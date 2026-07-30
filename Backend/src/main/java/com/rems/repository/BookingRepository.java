package com.rems.repository;

import com.rems.entity.Booking;
import com.rems.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserEmailOrderByCreatedAtDesc(String email);

    List<Booking> findByEquipmentDepartmentDepartmentIdAndStatusInOrderByCreatedAtDesc(
            Long departmentId, Collection<BookingStatus> statuses);

    List<Booking> findByStatusIn(Collection<BookingStatus> statuses);
}
