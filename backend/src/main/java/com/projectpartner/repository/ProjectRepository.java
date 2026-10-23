package com.projectpartner.repository;

import com.projectpartner.model.Project;
import com.projectpartner.model.ProjectDomain;
import com.projectpartner.model.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByStatus(ProjectStatus status);
    List<Project> findByLeaderId(Long leaderId);
    List<Project> findByDomain(ProjectDomain domain);

    @Query("SELECT p FROM Project p WHERE " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:domain IS NULL OR p.domain = :domain) AND " +
           "(:query IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Project> searchProjects(@Param("status") ProjectStatus status,
                                @Param("domain") ProjectDomain domain,
                                @Param("query") String query);

    long countByStatus(ProjectStatus status);
}
