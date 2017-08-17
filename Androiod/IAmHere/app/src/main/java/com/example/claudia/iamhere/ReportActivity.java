package com.example.claudia.iamhere;

import android.content.Intent;
import android.os.AsyncTask;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
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
import java.util.ArrayList;

public class ReportActivity extends AppCompatActivity {

    private ArrayList<Schedule> attendanceList;
    private ProgressBar loading;
    private TextView content;
    private Student student;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_report);
        content = (TextView) findViewById(R.id.report_content);
        loading = (ProgressBar) findViewById(R.id.present_schedule_loading);
        student = (Student) getIntent().getSerializableExtra("student");
        new ReportTask().execute(getString(R.string.server_address_localhost) + "/attendance/report/" + student.getId());
    }

    private class ReportTask extends AsyncTask<String, String, String> {

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
                Intent intent = new Intent(ReportActivity.this, LoginActivity.class);
                startActivity(intent);
                finishAffinity();
            } else {
                attendanceList = new ScheduleList(result).getList();
                if(attendanceList.size()!=0) {
                    String daily = attendanceList.get(0).getDay();
                    content.setText(getString(R.string.schedule_symbol) + " " + attendanceList.get(0).getDay()+ "\n");
                    for(int i=0;i<attendanceList.size();i++) {
                        if(!attendanceList.get(i).getDay().equals(daily)) {
                            daily = attendanceList.get(i).getDay();
                            content.append(getString(R.string.schedule_symbol) + " " + daily + "\n");
                        }
                        content.append(attendanceList.get(i).getType() + " " + attendanceList.get(i).getSubject().toUpperCase() +
                                "\n[ora: " + attendanceList.get(i).getStarts() + "-" + attendanceList.get(i).getEnds() +  ", prof: " +
                                attendanceList.get(i).getProfessor_name() + "]\n\n");
                    }
                } else {
                    Toast.makeText(getApplicationContext(),getString(R.string.no_attendance),Toast.LENGTH_SHORT).show();
                }
                loading.setVisibility(View.GONE);
            }
        }
    }
}
