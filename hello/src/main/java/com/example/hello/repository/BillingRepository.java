package com.example.hello.repository;

import com.example.hello.entity.Billing;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillingRepository extends JpaRepository<Billing, Integer> {

    boolean existsByBookingId(Integer bookingId);

}