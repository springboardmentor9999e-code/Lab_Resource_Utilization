package com.labplatform.labresourceplatform.security;

import com.labplatform.labresourceplatform.entity.User;
import com.labplatform.labresourceplatform.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

// Resolves the User entity that corresponds to the currently authenticated principal.
// The JWT/UserDetails principal is keyed on email, so we look the User up by email.
@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("No authenticated user found");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found: " + email));
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getUserId();
    }
}
