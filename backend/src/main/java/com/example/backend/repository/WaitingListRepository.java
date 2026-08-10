package com.example.backend.repository;

import com.example.backend.entity.WaitingList;
import com.example.backend.entity.WaitingListStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WaitingListRepository
        extends JpaRepository<WaitingList, Integer> {

    List<WaitingList>
    findByEquipment_IdAndStatusOrderByRequestTimeAsc(
            Integer equipmentId,
            WaitingListStatus status
    );

    List<WaitingList>
    findByStatusOrderByRequestTimeAsc(
            WaitingListStatus status
    );

    boolean existsByUser_UserIdAndEquipment_IdAndStatus(
            Integer userId,
            Integer equipmentId,
            WaitingListStatus status
    );
}