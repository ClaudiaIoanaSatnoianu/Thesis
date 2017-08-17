package com.example.claudia.iamhere;

import android.content.Intent;
import android.os.AsyncTask;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Toast;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

public class SettingsActivity extends AppCompatActivity {

    private Button change_password;
    private EditText old_password;
    private EditText new_password;
    private ProgressBar loading;
    private Student student;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_settings);

        change_password = (Button) findViewById(R.id.change_password);
        old_password = (EditText) findViewById(R.id.old_password);
        new_password = (EditText) findViewById(R.id.new_password);
        loading = (ProgressBar) findViewById(R.id.settings_loading);
        student = (Student) getIntent().getSerializableExtra("student");

        change_password.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(new Conditions(getApplicationContext()).internetConnectionAvailable()) {
                    loading.setVisibility(View.VISIBLE);
                    change_password.setVisibility(View.GONE);
                    new SettingsTask().execute(getString(R.string.server_address_localhost) + "/password",
                            student.getId(),old_password.getText().toString(),new_password.getText().toString());
                } else {
                    Toast.makeText(getApplicationContext(),getString(R.string.login_no_internet_message),Toast.LENGTH_LONG).show();
                }
            }
        });
    }

    private class SettingsTask extends AsyncTask<String, String, String> {

        @Override
        protected String doInBackground(String... params) {
            HttpURLConnection connection = null;
            BufferedReader bufferedReader = null;
            URL url;
            try {
                url = new URL(params[0]);
                connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("PUT");
                connection.setDoOutput(true);
                connection.setRequestProperty("Cookie", "session=" + CookieSingleton.getSession(null));
                connection.connect();
                OutputStreamWriter writer = new OutputStreamWriter(connection.getOutputStream());
                writer.write("student_id=" + params[1] + "&" + "old_password=" + params[2] + "&new_password=" + params[3]);
                writer.flush();

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
        protected void onPostExecute(String result) {
            super.onPostExecute(result);
            if(result.equals("\"session expired\"")) {
                Intent intent = new Intent(SettingsActivity.this, LoginActivity.class);
                startActivity(intent);
                finishAffinity();
            } else {
                if(result.equals("succes")) {
                    Toast.makeText(getApplicationContext(),getString(R.string.changes),Toast.LENGTH_SHORT).show();
                    old_password.setText("");
                    new_password.setText("");
                } else if(result.equals("wrong")){
                    Toast.makeText(getApplicationContext(),getString(R.string.no_changes),Toast.LENGTH_SHORT).show();
                    old_password.setText("");
                } else {
                    Toast.makeText(getApplicationContext(),getString(R.string.server_error),Toast.LENGTH_SHORT).show();
                    old_password.setText("");
                    new_password.setText("");
                }
                loading.setVisibility(View.GONE);
                change_password.setVisibility(View.VISIBLE);
            }
        }
    }
}
