package com.projectpartner.repository;

import com.projectpartner.model.StudentSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentSkillRepository extends JpaRepository<StudentSkill, Long> {
    List<StudentSkill> findByStudentProfileId(Long studentProfileId);
    Optional<StudentSkill> findByStudentProfileIdAndSkillId(Long studentProfileId, Long skillId);
    void deleteByStudentProfileIdAndSkillId(Long studentProfileId, Long skillId);
    void deleteBySkillId(Long skillId);
    void deleteByStudentProfileId(Long studentProfileId);
}
