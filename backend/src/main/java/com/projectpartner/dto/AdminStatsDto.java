package com.projectpartner.dto;

import java.util.HashMap;
import java.util.Map;

public class AdminStatsDto {
    private long totalUsers;
    private long totalStudents;
    private long totalAdmins;
    private long totalProjects;
    private long recruitingProjects;
    private long inProgressProjects;
    private long completedProjects;
    private long totalRequests;
    private long acceptedRequests;
    private long pendingRequests;

    private Map<String, Long> domainDistribution = new HashMap<>();
    private Map<String, Long> skillPopularity = new HashMap<>();

    public AdminStatsDto() {
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getTotalAdmins() {
        return totalAdmins;
    }

    public void setTotalAdmins(long totalAdmins) {
        this.totalAdmins = totalAdmins;
    }

    public long getTotalProjects() {
        return totalProjects;
    }

    public void setTotalProjects(long totalProjects) {
        this.totalProjects = totalProjects;
    }

    public long getRecruitingProjects() {
        return recruitingProjects;
    }

    public void setRecruitingProjects(long recruitingProjects) {
        this.recruitingProjects = recruitingProjects;
    }

    public long getInProgressProjects() {
        return inProgressProjects;
    }

    public void setInProgressProjects(long inProgressProjects) {
        this.inProgressProjects = inProgressProjects;
    }

    public long getCompletedProjects() {
        return completedProjects;
    }

    public void setCompletedProjects(long completedProjects) {
        this.completedProjects = completedProjects;
    }

    public long getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(long totalRequests) {
        this.totalRequests = totalRequests;
    }

    public long getAcceptedRequests() {
        return acceptedRequests;
    }

    public void setAcceptedRequests(long acceptedRequests) {
        this.acceptedRequests = acceptedRequests;
    }

    public long getPendingRequests() {
        return pendingRequests;
    }

    public void setPendingRequests(long pendingRequests) {
        this.pendingRequests = pendingRequests;
    }

    public Map<String, Long> getDomainDistribution() {
        return domainDistribution;
    }

    public void setDomainDistribution(Map<String, Long> domainDistribution) {
        this.domainDistribution = domainDistribution;
    }

    public Map<String, Long> getSkillPopularity() {
        return skillPopularity;
    }

    public void setSkillPopularity(Map<String, Long> skillPopularity) {
        this.skillPopularity = skillPopularity;
    }
}
