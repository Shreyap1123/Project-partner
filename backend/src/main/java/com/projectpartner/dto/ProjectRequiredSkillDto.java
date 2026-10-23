package com.projectpartner.dto;

import com.projectpartner.model.ProficiencyLevel;
import com.projectpartner.model.SkillCategory;

public class ProjectRequiredSkillDto {
    private Long id;
    private Long skillId;
    private String skillName;
    private SkillCategory category;
    private ProficiencyLevel minProficiency;
    private boolean mandatory;

    public ProjectRequiredSkillDto() {
    }

    public ProjectRequiredSkillDto(Long id, Long skillId, String skillName, SkillCategory category, ProficiencyLevel minProficiency, boolean mandatory) {
        this.id = id;
        this.skillId = skillId;
        this.skillName = skillName;
        this.category = category;
        this.minProficiency = minProficiency;
        this.mandatory = mandatory;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSkillId() {
        return skillId;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public SkillCategory getCategory() {
        return category;
    }

    public void setCategory(SkillCategory category) {
        this.category = category;
    }

    public ProficiencyLevel getMinProficiency() {
        return minProficiency;
    }

    public void setMinProficiency(ProficiencyLevel minProficiency) {
        this.minProficiency = minProficiency;
    }

    public boolean isMandatory() {
        return mandatory;
    }

    public void setMandatory(boolean mandatory) {
        this.mandatory = mandatory;
    }
}
