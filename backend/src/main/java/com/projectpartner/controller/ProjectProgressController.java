package com.projectpartner.controller;

import com.projectpartner.dto.MilestoneDto;
import com.projectpartner.dto.TaskDto;
import com.projectpartner.dto.TeamMessageDto;
import com.projectpartner.model.MilestoneStatus;
import com.projectpartner.model.TaskStatus;
import com.projectpartner.security.UserPrincipal;
import com.projectpartner.service.ProjectProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/progress")
public class ProjectProgressController {

    @Autowired
    private ProjectProgressService progressService;

    // Milestones
    @GetMapping("/{projectId}/milestones")
    public ResponseEntity<List<MilestoneDto>> getMilestones(@PathVariable Long projectId) {
        return ResponseEntity.ok(progressService.getMilestones(projectId));
    }

    @PostMapping("/{projectId}/milestones")
    public ResponseEntity<MilestoneDto> createMilestone(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long projectId,
            @Valid @RequestBody MilestoneDto dto) {
        return ResponseEntity.ok(progressService.createMilestone(projectId, dto, currentUser.getId()));
    }

    @PatchMapping("/milestones/{milestoneId}/status")
    public ResponseEntity<MilestoneDto> updateMilestoneStatus(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long milestoneId,
            @RequestParam MilestoneStatus status) {
        return ResponseEntity.ok(progressService.updateMilestoneStatus(milestoneId, status, currentUser.getId()));
    }

    @DeleteMapping("/milestones/{milestoneId}")
    public ResponseEntity<?> deleteMilestone(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long milestoneId) {
        progressService.deleteMilestone(milestoneId, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    // Tasks (Kanban)
    @GetMapping("/{projectId}/tasks")
    public ResponseEntity<List<TaskDto>> getTasks(@PathVariable Long projectId) {
        return ResponseEntity.ok(progressService.getTasks(projectId));
    }

    @PostMapping("/{projectId}/tasks")
    public ResponseEntity<TaskDto> createTask(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long projectId,
            @Valid @RequestBody TaskDto dto) {
        return ResponseEntity.ok(progressService.createTask(projectId, dto, currentUser.getId()));
    }

    @PatchMapping("/tasks/{taskId}/status")
    public ResponseEntity<TaskDto> updateTaskStatus(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long taskId,
            @RequestParam TaskStatus status) {
        return ResponseEntity.ok(progressService.updateTaskStatus(taskId, status, currentUser.getId()));
    }

    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<TaskDto> updateTask(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long taskId,
            @Valid @RequestBody TaskDto dto) {
        return ResponseEntity.ok(progressService.updateTask(taskId, dto, currentUser.getId()));
    }

    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<?> deleteTask(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long taskId) {
        progressService.deleteTask(taskId, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    // Team Discussion Board
    @GetMapping("/{projectId}/messages")
    public ResponseEntity<List<TeamMessageDto>> getMessages(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long projectId) {
        return ResponseEntity.ok(progressService.getTeamMessages(projectId, currentUser.getId()));
    }

    @PostMapping("/{projectId}/messages")
    public ResponseEntity<TeamMessageDto> postMessage(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long projectId,
            @RequestBody Map<String, String> payload) {
        String message = payload.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(progressService.postTeamMessage(projectId, currentUser.getId(), message.trim()));
    }
}
