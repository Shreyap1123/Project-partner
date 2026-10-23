package com.projectpartner.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "student_profiles")
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(length = 1500)
    private String bio;

    private String university;
    private String department;
    private String degreeLevel;
    private Integer graduationYear;

    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    private String avatarUrl;

    @Column(nullable = false)
    private Integer availableHoursPerWeek = 15;

    // Comma-separated domains e.g., "AI_ML,WEB_DEV,MOBILE"
    private String preferredDomains;

    @OneToMany(mappedBy = "studentProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<StudentSkill> skills = new ArrayList<>();

    @OneToMany(mappedBy = "studentProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<StudentProject> pastProjects = new ArrayList<>();

    public StudentProfile() {
    }

    public StudentProfile(User user) {
        this.user = user;
    }

    // Helper methods to manage bi-directional relationships
    public void addSkill(StudentSkill skill) {
        skills.add(skill);
        skill.setStudentProfile(this);
    }

    public void removeSkill(StudentSkill skill) {
        skills.remove(skill);
        skill.setStudentProfile(null);
    }

    public void addProject(StudentProject project) {
        pastProjects.add(project);
        project.setStudentProfile(this);
    }

    public void removeProject(StudentProject project) {
        pastProjects.remove(project);
        project.setStudentProfile(null);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getUniversity() {
        return university;
    }

    public void setUniversity(String university) {
        this.university = university;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getDegreeLevel() {
        return degreeLevel;
    }

    public void setDegreeLevel(String degreeLevel) {
        this.degreeLevel = degreeLevel;
    }

    public Integer getGraduationYear() {
        return graduationYear;
    }

    public void setGraduationYear(Integer graduationYear) {
        this.graduationYear = graduationYear;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public String getPortfolioUrl() {
        return portfolioUrl;
    }

    public void setPortfolioUrl(String portfolioUrl) {
        this.portfolioUrl = portfolioUrl;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public Integer getAvailableHoursPerWeek() {
        return availableHoursPerWeek;
    }

    public void setAvailableHoursPerWeek(Integer availableHoursPerWeek) {
        this.availableHoursPerWeek = availableHoursPerWeek;
    }

    public String getPreferredDomains() {
        return preferredDomains;
    }

    public void setPreferredDomains(String preferredDomains) {
        this.preferredDomains = preferredDomains;
    }

    public List<StudentSkill> getSkills() {
        return skills;
    }

    public void setSkills(List<StudentSkill> skills) {
        this.skills = skills;
    }

    public List<StudentProject> getPastProjects() {
        return pastProjects;
    }

    public void setPastProjects(List<StudentProject> pastProjects) {
        this.pastProjects = pastProjects;
    }
}
