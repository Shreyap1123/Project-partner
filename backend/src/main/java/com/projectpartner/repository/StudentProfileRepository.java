package com.projectpartner.repository;

import com.projectpartner.model.StudentProfile;
import com.projectpartner.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUser(User user);
    Optional<StudentProfile> findByUserId(Long userId);

    @Query("SELECT p FROM StudentProfile p WHERE " +
           "(:department IS NULL OR LOWER(p.department) LIKE LOWER(CONCAT('%', :department, '%'))) AND " +
           "(:minHours IS NULL OR p.availableHoursPerWeek >= :minHours)")
    List<StudentProfile> filterProfiles(@Param("department") String department, @Param("minHours") Integer minHours);
}
