package com.projectpartner.dto;

import com.projectpartner.model.ProjectDomain;
import com.projectpartner.model.ProjectStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ProjectResponseDto {
    private Long id;
    private String title;
    private String description;
    private ProjectDomain domain;
    private ProjectStatus status;
    private Integer maxTeamSize;
    private Integer currentTeamSize;
    private Integer openSlots;

    private Long leaderId;
    private String leaderName;
    private String leaderEmail;

    private String githubRepo;
    private String demoUrl;
    private String reportUrl;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private int progressPercentage;
    private int completedTasksCount;
    private int totalTasksCount;
    private int completedMilestonesCount;
    private int totalMilestonesCount;

    private List<ProjectRequiredSkillDto> requiredSkills = new ArrayList<>();
    private List<TeamMemberDto> members = new ArrayList<>();

    public ProjectResponseDto() {
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

    public Integer getCurrentTeamSize() {
        return currentTeamSize;
    }

    public void setCurrentTeamSize(Integer currentTeamSize) {
        this.currentTeamSize = currentTeamSize;
    }

    public Integer getOpenSlots() {
        return openSlots;
    }

    public void setOpenSlots(Integer openSlots) {
        this.openSlots = openSlots;
    }

    public Long getLeaderId() {
        return leaderId;
    }

    public void setLeaderId(Long leaderId) {
        this.leaderId = leaderId;
    }

    public String getLeaderName() {
        return leaderName;
    }

    public void setLeaderName(String leaderName) {
        this.leaderName = leaderName;
    }

    public String getLeaderEmail() {
        return leaderEmail;
    }

    public void setLeaderEmail(String leaderEmail) {
        this.leaderEmail = leaderEmail;
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

    public int getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(int progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public int getCompletedTasksCount() {
        return completedTasksCount;
    }

    public void setCompletedTasksCount(int completedTasksCount) {
        this.completedTasksCount = completedTasksCount;
    }

    public int getTotalTasksCount() {
        return totalTasksCount;
    }

    public void setTotalTasksCount(int totalTasksCount) {
        this.totalTasksCount = totalTasksCount;
    }

    public int getCompletedMilestonesCount() {
        return completedMilestonesCount;
    }

    public void setCompletedMilestonesCount(int completedMilestonesCount) {
        this.completedMilestonesCount = completedMilestonesCount;
    }

    public int getTotalMilestonesCount() {
        return totalMilestonesCount;
    }

    public void setTotalMilestonesCount(int totalMilestonesCount) {
        this.totalMilestonesCount = totalMilestonesCount;
    }

    public List<ProjectRequiredSkillDto> getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(List<ProjectRequiredSkillDto> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public List<TeamMemberDto> getMembers() {
        return members;
    }

    public void setMembers(List<TeamMemberDto> members) {
        this.members = members;
    }
}
