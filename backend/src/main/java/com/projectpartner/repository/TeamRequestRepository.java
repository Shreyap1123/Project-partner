package com.projectpartner.repository;

import com.projectpartner.model.RequestStatus;
import com.projectpartner.model.RequestType;
import com.projectpartner.model.TeamRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRequestRepository extends JpaRepository<TeamRequest, Long> {
    List<TeamRequest> findByReceiverId(Long receiverId);
    List<TeamRequest> findBySenderId(Long senderId);
    List<TeamRequest> findByProjectId(Long projectId);
    List<TeamRequest> findByReceiverIdAndStatus(Long receiverId, RequestStatus status);
    List<TeamRequest> findBySenderIdAndStatus(Long senderId, RequestStatus status);
    Optional<TeamRequest> findByProjectIdAndSenderIdAndReceiverIdAndStatus(Long projectId, Long senderId, Long receiverId, RequestStatus status);
    long countByStatus(RequestStatus status);
    void deleteByProjectId(Long projectId);
}
