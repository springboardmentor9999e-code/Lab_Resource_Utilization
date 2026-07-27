package com.labresource;

import com.labresource.entity.*;
import com.labresource.repository.*;
import com.labresource.security.CustomUserDetailsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Smoke test: verifies the full Spring context boots on the in-memory H2 test
 * database and that security wiring (CustomUserDetailsService) resolves a user
 * with authorities. The DatabaseInitializer seeder is disabled under the "test"
 * profile, so this test seeds its own minimal user.
 */
@SpringBootTest
@ActiveProfiles("test")
class LabResourcePlatformApplicationTests {

	@Autowired private CustomUserDetailsService userDetailsService;
	@Autowired private RoleRepository roleRepository;
	@Autowired private AppUserRepository appUserRepository;
	@Autowired private UserRoleRepository userRoleRepository;
	@Autowired private InstitutionRepository institutionRepository;
	@Autowired private DepartmentRepository departmentRepository;
	@Autowired private PasswordEncoder passwordEncoder;

	@Test
	void contextLoads() {
		assertNotNull(userDetailsService);
	}

	@Test
	@Transactional
	void loadUserByUsername_resolvesAuthorities() {
		Role role = roleRepository.save(Role.builder()
				.roleName("SYSTEM_ADMIN").description("Admin").isSystemRole(true).build());

		Institution institution = institutionRepository.save(Institution.builder()
				.name("Test Institution").code("TST").isActive(true).build());
		Department department = departmentRepository.save(Department.builder()
				.institution(institution).name("Test Dept").code("TD").isActive(true).build());

		AppUser user = appUserRepository.save(AppUser.builder()
				.institution(institution).department(department)
				.username("testadmin")
				.email("testadmin@labresource.local")
				.password(passwordEncoder.encode("secret123"))
				.firstName("Test").lastName("Admin")
				.status(UserStatus.ACTIVE).isActive(true).isVerified(true)
				.userRoles(new HashSet<>())
				.build());

		UserRole userRole = userRoleRepository.save(UserRole.builder()
				.id(new UserRoleId(user.getUserId(), role.getRoleId()))
				.user(user).role(role)
				.createdAt(java.time.LocalDateTime.now())
				.build());
		// Reflect the join on the cached entity (same persistence context in this @Transactional test)
		user.getUserRoles().add(userRole);

		UserDetails details = userDetailsService.loadUserByUsername("testadmin");
		assertNotNull(details);
		assertFalse(details.getAuthorities().isEmpty());
		assertTrue(details.getAuthorities().stream()
				.anyMatch(a -> a.getAuthority().equals("ROLE_SYSTEM_ADMIN")));
	}
}
