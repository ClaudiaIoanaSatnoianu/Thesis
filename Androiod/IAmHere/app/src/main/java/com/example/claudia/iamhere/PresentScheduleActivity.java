package com.example.claudia.iamhere;

import android.content.Intent;
import android.os.AsyncTask;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ListView;
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
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;

public class PresentScheduleActivity extends AppCompatActivity {

    private ProgressBar loading;
    private ListView listView;
    private TextView button_report;
    private ArrayList<Schedule> present_schedule;
    private Student student;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_present_schedule);

        student = (Student) getIntent().getSerializableExtra("student");
        loading = (ProgressBar) findViewById(R.id.present_schedule_loading);
        listView = (ListView) findViewById(R.id.present_schedule_list);
        button_report = (TextView) findViewById(R.id.button_report);

        Calendar now = Calendar.getInstance();
        now.setTime(new Date());
        String timeStamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss z").format(now.getTime());
        Integer difference = Integer.parseInt(timeStamp.substring(timeStamp.indexOf("GMT")+3,timeStamp.length()-3));
        now.add(Calendar.HOUR_OF_DAY,difference);
        timeStamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(now.getTime());
        new PresentScheduleTask().execute(getString(R.string.server_address_localhost) + "/present/schedule/" +
                student.getGroup_id() + "/" + timeStamp + "/" + student.getBatch_id());


        listView.setOnItemClickListener(new android.widget.AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(android.widget.AdapterView<?> parent, View view, int position, long id) {
                if(new Conditions(getApplicationContext()).internetConnectionAvailable()) {
                    Intent intent = new Intent(PresentScheduleActivity.this, AttendanceActivity.class);
                    intent.putExtra("student", student);
                    intent.putExtra("professor_id", present_schedule.get(position).getProfessor_id());
                    intent.putExtra("schedule_id", present_schedule.get(position).getId());
                    intent.putExtra("schedule_type", present_schedule.get(position).getType());
                    intent.putExtra("schedule_subject", present_schedule.get(position).getSubject());
                    startActivity(intent);
                } else {
                    Toast.makeText(getApplicationContext(),getString(R.string.login_no_internet_message),Toast.LENGTH_LONG).show();
                }
            }
        });

        button_report.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (new Conditions(getApplicationContext()).internetConnectionAvailable()) {
                    Intent intent = new Intent(getApplicationContext(),ReportActivity.class);
                    intent.putExtra("student", student);
                    startActivity(intent);
                } else {
                    Toast.makeText(getApplicationContext(), getString(R.string.login_no_internet_message), Toast.LENGTH_LONG).show();
                }
            }
        });
    }

    private class PresentScheduleTask extends AsyncTask<String, String, String> {

        @Override
        protected String doInBackground(String... params) {
            HttpURLConnection connection = null;
            BufferedReader bufferedReader = null;
            URL url;
            try {
                url = new URL(params[0]);
                connection = (HttpURLConnection) url.openConnection();
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
        protected void onPostExecute(String result) {
            super.onPostExecute(result);
            if(result.equals("\"session expired\"")) {
                Intent intent = new Intent(PresentScheduleActivity.this, LoginActivity.class);
                startActivity(intent);
                finishAffinity();
            } else {
                present_schedule = new ScheduleList(result).getList();
                if(present_schedule.size()!=0) {
                    loading.setVisibility(View.GONE);
                    AdapterViewCustomAttendance adapter = new AdapterViewCustomAttendance(PresentScheduleActivity.this, present_schedule);
                    listView.setAdapter(adapter);
                } else {
                    Toast.makeText(getApplicationContext(),"Nu exista niciun eveniment programat acum.",Toast.LENGTH_SHORT).show();
                }
                loading.setVisibility(View.GONE);
            }
        }
    }
}
