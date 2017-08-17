package com.example.claudia.iamhere;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.AsyncTask;
import android.os.Handler;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Calendar;

public class AttendanceActivity extends AppCompatActivity {

    private Button button_yes;
    private Button button_remove;
    private TextView text_subject;
    private TextView text_type;
    private Student student;
    private String schedule_id;
    private String professor_id;
    private String attendance_id;
    private ProgressBar loading;

    private String status;
    private String supposed_beacon;

    private boolean found;
    private static final long SCAN_PERIOD = 5000;

    private BluetoothAdapter bluetoothAdapter;
    private BluetoothManager bluetoothManager;
    private BluetoothAdapter.LeScanCallback leScanCallback;

    private Handler handler;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_attendance);

        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled()) {
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            startActivityForResult(enableBtIntent, 1);
        }

        button_yes = (Button) findViewById(R.id.attendance_yes_button);
        button_remove = (Button) findViewById(R.id.attendance_remove_button);
        text_subject = (TextView) findViewById(R.id.attendance_subject);
        text_type = (TextView) findViewById(R.id.attendance_type);
        loading = (ProgressBar) findViewById(R.id.attendance_login_loading);

        student = (Student) getIntent().getSerializableExtra("student");
        professor_id = getIntent().getStringExtra("professor_id");
        schedule_id = getIntent().getStringExtra("schedule_id");

        bluetoothManager = (BluetoothManager) getSystemService(Context.BLUETOOTH_SERVICE);
        bluetoothAdapter = bluetoothManager.getAdapter();
        button_yes.setVisibility(View.VISIBLE);

        if (ContextCompat.checkSelfPermission(AttendanceActivity.this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {

            if (ActivityCompat.shouldShowRequestPermissionRationale(AttendanceActivity.this, Manifest.permission.ACCESS_FINE_LOCATION)) {

            } else {
                ActivityCompat.requestPermissions(AttendanceActivity.this, new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, 1);
            }
        }

        status = "beacon";
        new AttendanceTask().execute(getString(R.string.server_address_localhost) + "/ble/device/" + professor_id);



        leScanCallback = new BluetoothAdapter.LeScanCallback() {
            @Override
            public void onLeScan(final BluetoothDevice device, final int rssi,
                                 byte[] scanRecord) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        if (device != null) {
                            if (device.getAddress().equals(supposed_beacon)) {
                                found = true;
                                bluetoothAdapter.stopLeScan(leScanCallback);
                                status = "accept";
                                new AttendanceTask().execute(getString(R.string.server_address_localhost) + "/attendance/" +
                                        student.getId() + "/" + schedule_id);
                            }
                        }

                    }
                });
            }
        };
        handler = new Handler();


        button_yes.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (new Conditions(getApplicationContext()).internetConnectionAvailable()) {
                    if (!getPackageManager().hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE)) {
                        Toast.makeText(getApplicationContext(), getString(R.string.no_ble), Toast.LENGTH_LONG).show();
                        button_yes.setVisibility(View.GONE);
                    } else {
                        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled()) {
                            Toast.makeText(getApplicationContext(), getString(R.string.bluetooth), Toast.LENGTH_LONG).show();
                        } else {
                            loading.setVisibility(View.VISIBLE);
                            button_yes.setVisibility(View.GONE);
                            handler.postDelayed(new Runnable() {
                                @Override
                                public void run() {
                                    bluetoothAdapter.stopLeScan(leScanCallback);
                                    if (found == false) {
                                        Toast.makeText(getApplicationContext(), getString(R.string.wrong_beacon), Toast.LENGTH_LONG).show();
                                        loading.setVisibility(View.GONE);
                                        button_yes.setVisibility(View.VISIBLE);
                                    }
                                }
                            }, SCAN_PERIOD);
                            found = false;
                            bluetoothAdapter.startLeScan(leScanCallback);
                        }
                    }
                } else {
                    Toast.makeText(getApplicationContext(), getString(R.string.login_no_internet_message), Toast.LENGTH_LONG).show();
                }
            }
        });

        button_remove.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (new Conditions(getApplicationContext()).internetConnectionAvailable()) {
                    loading.setVisibility(View.VISIBLE);
                    button_remove.setVisibility(View.GONE);
                    status = "remove";
                    new AttendanceTask().execute(getString(R.string.server_address_localhost) + "/attendance/" + attendance_id);
                } else {
                    Toast.makeText(getApplicationContext(), getString(R.string.login_no_internet_message), Toast.LENGTH_LONG).show();
                }
            }
        });
    }

    public class AttendanceTask extends AsyncTask<String, String, String> {

        @Override
        protected String doInBackground(String... params) {
            HttpURLConnection connection = null;
            BufferedReader bufferedReader = null;
            URL url;
            try {
                url = new URL(params[0]);
                connection = (HttpURLConnection) url.openConnection();
                if(status.equals("accept")) {
                    connection.setRequestMethod("POST");
                }
                if(status.equals("remove")) {
                    connection.setRequestMethod("DELETE");
                }
                connection.setRequestProperty("Cookie", "session=" + CookieSingleton.getSession(null));
                connection.connect();
                InputStream stream = new BufferedInputStream(connection.getInputStream());
                bufferedReader = new BufferedReader(new InputStreamReader(stream));
                StringBuilder stringBuffer = new StringBuilder();
                String content;
                while((content = bufferedReader.readLine())!=null) {
                    stringBuffer.append(content);
                }
                return stringBuffer.toString();
            } catch (MalformedURLException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            } finally {
                if(connection!=null) {
                    connection.disconnect();
                }
                if(bufferedReader!=null) {
                    try {
                        bufferedReader.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
            return null;
        }

        @Override
        protected void onPostExecute(String s) {
            super.onPostExecute(s);
            if(s.equals("\"session expired\"")) {
                Intent intent = new Intent(AttendanceActivity.this, LoginActivity.class);
                startActivity(intent);
                finishAffinity();
            } else {
                switch (status) {
                    case "beacon":
                        if(s.equals("null") || s.equals("")) {
                            text_subject.setText(getString(R.string.no_beacon));
                            button_yes.setVisibility(View.GONE);
                            button_remove.setVisibility(View.GONE);
                        } else {
                            supposed_beacon = s.substring(1,s.length()-1);
                            text_type.setText(getIntent().getStringExtra("schedule_type"));
                            text_subject.setText(getIntent().getStringExtra("schedule_subject"));
                            status = "existence";
                            new AttendanceTask().execute(getString(R.string.server_address_localhost) + "/attendance/exists/" + student.getId() + "/" + schedule_id);
                        }
                        break;
                    case "existence":
                        if(s.equals("null") || s.equals("")) {
                            button_yes.setVisibility(View.VISIBLE);
                            button_remove.setVisibility(View.GONE);
                        } else {
                            attendance_id = s;
                            button_yes.setVisibility(View.GONE);
                            button_remove.setVisibility(View.VISIBLE);
                        }
                        break;
                    case "accept":
                        button_remove.setVisibility(View.VISIBLE);
                        loading.setVisibility(View.GONE);
                        status = "existence";
                        new AttendanceTask().execute(getString(R.string.server_address_localhost) + "/attendance/exists/" + student.getId() + "/" + schedule_id);
                        break;
                    case "remove":
                        button_yes.setVisibility(View.VISIBLE);
                        loading.setVisibility(View.GONE);
                        break;
                }
            }
        }
    }
}
