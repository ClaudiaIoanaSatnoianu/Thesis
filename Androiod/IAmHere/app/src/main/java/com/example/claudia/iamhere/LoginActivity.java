package com.example.claudia.iamhere;

import android.app.Activity;
import android.content.Intent;
import android.os.AsyncTask;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.webkit.CookieManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Toast;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Serializable;
import java.net.CookieHandler;
import java.net.HttpCookie;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;
import java.util.Map;

public class LoginActivity extends AppCompatActivity {

    private EditText text_email_login;
    private EditText text_password_login;
    private ProgressBar progressBar_login;
    private Button button_login;

    private Student student;

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        CookieManager.getInstance().setAcceptCookie(true);

        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_VISIBLE|WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);

        button_login = (Button) findViewById(R.id.login_button);

        button_login.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                if(new Conditions(getApplicationContext()).internetConnectionAvailable()) {
                    InputMethodManager imm = (InputMethodManager) getSystemService(Activity.INPUT_METHOD_SERVICE);
                    imm.toggleSoftInput(InputMethodManager.HIDE_IMPLICIT_ONLY, 0);
                    text_email_login = (EditText) findViewById(R.id.login_email);
                    text_password_login = (EditText) findViewById(R.id.login_password);
                    String email = text_email_login.getText().toString();
                    String password = text_password_login.getText().toString();
                    progressBar_login = (ProgressBar) findViewById(R.id.login_loading);

                    if(email.equals("") || password.equals("")) {
                        Toast.makeText(getApplicationContext(),getApplicationContext().getString(R.string.empty_fields),Toast.LENGTH_LONG).show();
                    } else {
                        button_login.setVisibility(View.GONE);
                        text_email_login.setVisibility(View.GONE);
                        text_password_login.setVisibility(View.GONE);
                        progressBar_login.setVisibility(View.VISIBLE);
                        ServerCommunicationTask asynk = new ServerCommunicationTask();
                        asynk.execute(getString(R.string.server_address_localhost) + "/student/" + email + "/" + password);
                    }
                } else {
                    Toast.makeText(getApplicationContext(),getString(R.string.login_no_internet_message),Toast.LENGTH_LONG).show();
                }

            }
        });

    }

    public class ServerCommunicationTask extends AsyncTask<String, String, String> {

        @Override
        protected String doInBackground(String... params) {

            HttpURLConnection connection = null;
            BufferedReader bufferedReader = null;

            URL url;
            try {
                url = new URL(params[0]);
                connection = (HttpURLConnection) url.openConnection();
                connection.connect();
                Map<String, List<String>> headerFields = connection.getHeaderFields();
                List<String> cookiesHeader = headerFields.get("Set-Cookie");
                if(cookiesHeader != null){
                    String cookie = cookiesHeader.get(0);
                    HttpCookie httpCookie = HttpCookie.parse(cookie).get(0);
                    String name = httpCookie.getName();
                    if(name.contains("session")) {
                        String value = httpCookie.getValue();
                        CookieSingleton.getSession(value);
                    }
                }
                InputStream stream = new BufferedInputStream(connection.getInputStream());
                bufferedReader = new BufferedReader(new InputStreamReader(stream));
                StringBuilder stringBuffer = new StringBuilder();
                String content;
                while((content = bufferedReader.readLine())!=null) {
                    stringBuffer.append(content);
                }
                publishProgress("login",stringBuffer.toString());
            } catch (MalformedURLException e) {
                e.printStackTrace();
                publishProgress("wrongUrl");
            } catch (IOException e) {
                e.printStackTrace();
                publishProgress("wrongUrl");
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
        }

        @Override
        protected void onProgressUpdate(String...values){
            super.onProgressUpdate(values);

            String type =values[0];

            if(type.equals("wrongUrl"))
            {
                Toast.makeText(getApplicationContext(), getString(R.string.login_wrong_url), Toast.LENGTH_SHORT).show();
                progressBar_login.setVisibility(View.GONE);
                button_login.setVisibility(View.VISIBLE);
                text_email_login.setVisibility(View.VISIBLE);
                text_password_login.setVisibility(View.VISIBLE);
            } else if(type.equals("login")) {
                String json = values[1];
                if(json.equals("null")) {
                    Toast.makeText(getApplicationContext(), getString(R.string.login_failed), Toast.LENGTH_SHORT).show();
                    progressBar_login.setVisibility(View.GONE);
                    button_login.setVisibility(View.VISIBLE);
                    text_email_login.setVisibility(View.VISIBLE);
                    text_password_login.setVisibility(View.VISIBLE);
                } else {
                    student = new Student(json);
                    Intent intent = new Intent(getApplicationContext(),MenuActivity.class);
                    intent.putExtra("student", (Serializable) student);
                    startActivity(intent);
                    finish();
                }
            }
        }
    }
}
