package com.labresource.platform.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.labresource.platform.dto.UpdateUserRoleRequest;
import com.labresource.platform.dto.UserResponse;
import com.labresource.platform.entity.Role;
import com.labresource.platform.entity.User;
import com.labresource.platform.exception.UserNotFoundException;
import com.labresource.platform.repository.UserRepository;
import java.time.Instant;
import java.util.Arrays;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void updateUserRoleAcceptsValidRoleEnumAndReturnsPasswordFreeResponse() {
        User user = user(1L, Role.ROLE_STUDENT);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.saveAndFlush(user)).thenReturn(user);

        UserResponse response = userService.updateUserRole(
                1L,
                new UpdateUserRoleRequest(Role.ROLE_PROFESSOR)
        );

        assertThat(user.getRole()).isEqualTo(Role.ROLE_PROFESSOR);
        assertThat(response.role()).isEqualTo(Role.ROLE_PROFESSOR);
        assertThat(Arrays.stream(UserResponse.class.getRecordComponents()).map(record -> record.getName()))
                .doesNotContain("password");
        verify(userRepository).saveAndFlush(user);
    }

    @Test
    void getUserByIdRejectsMissingUser() {
        when(userRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserById(404L))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessage("User with id 404 was not found");
    }

    private User user(Long id, Role role) {
        return User.builder()
                .id(id)
                .firstName("Test")
                .lastName("User")
                .email("user" + id + "@example.com")
                .password("encoded-password")
                .role(role)
                .enabled(true)
                .createdAt(Instant.parse("2026-01-01T00:00:00Z"))
                .updatedAt(Instant.parse("2026-01-01T00:00:00Z"))
                .build();
    }
}
