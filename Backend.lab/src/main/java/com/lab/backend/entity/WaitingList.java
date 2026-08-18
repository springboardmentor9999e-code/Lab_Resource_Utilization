package com.lab.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.lab.backend.enums.WaitingStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

@Entity
@Table(name = "waiting_list")
public class WaitingList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User is required")
    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"password"})
    private User user;

    @NotNull(message = "Equipment is required")
    @ManyToOne
    @JoinColumn(name = "equipment_id")
    @JsonIgnoreProperties({"bookings"})
    private Equipment equipment;

    private int position;

    private LocalDate requestDate;

    @Enumerated(EnumType.STRING)
    private WaitingStatus status;

    public WaitingList() {
    }

    public WaitingList(Long id, User user, Equipment equipment, int position,
                       LocalDate requestDate, WaitingStatus status) {
        this.id = id;
        this.user = user;
        this.equipment = equipment;
        this.position = position;
        this.requestDate = requestDate;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public int getPosition() {
        return position;
    }

    public void setPosition(int position) {
        this.position = position;
    }

    public LocalDate getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDate requestDate) {
        this.requestDate = requestDate;
    }

    public WaitingStatus getStatus() {
        return status;
    }

    public void setStatus(WaitingStatus status) {
        this.status = status;
    }
}
