package com.projectpartner.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "team_members", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"project_id", "user_id"})
})
public class TeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonBackReference
    private Project project;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TeamRole roleInTeam = TeamRole.MEMBER;

    @Column(nullable = false, updatable = false)
    private LocalDateTime joinedAt = LocalDateTime.now();

    public TeamMember() {
    }

    public TeamMember(Project project, User user, TeamRole roleInTeam) {
        this.project = project;
        this.user = user;
        this.roleInTeam = roleInTeam;
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public TeamRole getRoleInTeam() {
        return roleInTeam;
    }

    public void setRoleInTeam(TeamRole roleInTeam) {
        this.roleInTeam = roleInTeam;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }
}
