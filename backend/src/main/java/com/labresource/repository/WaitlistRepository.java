package com.labresource.repository;

import com.labresource.entity.Waitlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WaitlistRepository extends JpaRepository<Waitlist, Long> {

    List<Waitlist> findByUser_UserIdOrderByRequestedAtDesc(Long userId);

    List<Waitlist> findByStatusInOrderByRequestedAtAsc(List<String> statuses);

    boolean existsByUser_UserIdAndEquipment_EquipmentIdAndRequestedDateAndStatusIn(
            Long userId, Long equipmentId, LocalDate requestedDate, List<String> statuses);

    long countByEquipment_EquipmentIdAndRequestedDateAndStatus(
            Long equipmentId, LocalDate requestedDate, String status);

    // Active queue for one equipment+date, ordered by arrival — used to compute positions
    @Query("SELECT w FROM Waitlist w WHERE w.equipment.equipmentId = :equipmentId " +
           "AND w.requestedDate = :date AND w.status IN ('WAITING', 'NOTIFIED') " +
           "ORDER BY w.requestedAt ASC")
    List<Waitlist> findActiveQueue(@Param("equipmentId") Long equipmentId, @Param("date") LocalDate date);

    @Query("SELECT w FROM Waitlist w WHERE w.equipment.equipmentId = :equipmentId " +
           "AND w.requestedDate = :date AND w.status = 'WAITING' " +
           "ORDER BY w.requestedAt ASC LIMIT 1")
    Optional<Waitlist> findNextWaiting(@Param("equipmentId") Long equipmentId, @Param("date") LocalDate date);

    @Query("SELECT w FROM Waitlist w WHERE w.user.userId = :userId " +
           "AND w.equipment.equipmentId = :equipmentId AND w.requestedDate = :date " +
           "AND w.status = 'NOTIFIED' ORDER BY w.requestedAt ASC LIMIT 1")
    Optional<Waitlist> findNotifiedEntry(@Param("userId") Long userId,
                                         @Param("equipmentId") Long equipmentId,
                                         @Param("date") LocalDate date);

    /** NOTIFIED offers whose claim window has lapsed — swept so the queue can advance. */
    @Query("SELECT w FROM Waitlist w WHERE w.status = 'NOTIFIED' " +
           "AND w.offerExpiresAt IS NOT NULL AND w.offerExpiresAt < :now " +
           "ORDER BY w.offerExpiresAt ASC")
    List<Waitlist> findLapsedOffers(@Param("now") LocalDateTime now);

    /** Any outstanding offer for this slot, expired or not — a slot may hold only one. */
    @Query("SELECT w FROM Waitlist w WHERE w.equipment.equipmentId = :equipmentId " +
           "AND w.requestedDate = :date AND w.status = 'NOTIFIED' " +
           "ORDER BY w.notifiedAt ASC LIMIT 1")
    Optional<Waitlist> findOutstandingOffer(@Param("equipmentId") Long equipmentId,
                                            @Param("date") LocalDate date);

    /**
     * Every waitlist entry whose requested date falls in the window, whatever became of it.
     * Demand analysis counts expired and cancelled entries too — someone still asked for that
     * slot and did not get it, and dropping them would understate unmet demand.
     */
    @Query("SELECT w FROM Waitlist w " +
           "JOIN FETCH w.equipment e " +
           "LEFT JOIN FETCH e.department " +
           "WHERE w.requestedDate >= :from AND w.requestedDate <= :to")
    List<Waitlist> findInWindow(@Param("from") LocalDate from, @Param("to") LocalDate to);

    /** Waitlist entries for dates that have already passed — nothing can come of them. */
    @Query("SELECT w FROM Waitlist w WHERE w.status IN ('WAITING', 'NOTIFIED') " +
           "AND w.requestedDate < :today")
    List<Waitlist> findStaleByDate(@Param("today") LocalDate today);
}
