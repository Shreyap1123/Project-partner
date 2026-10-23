package com.projectpartner.dto;

import com.projectpartner.model.ProficiencyLevel;
import com.projectpartner.model.SkillCategory;

public class SkillDto {
    private Long skillId;
    private String name;
    private SkillCategory category;
    private ProficiencyLevel proficiencyLevel;
    private Double yearsOfExperience;

    public SkillDto() {
    }

    public SkillDto(Long skillId, String name, SkillCategory category, ProficiencyLevel proficiencyLevel, Double yearsOfExperience) {
        this.skillId = skillId;
        this.name = name;
        this.category = category;
        this.proficiencyLevel = proficiencyLevel;
        this.yearsOfExperience = yearsOfExperience;
    }

    public Long getSkillId() {
        return skillId;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public SkillCategory getCategory() {
        return category;
    }

    public void setCategory(SkillCategory category) {
        this.category = category;
    }

    public ProficiencyLevel getProficiencyLevel() {
        return proficiencyLevel;
    }

    public void setProficiencyLevel(ProficiencyLevel proficiencyLevel) {
        this.proficiencyLevel = proficiencyLevel;
    }

    public Double getYearsOfExperience() {
        return yearsOfExperience;
    }

    public void setYearsOfExperience(Double yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }
}
