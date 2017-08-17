package com.example.claudia.iamhere;

import android.content.Intent;
import android.os.AsyncTask;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
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

public class EvaluationResponseActivity extends AppCompatActivity {

    private Student student;
    private String evaluation_id;
    private String evaluation_question;
    private TextView question;
    private EditText response;
    private Button send_response;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_evaluation_response);

        student = (Student) getIntent().getSerializableExtra("student");
        evaluation_id = getIntent().getStringExtra("evaluation_id");
        evaluation_question = getIntent().getStringExtra("question");

        question = (TextView) findViewById(R.id.evaluation_question);
        response = (EditText) findViewById(R.id.evaluation_response);
        send_response = (Button) findViewById(R.id.send_response);

        question.setText(evaluation_question);

        send_response.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(new Conditions(getApplicationContext()).internetConnectionAvailable()) {
                    new EvaluationResponseTask().execute(getString(R.string.server_address_localhost) + "/answer",
                            student.getId(),response.getText().toString(),evaluation_id);
                } else {
                    Toast.makeText(getApplicationContext(),getString(R.string.login_no_internet_message),Toast.LENGTH_LONG).show();
                }
            }
        });

    }

    private class EvaluationResponseTask extends AsyncTask<String, String, String> {

        @Override
        protected String doInBackground(String... params) {
            HttpURLConnection connection = null;
            BufferedReader bufferedReader = null;
            URL url;
            try {
                url = new URL(params[0]);
                connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("POST");
                connection.setDoOutput(true);
                connection.setRequestProperty("Cookie", "session=" + CookieSingleton.getSession(null));
                connection.connect();

                OutputStreamWriter writer = new OutputStreamWriter(connection.getOutputStream());
                writer.write("evaluation_response=" + params[2] + "&" + "id=" + params[1] + "&evaluations_id=" + params[3]);
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
                Intent intent = new Intent(EvaluationResponseActivity.this, LoginActivity.class);
                startActivity(intent);
                finishAffinity();
            } else {
                Intent intent = new Intent(EvaluationResponseActivity.this, EvaluationsActivity.class);
                intent.putExtra("student", student);
                startActivity(intent);
                finish();
            }
        }
    }
}
