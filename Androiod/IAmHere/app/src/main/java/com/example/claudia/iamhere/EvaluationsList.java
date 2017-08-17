package com.example.claudia.iamhere;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;

public class EvaluationsList {

    private ArrayList<Evaluation> evaluations;

    public EvaluationsList(String json) {
        evaluations = new ArrayList<Evaluation>();
        JSONArray jsonArray = null;
        JSONObject jsonObject;
        try {
            jsonArray = new JSONArray(json);
            for(int i=0;i<jsonArray.length();i++) {
                jsonObject = jsonArray.getJSONObject(i);
                evaluations.add(new Evaluation(jsonObject.getString("id"), jsonObject.getString("question"),
                        jsonObject.getString("type"), jsonObject.getString("subject"),jsonObject.getString("grade"),
                        jsonObject.getString("answer")));
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    public ArrayList<Evaluation> getEvaluations() {
        return evaluations;
    }
}
