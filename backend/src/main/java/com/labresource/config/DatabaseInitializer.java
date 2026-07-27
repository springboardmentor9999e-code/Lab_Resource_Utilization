package com.labresource.config;

import com.labresource.entity.*;
import com.labresource.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;

/**
 * Bootstraps only what the application cannot start empty without.
 *
 * <p>Deliberately seeds <b>no sample labs, equipment, bookings or maintenance records</b>.
 * All operational content is entered through the UI so the data in the system is real and
 * traceable to the person who created it.
 *
 * <p>Three things are unavoidable, and each is seeded once and never overwritten:
 * <ol>
 *   <li><b>Roles</b> — reference data. RBAC cannot resolve authorities without them, and
 *       registration would invent roles ad hoc on first use.</li>
 *   <li><b>One institution and one department</b> — {@code app_user.institution_id} and
 *       {@code department_id} are NOT NULL, and registration falls back to the first row of
 *       each table. With both empty, nobody can register or log in. Name them via
 *       {@code app.bootstrap.institution-name} / {@code app.bootstrap.department-name} so the
 *       first rows in the database are yours rather than a placeholder.</li>
 *   <li><b>One admin account</b> — roles can only be granted by an existing admin, and
 *       self-registration grants STUDENT. Without this there is no way in.</li>
 * </ol>
 */
@Component
@Profile("!test") // tests build their own fixtures
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final AppUserRepository appUserRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.institution-name:My Institution}")
    private String institutionName;
    @Value("${app.bootstrap.institution-code:INST-01}")
    private String institutionCode;
    @Value("${app.bootstrap.department-name:General}")
    private String departmentName;
    @Value("${app.bootstrap.department-code:GEN}")
    private String departmentCode;
    @Value("${app.bootstrap.admin-username:admin}")
    private String adminUsername;
    @Value("${app.bootstrap.admin-email:admin@labresource.local}")
    private String adminEmail;
    @Value("${app.bootstrap.admin-password:admin123}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(String... args) {
        // Legacy role names from the pre-7-role model, renamed so existing user_role rows survive
        migrateLegacyRole("ADMIN", "SYSTEM_ADMIN");
        migrateLegacyRole("HOD", "DEPARTMENT_HEAD");
        migrateLegacyRole("TECHNICIAN", "LAB_TECHNICIAN");

        Role adminRole = seedRole("SYSTEM_ADMIN", "System Administrator", true);
        seedRole("INSTITUTION_ADMIN", "Institution Administrator", true);
        seedRole("DEPARTMENT_HEAD", "Department Head", false);
        seedRole("LAB_MANAGER", "Lab Manager", false);
        seedRole("LAB_TECHNICIAN", "Lab Technician", false);
        seedRole("RESEARCHER", "Researcher", false);
        seedRole("STUDENT", "Student Role", false);

        Institution institution = seedInstitution();
        Department department = seedDepartment(institution);
        seedAdminUser(institution, department, adminRole);
    }

    private void migrateLegacyRole(String oldName, String newName) {
        Optional<Role> oldRole = roleRepository.findByRoleName(oldName);
        if (oldRole.isPresent() && roleRepository.findByRoleName(newName).isEmpty()) {
            Role role = oldRole.get();
            role.setRoleName(newName);
            roleRepository.save(role);
            log.info("Migrated legacy role {} -> {}", oldName, newName);
        }
    }

    private Role seedRole(String name, String description, boolean isSystem) {
        return roleRepository.findByRoleName(name).orElseGet(() -> {
            log.info("Seeding role: {}", name);
            return roleRepository.save(Role.builder()
                    .roleName(name).description(description).isSystemRole(isSystem).build());
        });
    }

    /**
     * Only creates a row when the table is empty — so once you have renamed it or added your
     * own institutions, a restart never re-inserts the bootstrap one.
     */
    private Institution seedInstitution() {
        if (institutionRepository.count() > 0) {
            return institutionRepository.findAll().get(0);
        }
        log.info("No institutions found — creating bootstrap institution '{}'. "
                + "Rename it from the UI or set app.bootstrap.institution-name.", institutionName);
        return institutionRepository.save(Institution.builder()
                .name(institutionName)
                .code(institutionCode)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());
    }

    private Department seedDepartment(Institution institution) {
        if (departmentRepository.count() > 0) {
            return departmentRepository.findAll().get(0);
        }
        log.info("No departments found — creating bootstrap department '{}'.", departmentName);
        return departmentRepository.save(Department.builder()
                .institution(institution)
                .name(departmentName)
                .code(departmentCode)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());
    }

    private void seedAdminUser(Institution institution, Department department, Role adminRole) {
        if (appUserRepository.findByUsername(adminUsername).isPresent()) return;

        AppUser admin = appUserRepository.save(AppUser.builder()
                .institution(institution)
                .department(department)
                .username(adminUsername)
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .firstName("Admin")
                .lastName("User")
                .status(UserStatus.ACTIVE)
                .isActive(true)
                .isVerified(true)
                .userRoles(new HashSet<>())
                .build());

        userRoleRepository.save(UserRole.builder()
                .id(new UserRoleId(admin.getUserId(), adminRole.getRoleId()))
                .user(admin)
                .role(adminRole)
                .createdAt(LocalDateTime.now())
                .build());

        log.warn("Created bootstrap admin '{}' with the default password. "
                + "Change it from Profile > Change Password before this is exposed to anyone else.",
                adminUsername);
    }
}
