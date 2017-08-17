package com.example.claudia.iamhere;

import android.content.Intent;
import android.os.AsyncTask;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.RelativeLayout;
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

public class MenuActivity extends AppCompatActivity {

    private Student student;
    RelativeLayout button_menu_schedule;
    RelativeLayout button_menu_attendance;
    RelativeLayout button_menu_questions;
    RelativeLayout button_menu_settings;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_menu);

        student = (Student) getIntent().getSerializableExtra("student");

        button_menu_schedule = (RelativeLayout) findViewById(R.id.menu_schedule_button);
        button_menu_attendance = (RelativeLayout) findViewById(R.id.menu_attendance_button);
        button_menu_questions = (RelativeLayout) findViewById(R.id.menu_questions_button);
        button_menu_settings = (RelativeLayout) findViewById(R.id.menu_settings_button);

        button_menu_schedule.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(new Conditions(getApplicationContext()).internetConnectionAvailable()) {
                    Intent intent = new Intent(getApplicationContext(),ScheduleActivity.class);
                    intent.putExtra("student", student);
                    startActivity(intent);
                } else {
                    Toast.makeText(getApplicationContext(),getString(R.string.login_no_internet_message),Toast.LENGTH_LONG).show();
                }
            }
        });

        button_menu_attendance.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(new Conditions(getApplicationContext()).internetConnectionAvailable()) {
                    Intent intent = new Intent(getApplicationContext(),PresentScheduleActivity.class);
                    intent.putExtra("student", student);
                    startActivity(intent);
                } else {
                    Toast.makeText(getApplicationContext(),getString(R.string.login_no_internet_message),Toast.LENGTH_LONG).show();
                }
            }
        });

        button_menu_questions.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(new Conditions(getApplicationContext()).internetConnectionAvailable()) {
                    Intent intent = new Intent(getApplicationContext(),EvaluationsActivity.class);
                    intent.putExtra("student", student);
                    startActivity(intent);
                } else {
                    Toast.makeText(getApplicationContext(),getString(R.string.login_no_internet_message),Toast.LENGTH_LONG).show();
                }
            }
        });

        button_menu_settings.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(getApplicationContext(),SettingsActivity.class);
                intent.putExtra("student", student);
                startActivity(intent);
            }
        });

    }
}
