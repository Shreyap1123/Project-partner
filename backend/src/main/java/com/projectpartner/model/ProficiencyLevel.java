package com.projectpartner.model;

public enum ProficiencyLevel {
    BEGINNER(1, "Beginner"),
    INTERMEDIATE(2, "Intermediate"),
    ADVANCED(3, "Advanced"),
    EXPERT(4, "Expert");

    private final int weight;
    private final String displayName;

    ProficiencyLevel(int weight, String displayName) {
        this.weight = weight;
        this.displayName = displayName;
    }

    public int getWeight() {
        return weight;
    }

    public String getDisplayName() {
        return displayName;
    }
}
