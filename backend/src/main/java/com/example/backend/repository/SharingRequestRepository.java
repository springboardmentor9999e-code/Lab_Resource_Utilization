package com.example.backend.repository;

import com.example.backend.entity.SharingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SharingRequestRepository extends JpaRepository<SharingRequest, Long> {

    List<SharingRequest> findByStatus(String status);

}