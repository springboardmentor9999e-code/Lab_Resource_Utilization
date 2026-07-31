package com.project.Lab.Resource.Utilization.Platform.dto;

public class DashboardStatsDTO {

    private Long totalBookings;
    private Long pendingBookings;
    private Long approvedBookings;
    private Long completedBookings;

    private Long totalEquipment;
    private Long availableEquipment;
    private Long bookedEquipment;

    private Long totalUsers;
    private Long activeUsers;

    public DashboardStatsDTO() {
    }

    public DashboardStatsDTO(
            Long totalBookings,
            Long pendingBookings,
            Long approvedBookings,
            Long completedBookings,
            Long totalEquipment,
            Long availableEquipment,
            Long bookedEquipment,
            Long totalUsers,
            Long activeUsers
    ) {
        this.totalBookings = totalBookings;
        this.pendingBookings = pendingBookings;
        this.approvedBookings = approvedBookings;
        this.completedBookings = completedBookings;
        this.totalEquipment = totalEquipment;
        this.availableEquipment = availableEquipment;
        this.bookedEquipment = bookedEquipment;
        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
    }

    public Long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(Long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public Long getPendingBookings() {
        return pendingBookings;
    }

    public void setPendingBookings(Long pendingBookings) {
        this.pendingBookings = pendingBookings;
    }

    public Long getApprovedBookings() {
        return approvedBookings;
    }

    public void setApprovedBookings(Long approvedBookings) {
        this.approvedBookings = approvedBookings;
    }

    public Long getCompletedBookings() {
        return completedBookings;
    }

    public void setCompletedBookings(Long completedBookings) {
        this.completedBookings = completedBookings;
    }

    public Long getTotalEquipment() {
        return totalEquipment;
    }

    public void setTotalEquipment(Long totalEquipment) {
        this.totalEquipment = totalEquipment;
    }

    public Long getAvailableEquipment() {
        return availableEquipment;
    }

    public void setAvailableEquipment(Long availableEquipment) {
        this.availableEquipment = availableEquipment;
    }

    public Long getBookedEquipment() {
        return bookedEquipment;
    }

    public void setBookedEquipment(Long bookedEquipment) {
        this.bookedEquipment = bookedEquipment;
    }

    public Long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(Long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public Long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(Long activeUsers) {
        this.activeUsers = activeUsers;
    }
}