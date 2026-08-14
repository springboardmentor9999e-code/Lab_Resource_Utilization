package com.example.hello.controller;

import com.example.hello.entity.User;
import com.example.hello.repository.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
public class TestController {

    private final UserRepository userRepository;

    public TestController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/test")
    public String test() {

        Optional<User> user = userRepository.findByEmail("admin@gmail.com");

        if(user.isPresent()) {
            return "User Found : " + user.get().getFullName();
        }

        return "User Not Found";
    }
}
