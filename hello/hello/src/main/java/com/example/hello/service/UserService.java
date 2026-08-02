package com.example.hello.service;

import com.example.hello.entity.User;
import com.example.hello.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository repository;

    public List<User> getAllUsers() {
        return repository.findAll(Sort.by("userId"));
    }
}