package com.projectpartner;

import com.projectpartner.dto.*;
import com.projectpartner.model.*;
import com.projectpartner.repository.*;
import com.projectpartner.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("h2")
@Transactional
public class ProjectPartnerApplicationTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private StudentProfileService profileService;

    @Autowired
    private TeamService teamService;

    @Autowired
    private TeamRequestService requestService;

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private ProjectProgressService progressService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Test
    void contextLoads() {
        assertNotNull(authService);
        assertNotNull(teamService);
        assertNotNull(recommendationService);
    }

    @Test
    void testRegisterAndLogin() {
        RegisterRequest register = new RegisterRequest();
        register.setEmail("test_student@campus.edu");
        register.setPassword("password123");
        register.setFullName("Test Student");
        register.setUniversity("Test University");
        register.setDepartment("Computer Science");
        register.setDegreeLevel("B.Tech");
        register.setGraduationYear(2026);
        register.setAvailableHoursPerWeek(20);

        AuthResponse authRes = authService.registerUser(register);
        assertNotNull(authRes);
        assertNotNull(authRes.getToken());
        assertEquals("Test Student", authRes.getFullName());

        // Verify profile was created
        StudentProfileDto profile = profileService.getProfileByUserId(authRes.getId());
        assertNotNull(profile);
        assertEquals("Test University", profile.getUniversity());

        // Test login
        AuthRequest loginReq = new AuthRequest("test_student@campus.edu", "password123");
        AuthResponse loginRes = authService.loginUser(loginReq);
        assertNotNull(loginRes);
        assertEquals(authRes.getId(), loginRes.getId());
    }

    @Test
    void testRecommendationEngineFiltersDisabledUsers() {
        List<Project> recruiting = projectRepository.findByStatus(ProjectStatus.RECRUITING);
        assertFalse(recruiting.isEmpty(), "At least one recruiting project should be seeded");
        Project project = recruiting.get(0);

        List<MatchCandidateDto> candidatesBefore = recommendationService.recommendTeammatesForProject(project.getId(), 20);
        assertFalse(candidatesBefore.isEmpty());

        // Disable first candidate
        Long candidateUserId = candidatesBefore.get(0).getUserId();
        User candidateUser = userRepository.findById(candidateUserId).orElseThrow(RuntimeException::new);
        candidateUser.setEnabled(false);
        userRepository.save(candidateUser);

        // Fetch again - candidate should NOT be recommended
        List<MatchCandidateDto> candidatesAfter = recommendationService.recommendTeammatesForProject(project.getId(), 20);
        boolean stillPresent = candidatesAfter.stream().anyMatch(c -> c.getUserId().equals(candidateUserId));
        assertFalse(stillPresent, "Disabled users must not be recommended by the matching engine");
    }

    @Test
    void testMilestoneCompletedAtTimestamp() {
        List<Project> projects = projectRepository.findAll();
        assertFalse(projects.isEmpty());
        Project project = projects.get(0);

        MilestoneDto newMilestone = new MilestoneDto();
        newMilestone.setTitle("Test Sprint Delivery");
        newMilestone.setDescription("Finish API endpoints");
        newMilestone.setStatus(MilestoneStatus.NOT_STARTED);

        MilestoneDto created = progressService.createMilestone(project.getId(), newMilestone, project.getLeader().getId());
        assertNull(created.getCompletedAt(), "Uncompleted milestone should have null completedAt");

        MilestoneDto updated = progressService.updateMilestoneStatus(created.getId(), MilestoneStatus.COMPLETED, project.getLeader().getId());
        assertEquals(MilestoneStatus.COMPLETED, updated.getStatus());
        assertNotNull(updated.getCompletedAt(), "Completed milestone must set completedAt timestamp");
    }

    @Test
    void testAdminDeleteUserCascadeClean() {
        // Register a temporary user who has a task and a message
        RegisterRequest register = new RegisterRequest();
        register.setEmail("user_to_delete@campus.edu");
        register.setPassword("password123");
        register.setFullName("User To Delete");
        register.setUniversity("Tech University");
        register.setDepartment("Informatics");
        AuthResponse userAuth = authService.registerUser(register);

        Project project = projectRepository.findAll().get(0);

        // Add user as member
        teamService.addMember(project.getId(), userAuth.getId(), TeamRole.FRONTEND_DEV);

        // Post a message
        progressService.postTeamMessage(project.getId(), userAuth.getId(), "Hello team!");

        // Assign a task
        TaskDto task = new TaskDto();
        task.setTitle("Assigned Task");
        task.setAssignedToId(userAuth.getId());
        progressService.createTask(project.getId(), task, project.getLeader().getId());

        // Admin deletes user
        adminService.deleteUser(userAuth.getId());

        // Verify user is gone and no SQL foreign key exceptions occurred
        assertFalse(userRepository.findById(userAuth.getId()).isPresent());
    }

    @Test
    void testBidirectionalRequestDuplicatePrevention() {
        Project project = projectRepository.findByStatus(ProjectStatus.RECRUITING).get(0);
        User leader = project.getLeader();

        RegisterRequest register = new RegisterRequest();
        register.setEmail("req_student@campus.edu");
        register.setPassword("password123");
        register.setFullName("Req Student");
        AuthResponse studentAuth = authService.registerUser(register);

        // Leader sends an invite
        TeamRequestDto invite = new TeamRequestDto();
        invite.setProjectId(project.getId());
        invite.setReceiverId(studentAuth.getId());
        invite.setRequestType(RequestType.INVITE_REQUEST);
        invite.setMessage("Join our team!");
        requestService.sendRequest(leader.getId(), invite);

        // Student tries to send a join request for the same project
        TeamRequestDto join = new TeamRequestDto();
        join.setProjectId(project.getId());
        join.setRequestType(RequestType.JOIN_REQUEST);
        join.setMessage("I want to join!");

        assertThrows(RuntimeException.class, () -> {
            requestService.sendRequest(studentAuth.getId(), join);
        }, "Should reject conflicting duplicate request in reverse direction");
    }
}
