package com.projectpartner.controller;

import com.projectpartner.model.Skill;
import com.projectpartner.model.SkillCategory;
import com.projectpartner.repository.SkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    @Autowired
    private SkillRepository skillRepository;

    @GetMapping
    public ResponseEntity<List<Skill>> getAllSkills(@RequestParam(required = false) SkillCategory category) {
        List<Skill> skills = (category != null)
                ? skillRepository.findByCategory(category)
                : skillRepository.findAll();
        return ResponseEntity.ok(skills);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<SkillCategory>> getSkillCategories() {
        return ResponseEntity.ok(Arrays.asList(SkillCategory.values()));
    }
}
