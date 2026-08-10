package com.example.backend.service;

import com.example.backend.entity.Equipment;
import com.example.backend.entity.User;
import com.example.backend.entity.WaitingList;
import com.example.backend.entity.WaitingListStatus;
import com.example.backend.repository.EquipmentRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.WaitingListRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WaitingListService {

    private final WaitingListRepository waitingListRepository;
    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;

    public WaitingListService(
            WaitingListRepository waitingListRepository,
            UserRepository userRepository,
            EquipmentRepository equipmentRepository
    ) {
        this.waitingListRepository = waitingListRepository;
        this.userRepository = userRepository;
        this.equipmentRepository = equipmentRepository;
    }

    public WaitingList joinWaitingList(
            Integer userId,
            Integer equipmentId
    ) {

        boolean alreadyWaiting =
                waitingListRepository
                        .existsByUser_UserIdAndEquipment_IdAndStatus(
                                userId,
                                equipmentId,
                                WaitingListStatus.WAITING
                        );

        if (alreadyWaiting) {
            throw new RuntimeException(
                    "User is already in the waiting list"
            );
        }

        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Equipment equipment = equipmentRepository
                .findById(equipmentId)
                .orElseThrow(() ->
                        new RuntimeException("Equipment not found")
                );

        List<WaitingList> existingQueue =
                waitingListRepository
                        .findByEquipment_IdAndStatusOrderByRequestTimeAsc(
                                equipmentId,
                                WaitingListStatus.WAITING
                        );

        int position = existingQueue.size() + 1;

        WaitingList waitingList = new WaitingList();

        waitingList.setUser(user);
        waitingList.setEquipment(equipment);
        waitingList.setRequestTime(LocalDateTime.now());
        waitingList.setQueuePosition(position);
        waitingList.setStatus(WaitingListStatus.WAITING);
        waitingList.setDemandCost(position * 100.0);

        return waitingListRepository.save(waitingList);
    }
    public List<WaitingList> getAllRequests() {

        return waitingListRepository
                .findAll();
    }

    public List<WaitingList> getEquipmentQueue(
            Integer equipmentId
    ) {

        return waitingListRepository
                .findByEquipment_IdAndStatusOrderByRequestTimeAsc(
                        equipmentId,
                        WaitingListStatus.WAITING
                );
    }

    public WaitingList acceptRequest(
            Integer waitingListId
    ) {

        WaitingList waitingList =
                waitingListRepository
                        .findById(waitingListId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Waiting list request not found"
                                )
                        );

        waitingList.setStatus(
                WaitingListStatus.ACCEPTED
        );

        return waitingListRepository.save(waitingList);
    }

    public WaitingList rejectRequest(
            Integer waitingListId
    ) {

        WaitingList waitingList =
                waitingListRepository
                        .findById(waitingListId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Waiting list request not found"
                                )
                        );

        waitingList.setStatus(
                WaitingListStatus.REJECTED
        );

        return waitingListRepository.save(waitingList);
    }

    public WaitingList cancelRequest(
            Integer waitingListId
    ) {

        WaitingList waitingList =
                waitingListRepository
                        .findById(waitingListId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Waiting list request not found"
                                )
                        );

        waitingList.setStatus(
                WaitingListStatus.CANCELLED
        );

        return waitingListRepository.save(waitingList);
    }
}