package com.projectpartner.service;

import com.projectpartner.dto.SkillDto;
import com.projectpartner.dto.StudentProfileDto;
import com.projectpartner.dto.StudentProjectDto;
import com.projectpartner.model.*;
import com.projectpartner.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentProfileService {

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private StudentSkillRepository studentSkillRepository;

    @Autowired
    private StudentProjectRepository studentProjectRepository;

    @Transactional(readOnly = true)
    public StudentProfileDto getProfileByUserId(Long userId) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
                    StudentProfile newProfile = new StudentProfile(user);
                    return studentProfileRepository.save(newProfile);
                });

        return mapToDto(profile);
    }

    @Transactional(readOnly = true)
    public StudentProfileDto getProfileById(Long profileId) {
        StudentProfile profile = studentProfileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + profileId));
        return mapToDto(profile);
    }

    @Transactional
    public StudentProfileDto updateProfile(Long userId, StudentProfileDto dto) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found for user: " + userId));

        // Update basic info in User if provided
        if (dto.getFullName() != null && !dto.getFullName().trim().isEmpty()) {
            User user = profile.getUser();
            user.setFullName(dto.getFullName());
            userRepository.save(user);
        }

        profile.setBio(dto.getBio());
        profile.setUniversity(dto.getUniversity());
        profile.setDepartment(dto.getDepartment());
        profile.setDegreeLevel(dto.getDegreeLevel());
        profile.setGraduationYear(dto.getGraduationYear());
        profile.setGithubUrl(dto.getGithubUrl());
        profile.setLinkedinUrl(dto.getLinkedinUrl());
        profile.setPortfolioUrl(dto.getPortfolioUrl());
        profile.setAvatarUrl(dto.getAvatarUrl());
        if (dto.getAvailableHoursPerWeek() != null) {
            profile.setAvailableHoursPerWeek(dto.getAvailableHoursPerWeek());
        }
        profile.setPreferredDomains(dto.getPreferredDomains());

        StudentProfile updated = studentProfileRepository.save(profile);
        return mapToDto(updated);
    }

    @Transactional
    public StudentProfileDto addOrUpdateSkill(Long userId, SkillDto skillDto) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        Skill skill;
        if (skillDto.getSkillId() != null) {
            skill = skillRepository.findById(skillDto.getSkillId())
                    .orElseThrow(() -> new RuntimeException("Skill not found with id: " + skillDto.getSkillId()));
        } else if (skillDto.getName() != null) {
            skill = skillRepository.findByNameIgnoreCase(skillDto.getName().trim())
                    .orElseGet(() -> {
                        Skill newSkill = new Skill(
                                skillDto.getName().trim(),
                                skillDto.getCategory() != null ? skillDto.getCategory() : SkillCategory.OTHER,
                                null
                        );
                        return skillRepository.save(newSkill);
                    });
        } else {
            throw new IllegalArgumentException("Skill name or ID must be provided");
        }

        StudentSkill studentSkill = studentSkillRepository.findByStudentProfileIdAndSkillId(profile.getId(), skill.getId())
                .orElse(new StudentSkill(profile, skill, ProficiencyLevel.INTERMEDIATE, 1.0));

        if (skillDto.getProficiencyLevel() != null) {
            studentSkill.setProficiencyLevel(skillDto.getProficiencyLevel());
        }
        if (skillDto.getYearsOfExperience() != null) {
            studentSkill.setYearsOfExperience(skillDto.getYearsOfExperience());
        }

        StudentSkill saved = studentSkillRepository.save(studentSkill);
        if (profile.getSkills() != null) {
            profile.getSkills().removeIf(s -> s.getSkill().getId().equals(skill.getId()));
            profile.getSkills().add(saved);
        }
        studentProfileRepository.saveAndFlush(profile);
        return mapToDto(profile);
    }

    @Transactional
    public StudentProfileDto removeSkill(Long userId, Long skillId) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        studentSkillRepository.deleteByStudentProfileIdAndSkillId(profile.getId(), skillId);
        if (profile.getSkills() != null) {
            profile.getSkills().removeIf(s -> s.getSkill() != null && s.getSkill().getId().equals(skillId));
        }
        studentProfileRepository.saveAndFlush(profile);
        return mapToDto(profile);
    }

    @Transactional
    public StudentProfileDto addPastProject(Long userId, StudentProjectDto projectDto) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        StudentProject project = new StudentProject(
                profile,
                projectDto.getTitle(),
                projectDto.getDescription(),
                projectDto.getTechnologiesUsed(),
                projectDto.getRepoUrl(),
                projectDto.getDemoUrl(),
                projectDto.getProjectDate()
        );

        StudentProject saved = studentProjectRepository.save(project);
        if (profile.getPastProjects() != null) {
            profile.getPastProjects().add(saved);
        }
        studentProfileRepository.saveAndFlush(profile);
        return mapToDto(profile);
    }

    @Transactional
    public StudentProfileDto deletePastProject(Long userId, Long projectId) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        StudentProject project = studentProjectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Past project not found"));

        if (!project.getStudentProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Unauthorized to delete this project");
        }

        studentProjectRepository.delete(project);
        if (profile.getPastProjects() != null) {
            profile.getPastProjects().removeIf(p -> p.getId().equals(projectId));
        }
        studentProfileRepository.saveAndFlush(profile);
        return mapToDto(profile);
    }

    @Transactional(readOnly = true)
    public List<StudentProfileDto> getAllProfiles(String department, Integer minHours) {
        return studentProfileRepository.filterProfiles(department, minHours).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public StudentProfileDto mapToDto(StudentProfile profile) {
        StudentProfileDto dto = new StudentProfileDto();
        dto.setId(profile.getId());
        dto.setUserId(profile.getUser().getId());
        dto.setFullName(profile.getUser().getFullName());
        dto.setEmail(profile.getUser().getEmail());
        dto.setBio(profile.getBio());
        dto.setUniversity(profile.getUniversity());
        dto.setDepartment(profile.getDepartment());
        dto.setDegreeLevel(profile.getDegreeLevel());
        dto.setGraduationYear(profile.getGraduationYear());
        dto.setGithubUrl(profile.getGithubUrl());
        dto.setLinkedinUrl(profile.getLinkedinUrl());
        dto.setPortfolioUrl(profile.getPortfolioUrl());
        dto.setAvatarUrl(profile.getAvatarUrl());
        dto.setAvailableHoursPerWeek(profile.getAvailableHoursPerWeek());
        dto.setPreferredDomains(profile.getPreferredDomains());
        if (profile.getUser() != null) {
            dto.setEnabled(profile.getUser().isEnabled());
            dto.setRole(profile.getUser().getRole() != null ? profile.getUser().getRole().name() : "ROLE_STUDENT");
        }

        if (profile.getSkills() != null) {
            dto.setSkills(profile.getSkills().stream().map(s -> new SkillDto(
                    s.getSkill().getId(),
                    s.getSkill().getName(),
                    s.getSkill().getCategory(),
                    s.getProficiencyLevel(),
                    s.getYearsOfExperience()
            )).collect(Collectors.toList()));
        }

        if (profile.getPastProjects() != null) {
            dto.setPastProjects(profile.getPastProjects().stream().map(p -> new StudentProjectDto(
                    p.getId(),
                    p.getTitle(),
                    p.getDescription(),
                    p.getTechnologiesUsed(),
                    p.getRepoUrl(),
                    p.getDemoUrl(),
                    p.getProjectDate()
            )).collect(Collectors.toList()));
        }

        return dto;
    }
}
