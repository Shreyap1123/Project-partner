package com.projectpartner.controller;

import com.projectpartner.dto.SkillDto;
import com.projectpartner.dto.StudentProfileDto;
import com.projectpartner.dto.StudentProjectDto;
import com.projectpartner.security.UserPrincipal;
import com.projectpartner.service.StudentProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profiles")
public class StudentProfileController {

    @Autowired
    private StudentProfileService studentProfileService;

    @GetMapping("/me")
    public ResponseEntity<StudentProfileDto> getMyProfile(@AuthenticationPrincipal UserPrincipal currentUser) {
        StudentProfileDto profile = studentProfileService.getProfileByUserId(currentUser.getId());
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<StudentProfileDto> getProfileByUserId(@PathVariable Long userId) {
        StudentProfileDto profile = studentProfileService.getProfileByUserId(userId);
        return ResponseEntity.ok(profile);
    }

    @GetMapping
    public ResponseEntity<List<StudentProfileDto>> getAllProfiles(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer minHours) {
        List<StudentProfileDto> profiles = studentProfileService.getAllProfiles(department, minHours);
        return ResponseEntity.ok(profiles);
    }

    @PutMapping("/me")
    public ResponseEntity<StudentProfileDto> updateMyProfile(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody StudentProfileDto profileDto) {
        StudentProfileDto updated = studentProfileService.updateProfile(currentUser.getId(), profileDto);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/me/skills")
    public ResponseEntity<StudentProfileDto> addSkill(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody SkillDto skillDto) {
        StudentProfileDto updated = studentProfileService.addOrUpdateSkill(currentUser.getId(), skillDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/me/skills/{skillId}")
    public ResponseEntity<StudentProfileDto> removeSkill(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long skillId) {
        StudentProfileDto updated = studentProfileService.removeSkill(currentUser.getId(), skillId);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/me/projects")
    public ResponseEntity<StudentProfileDto> addPastProject(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody StudentProjectDto projectDto) {
        StudentProfileDto updated = studentProfileService.addPastProject(currentUser.getId(), projectDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/me/projects/{projectId}")
    public ResponseEntity<StudentProfileDto> deletePastProject(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long projectId) {
        StudentProfileDto updated = studentProfileService.deletePastProject(currentUser.getId(), projectId);
        return ResponseEntity.ok(updated);
    }
}
