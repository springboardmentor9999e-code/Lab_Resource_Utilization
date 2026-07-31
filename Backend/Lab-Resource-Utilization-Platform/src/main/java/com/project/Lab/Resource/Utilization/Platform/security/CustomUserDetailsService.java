package com.project.Lab.Resource.Utilization.Platform.security;

import com.project.Lab.Resource.Utilization.Platform.entity.User;
import com.project.Lab.Resource.Utilization.Platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));

        String role = user.getRole().getRoleName().trim().toUpperCase();

        List<GrantedAuthority> authorities = new ArrayList<>();

        authorities.add(
                new SimpleGrantedAuthority("ROLE_" + role)
        );

        System.out.println("========================================");
        System.out.println("Authenticated User : " + user.getEmail());
        System.out.println("Role               : " + role);
        System.out.println("Authority          : ROLE_" + role);
        System.out.println("========================================");

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities
        );
    }
}