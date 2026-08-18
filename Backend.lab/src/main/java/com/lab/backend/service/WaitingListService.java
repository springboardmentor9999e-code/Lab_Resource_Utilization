package com.lab.backend.service;

import com.lab.backend.entity.Booking;
import com.lab.backend.entity.Equipment;
import com.lab.backend.entity.User;
import com.lab.backend.entity.WaitingList;
import com.lab.backend.enums.BookingStatus;
import com.lab.backend.enums.WaitingStatus;
import com.lab.backend.exception.CustomExceptions;
import com.lab.backend.repository.BookingRepository;
import com.lab.backend.repository.EquipmentRepository;
import com.lab.backend.repository.UserRepository;
import com.lab.backend.repository.WaitingListRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional
public class WaitingListService {

    private final WaitingListRepository waitingListRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final BookingService bookingService;

    public WaitingListService(WaitingListRepository waitingListRepository,
                              EquipmentRepository equipmentRepository,
                              UserRepository userRepository,
                              BookingRepository bookingRepository,
                              @Lazy BookingService bookingService) {
        this.waitingListRepository = waitingListRepository;
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.bookingService = bookingService;
    }

    public WaitingList addToWaitingList(WaitingList waitingList) {
        if (waitingList.getUser() == null || waitingList.getUser().getId() == null) {
            throw new CustomExceptions.BadRequestException("User is required for waiting list");
        }

        if (waitingList.getEquipment() == null || waitingList.getEquipment().getId() == null) {
            throw new CustomExceptions.BadRequestException("Equipment is required for waiting list");
        }

        User user = userRepository.findById(waitingList.getUser().getId())
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException(
                        "User not found with ID: " + waitingList.getUser().getId()));

        Equipment equipment = equipmentRepository.findById(waitingList.getEquipment().getId())
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException(
                        "Equipment not found with ID: " + waitingList.getEquipment().getId()));

        if (equipment.getAvailableQuantity() > 0) {
            throw new CustomExceptions.BadRequestException(
                    "Equipment is available for booking. Please book directly instead of joining the waiting list.");
        }

        if (waitingListRepository.existsByUserIdAndEquipmentIdAndStatus(
                user.getId(), equipment.getId(), WaitingStatus.PENDING)) {
            throw new CustomExceptions.ConflictException("User is already on the waiting list for this equipment");
        }

        int nextPosition = waitingListRepository.findByEquipmentIdOrderByPositionAsc(equipment.getId())
                .stream()
                .mapToInt(WaitingList::getPosition)
                .max()
                .orElse(0) + 1;

        waitingList.setUser(user);
        waitingList.setEquipment(equipment);
        waitingList.setPosition(nextPosition);
        waitingList.setRequestDate(LocalDate.now());
        waitingList.setStatus(WaitingStatus.PENDING);

        return waitingListRepository.save(waitingList);
    }

    public List<WaitingList> getWaitingList() {
        return waitingListRepository.findAll()
                .stream()
                .sorted(Comparator
                        .comparing((WaitingList w) -> w.getEquipment().getId())
                        .thenComparing(WaitingList::getPosition))
                .toList();
    }

    public List<WaitingList> getByUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new CustomExceptions.ResourceNotFoundException("User not found with ID: " + userId);
        }
        return waitingListRepository.findByUserId(userId);
    }

    public Booking allocateNextUser(Long equipmentId) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException(
                        "Equipment not found with ID: " + equipmentId));

        if (equipment.getAvailableQuantity() <= 0) {
            return null;
        }

        WaitingList nextInQueue = waitingListRepository.findByEquipmentIdOrderByPositionAsc(equipmentId)
                .stream()
                .filter(w -> w.getStatus() == WaitingStatus.PENDING)
                .findFirst()
                .orElse(null);

        if (nextInQueue == null) {
            return null;
        }

        LocalDate today = LocalDate.now();
        Booking booking = new Booking();
        booking.setUser(nextInQueue.getUser());
        booking.setEquipment(equipment);
        booking.setBookingDate(today);
        booking.setReturnDate(today.plusDays(7));
        booking.setStatus(BookingStatus.APPROVED);
        bookingRepository.save(booking);

        equipment.setAvailableQuantity(equipment.getAvailableQuantity() - 1);
        equipmentRepository.save(equipment);

        nextInQueue.setStatus(WaitingStatus.ALLOCATED);
        waitingListRepository.save(nextInQueue);

        bookingService.recalculateEquipmentStatus(equipment);

        return booking;
    }

    public WaitingList cancelWaiting(Long id) {
        WaitingList waitingList = waitingListRepository.findById(id)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException(
                        "Waiting list entry not found with ID: " + id));

        if (waitingList.getStatus() != WaitingStatus.PENDING) {
            throw new CustomExceptions.BadRequestException(
                    "Only PENDING waiting list entries can be cancelled");
        }

        waitingList.setStatus(WaitingStatus.CANCELLED);
        return waitingListRepository.save(waitingList);
    }
}
