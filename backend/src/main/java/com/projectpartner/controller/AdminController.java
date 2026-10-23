package com.projectpartner.controller;

import com.projectpartner.dto.AdminStatsDto;
import com.projectpartner.dto.ProjectResponseDto;
import com.projectpartner.dto.StudentProfileDto;
import com.projectpartner.model.ProjectStatus;
import com.projectpartner.model.Skill;
import com.projectpartner.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDto> getStats() {
        return ResponseEntity.ok(adminService.getAdminStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<StudentProfileDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PatchMapping("/users/{userId}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long userId) {
        adminService.toggleUserStatus(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/projects/{projectId}")
    public ResponseEntity<?> deleteProject(@PathVariable Long projectId) {
        adminService.deleteProject(projectId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/projects/{projectId}/status")
    public ResponseEntity<ProjectResponseDto> updateProjectStatus(
            @PathVariable Long projectId,
            @RequestParam ProjectStatus status) {
        return ResponseEntity.ok(adminService.updateProjectStatus(projectId, status));
    }

    @PostMapping("/skills")
    public ResponseEntity<Skill> createSkill(@RequestBody Skill skill) {
        return ResponseEntity.ok(adminService.createSkill(skill));
    }

    @DeleteMapping("/skills/{skillId}")
    public ResponseEntity<?> deleteSkill(@PathVariable Long skillId) {
        adminService.deleteSkill(skillId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }
}
