package com.labresource.security;

import com.labresource.entity.AppUser;
import com.labresource.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    
    private final AppUserRepository appUserRepository;
    
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        // Allow signing in with either username or email address
        AppUser user = appUserRepository
                .findByUsername(username)
                .or(() -> appUserRepository.findByEmail(username))
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found"));
        
        return User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(
                        user.getUserRoles()
                                .stream()
                                .map(r -> {
                                    String roleName = r.getRole().getRoleName().toUpperCase();
                                    return roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;
                                })
                                .toArray(String[]::new)
                )
                .build();
    }
}