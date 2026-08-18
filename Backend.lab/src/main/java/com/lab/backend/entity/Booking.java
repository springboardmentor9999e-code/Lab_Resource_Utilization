package com.lab.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.lab.backend.enums.BookingStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Booking date is required")
    @FutureOrPresent(message = "Booking date cannot be in the past")
    private LocalDate bookingDate;

    @NotNull(message = "Return date is required")
    private LocalDate returnDate;

    private LocalDateTime returnTime;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    @NotNull(message = "User is required")
    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"bookings"})
    private User user;

    @NotNull(message = "Equipment is required")
    @ManyToOne
    @JoinColumn(name = "equipment_id")
    @JsonIgnoreProperties({"bookings"})
    private Equipment equipment;

    public Booking() {
    }

    public Booking(Long id,
                   LocalDate bookingDate,
                   LocalDate returnDate,
                   BookingStatus status,
                   User user,
                   Equipment equipment) {

        this.id = id;
        this.bookingDate = bookingDate;
        this.returnDate = returnDate;
        this.status = status;
        this.user = user;
        this.equipment = equipment;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }

    public LocalDate getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(LocalDate returnDate) {
        this.returnDate = returnDate;
    }

    public LocalDateTime getReturnTime() {
        return returnTime;
    }

    public void setReturnTime(LocalDateTime returnTime) {
        this.returnTime = returnTime;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Equipment getEquipment() {
        return equipment;
    }

    public void setEquipment(Equipment equipment) {
        this.equipment = equipment;
    }
}