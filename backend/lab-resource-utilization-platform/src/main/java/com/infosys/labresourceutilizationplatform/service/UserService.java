package com.infosys.labresourceutilizationplatform.service;

import com.infosys.labresourceutilizationplatform.dto.LoginResponse;
import com.infosys.labresourceutilizationplatform.dto.RegisterRequest;
import com.infosys.labresourceutilizationplatform.entity.Role;
import com.infosys.labresourceutilizationplatform.entity.User;
import com.infosys.labresourceutilizationplatform.repository.RoleRepository;
import com.infosys.labresourceutilizationplatform.repository.UserRepository;
import com.infosys.labresourceutilizationplatform.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    public List<User> getPendingUsers() {
        return userRepository.findByStatus("PENDING");
    }

    public String approveUser(Integer userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setStatus("ACTIVE");
        userRepository.save(user);

        return "User approved successfully.";
    }

    public String rejectUser(Integer userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setStatus("REJECTED");
        userRepository.save(user);

        return "User rejected successfully.";
    }

    public String registerUser(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return "Email already registered!";
        }

        Role role = roleRepository.findByRoleName(request.getRoleName())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        User user = new User();

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(role);
        user.setDepartmentId(null);
        user.setInstitutionId(null);

        if (request.getRoleName().equals("STUDENT")
                || request.getRoleName().equals("RESEARCHER")) {

            user.setStatus("ACTIVE");

        } else {

            user.setStatus("PENDING");

        }

        userRepository.save(user);

        return "User Registered Successfully";
    }

    public LoginResponse loginUser(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {
            return new LoginResponse("User not found");
        }

        if ("PENDING".equals(user.getStatus())) {

            return new LoginResponse(
                    "Your account is pending approval. Please wait for the Institution Administrator to approve your account."
            );

        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            return new LoginResponse("Invalid Password");
        }

        String token = jwtService.generateToken(user.getEmail());

        return new LoginResponse(
                token,
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().getRoleName()
        );
    }
}