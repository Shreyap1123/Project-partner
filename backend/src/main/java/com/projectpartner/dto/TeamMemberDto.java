package com.projectpartner.dto;

import com.projectpartner.model.TeamRole;
import java.time.LocalDateTime;

public class TeamMemberDto {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String avatarUrl;
    private TeamRole roleInTeam;
    private LocalDateTime joinedAt;

    public TeamMemberDto() {
    }

    public TeamMemberDto(Long id, Long userId, String fullName, String email, String avatarUrl, TeamRole roleInTeam, LocalDateTime joinedAt) {
        this.id = id;
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.avatarUrl = avatarUrl;
        this.roleInTeam = roleInTeam;
        this.joinedAt = joinedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
