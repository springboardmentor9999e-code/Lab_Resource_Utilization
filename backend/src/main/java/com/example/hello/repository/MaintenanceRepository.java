package com.example.hello.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hello.entity.Maintenance;

public interface MaintenanceRepository
        extends JpaRepository<Maintenance, Integer> {
}