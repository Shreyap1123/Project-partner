package com.projectpartner.dto;

public class StudentProjectDto {
    private Long id;
    private String title;
    private String description;
    private String technologiesUsed;
    private String repoUrl;
    private String demoUrl;
    private String projectDate;

    public StudentProjectDto() {
    }

    public StudentProjectDto(Long id, String title, String description, String technologiesUsed, String repoUrl, String demoUrl, String projectDate) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.technologiesUsed = technologiesUsed;
        this.repoUrl = repoUrl;
        this.demoUrl = demoUrl;
        this.projectDate = projectDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTechnologiesUsed() {
        return technologiesUsed;
    }

    public void setTechnologiesUsed(String technologiesUsed) {
        this.technologiesUsed = technologiesUsed;
    }

    public String getRepoUrl() {
        return repoUrl;
    }

    public void setRepoUrl(String repoUrl) {
        this.repoUrl = repoUrl;
    }

    public String getDemoUrl() {
        return demoUrl;
    }

    public void setDemoUrl(String demoUrl) {
        this.demoUrl = demoUrl;
    }

    public String getProjectDate() {
        return projectDate;
    }

    public void setProjectDate(String projectDate) {
        this.projectDate = projectDate;
    }
}
