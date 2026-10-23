package com.projectpartner.repository;

import com.projectpartner.model.MilestoneStatus;
import com.projectpartner.model.ProjectMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectMilestoneRepository extends JpaRepository<ProjectMilestone, Long> {
    List<ProjectMilestone> findByProjectIdOrderByDueDateAsc(Long projectId);
    long countByProjectId(Long projectId);
    long countByProjectIdAndStatus(Long projectId, MilestoneStatus status);
    void deleteByProjectId(Long projectId);
}
