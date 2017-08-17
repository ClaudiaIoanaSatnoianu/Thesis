package com.example.claudia.iamhere;

import android.webkit.CookieManager;

import java.net.CookieHandler;
import java.net.CookiePolicy;

public class CookieSingleton {

    private static String session = null;
    private static CookieSingleton instance = null;

    private CookieSingleton(String ssession) {
        session = ssession;
    }

    public static String getSession(String inputSession){
        if(instance==null) {
            instance = new CookieSingleton(inputSession);
        }
        return session;
    }

}
