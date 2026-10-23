package com.projectpartner.service;

import com.projectpartner.dto.AuthRequest;
import com.projectpartner.dto.AuthResponse;
import com.projectpartner.dto.RegisterRequest;
import com.projectpartner.model.Role;
import com.projectpartner.model.StudentProfile;
import com.projectpartner.model.User;
import com.projectpartner.repository.StudentProfileRepository;
import com.projectpartner.repository.UserRepository;
import com.projectpartner.security.JwtTokenProvider;
import com.projectpartner.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email address is already in use!");
        }

        Role role = registerRequest.getRole() != null ? registerRequest.getRole() : Role.ROLE_STUDENT;

        User user = new User(
                registerRequest.getEmail(),
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getFullName(),
                role
        );

        User savedUser = userRepository.save(user);

        // Auto-create StudentProfile for students
        if (role == Role.ROLE_STUDENT) {
            StudentProfile profile = new StudentProfile(savedUser);
            profile.setUniversity(registerRequest.getUniversity());
            profile.setDepartment(registerRequest.getDepartment());
            profile.setDegreeLevel(registerRequest.getDegreeLevel());
            profile.setGraduationYear(registerRequest.getGraduationYear());
            if (registerRequest.getAvailableHoursPerWeek() != null) {
                profile.setAvailableHoursPerWeek(registerRequest.getAvailableHoursPerWeek());
            }
            profile.setPreferredDomains(registerRequest.getPreferredDomains());
            studentProfileRepository.save(profile);
        }

        String jwt = tokenProvider.generateTokenFromUserId(savedUser.getId(), savedUser.getEmail());

        return new AuthResponse(
                jwt,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getRole()
        );
    }

    public AuthResponse loginUser(AuthRequest authRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        authRequest.getEmail(),
                        authRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole()
        );
    }

    public AuthResponse getCurrentUser(UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String jwt = tokenProvider.generateTokenFromUserId(user.getId(), user.getEmail());

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole()
        );
    }
}
