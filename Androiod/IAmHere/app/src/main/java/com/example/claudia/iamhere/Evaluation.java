package com.example.claudia.iamhere;

public class Evaluation {

    private String id;
    private String question;
    private String answer;
    private String type;
    private String subject;
    private String grade;


    public Evaluation(String id, String question, String type, String subject, String grade, String answer) {
        this.id = id;
        this.question = question;
        this.type = type;
        this.subject = subject;
        this.grade = grade;
        this.answer = answer;
    }

    public String getId() {
        return id;
    }

    public String getQuestion() {
        return question;
    }

    public String getType() {
        return type;
    }

    public String getSubject() {
        return subject;
    }

    public String getGrade() {
        return grade;
    }

    public String getAnswer() {
        return answer;
    }
}
