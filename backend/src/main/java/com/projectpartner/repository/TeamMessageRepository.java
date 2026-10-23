package com.projectpartner.repository;

import com.projectpartner.model.TeamMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamMessageRepository extends JpaRepository<TeamMessage, Long> {
    List<TeamMessage> findByProjectIdOrderByCreatedAtAsc(Long projectId);
    void deleteByProjectId(Long projectId);
    void deleteBySenderId(Long senderId);
}
