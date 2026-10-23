package com.projectpartner.model;

public enum ProjectDomain {
    WEB_DEVELOPMENT("Web Development"),
    AI_MACHINE_LEARNING("AI & Machine Learning"),
    MOBILE_APPS("Mobile Applications"),
    CLOUD_DEVOPS("Cloud & DevOps"),
    CYBERSECURITY("Cybersecurity"),
    DATA_SCIENCE("Data Science & Big Data"),
    BLOCKCHAIN("Blockchain & Web3"),
    IOT_EMBEDDED("IoT & Embedded Systems"),
    GAME_DEVELOPMENT("Game Development"),
    OTHER("Other");

    private final String displayName;

    ProjectDomain(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
