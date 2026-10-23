package com.projectpartner.service;

import com.projectpartner.dto.TeamRequestDto;
import com.projectpartner.model.*;
import com.projectpartner.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeamRequestService {

    @Autowired
    private TeamRequestRepository teamRequestRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private TeamService teamService;

    @Transactional
    public TeamRequestDto sendRequest(Long senderUserId, TeamRequestDto requestDto) {
        User sender = userRepository.findById(senderUserId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        Project project = projectRepository.findById(requestDto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        User receiver;
        if (requestDto.getRequestType() == RequestType.JOIN_REQUEST) {
            receiver = project.getLeader();
        } else {
            if (requestDto.getReceiverId() == null) {
                throw new RuntimeException("Receiver ID required for invite requests");
            }
            receiver = userRepository.findById(requestDto.getReceiverId())
                    .orElseThrow(() -> new RuntimeException("Candidate receiver not found"));
        }

        Long studentUserId = (requestDto.getRequestType() == RequestType.JOIN_REQUEST) ? sender.getId() : receiver.getId();

        // Check if student is already a member
        if (teamMemberRepository.existsByProjectIdAndUserId(project.getId(), studentUserId)) {
            throw new RuntimeException("Student is already a member of this project");
        }

        // Check if team is full
        List<TeamMember> currentMembers = teamMemberRepository.findByProjectId(project.getId());
        if (currentMembers.size() >= project.getMaxTeamSize()) {
            throw new RuntimeException("Cannot send request: Project team is already full!");
        }

        // Check for existing pending request
        teamRequestRepository.findByProjectIdAndSenderIdAndReceiverIdAndStatus(
                project.getId(), sender.getId(), receiver.getId(), RequestStatus.PENDING
        ).ifPresent(r -> {
            throw new RuntimeException("A pending request already exists between you for this project");
        });

        TeamRequest teamRequest = new TeamRequest(
                project,
                sender,
                receiver,
                requestDto.getRequestType(),
                requestDto.getProposedRole() != null ? requestDto.getProposedRole() : TeamRole.MEMBER,
                requestDto.getMessage()
        );

        TeamRequest saved = teamRequestRepository.save(teamRequest);
        return mapToDto(saved);
    }

    @Transactional
    public TeamRequestDto respondToRequest(Long requestId, Long currentUserId, boolean accept) {
        TeamRequest request = teamRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getReceiver().getId().equals(currentUserId)) {
            throw new RuntimeException("Unauthorized: Only the recipient can respond to this request");
        }

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Request is no longer pending");
        }

        if (accept) {
            request.setStatus(RequestStatus.ACCEPTED);
            request.setRespondedAt(LocalDateTime.now());

            // Add candidate to team members
            Long candidateUserId = (request.getRequestType() == RequestType.JOIN_REQUEST)
                    ? request.getSender().getId()
                    : request.getReceiver().getId();

            teamService.addMember(request.getProject().getId(), candidateUserId, request.getProposedRole());
        } else {
            request.setStatus(RequestStatus.REJECTED);
            request.setRespondedAt(LocalDateTime.now());
        }

        TeamRequest saved = teamRequestRepository.save(request);
        return mapToDto(saved);
    }

    @Transactional
    public TeamRequestDto cancelRequest(Long requestId, Long currentUserId) {
        TeamRequest request = teamRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getSender().getId().equals(currentUserId)) {
            throw new RuntimeException("Unauthorized: Only the sender can cancel this request");
        }

        request.setStatus(RequestStatus.CANCELLED);
        request.setRespondedAt(LocalDateTime.now());
        TeamRequest saved = teamRequestRepository.save(request);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<TeamRequestDto> getIncomingRequests(Long userId) {
        return teamRequestRepository.findByReceiverId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TeamRequestDto> getOutgoingRequests(Long userId) {
        return teamRequestRepository.findBySenderId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TeamRequestDto> getProjectRequests(Long projectId, Long currentUserId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getLeader().getId().equals(currentUserId)) {
            throw new RuntimeException("Unauthorized: Only project leader can view all project requests");
        }

        return teamRequestRepository.findByProjectId(projectId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public TeamRequestDto mapToDto(TeamRequest tr) {
        TeamRequestDto dto = new TeamRequestDto();
        dto.setId(tr.getId());
        dto.setProjectId(tr.getProject().getId());
        dto.setProjectTitle(tr.getProject().getTitle());

        dto.setSenderId(tr.getSender().getId());
        dto.setSenderName(tr.getSender().getFullName());
        dto.setSenderEmail(tr.getSender().getEmail());
        studentProfileRepository.findByUserId(tr.getSender().getId())
                .ifPresent(p -> dto.setSenderAvatarUrl(p.getAvatarUrl()));

        dto.setReceiverId(tr.getReceiver().getId());
        dto.setReceiverName(tr.getReceiver().getFullName());
        dto.setReceiverEmail(tr.getReceiver().getEmail());
        studentProfileRepository.findByUserId(tr.getReceiver().getId())
                .ifPresent(p -> dto.setReceiverAvatarUrl(p.getAvatarUrl()));

        dto.setRequestType(tr.getRequestType());
        dto.setStatus(tr.getStatus());
        dto.setProposedRole(tr.getProposedRole());
        dto.setMessage(tr.getMessage());
        dto.setCreatedAt(tr.getCreatedAt());
        dto.setRespondedAt(tr.getRespondedAt());
        return dto;
    }
}
