package com.example.claudia.iamhere;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.Serializable;
import java.util.ArrayList;

public class ScheduleList implements Serializable {

    private ArrayList<Schedule> list;

    public ScheduleList(String json) {
        list = new ArrayList<Schedule>();
        JSONArray jsonArray = null;
        JSONObject jsonObject;
        try {
            jsonArray = new JSONArray(json);
            for(int i=0;i<jsonArray.length();i++) {
                jsonObject = jsonArray.getJSONObject(i);
                list.add(new Schedule(jsonObject.getString("id"), jsonObject.getString("day"),
                            jsonObject.getString("starts"), jsonObject.getString("ends"),
                            jsonObject.getString("subject"), jsonObject.getString("professor_id"),
                            jsonObject.getString("professor_name"), jsonObject.getString("type"),
                            jsonObject.getString("room")));
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    public ArrayList<Schedule> getList() {
        return  this.list;
    }

}
