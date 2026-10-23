package com.projectpartner.service;

import com.projectpartner.dto.AdminStatsDto;
import com.projectpartner.dto.ProjectResponseDto;
import com.projectpartner.dto.StudentProfileDto;
import com.projectpartner.model.*;
import com.projectpartner.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TeamRequestRepository teamRequestRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private StudentSkillRepository studentSkillRepository;

    @Autowired
    private ProjectRequiredSkillRepository projectRequiredSkillRepository;

    @Autowired
    private StudentProjectRepository studentProjectRepository;

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired
    private ProjectTaskRepository taskRepository;

    @Autowired
    private TeamMessageRepository teamMessageRepository;

    @Autowired
    private TeamService teamService;

    @Autowired
    private StudentProfileService studentProfileService;

    @Transactional(readOnly = true)
    public AdminStatsDto getAdminStats() {
        AdminStatsDto stats = new AdminStatsDto();
        stats.setTotalUsers(userRepository.count());
        stats.setTotalStudents(userRepository.countByRole(Role.ROLE_STUDENT));
        stats.setTotalAdmins(userRepository.countByRole(Role.ROLE_ADMIN));

        stats.setTotalProjects(projectRepository.count());
        stats.setRecruitingProjects(projectRepository.countByStatus(ProjectStatus.RECRUITING));
        stats.setInProgressProjects(projectRepository.countByStatus(ProjectStatus.IN_PROGRESS));
        stats.setCompletedProjects(projectRepository.countByStatus(ProjectStatus.COMPLETED));

        stats.setTotalRequests(teamRequestRepository.count());
        stats.setAcceptedRequests(teamRequestRepository.countByStatus(RequestStatus.ACCEPTED));
        stats.setPendingRequests(teamRequestRepository.countByStatus(RequestStatus.PENDING));

        // Domain distribution
        Map<String, Long> domainDist = new HashMap<>();
        for (Project p : projectRepository.findAll()) {
            String domain = p.getDomain().getDisplayName();
            domainDist.put(domain, domainDist.getOrDefault(domain, 0L) + 1);
        }
        stats.setDomainDistribution(domainDist);

        // Top skills popularity
        Map<String, Long> skillPop = new HashMap<>();
        for (StudentSkill ss : studentSkillRepository.findAll()) {
            String skill = ss.getSkill().getName();
            skillPop.put(skill, skillPop.getOrDefault(skill, 0L) + 1);
        }
        stats.setSkillPopularity(skillPop);

        return stats;
    }

    @Transactional(readOnly = true)
    public List<StudentProfileDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> {
                    StudentProfile profile = studentProfileRepository.findByUserId(u.getId()).orElse(null);
                    StudentProfileDto dto;
                    if (profile != null) {
                        dto = studentProfileService.mapToDto(profile);
                    } else {
                        dto = new StudentProfileDto();
                        dto.setUserId(u.getId());
                        dto.setFullName(u.getFullName());
                        dto.setEmail(u.getEmail());
                        dto.setDepartment("System Administrator");
                        dto.setUniversity("ProjectPartner");
                    }
                    dto.setEnabled(u.isEnabled());
                    dto.setRole(u.getRole() != null ? u.getRole().name() : "ROLE_STUDENT");
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
    }

    @Transactional
    public void deleteProject(Long projectId) {
        teamService.deleteProject(projectId, null);
    }

    @Transactional
    public ProjectResponseDto updateProjectStatus(Long projectId, ProjectStatus status) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        project.setStatus(status);
        Project saved = projectRepository.save(project);
        return teamService.mapToProjectResponseDto(saved);
    }

    @Transactional
    public Skill createSkill(Skill skill) {
        if (skillRepository.existsByNameIgnoreCase(skill.getName())) {
            throw new RuntimeException("Skill already exists!");
        }
        return skillRepository.save(skill);
    }

    @Transactional
    public void deleteSkill(Long skillId) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found with id: " + skillId));
        studentSkillRepository.deleteBySkillId(skillId);
        projectRequiredSkillRepository.deleteBySkillId(skillId);
        skillRepository.delete(skill);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // 1. Unassign user from any tasks
        List<ProjectTask> assignedTasks = taskRepository.findByAssignedToId(userId);
        for (ProjectTask task : assignedTasks) {
            task.setAssignedTo(null);
            taskRepository.save(task);
        }

        // 2. Delete team messages sent by user
        teamMessageRepository.deleteBySenderId(userId);

        // 3. Delete team requests involving user as sender or receiver
        teamRequestRepository.deleteBySenderId(userId);
        teamRequestRepository.deleteByReceiverId(userId);

        // 4. Delete any projects led by user
        List<Project> led = projectRepository.findByLeaderId(userId);
        for (Project p : led) {
            teamService.deleteProject(p.getId(), null);
        }

        // 5. Remove from team memberships
        teamMemberRepository.deleteByUserId(userId);

        // 6. Remove profile, student skills, past projects
        studentProfileRepository.findByUserId(userId).ifPresent(profile -> {
            studentSkillRepository.deleteByStudentProfileId(profile.getId());
            studentProjectRepository.deleteByStudentProfileId(profile.getId());
            studentProfileRepository.delete(profile);
        });

        // 7. Delete the user
        userRepository.delete(user);
    }
}
