package com.projectpartner.service;

import com.projectpartner.dto.MatchCandidateDto;
import com.projectpartner.dto.ProjectResponseDto;
import com.projectpartner.dto.SkillDto;
import com.projectpartner.model.*;
import com.projectpartner.repository.ProjectRepository;
import com.projectpartner.repository.StudentProfileRepository;
import com.projectpartner.repository.TeamMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired
    private TeamService teamService;

    @Transactional(readOnly = true)
    public List<MatchCandidateDto> recommendTeammatesForProject(Long projectId, int limit) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        // Get IDs of current team members and project leader
        Set<Long> existingMemberUserIds = project.getMembers().stream()
                .map(m -> m.getUser().getId())
                .collect(Collectors.toSet());
        existingMemberUserIds.add(project.getLeader().getId());

        List<StudentProfile> allStudents = studentProfileRepository.findAll();
        List<ProjectRequiredSkill> requiredSkills = project.getRequiredSkills();

        List<MatchCandidateDto> candidateDtos = new ArrayList<>();

        for (StudentProfile student : allStudents) {
            if (student.getUser() == null || existingMemberUserIds.contains(student.getUser().getId())) {
                continue;
            }

            MatchCandidateDto candidate = evaluateStudentForProject(student, project, requiredSkills);
            candidateDtos.add(candidate);
        }

        // Sort descending by match percentage
        candidateDtos.sort((a, b) -> Integer.compare(b.getMatchPercentage(), a.getMatchPercentage()));

        if (limit > 0 && candidateDtos.size() > limit) {
            return candidateDtos.subList(0, limit);
        }
        return candidateDtos;
    }

    @Transactional(readOnly = true)
    public List<ProjectResponseDto> recommendProjectsForStudent(Long userId, int limit) {
        StudentProfile studentProfile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found for user: " + userId));

        List<Project> recruitingProjects = projectRepository.findByStatus(ProjectStatus.RECRUITING);
        List<TeamMember> userMemberships = teamMemberRepository.findByUserId(userId);
        Set<Long> joinedProjectIds = userMemberships.stream()
                .map(m -> m.getProject().getId())
                .collect(Collectors.toSet());

        List<ProjectScore> scoredProjects = new ArrayList<>();

        for (Project project : recruitingProjects) {
            if (project.getLeader().getId().equals(userId) || joinedProjectIds.contains(project.getId())) {
                continue; // Skip already joined projects
            }

            MatchCandidateDto matchEvaluation = evaluateStudentForProject(studentProfile, project, project.getRequiredSkills());
            scoredProjects.add(new ProjectScore(project, matchEvaluation.getMatchPercentage()));
        }

        // Sort projects descending by score
        scoredProjects.sort((a, b) -> Integer.compare(b.score, a.score));

        List<ProjectResponseDto> result = new ArrayList<>();
        int count = 0;
        for (ProjectScore ps : scoredProjects) {
            if (limit > 0 && count >= limit) break;
            result.add(teamService.mapToProjectResponseDto(ps.project));
            count++;
        }

        return result;
    }

    private MatchCandidateDto evaluateStudentForProject(StudentProfile student, Project project, List<ProjectRequiredSkill> requiredSkills) {
        MatchCandidateDto dto = new MatchCandidateDto();
        dto.setStudentProfileId(student.getId());
        dto.setUserId(student.getUser().getId());
        dto.setFullName(student.getUser().getFullName());
        dto.setEmail(student.getUser().getEmail());
        dto.setAvatarUrl(student.getAvatarUrl());
        dto.setUniversity(student.getUniversity());
        dto.setDepartment(student.getDepartment());
        dto.setDegreeLevel(student.getDegreeLevel());
        dto.setAvailableHoursPerWeek(student.getAvailableHoursPerWeek());

        // Map student's skills
        Map<Long, StudentSkill> studentSkillMap = new HashMap<>();
        if (student.getSkills() != null) {
            for (StudentSkill ss : student.getSkills()) {
                studentSkillMap.put(ss.getSkill().getId(), ss);
            }
        }

        double skillScore = 0.0;
        double maxSkillScore = 0.0;
        List<SkillDto> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        if (requiredSkills == null || requiredSkills.isEmpty()) {
            skillScore = 70.0;
            maxSkillScore = 70.0;
        } else {
            for (ProjectRequiredSkill req : requiredSkills) {
                int reqWeight = req.getMinProficiency() != null ? req.getMinProficiency().getWeight() : 2;
                maxSkillScore += reqWeight * (req.isMandatory() ? 1.5 : 1.0);

                if (studentSkillMap.containsKey(req.getSkill().getId())) {
                    StudentSkill ss = studentSkillMap.get(req.getSkill().getId());
                    int stuWeight = ss.getProficiencyLevel().getWeight();

                    double skillRatio = Math.min(1.0, (double) stuWeight / (double) reqWeight);
                    double awarded = skillRatio * reqWeight * (req.isMandatory() ? 1.5 : 1.0);
                    skillScore += awarded;

                    matchedSkills.add(new SkillDto(
                            ss.getSkill().getId(),
                            ss.getSkill().getName(),
                            ss.getSkill().getCategory(),
                            ss.getProficiencyLevel(),
                            ss.getYearsOfExperience()
                    ));
                } else {
                    missingSkills.add(req.getSkill().getName() + (req.isMandatory() ? " (Required)" : ""));
                }
            }
        }

        // Calculate skill percentage weight (out of 70%)
        double skillPercent = maxSkillScore > 0 ? (skillScore / maxSkillScore) * 70.0 : 40.0;

        // Domain overlap bonus (up to 20%)
        double domainScore = 0.0;
        List<String> overlappingDomains = new ArrayList<>();
        if (student.getPreferredDomains() != null && project.getDomain() != null) {
            String domainName = project.getDomain().name();
            if (student.getPreferredDomains().contains(domainName)) {
                domainScore = 20.0;
                overlappingDomains.add(project.getDomain().getDisplayName());
            }
        }

        // Availability fit bonus (up to 10%)
        double availabilityScore = 0.0;
        int hours = student.getAvailableHoursPerWeek() != null ? student.getAvailableHoursPerWeek() : 10;
        if (hours >= 15) {
            availabilityScore = 10.0;
        } else if (hours >= 10) {
            availabilityScore = 7.0;
        } else {
            availabilityScore = 4.0;
        }

        int finalMatchPercentage = (int) Math.round(skillPercent + domainScore + availabilityScore);
        finalMatchPercentage = Math.max(10, Math.min(100, finalMatchPercentage));

        dto.setMatchPercentage(finalMatchPercentage);
        dto.setMatchedSkills(matchedSkills);
        dto.setMissingSkills(missingSkills);
        dto.setOverlappingDomains(overlappingDomains);

        // Build explanatory note
        StringBuilder reason = new StringBuilder();
        if (matchedSkills.size() > 0) {
            reason.append("Proficient in ").append(matchedSkills.get(0).getName());
            if (matchedSkills.size() > 1) {
                reason.append(" & ").append(matchedSkills.get(1).getName());
            }
        } else {
            reason.append("Has complementary background");
        }
        if (domainScore > 0) {
            reason.append(" • Matches project domain");
        }
        if (hours >= 15) {
            reason.append(" • High availability (").append(hours).append("h/wk)");
        }
        dto.setRecommendationReason(reason.toString());

        return dto;
    }

    private static class ProjectScore {
        Project project;
        int score;

        ProjectScore(Project project, int score) {
            this.project = project;
            this.score = score;
        }
    }
}
