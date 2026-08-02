package com.example.hello.repository;
import com.example.hello.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    List<Booking> findByUserId(Integer userId);
    List<Booking> findByEquipmentIdAndStatusIn(
            Integer equipmentId,
            List<String> statuses
    );
    Optional<Booking> findFirstByEquipmentIdAndStatusOrderByCreatedAtAsc(
            Integer equipmentId,
            String status
    );
}

