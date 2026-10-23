package com.projectpartner.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping({"/", "/api/health"})
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "ProjectPartner Backend API");
        response.put("version", "1.0.0");
        response.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(response);
    }
}
