package com.projectpartner.controller;

import com.projectpartner.dto.MatchCandidateDto;
import com.projectpartner.dto.ProjectResponseDto;
import com.projectpartner.security.UserPrincipal;
import com.projectpartner.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @GetMapping("/teammates/{projectId}")
    public ResponseEntity<List<MatchCandidateDto>> getTeammateRecommendations(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "15") int limit) {
        List<MatchCandidateDto> recommendations = recommendationService.recommendTeammatesForProject(projectId, limit);
        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/projects")
    public ResponseEntity<List<ProjectResponseDto>> getProjectRecommendations(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "10") int limit) {
        List<ProjectResponseDto> recommendations = recommendationService.recommendProjectsForStudent(currentUser.getId(), limit);
        return ResponseEntity.ok(recommendations);
    }
}
