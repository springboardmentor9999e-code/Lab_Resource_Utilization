package com.example.backend.repository;

import com.example.backend.entity.Utilization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UtilizationRepository extends JpaRepository<Utilization, Long> {

}