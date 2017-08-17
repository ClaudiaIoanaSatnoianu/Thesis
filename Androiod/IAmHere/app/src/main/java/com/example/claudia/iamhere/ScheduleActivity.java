package com.example.claudia.iamhere;

import android.content.Intent;
import android.os.AsyncTask;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.webkit.CookieManager;
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

public class ScheduleActivity extends AppCompatActivity {

    private TextView text_schedule_content;
    private ProgressBar loading;

    private Student student;
    private ArrayList<Schedule> schedule;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_schedule);

        CookieManager.getInstance().setAcceptCookie(true);

        student = (Student) getIntent().getSerializableExtra("student");

        text_schedule_content = (TextView) findViewById(R.id.schedule_content);Calendar calendar = Calendar.getInstance();
        loading = (ProgressBar) findViewById(R.id.schedule_loading);

        Calendar now = Calendar.getInstance();
        now.setTime(new Date());
        String timeStamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss z").format(now.getTime());
        /*Integer difference = Integer.parseInt(timeStamp.substring(timeStamp.indexOf("GMT")+3,timeStamp.length()-3));
        now.add(Calendar.HOUR_OF_DAY,difference);*/
        timeStamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(now.getTime());
        new ScheduleTask().execute(getString(R.string.server_address_localhost) + "/schedule/" +
                student.getGroup_id() + "/" + timeStamp + "/" + student.getBatch_id());
    }

    private class ScheduleTask extends AsyncTask<String, String, String> {

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
                Intent intent = new Intent(ScheduleActivity.this, LoginActivity.class);
                startActivity(intent);
                finishAffinity();
            } else {
                schedule = new ScheduleList(result).getList();
                if(schedule.size()!=0) {
                    String daily = schedule.get(0).getDay();
                    text_schedule_content.setText(getString(R.string.schedule_symbol) + " " + schedule.get(0).getDay()+ "\n");
                    for(int i=0;i<schedule.size();i++) {
                        if(!schedule.get(i).getDay().equals(daily)) {
                            daily = schedule.get(i).getDay();
                            text_schedule_content.append(getString(R.string.schedule_symbol) + " " + daily + "\n");
                        }
                        text_schedule_content.append(schedule.get(i).getType() + " " + schedule.get(i).getSubject().toUpperCase() +
                                "\n[ora: " + schedule.get(i).getStarts() + "-" + schedule.get(i).getEnds() + ", sala: " +
                                schedule.get(i).getRoom() + ", prof: " + schedule.get(i).getProfessor_name() + "]\n\n");
                    }
                } else {
                    text_schedule_content.setText("Nu exista niciun eveniment programat in viitor.");
                }
                loading.setVisibility(View.GONE);
            }
        }
    }
}
