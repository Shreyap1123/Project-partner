package com.projectpartner.repository;

import com.projectpartner.model.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    List<TeamMember> findByProjectId(Long projectId);
    List<TeamMember> findByUserId(Long userId);
    Optional<TeamMember> findByProjectIdAndUserId(Long projectId, Long userId);
    boolean existsByProjectIdAndUserId(Long projectId, Long userId);
    void deleteByProjectIdAndUserId(Long projectId, Long userId);
    void deleteByProjectId(Long projectId);
    void deleteByUserId(Long userId);
}
