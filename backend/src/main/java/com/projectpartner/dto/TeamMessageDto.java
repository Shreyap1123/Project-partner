package com.projectpartner.dto;

import java.time.LocalDateTime;

public class TeamMessageDto {
    private Long id;
    private Long projectId;
    private Long senderId;
    private String senderName;
    private String senderAvatarUrl;
    private String message;
    private LocalDateTime createdAt;

    public TeamMessageDto() {
    }

    public TeamMessageDto(Long id, Long projectId, Long senderId, String senderName, String senderAvatarUrl, String message, LocalDateTime createdAt) {
        this.id = id;
        this.projectId = projectId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.senderAvatarUrl = senderAvatarUrl;
        this.message = message;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getSenderAvatarUrl() {
        return senderAvatarUrl;
    }

    public void setSenderAvatarUrl(String senderAvatarUrl) {
        this.senderAvatarUrl = senderAvatarUrl;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
