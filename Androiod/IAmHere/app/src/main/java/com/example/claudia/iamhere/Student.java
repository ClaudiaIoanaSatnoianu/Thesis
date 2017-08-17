package com.example.claudia.iamhere;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.Serializable;

public class Student implements Serializable {

    private String id;
    private String last_name;
    private String first_name;
    private String email;
    private String group_id;
    private String group_name;
    private String batch_id;
    private String batch_name;
    private String year;

    public Student(String json) {
        try {
            JSONObject jsonObject = new JSONObject(json);

            this.id = jsonObject.getString("id");
            this.last_name = jsonObject.getString("last_name");
            this.first_name = jsonObject.getString("first_name");
            this.email = jsonObject.getString("email");
            this.group_id = jsonObject.getString("group_id");
            this.group_name = jsonObject.getString("group_name");
            this.batch_id = jsonObject.getString("batch_id");
            this.batch_name = jsonObject.getString("batch_name");
            this.year = jsonObject.getString("year");
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    public String getId() {
        return id;
    }

    public String getLast_name() {
        return last_name;
    }

    public String getFirst_name() {
        return first_name;
    }

    public String getEmail() {
        return email;
    }

    public String getGroup_id() {
        return group_id;
    }

    public String getGroup_name() {
        return group_name;
    }

    public String getBatch_id() {
        return batch_id;
    }

    public String getBatch_name() {
        return batch_name;
    }

    public String getYear() {
        return year;
    }
}
