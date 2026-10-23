package com.projectpartner.repository;

import com.projectpartner.model.ProjectRequiredSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRequiredSkillRepository extends JpaRepository<ProjectRequiredSkill, Long> {
    List<ProjectRequiredSkill> findByProjectId(Long projectId);
    void deleteByProjectIdAndSkillId(Long projectId, Long skillId);
    void deleteByProjectId(Long projectId);
    void deleteBySkillId(Long skillId);
}
