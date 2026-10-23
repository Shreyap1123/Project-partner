package com.projectpartner.service;

import com.projectpartner.dto.*;
import com.projectpartner.model.*;
import com.projectpartner.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeamService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private ProjectRequiredSkillRepository requiredSkillRepository;

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired
    private ProjectTaskRepository taskRepository;

    @Autowired
    private ProjectMilestoneRepository milestoneRepository;

    @Autowired
    private TeamMessageRepository teamMessageRepository;

    @Autowired
    private TeamRequestRepository teamRequestRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Transactional
    public ProjectResponseDto createProject(Long leaderId, ProjectCreateRequest request) {
        User leader = userRepository.findById(leaderId)
                .orElseThrow(() -> new RuntimeException("Leader not found"));

        Project project = new Project(
                request.getTitle(),
                request.getDescription(),
                request.getDomain() != null ? request.getDomain() : ProjectDomain.WEB_DEVELOPMENT,
                request.getMaxTeamSize() != null ? request.getMaxTeamSize() : 4,
                leader
        );
        project.setGithubRepo(request.getGithubRepo());
        project.setDemoUrl(request.getDemoUrl());

        Project savedProject = projectRepository.save(project);

        // Add leader as first team member
        TeamMember leaderMember = new TeamMember(savedProject, leader, TeamRole.LEADER);
        teamMemberRepository.save(leaderMember);

        // Add required skills
        if (request.getRequiredSkills() != null) {
            for (ProjectCreateRequest.SkillRequirementItem item : request.getRequiredSkills()) {
                if (item.getSkillId() != null) {
                    skillRepository.findById(item.getSkillId()).ifPresent(skill -> {
                        ProjectRequiredSkill prs = new ProjectRequiredSkill(
                                savedProject,
                                skill,
                                item.getMinProficiency() != null ? item.getMinProficiency() : ProficiencyLevel.INTERMEDIATE,
                                item.isMandatory()
                        );
                        requiredSkillRepository.save(prs);
                    });
                }
            }
        }

        return getProjectById(savedProject.getId());
    }

    @Transactional(readOnly = true)
    public ProjectResponseDto getProjectById(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        return mapToProjectResponseDto(project);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponseDto> getAllProjects(ProjectStatus status, ProjectDomain domain, String query) {
        List<Project> projects = projectRepository.searchProjects(status, domain, query);
        return projects.stream()
                .map(this::mapToProjectResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectResponseDto> getUserProjects(Long userId) {
        List<TeamMember> memberships = teamMemberRepository.findByUserId(userId);
        return memberships.stream()
                .map(m -> mapToProjectResponseDto(m.getProject()))
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectResponseDto addMember(Long projectId, Long userId, TeamRole role) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (teamMemberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new RuntimeException("User is already a member of this project");
        }

        List<TeamMember> currentMembers = teamMemberRepository.findByProjectId(projectId);
        if (currentMembers.size() >= project.getMaxTeamSize()) {
            throw new RuntimeException("Project team is already full!");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TeamMember member = new TeamMember(project, user, role != null ? role : TeamRole.MEMBER);
        teamMemberRepository.save(member);

        // If team reached max size, update status
        if (currentMembers.size() + 1 >= project.getMaxTeamSize()) {
            project.setStatus(ProjectStatus.IN_PROGRESS);
            projectRepository.save(project);
        }

        return getProjectById(projectId);
    }

    @Transactional
    public ProjectResponseDto removeMember(Long projectId, Long memberUserId, Long requesterUserId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        boolean isLeader = project.getLeader().getId().equals(requesterUserId);
        boolean isSelf = memberUserId.equals(requesterUserId);

        if (!isLeader && !isSelf) {
            throw new RuntimeException("Unauthorized: Only the project leader or the member themselves can perform this action");
        }

        if (memberUserId.equals(project.getLeader().getId())) {
            throw new RuntimeException("Project leader cannot leave the project directly. Reassign or delete the project.");
        }

        teamMemberRepository.deleteByProjectIdAndUserId(projectId, memberUserId);

        // If team was full and is now less than max, open for recruiting again
        List<TeamMember> remaining = teamMemberRepository.findByProjectId(projectId);
        if (remaining.size() < project.getMaxTeamSize() && project.getStatus() == ProjectStatus.IN_PROGRESS) {
            project.setStatus(ProjectStatus.RECRUITING);
            projectRepository.save(project);
        }

        return getProjectById(projectId);
    }

    @Transactional
    public ProjectResponseDto updateProjectStatus(Long projectId, ProjectStatus newStatus, Long requesterUserId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (requesterUserId != null) {
            User requester = userRepository.findById(requesterUserId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            boolean isLeader = project.getLeader().getId().equals(requesterUserId);
            boolean isAdmin = requester.getRole() == Role.ROLE_ADMIN;
            if (!isLeader && !isAdmin) {
                throw new RuntimeException("Only the project leader or administrator can update the project status");
            }
        }

        project.setStatus(newStatus);
        Project saved = projectRepository.save(project);
        return mapToProjectResponseDto(saved);
    }

    @Transactional
    public void deleteProject(Long projectId, Long requesterUserId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        if (requesterUserId != null) {
            User requester = userRepository.findById(requesterUserId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            boolean isLeader = project.getLeader().getId().equals(requesterUserId);
            boolean isAdmin = requester.getRole() == Role.ROLE_ADMIN;
            if (!isLeader && !isAdmin) {
                throw new RuntimeException("Unauthorized: Only the project leader or administrator can delete this project");
            }
        }

        taskRepository.deleteByProjectId(projectId);
        milestoneRepository.deleteByProjectId(projectId);
        teamMessageRepository.deleteByProjectId(projectId);
        teamRequestRepository.deleteByProjectId(projectId);
        teamMemberRepository.deleteByProjectId(projectId);
        requiredSkillRepository.deleteByProjectId(projectId);
        projectRepository.delete(project);
    }

    public ProjectResponseDto mapToProjectResponseDto(Project project) {
        ProjectResponseDto dto = new ProjectResponseDto();
        dto.setId(project.getId());
        dto.setTitle(project.getTitle());
        dto.setDescription(project.getDescription());
        dto.setDomain(project.getDomain());
        dto.setStatus(project.getStatus());
        dto.setMaxTeamSize(project.getMaxTeamSize());

        dto.setLeaderId(project.getLeader().getId());
        dto.setLeaderName(project.getLeader().getFullName());
        dto.setLeaderEmail(project.getLeader().getEmail());

        dto.setGithubRepo(project.getGithubRepo());
        dto.setDemoUrl(project.getDemoUrl());
        dto.setReportUrl(project.getReportUrl());
        dto.setCreatedAt(project.getCreatedAt());
        dto.setUpdatedAt(project.getUpdatedAt());

        // Members
        List<TeamMember> members = teamMemberRepository.findByProjectId(project.getId());
        dto.setCurrentTeamSize(members.size());
        dto.setOpenSlots(Math.max(0, project.getMaxTeamSize() - members.size()));

        List<TeamMemberDto> memberDtos = members.stream().map(m -> {
            String avatar = studentProfileRepository.findByUserId(m.getUser().getId())
                    .map(StudentProfile::getAvatarUrl)
                    .orElse(null);
            return new TeamMemberDto(
                    m.getId(),
                    m.getUser().getId(),
                    m.getUser().getFullName(),
                    m.getUser().getEmail(),
                    avatar,
                    m.getRoleInTeam(),
                    m.getJoinedAt()
            );
        }).collect(Collectors.toList());
        dto.setMembers(memberDtos);

        // Required skills
        List<ProjectRequiredSkill> reqSkills = requiredSkillRepository.findByProjectId(project.getId());
        List<ProjectRequiredSkillDto> skillDtos = reqSkills.stream().map(rs -> new ProjectRequiredSkillDto(
                rs.getId(),
                rs.getSkill().getId(),
                rs.getSkill().getName(),
                rs.getSkill().getCategory(),
                rs.getMinProficiency(),
                rs.isMandatory()
        )).collect(Collectors.toList());
        dto.setRequiredSkills(skillDtos);

        // Progress metrics
        long totalTasks = taskRepository.countByProjectId(project.getId());
        long doneTasks = taskRepository.countByProjectIdAndStatus(project.getId(), TaskStatus.DONE);
        long totalMilestones = milestoneRepository.countByProjectId(project.getId());
        long doneMilestones = milestoneRepository.countByProjectIdAndStatus(project.getId(), MilestoneStatus.COMPLETED);

        dto.setTotalTasksCount((int) totalTasks);
        dto.setCompletedTasksCount((int) doneTasks);
        dto.setTotalMilestonesCount((int) totalMilestones);
        dto.setCompletedMilestonesCount((int) doneMilestones);

        int progress = 0;
        if (totalTasks > 0) {
            progress = (int) Math.round(((double) doneTasks / (double) totalTasks) * 100.0);
        } else if (totalMilestones > 0) {
            progress = (int) Math.round(((double) doneMilestones / (double) totalMilestones) * 100.0);
        }
        dto.setProgressPercentage(progress);

        return dto;
    }
}
