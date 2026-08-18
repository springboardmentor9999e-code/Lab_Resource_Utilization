package com.lab.backend.repository;

import com.lab.backend.entity.WaitingList;
import com.lab.backend.enums.WaitingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WaitingListRepository extends JpaRepository<WaitingList, Long> {

    List<WaitingList> findByEquipmentIdOrderByPositionAsc(Long equipmentId);

    List<WaitingList> findByUserId(Long userId);

    List<WaitingList> findByStatus(WaitingStatus status);

    boolean existsByUserIdAndEquipmentIdAndStatus(Long userId, Long equipmentId, WaitingStatus status);
}
