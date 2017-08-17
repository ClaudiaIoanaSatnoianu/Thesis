package com.example.claudia.iamhere;

import java.io.Serializable;

public class Schedule implements Serializable{

    private String id;
    private String day;
    private String starts;
    private String ends;
    private String subject;
    private String professor_id;
    private String professor_name;
    private String type;
    private String room;

    public Schedule(String id, String day, String starts, String ends, String subject, String professor_id,
                    String professor_name, String type, String room) {
        this.id = id;
        this.day = day;
        this.starts = starts;
        this.ends = ends;
        this.subject = subject;
        this.professor_id = professor_id;
        this.professor_name = professor_name;
        this.type = type;
        this.room = room;
    }

    public String getId() {
        return id;
    }

    public String getDay() {
        return day;
    }

    public String getStarts() {
        return starts;
    }

    public String getEnds() {
        return ends;
    }

    public String getSubject() {
        return subject;
    }

    public String getProfessor_id() {
        return professor_id;
    }

    public String getProfessor_name() {
        return professor_name;
    }

    public String getType() {
        return type;
    }

    public String getRoom() {
        return room;
    }

}
