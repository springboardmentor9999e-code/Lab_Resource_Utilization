package com.labplatform.labresourceplatform.service;

import com.labplatform.labresourceplatform.dto.AuthResponse;
import com.labplatform.labresourceplatform.dto.LoginRequest;
import com.labplatform.labresourceplatform.dto.RegisterRequest;
import com.labplatform.labresourceplatform.entity.Institution;
import com.labplatform.labresourceplatform.entity.User;
import com.labplatform.labresourceplatform.enums.Role;
import com.labplatform.labresourceplatform.repository.InstitutionRepository;
import com.labplatform.labresourceplatform.repository.UserRepository;
import com.labplatform.labresourceplatform.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    // The only role an account can be created with via public self-registration.
    // Anything else the registrant selects becomes a pending RoleChangeRequest
    // instead of being applied directly - see the security note on
    // RegisterRequest.role and item #5/#11 of the fixes spec.
    private static final Role DEFAULT_SELF_REGISTER_ROLE = Role.STUDENT;

    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RoleChangeRequestService roleChangeRequestService;

    public AuthService(UserRepository userRepository,
                       InstitutionRepository institutionRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       RoleChangeRequestService roleChangeRequestService) {

        this.userRepository = userRepository;
        this.institutionRepository = institutionRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.roleChangeRequestService = roleChangeRequestService;
    }

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        Institution institution = institutionRepository.findById(request.getInstitutionId())
                .orElseThrow(() -> new RuntimeException("Institution not found"));

        // Security fix: the client-submitted role is NEVER trusted directly -
        // every self-registered account is created as STUDENT or RESEARCHER,
        // regardless of what was submitted. RESEARCHER is honored directly since
        // it's already a self-service-tier role with no elevated privileges; any
        // other selection (LAB_TECHNICIAN, LAB_MANAGER, DEPARTMENT_HEAD, admin
        // roles, etc.) is only recorded as a pending request below.
        Role requestedRole = request.getRole();
        Role actualRole = requestedRole == Role.RESEARCHER ? Role.RESEARCHER : DEFAULT_SELF_REGISTER_ROLE;

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(actualRole);
        user.setInstitution(institution);

        User saved = userRepository.save(user);

        if (requestedRole != null && requestedRole != actualRole) {
            roleChangeRequestService.createOrReplacePending(saved, requestedRole);
        }

        return buildAuthResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (org.springframework.security.core.AuthenticationException ex) {
            throw new BadCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities("ROLE_" + user.getRole().name())
                .build();

        String token = jwtService.generateToken(
                userDetails,
                user.getUserId(),
                user.getRole().name(),
                user.getInstitution().getInstitutionId()
        );

        return new AuthResponse(
                token,
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getInstitution().getInstitutionId()
        );
    }
}
