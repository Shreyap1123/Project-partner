package com.projectpartner.repository;

import com.projectpartner.model.ProjectTask;
import com.projectpartner.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectTaskRepository extends JpaRepository<ProjectTask, Long> {
    List<ProjectTask> findByProjectId(Long projectId);
    List<ProjectTask> findByProjectIdAndStatus(Long projectId, TaskStatus status);
    List<ProjectTask> findByAssignedToId(Long assignedToId);
    long countByProjectId(Long projectId);
    long countByProjectIdAndStatus(Long projectId, TaskStatus status);
    void deleteByProjectId(Long projectId);
}
