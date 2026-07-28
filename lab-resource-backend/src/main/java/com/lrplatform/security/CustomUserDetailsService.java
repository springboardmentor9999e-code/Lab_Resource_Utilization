package com.lrplatform.security;

import com.lrplatform.model.entity.User;
import com.lrplatform.repository.RoleConfigRepository;
import com.lrplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final RoleConfigRepository roleConfigRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (!user.getStatus()) {
            throw new DisabledException("Your account has been deactivated. Please contact your administrator.");
        }

        roleConfigRepository.findByRoleName(user.getRole().name())
                .filter(rc -> !rc.getEnabled())
                .ifPresent(rc -> {
                    throw new DisabledException("Role '" + rc.getRoleName() + "' is disabled");
                });

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
