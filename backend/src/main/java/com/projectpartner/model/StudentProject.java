package com.projectpartner.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import javax.persistence.*;

@Entity
@Table(name = "student_projects")
public class StudentProject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_profile_id", nullable = false)
    @JsonBackReference
    private StudentProfile studentProfile;

    @Column(nullable = false)
    private String title;

    @Column(length = 1500)
    private String description;

    private String technologiesUsed; // Comma-separated: "React, Node.js, MongoDB"
    private String repoUrl;
    private String demoUrl;
    private String projectDate;

    public StudentProject() {
    }

    public StudentProject(StudentProfile studentProfile, String title, String description, String technologiesUsed, String repoUrl, String demoUrl, String projectDate) {
        this.studentProfile = studentProfile;
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

    public StudentProfile getStudentProfile() {
        return studentProfile;
    }

    public void setStudentProfile(StudentProfile studentProfile) {
        this.studentProfile = studentProfile;
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
