package com.projectpartner.service;

import com.projectpartner.dto.MilestoneDto;
import com.projectpartner.dto.TaskDto;
import com.projectpartner.dto.TeamMessageDto;
import com.projectpartner.model.*;
import com.projectpartner.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectProgressService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectMilestoneRepository milestoneRepository;

    @Autowired
    private ProjectTaskRepository taskRepository;

    @Autowired
    private TeamMessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    private void verifyMemberOrLeader(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (userId == null) return;
        User user = userRepository.findById(userId).orElse(null);
        if (user != null && user.getRole() == Role.ROLE_ADMIN) {
            return;
        }

        boolean isLeader = project.getLeader().getId().equals(userId);
        boolean isMember = teamMemberRepository.existsByProjectIdAndUserId(projectId, userId);

        if (!isLeader && !isMember) {
            throw new RuntimeException("Unauthorized: You must be a team member of this project");
        }
    }

    // Milestones
    @Transactional(readOnly = true)
    public List<MilestoneDto> getMilestones(Long projectId) {
        return milestoneRepository.findByProjectIdOrderByDueDateAsc(projectId).stream()
                .map(this::mapMilestoneToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MilestoneDto createMilestone(Long projectId, MilestoneDto dto, Long userId) {
        verifyMemberOrLeader(projectId, userId);
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found"));

        ProjectMilestone milestone = new ProjectMilestone(
                project,
                dto.getTitle(),
                dto.getDescription(),
                dto.getDueDate()
        );
        if (dto.getStatus() != null) {
            milestone.setStatus(dto.getStatus());
        }

        ProjectMilestone saved = milestoneRepository.save(milestone);
        return mapMilestoneToDto(saved);
    }

    @Transactional
    public MilestoneDto updateMilestoneStatus(Long milestoneId, MilestoneStatus status, Long userId) {
        ProjectMilestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        verifyMemberOrLeader(milestone.getProject().getId(), userId);
        milestone.setStatus(status);
        ProjectMilestone saved = milestoneRepository.save(milestone);
        return mapMilestoneToDto(saved);
    }

    @Transactional
    public void deleteMilestone(Long milestoneId, Long userId) {
        ProjectMilestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        verifyMemberOrLeader(milestone.getProject().getId(), userId);
        milestoneRepository.delete(milestone);
    }

    // Tasks (Kanban)
    @Transactional(readOnly = true)
    public List<TaskDto> getTasks(Long projectId) {
        return taskRepository.findByProjectId(projectId).stream()
                .map(this::mapTaskToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public TaskDto createTask(Long projectId, TaskDto dto, Long userId) {
        verifyMemberOrLeader(projectId, userId);
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found"));

        ProjectTask task = new ProjectTask(
                project,
                dto.getTitle(),
                dto.getDescription(),
                dto.getPriority() != null ? dto.getPriority() : TaskPriority.MEDIUM,
                dto.getStatus() != null ? dto.getStatus() : TaskStatus.TODO,
                dto.getDueDate()
        );

        if (dto.getMilestoneId() != null) {
            milestoneRepository.findById(dto.getMilestoneId()).ifPresent(task::setMilestone);
        }

        if (dto.getAssignedToId() != null) {
            userRepository.findById(dto.getAssignedToId()).ifPresent(task::setAssignedTo);
        }

        ProjectTask saved = taskRepository.save(task);
        return mapTaskToDto(saved);
    }

    @Transactional
    public TaskDto updateTaskStatus(Long taskId, TaskStatus status, Long userId) {
        ProjectTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        verifyMemberOrLeader(task.getProject().getId(), userId);
        task.setStatus(status);
        ProjectTask saved = taskRepository.save(task);
        return mapTaskToDto(saved);
    }

    @Transactional
    public TaskDto updateTask(Long taskId, TaskDto dto, Long userId) {
        ProjectTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        verifyMemberOrLeader(task.getProject().getId(), userId);
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        if (dto.getPriority() != null) task.setPriority(dto.getPriority());
        if (dto.getStatus() != null) task.setStatus(dto.getStatus());
        task.setDueDate(dto.getDueDate());

        if (dto.getMilestoneId() != null) {
            milestoneRepository.findById(dto.getMilestoneId()).ifPresent(task::setMilestone);
        } else {
            task.setMilestone(null);
        }

        if (dto.getAssignedToId() != null) {
            userRepository.findById(dto.getAssignedToId()).ifPresent(task::setAssignedTo);
        } else {
            task.setAssignedTo(null);
        }

        ProjectTask saved = taskRepository.save(task);
        return mapTaskToDto(saved);
    }

    @Transactional
    public void deleteTask(Long taskId, Long userId) {
        ProjectTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        verifyMemberOrLeader(task.getProject().getId(), userId);
        taskRepository.delete(task);
    }

    // Team Discussion / Chat
    @Transactional(readOnly = true)
    public List<TeamMessageDto> getTeamMessages(Long projectId, Long userId) {
        verifyMemberOrLeader(projectId, userId);
        return messageRepository.findByProjectIdOrderByCreatedAtAsc(projectId).stream()
                .map(this::mapMessageToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public TeamMessageDto postTeamMessage(Long projectId, Long userId, String messageText) {
        verifyMemberOrLeader(projectId, userId);
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        TeamMessage message = new TeamMessage(project, user, messageText);
        TeamMessage saved = messageRepository.save(message);
        return mapMessageToDto(saved);
    }

    private MilestoneDto mapMilestoneToDto(ProjectMilestone m) {
        MilestoneDto dto = new MilestoneDto();
        dto.setId(m.getId());
        dto.setProjectId(m.getProject().getId());
        dto.setTitle(m.getTitle());
        dto.setDescription(m.getDescription());
        dto.setDueDate(m.getDueDate());
        dto.setStatus(m.getStatus());
        dto.setCreatedAt(m.getCreatedAt());
        dto.setCompletedAt(m.getCompletedAt());
        return dto;
    }

    private TaskDto mapTaskToDto(ProjectTask t) {
        TaskDto dto = new TaskDto();
        dto.setId(t.getId());
        dto.setProjectId(t.getProject().getId());
        if (t.getMilestone() != null) {
            dto.setMilestoneId(t.getMilestone().getId());
            dto.setMilestoneTitle(t.getMilestone().getTitle());
        }
        dto.setTitle(t.getTitle());
        dto.setDescription(t.getDescription());
        if (t.getAssignedTo() != null) {
            dto.setAssignedToId(t.getAssignedTo().getId());
            dto.setAssignedToName(t.getAssignedTo().getFullName());
            studentProfileRepository.findByUserId(t.getAssignedTo().getId())
                    .ifPresent(p -> dto.setAssignedToAvatarUrl(p.getAvatarUrl()));
        }
        dto.setPriority(t.getPriority());
        dto.setStatus(t.getStatus());
        dto.setDueDate(t.getDueDate());
        dto.setCreatedAt(t.getCreatedAt());
        dto.setUpdatedAt(t.getUpdatedAt());
        return dto;
    }

    private TeamMessageDto mapMessageToDto(TeamMessage msg) {
        String avatar = studentProfileRepository.findByUserId(msg.getSender().getId())
                .map(StudentProfile::getAvatarUrl)
                .orElse(null);

        return new TeamMessageDto(
                msg.getId(),
                msg.getProject().getId(),
                msg.getSender().getId(),
                msg.getSender().getFullName(),
                avatar,
                msg.getMessage(),
                msg.getCreatedAt()
        );
    }
}
