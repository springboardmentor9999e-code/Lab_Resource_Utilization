package com.labhub.repository;

import com.labhub.entity.BookingApproval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BookingApprovalRepository extends JpaRepository<BookingApproval, UUID> {
}
