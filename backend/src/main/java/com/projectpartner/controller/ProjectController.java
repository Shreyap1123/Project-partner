package com.projectpartner.controller;

import com.projectpartner.dto.ProjectCreateRequest;
import com.projectpartner.dto.ProjectResponseDto;
import com.projectpartner.model.ProjectDomain;
import com.projectpartner.model.ProjectStatus;
import com.projectpartner.security.UserPrincipal;
import com.projectpartner.service.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private TeamService teamService;

    @PostMapping
    public ResponseEntity<ProjectResponseDto> createProject(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody ProjectCreateRequest request) {
        ProjectResponseDto created = teamService.createProject(currentUser.getId(), request);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectResponseDto> getProjectById(@PathVariable Long projectId) {
        ProjectResponseDto project = teamService.getProjectById(projectId);
        return ResponseEntity.ok(project);
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponseDto>> getAllProjects(
            @RequestParam(required = false) ProjectStatus status,
            @RequestParam(required = false) ProjectDomain domain,
            @RequestParam(required = false) String query) {
        List<ProjectResponseDto> projects = teamService.getAllProjects(status, domain, query);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/user/me")
    public ResponseEntity<List<ProjectResponseDto>> getMyProjects(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<ProjectResponseDto> projects = teamService.getUserProjects(currentUser.getId());
        return ResponseEntity.ok(projects);
    }

    @PatchMapping("/{projectId}/status")
    public ResponseEntity<ProjectResponseDto> updateStatus(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long projectId,
            @RequestParam ProjectStatus status) {
        ProjectResponseDto updated = teamService.updateProjectStatus(projectId, status, currentUser.getId());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{projectId}/members/{memberUserId}")
    public ResponseEntity<ProjectResponseDto> removeMember(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long projectId,
            @PathVariable Long memberUserId) {
        ProjectResponseDto updated = teamService.removeMember(projectId, memberUserId, currentUser.getId());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<?> deleteProject(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long projectId) {
        teamService.deleteProject(projectId, currentUser.getId());
        return ResponseEntity.ok().build();
    }
}
