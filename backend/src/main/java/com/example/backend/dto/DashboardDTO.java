package com.example.backend.dto;

public class DashboardDTO {

    private long totalUsers;
    private long totalLaboratories;
    private long totalResources;
    private long totalBookings;
    private long totalMaintenance;
    private long totalWaitingList;

    public DashboardDTO() {
    }

    public DashboardDTO(long totalUsers,
                        long totalLaboratories,
                        long totalResources,
                        long totalBookings,
                        long totalMaintenance,
                        long totalWaitingList) {

        this.totalUsers = totalUsers;
        this.totalLaboratories = totalLaboratories;
        this.totalResources = totalResources;
        this.totalBookings = totalBookings;
        this.totalMaintenance = totalMaintenance;
        this.totalWaitingList = totalWaitingList;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalLaboratories() {
        return totalLaboratories;
    }

    public void setTotalLaboratories(long totalLaboratories) {
        this.totalLaboratories = totalLaboratories;
    }

    public long getTotalResources() {
        return totalResources;
    }

    public void setTotalResources(long totalResources) {
        this.totalResources = totalResources;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getTotalMaintenance() {
        return totalMaintenance;
    }

    public void setTotalMaintenance(long totalMaintenance) {
        this.totalMaintenance = totalMaintenance;
    }

    public long getTotalWaitingList() {
        return totalWaitingList;
    }

    public void setTotalWaitingList(long totalWaitingList) {
        this.totalWaitingList = totalWaitingList;
    }
}