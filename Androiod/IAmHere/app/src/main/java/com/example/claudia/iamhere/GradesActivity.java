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

public class GradesActivity extends AppCompatActivity {

    private ArrayList<Evaluation> grades;
    private ProgressBar loading;
    private TextView content;
    private Student student;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_grades);
        content = (TextView) findViewById(R.id.grades_content);
        loading = (ProgressBar) findViewById(R.id.grades_loading);
        student = (Student) getIntent().getSerializableExtra("student");
        new GradesTask().execute(getString(R.string.server_address_localhost) + "/grades/" + student.getId());
    }

    private class GradesTask extends AsyncTask<String, String, String> {

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
                Intent intent = new Intent(GradesActivity.this, LoginActivity.class);
                startActivity(intent);
                finishAffinity();
            } else {
                grades = new EvaluationsList(result).getEvaluations();
                if(grades.size()!=0) {
                    for(int i=0;i<grades.size();i++) {
                        content.append(getString(R.string.check_symbol) + " " +
                                grades.get(i).getType() + " " + grades.get(i).getSubject().toUpperCase() +
                                "\n\t\t\t\t intrebare: " + grades.get(i).getQuestion() +
                                "\n\t\t\t\t raspuns: " + grades.get(i).getAnswer() +
                                "\n\t\t\t\t nota: " + grades.get(i).getGrade() + "\n\n");
                    }
                } else {
                    Toast.makeText(getApplicationContext(),getString(R.string.no_attendance),Toast.LENGTH_SHORT).show();
                }
                loading.setVisibility(View.GONE);
            }
        }
    }
}
