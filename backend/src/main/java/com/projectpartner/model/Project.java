package com.projectpartner.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectDomain domain = ProjectDomain.WEB_DEVELOPMENT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectStatus status = ProjectStatus.RECRUITING;

    @Column(nullable = false)
    private Integer maxTeamSize = 4;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "leader_id", nullable = false)
    private User leader;

    private String githubRepo;
    private String demoUrl;
    private String reportUrl;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ProjectRequiredSkill> requiredSkills = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<TeamMember> members = new ArrayList<>();

    public Project() {
    }

    public Project(String title, String description, ProjectDomain domain, Integer maxTeamSize, User leader) {
        this.title = title;
        this.description = description;
        this.domain = domain;
        this.maxTeamSize = maxTeamSize;
        this.leader = leader;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void addRequiredSkill(ProjectRequiredSkill skill) {
        requiredSkills.add(skill);
        skill.setProject(this);
    }

    public void removeRequiredSkill(ProjectRequiredSkill skill) {
        requiredSkills.remove(skill);
        skill.setProject(null);
    }

    public void addMember(TeamMember member) {
        members.add(member);
        member.setProject(this);
    }

    public void removeMember(TeamMember member) {
        members.remove(member);
        member.setProject(null);
    }

    // Getters and Setters
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

    public ProjectDomain getDomain() {
        return domain;
    }

    public void setDomain(ProjectDomain domain) {
        this.domain = domain;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectStatus status) {
        this.status = status;
    }

    public Integer getMaxTeamSize() {
        return maxTeamSize;
    }

    public void setMaxTeamSize(Integer maxTeamSize) {
        this.maxTeamSize = maxTeamSize;
    }

    public User getLeader() {
        return leader;
    }

    public void setLeader(User leader) {
        this.leader = leader;
    }

    public String getGithubRepo() {
        return githubRepo;
    }

    public void setGithubRepo(String githubRepo) {
        this.githubRepo = githubRepo;
    }

    public String getDemoUrl() {
        return demoUrl;
    }

    public void setDemoUrl(String demoUrl) {
        this.demoUrl = demoUrl;
    }

    public String getReportUrl() {
        return reportUrl;
    }

    public void setReportUrl(String reportUrl) {
        this.reportUrl = reportUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<ProjectRequiredSkill> getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(List<ProjectRequiredSkill> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public List<TeamMember> getMembers() {
        return members;
    }

    public void setMembers(List<TeamMember> members) {
        this.members = members;
    }
}
