package com.projectpartner.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import javax.persistence.*;

@Entity
@Table(name = "project_required_skills", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"project_id", "skill_id"})
})
public class ProjectRequiredSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonBackReference
    private Project project;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProficiencyLevel minProficiency = ProficiencyLevel.INTERMEDIATE;

    @Column(nullable = false)
    private boolean mandatory = true;

    public ProjectRequiredSkill() {
    }

    public ProjectRequiredSkill(Project project, Skill skill, ProficiencyLevel minProficiency, boolean mandatory) {
        this.project = project;
        this.skill = skill;
        this.minProficiency = minProficiency;
        this.mandatory = mandatory;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public Skill getSkill() {
        return skill;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
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
