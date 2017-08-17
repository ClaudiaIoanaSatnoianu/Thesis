package com.example.claudia.iamhere;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;

public class Conditions {

    private Context context;

    public Conditions(Context activityContext) {
        this.context = activityContext;
    }

    public boolean internetConnectionAvailable() {
        ConnectivityManager connectivityManager = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetworkInfo = connectivityManager.getActiveNetworkInfo();
        if(activeNetworkInfo != null && activeNetworkInfo.isConnected()) {
            return true;
        } else {
            return false;
        }
    }
}
