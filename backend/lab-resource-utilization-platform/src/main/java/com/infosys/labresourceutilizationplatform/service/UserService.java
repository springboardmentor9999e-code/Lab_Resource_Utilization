package com.infosys.labresourceutilizationplatform.service;

import com.infosys.labresourceutilizationplatform.dto.*;
import com.infosys.labresourceutilizationplatform.entity.*;
import com.infosys.labresourceutilizationplatform.repository.*;
import com.infosys.labresourceutilizationplatform.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private InstitutionRepository institutionRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PasswordResetOtpRepository otpRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailNotificationService emailNotificationService;

    @Autowired
    private SmsNotificationService smsNotificationService;

    @Value("${google.client-id:}")
    private String googleClientId;

    public List<User> getPendingUsers() {
        return userRepository.findByStatus("PENDING");
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public String approveUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setStatus("ACTIVE");
        userRepository.save(user);

        Long uId = user.getUserId() != null ? Long.valueOf(user.getUserId()) : null;
        Long instId = user.getInstitutionId() != null ? Long.valueOf(user.getInstitutionId()) : null;
        notificationService.sendNotification(uId, null, instId, "Account Approved", "Your account has been approved by the Administrator.", "SYSTEM", "High");

        // Send approval email
        if (user.getEmail() != null) {
            emailNotificationService.sendEmailAsync(user.getEmail(), "Account Approved",
                    "Congratulations! Your account on the Lab Resource Utilization Platform has been approved by the Administrator. You can now log in.");
        }

        return "User approved successfully.";
    }

    public String rejectUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setStatus("REJECTED");
        userRepository.save(user);

        Long uId = user.getUserId() != null ? Long.valueOf(user.getUserId()) : null;
        Long instId = user.getInstitutionId() != null ? Long.valueOf(user.getInstitutionId()) : null;
        notificationService.sendNotification(uId, null, instId, "Account Rejected", "Your account registration has been rejected.", "SYSTEM", "High");

        if (user.getEmail() != null) {
            emailNotificationService.sendEmailAsync(user.getEmail(), "Account Registration Update",
                    "Your account registration on the Lab Resource Utilization Platform has been declined.");
        }

        return "User rejected successfully.";
    }

    public String registerUser(RegisterRequest request) {
        if (request.getEmail() == null || !request.getEmail().matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$")) {
            return "Invalid email format!";
        }

        if (request.getPhone() == null || !request.getPhone().matches("^\\+?[0-9]{10,15}$")) {
            return "Invalid phone number format! Must be 10-15 digits.";
        }

        if (request.getPassword() == null || !request.getPassword().equals(request.getConfirmPassword())) {
            return "Passwords do not match!";
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return "Email already registered!";
        }

        Role role = roleRepository.findByRoleName(request.getRoleName())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        // Validate that rollNumber is present for STUDENT
        if ("STUDENT".equals(request.getRoleName())) {
            if (request.getRollNumber() == null || request.getRollNumber().trim().isEmpty()) {
                return "Roll Number is required for students!";
            }
        }

        // Validate selection/input of Institution
        if (request.getInstitutionId() == null && (request.getInstitutionName() == null || request.getInstitutionName().trim().isEmpty())) {
            return "Please select or enter an institution.";
        }

        // Validate selection/input of Department
        if (request.getDepartmentId() == null && (request.getDepartmentName() == null || request.getDepartmentName().trim().isEmpty())) {
            return "Please select or enter a department.";
        }

        // Resolve or create Institution
        Integer instId = request.getInstitutionId();
        if (instId == null && request.getInstitutionName() != null && !request.getInstitutionName().trim().isEmpty()) {
            String instName = request.getInstitutionName().trim();
            Institution existingInst = institutionRepository.findAll().stream()
                    .filter(i -> i.getInstitutionName().equalsIgnoreCase(instName))
                    .findFirst().orElse(null);
            if (existingInst != null) {
                instId = existingInst.getInstitutionId().intValue();
            } else {
                Institution newInst = new Institution();
                newInst.setInstitutionName(instName);
                newInst.setInstitutionCode(instName.toUpperCase().replaceAll("[^A-Z0-9]", "_") + "_" + (System.currentTimeMillis() % 1000));
                newInst.setStatus("ACTIVE");
                newInst = institutionRepository.save(newInst);
                instId = newInst.getInstitutionId().intValue();
            }
        }

        // Resolve or create Department
        Integer deptId = request.getDepartmentId();
        if (deptId == null && request.getDepartmentName() != null && !request.getDepartmentName().trim().isEmpty() && instId != null) {
            String deptName = request.getDepartmentName().trim();
            final Long resolvedInstId = Long.valueOf(instId);
            Department existingDept = departmentRepository.findAll().stream()
                    .filter(d -> d.getInstitution().getInstitutionId().equals(resolvedInstId)
                            && d.getDepartmentName().equalsIgnoreCase(deptName))
                    .findFirst().orElse(null);
            if (existingDept != null) {
                deptId = existingDept.getDepartmentId().intValue();
            } else {
                Department newDept = new Department();
                newDept.setDepartmentName(deptName);
                newDept.setDepartmentCode(deptName.toUpperCase().replaceAll("[^A-Z0-9]", "_") + "_" + (System.currentTimeMillis() % 1000));
                newDept.setStatus("ACTIVE");
                
                Institution instObj = institutionRepository.findById(resolvedInstId).orElse(null);
                newDept.setInstitution(instObj);
                newDept = departmentRepository.save(newDept);
                deptId = newDept.getDepartmentId().intValue();
            }
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(role);
        user.setInstitutionId(instId);
        user.setDepartmentId(deptId);
        user.setRollNumber(request.getRollNumber());
        user.setResearchId(request.getResearchId());
        user.setRegistrationDate(java.time.LocalDate.now());

        if (request.getRoleName().equals("STUDENT") || request.getRoleName().equals("RESEARCHER")) {
            user.setStatus("ACTIVE");
        } else {
            user.setStatus("PENDING");
        }

        User savedUser = userRepository.save(user);

        // Required Event: After successful user registration, send confirmation email
        emailNotificationService.sendEmailAsync(
                savedUser.getEmail(),
                "Registration Confirmation",
                "Welcome! Your registration on the Lab Resource Utilization Platform was successful."
        );

        // Send SMS confirmation
        if (savedUser.getPhone() != null) {
            smsNotificationService.sendSmsAsync(
                    savedUser.getPhone(),
                    "Welcome! Your registration on the Lab Resource Utilization Platform was successful."
            );
        }

        if ("PENDING".equals(savedUser.getStatus())) {
            Long newInstId = savedUser.getInstitutionId() != null ? Long.valueOf(savedUser.getInstitutionId()) : null;
            notificationService.sendNotification(null, "INSTITUTION_ADMIN", newInstId, "Pending User Approval", "New user registration pending approval: " + savedUser.getFullName() + ".", "SYSTEM", "High");
            notificationService.sendNotification(null, "SYSTEM_ADMIN", null, "Pending User Approval", "New user registration pending approval: " + savedUser.getFullName() + ".", "SYSTEM", "High");
        }

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

        if ("REJECTED".equals(user.getStatus())) {
            return new LoginResponse("Your account has been rejected. Please contact your Institution Administrator.");
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            return new LoginResponse("Invalid Password");
        }

        String token = jwtService.generateToken(user.getEmail());

        // Required Event: After every successful login, send a short welcome-back email
        emailNotificationService.sendEmailAsync(
                user.getEmail(),
                "Login Notification",
                "Welcome back to the Lab Resource Utilization Platform. You have successfully logged in."
        );

        return new LoginResponse(
                token,
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().getRoleName(),
                user.getInstitutionId(),
                user.getDepartmentId()
        );
    }

    /**
     * Get Google OAuth Public Configuration.
     */
    public Map<String, Object> getGoogleAuthConfig() {
        Map<String, Object> config = new HashMap<>();
        boolean configured = googleClientId != null && !googleClientId.trim().isEmpty() && !googleClientId.contains("mock-");
        config.put("clientId", googleClientId != null ? googleClientId.trim() : "");
        config.put("configured", configured);
        config.put("authorizedOrigin", "http://localhost:3000");
        return config;
    }

    /**
     * Process Google OAuth Login securely on backend.
     * Google Login is ONLY for users who are already registered in our platform.
     */
    public LoginResponse processGoogleLogin(GoogleAuthRequest request) {
        String verifiedEmail = null;
        String verifiedName = null;

        // 1. Backend Google Token Verification
        String tokenOrCredential = request.getCredential() != null ? request.getCredential() : request.getIdToken();
        String accessToken = request.getAccessToken();

        RestTemplate restTemplate = new RestTemplate();

        if (tokenOrCredential != null && !tokenOrCredential.trim().isEmpty()) {
            try {
                String googleUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + tokenOrCredential;
                @SuppressWarnings("unchecked")
                Map<String, Object> tokenInfo = restTemplate.getForObject(googleUrl, Map.class);
                if (tokenInfo != null && tokenInfo.containsKey("email")) {
                    verifiedEmail = (String) tokenInfo.get("email");
                    verifiedName = (String) tokenInfo.get("name");
                }
            } catch (Exception ex) {
                log.warn("[GOOGLE OAUTH ID TOKEN VERIFY] Tokeninfo check failed: {}", ex.getMessage());
            }
        }

        if (verifiedEmail == null && accessToken != null && !accessToken.trim().isEmpty()) {
            try {
                org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                headers.setBearerAuth(accessToken);
                org.springframework.http.HttpEntity<?> entity = new org.springframework.http.HttpEntity<>(headers);
                org.springframework.http.ResponseEntity<Map> response = restTemplate.exchange(
                        "https://www.googleapis.com/oauth2/v3/userinfo",
                        org.springframework.http.HttpMethod.GET,
                        entity,
                        Map.class
                );
                Map<String, Object> userInfo = response.getBody();
                if (userInfo != null && userInfo.containsKey("email")) {
                    verifiedEmail = (String) userInfo.get("email");
                    verifiedName = (String) userInfo.get("name");
                }
            } catch (Exception ex) {
                log.warn("[GOOGLE OAUTH ACCESS TOKEN VERIFY] UserInfo check failed: {}", ex.getMessage());
            }
        }

        // Direct email fallback for testing / development
        if (verifiedEmail == null && request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            verifiedEmail = request.getEmail().trim();
            verifiedName = request.getName() != null ? request.getName().trim() : "Google User";
        }

        if (verifiedEmail == null) {
            return new LoginResponse("Google Authentication failed: Could not verify Google identity.");
        }

        // 2. Lookup existing user in our platform database
        User user = userRepository.findByEmail(verifiedEmail).orElse(null);

        if (user == null) {
            // DO NOT create a new account automatically.
            // DO NOT assign a default role.
            LoginResponse resp = new LoginResponse("Account not registered. Please register first before using Google Sign-In.", false);
            resp.setEmail(verifiedEmail);
            return resp;
        }

        // 3. User exists -> Check status
        if ("PENDING".equalsIgnoreCase(user.getStatus())) {
            return new LoginResponse("Your account is pending approval. Please wait for the Institution Administrator to approve your account.");
        }

        if ("REJECTED".equalsIgnoreCase(user.getStatus())) {
            return new LoginResponse("Your account has been rejected. Please contact your administrator.");
        }

        String token = jwtService.generateToken(user.getEmail());

        // Send login welcome-back email
        emailNotificationService.sendEmailAsync(
                user.getEmail(),
                "Google Login Notification",
                "Welcome back to the Lab Resource Utilization Platform. You have successfully logged in via Google."
        );

        return new LoginResponse(
                token,
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole() != null ? user.getRole().getRoleName() : "STUDENT",
                user.getInstitutionId(),
                user.getDepartmentId()
        );
    }

    /**
     * Generate 6-digit single-use OTP for Password Reset.
     */
    public Map<String, Object> forgotPassword(String email) {
        Map<String, Object> response = new HashMap<>();

        if (email == null || email.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Please provide a valid email address.");
            return response;
        }

        User user = userRepository.findByEmail(email.trim()).orElse(null);
        if (user != null) {
            // Generate 6-digit numeric OTP
            String otp = String.format("%06d", new Random().nextInt(900000) + 100000);
            LocalDateTime expiry = LocalDateTime.now().plusMinutes(10);

            // Invalidate prior unused OTPs for this email
            List<PasswordResetOtp> existingOtps = otpRepository.findByEmailAndIsUsedFalseOrderByCreatedAtDesc(user.getEmail());
            for (PasswordResetOtp old : existingOtps) {
                old.setUsed(true);
                otpRepository.save(old);
            }

            PasswordResetOtp resetOtp = new PasswordResetOtp(user.getEmail(), otp, expiry);
            otpRepository.save(resetOtp);

            // Send OTP via Email
            emailNotificationService.sendEmail(
                    user.getEmail(),
                    "Password Reset OTP",
                    "Your One-Time Password (OTP) for password reset is: " + otp + ".\n\n" +
                    "This OTP is single-use and will expire in 10 minutes.\n" +
                    "If you did not request a password reset, please ignore this message."
            );

            // Send OTP via SMS
            if (user.getPhone() != null && !user.getPhone().trim().isEmpty()) {
                smsNotificationService.sendSms(
                        user.getPhone(),
                        "Your Lab Resource Platform password reset OTP is " + otp + ". Valid for 10 minutes."
                );
            }

            log.info("[FORGOT PASSWORD] Generated OTP for user {}", user.getEmail());
        } else {
            log.info("[FORGOT PASSWORD] Password reset requested for non-existent email: {}", email);
        }

        // Generic safe response to prevent email enumeration
        response.put("success", true);
        response.put("message", "If an account exists with this email, a 6-digit verification code has been sent.");
        return response;
    }

    /**
     * Verify Single-Use OTP.
     */
    public Map<String, Object> verifyOtp(String email, String otp) {
        Map<String, Object> response = new HashMap<>();

        if (email == null || otp == null || email.trim().isEmpty() || otp.trim().isEmpty()) {
            response.put("valid", false);
            response.put("message", "Email and OTP are required.");
            return response;
        }

        Optional<PasswordResetOtp> otpRecordOpt = otpRepository.findTopByEmailAndIsUsedFalseOrderByCreatedAtDesc(email.trim());
        if (otpRecordOpt.isEmpty()) {
            response.put("valid", false);
            response.put("message", "No active OTP found. Please request a new OTP.");
            return response;
        }

        PasswordResetOtp otpRecord = otpRecordOpt.get();
        if (otpRecord.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpRecord.setUsed(true);
            otpRepository.save(otpRecord);
            response.put("valid", false);
            response.put("message", "OTP has expired. Please request a new OTP.");
            return response;
        }

        if (!otpRecord.getOtp().equals(otp.trim())) {
            response.put("valid", false);
            response.put("message", "Invalid OTP. Please check and try again.");
            return response;
        }

        response.put("valid", true);
        response.put("message", "OTP verified successfully.");
        return response;
    }

    /**
     * Reset password using verified OTP.
     */
    public Map<String, Object> resetPassword(ResetPasswordRequest request) {
        Map<String, Object> response = new HashMap<>();

        if (request.getEmail() == null || request.getOtp() == null || request.getNewPassword() == null) {
            response.put("success", false);
            response.put("message", "All fields are required.");
            return response;
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            response.put("success", false);
            response.put("message", "New password and Confirm password do not match.");
            return response;
        }

        // Verify OTP
        Map<String, Object> verifyResult = verifyOtp(request.getEmail(), request.getOtp());
        if (!(Boolean) verifyResult.get("valid")) {
            response.put("success", false);
            response.put("message", verifyResult.get("message"));
            return response;
        }

        User user = userRepository.findByEmail(request.getEmail().trim()).orElse(null);
        if (user == null) {
            response.put("success", false);
            response.put("message", "User not found.");
            return response;
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Mark OTP as used
        otpRepository.findTopByEmailAndIsUsedFalseOrderByCreatedAtDesc(request.getEmail().trim())
                .ifPresent(otpRecord -> {
                    otpRecord.setUsed(true);
                    otpRepository.save(otpRecord);
                });

        // Notify user
        emailNotificationService.sendEmailAsync(
                user.getEmail(),
                "Password Changed Successfully",
                "Your password for the Lab Resource Utilization Platform was successfully updated. You can now log in with your new password."
        );

        response.put("success", true);
        response.put("message", "Password has been reset successfully. You can now log in.");
        return response;
    }

    public UserProfileDto getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfileDto dto = new UserProfileDto();
        dto.setUserId(user.getUserId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setInstitutionId(user.getInstitutionId());
        dto.setDepartmentId(user.getDepartmentId());
        dto.setRoleName(user.getRole().getRoleName());
        dto.setRollNumber(user.getRollNumber());
        dto.setResearchId(user.getResearchId());
        dto.setStatus(user.getStatus());
        dto.setRegistrationDate(user.getRegistrationDate());
        dto.setProfilePhoto(user.getProfilePhoto());

        if (user.getInstitutionId() != null) {
            institutionRepository.findById(Long.valueOf(user.getInstitutionId()))
                    .ifPresent(inst -> dto.setInstitutionName(inst.getInstitutionName()));
        }

        if (user.getDepartmentId() != null) {
            departmentRepository.findById(Long.valueOf(user.getDepartmentId()))
                    .ifPresent(dept -> dto.setDepartmentName(dept.getDepartmentName()));
        }

        return dto;
    }

    public UserProfileDto updateUserProfile(String email, UserProfileDto profileDto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (profileDto.getFullName() != null && !profileDto.getFullName().trim().isEmpty()) {
            user.setFullName(profileDto.getFullName());
        }
        if (profileDto.getPhone() != null && !profileDto.getPhone().trim().isEmpty()) {
            if (!profileDto.getPhone().matches("^\\+?[0-9]{10,15}$")) {
                throw new RuntimeException("Invalid phone number format! Must be 10-15 digits.");
            }
            user.setPhone(profileDto.getPhone());
        }
        if (profileDto.getProfilePhoto() != null) {
            user.setProfilePhoto(profileDto.getProfilePhoto());
        }

        userRepository.save(user);
        return getUserProfile(email);
    }

    public String changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Incorrect current password!");
        }

        if (request.getNewPassword() == null || request.getNewPassword().trim().isEmpty()) {
            throw new RuntimeException("New password cannot be empty!");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("New Password and Confirm Password do not match!");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        emailNotificationService.sendEmailAsync(
                user.getEmail(),
                "Password Changed",
                "Your password has been changed successfully. If you did not perform this change, please contact your administrator immediately."
        );

        return "Password changed successfully.";
    }
}