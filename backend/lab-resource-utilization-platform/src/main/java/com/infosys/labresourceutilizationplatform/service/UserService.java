package com.infosys.labresourceutilizationplatform.service;

import com.infosys.labresourceutilizationplatform.dto.LoginResponse;
import com.infosys.labresourceutilizationplatform.dto.RegisterRequest;
import com.infosys.labresourceutilizationplatform.dto.UserProfileDto;
import com.infosys.labresourceutilizationplatform.dto.ChangePasswordRequest;
import com.infosys.labresourceutilizationplatform.entity.Role;
import com.infosys.labresourceutilizationplatform.entity.User;
import com.infosys.labresourceutilizationplatform.entity.Institution;
import com.infosys.labresourceutilizationplatform.entity.Department;
import com.infosys.labresourceutilizationplatform.repository.RoleRepository;
import com.infosys.labresourceutilizationplatform.repository.UserRepository;
import com.infosys.labresourceutilizationplatform.repository.InstitutionRepository;
import com.infosys.labresourceutilizationplatform.repository.DepartmentRepository;
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
    private InstitutionRepository institutionRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private NotificationService notificationService;

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

        return "User approved successfully.";
    }

    public String rejectUser(Integer userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setStatus("REJECTED");
        userRepository.save(user);

        Long uId = user.getUserId() != null ? Long.valueOf(user.getUserId()) : null;
        Long instId = user.getInstitutionId() != null ? Long.valueOf(user.getInstitutionId()) : null;
        notificationService.sendNotification(uId, null, instId, "Account Rejected", "Your account has been rejected.", "SYSTEM", "High");

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

        if (request.getRoleName().equals("STUDENT")
                || request.getRoleName().equals("RESEARCHER")) {

            user.setStatus("ACTIVE");

        } else {

            user.setStatus("PENDING");

        }

        userRepository.save(user);

        if ("PENDING".equals(user.getStatus())) {
            Long newInstId = user.getInstitutionId() != null ? Long.valueOf(user.getInstitutionId()) : null;
            notificationService.sendNotification(null, "INSTITUTION_ADMIN", newInstId, "Pending User Approval", "New user registration pending approval: " + user.getFullName() + ".", "SYSTEM", "High");
            notificationService.sendNotification(null, "SYSTEM_ADMIN", null, "Pending User Approval", "New user registration pending approval: " + user.getFullName() + ".", "SYSTEM", "High");
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

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            return new LoginResponse("Invalid Password");
        }

        String token = jwtService.generateToken(user.getEmail());

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

        return "Password changed successfully.";
    }
}