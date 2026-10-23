package com.projectpartner.dto;

import java.util.ArrayList;
import java.util.List;

public class MatchCandidateDto {
    private Long studentProfileId;
    private Long userId;
    private String fullName;
    private String email;
    private String avatarUrl;
    private String university;
    private String department;
    private String degreeLevel;
    private Integer availableHoursPerWeek;
    private int matchPercentage;
    private String recommendationReason;

    private List<SkillDto> matchedSkills = new ArrayList<>();
    private List<String> missingSkills = new ArrayList<>();
    private List<String> overlappingDomains = new ArrayList<>();

    public MatchCandidateDto() {
    }

    public Long getStudentProfileId() {
        return studentProfileId;
    }

    public void setStudentProfileId(Long studentProfileId) {
        this.studentProfileId = studentProfileId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
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

    public Integer getAvailableHoursPerWeek() {
        return availableHoursPerWeek;
    }

    public void setAvailableHoursPerWeek(Integer availableHoursPerWeek) {
        this.availableHoursPerWeek = availableHoursPerWeek;
    }

    public int getMatchPercentage() {
        return matchPercentage;
    }

    public void setMatchPercentage(int matchPercentage) {
        this.matchPercentage = matchPercentage;
    }

    public String getRecommendationReason() {
        return recommendationReason;
    }

    public void setRecommendationReason(String recommendationReason) {
        this.recommendationReason = recommendationReason;
    }

    public List<SkillDto> getMatchedSkills() {
        return matchedSkills;
    }

    public void setMatchedSkills(List<SkillDto> matchedSkills) {
        this.matchedSkills = matchedSkills;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills;
    }

    public List<String> getOverlappingDomains() {
        return overlappingDomains;
    }

    public void setOverlappingDomains(List<String> overlappingDomains) {
        this.overlappingDomains = overlappingDomains;
    }
}
