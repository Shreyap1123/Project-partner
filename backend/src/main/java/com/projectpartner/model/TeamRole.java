package com.projectpartner.model;

public enum TeamRole {
    LEADER("Team Leader"),
    FULLSTACK_DEV("Full Stack Developer"),
    FRONTEND_DEV("Frontend Developer"),
    BACKEND_DEV("Backend Developer"),
    AI_ML_ENGINEER("AI/ML Engineer"),
    MOBILE_DEV("Mobile Developer"),
    UI_UX_DESIGNER("UI/UX Designer"),
    DEVOPS_ENGINEER("DevOps Engineer"),
    DATA_ANALYST("Data Analyst"),
    RESEARCHER("Researcher"),
    MEMBER("Team Member");

    private final String title;

    TeamRole(String title) {
        this.title = title;
    }

    public String getTitle() {
        return title;
    }
}
