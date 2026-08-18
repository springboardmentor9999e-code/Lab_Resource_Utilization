package com.lab.backend;

import com.lab.backend.entity.User;
import com.lab.backend.enums.Role;
import com.lab.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByEmail("manager@test.com") == null) {
                User manager = new User();
                manager.setName("Sarah Manager");
                manager.setEmail("manager@test.com");
                manager.setPassword(passwordEncoder.encode("password"));
                manager.setRole(Role.MANAGER);
                userRepository.save(manager);
            }

            if (userRepository.findByEmail("student@test.com") == null) {
                User student = new User();
                student.setName("Alex Student");
                student.setEmail("student@test.com");
                student.setPassword(passwordEncoder.encode("password"));
                student.setRole(Role.STUDENT);
                userRepository.save(student);
            }

            if (userRepository.findByEmail("tech@test.com") == null) {
                User tech = new User();
                tech.setName("John Tech");
                tech.setEmail("tech@test.com");
                tech.setPassword(passwordEncoder.encode("password"));
                tech.setRole(Role.TECHNICIAN);
                userRepository.save(tech);
            }

            if (userRepository.findByEmail("admin@test.com") == null) {
                User admin = new User();
                admin.setName("System Admin");
                admin.setEmail("admin@test.com");
                admin.setPassword(passwordEncoder.encode("password"));
                admin.setRole(Role.SYSTEM_ADMINISTRATOR);
                userRepository.save(admin);
            }
        };
    }
}