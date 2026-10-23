package com.projectpartner.dto;

import com.projectpartner.model.ProficiencyLevel;
import com.projectpartner.model.ProjectDomain;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class ProjectCreateRequest {

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private ProjectDomain domain = ProjectDomain.WEB_DEVELOPMENT;

    private Integer maxTeamSize = 4;
    private String githubRepo;
    private String demoUrl;

    private List<SkillRequirementItem> requiredSkills = new ArrayList<>();

    public static class SkillRequirementItem {
        private Long skillId;
        private ProficiencyLevel minProficiency = ProficiencyLevel.INTERMEDIATE;
        private boolean mandatory = true;

        public SkillRequirementItem() {
        }

        public SkillRequirementItem(Long skillId, ProficiencyLevel minProficiency, boolean mandatory) {
            this.skillId = skillId;
            this.minProficiency = minProficiency;
            this.mandatory = mandatory;
        }

        public Long getSkillId() {
            return skillId;
        }

        public void setSkillId(Long skillId) {
            this.skillId = skillId;
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

    public ProjectCreateRequest() {
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

    public Integer getMaxTeamSize() {
        return maxTeamSize;
    }

    public void setMaxTeamSize(Integer maxTeamSize) {
        this.maxTeamSize = maxTeamSize;
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

    public List<SkillRequirementItem> getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(List<SkillRequirementItem> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }
}
