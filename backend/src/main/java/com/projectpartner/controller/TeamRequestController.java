package com.projectpartner.controller;

import com.projectpartner.dto.TeamRequestDto;
import com.projectpartner.security.UserPrincipal;
import com.projectpartner.service.TeamRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/team-requests")
public class TeamRequestController {

    @Autowired
    private TeamRequestService teamRequestService;

    @PostMapping
    public ResponseEntity<TeamRequestDto> sendRequest(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody TeamRequestDto requestDto) {
        TeamRequestDto response = teamRequestService.sendRequest(currentUser.getId(), requestDto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{requestId}/respond")
    public ResponseEntity<TeamRequestDto> respondToRequest(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long requestId,
            @RequestParam boolean accept) {
        TeamRequestDto response = teamRequestService.respondToRequest(requestId, currentUser.getId(), accept);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{requestId}/cancel")
    public ResponseEntity<TeamRequestDto> cancelRequest(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long requestId) {
        TeamRequestDto response = teamRequestService.cancelRequest(requestId, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/incoming")
    public ResponseEntity<List<TeamRequestDto>> getIncomingRequests(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<TeamRequestDto> requests = teamRequestService.getIncomingRequests(currentUser.getId());
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/outgoing")
    public ResponseEntity<List<TeamRequestDto>> getOutgoingRequests(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<TeamRequestDto> requests = teamRequestService.getOutgoingRequests(currentUser.getId());
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TeamRequestDto>> getProjectRequests(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long projectId) {
        List<TeamRequestDto> requests = teamRequestService.getProjectRequests(projectId, currentUser.getId());
        return ResponseEntity.ok(requests);
    }
}
