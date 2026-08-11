package com.infosys.labresourceutilizationplatform.dto;

import java.util.List;
import java.util.Map;

public class ResourceSharingAnalyticsDTO {

    private long totalRequests;
    private long approvedRequests;
    private long rejectedRequests;
    private long pendingRequests;
    private long activeShares;
    private long completedShares;
    private double totalDurationHours;
    private double totalRevenue;
    private double approvalRate;

    // Charts data
    private List<Map<String, Object>> sharesByInstitute;
    private List<Map<String, Object>> mostFrequentlySharedEquipment;
    private List<Map<String, Object>> monthlyTrends;
    private List<Map<String, Object>> statusBreakdown;
    private List<Map<String, Object>> durationDistribution;
    private List<Map<String, Object>> instituteComparison;
    private List<Map<String, Object>> activityHeatmap;

    public ResourceSharingAnalyticsDTO() {
    }

    public long getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(long totalRequests) {
        this.totalRequests = totalRequests;
    }

    public long getApprovedRequests() {
        return approvedRequests;
    }

    public void setApprovedRequests(long approvedRequests) {
        this.approvedRequests = approvedRequests;
    }

    public long getRejectedRequests() {
        return rejectedRequests;
    }

    public void setRejectedRequests(long rejectedRequests) {
        this.rejectedRequests = rejectedRequests;
    }

    public long getPendingRequests() {
        return pendingRequests;
    }

    public void setPendingRequests(long pendingRequests) {
        this.pendingRequests = pendingRequests;
    }

    public long getActiveShares() {
        return activeShares;
    }

    public void setActiveShares(long activeShares) {
        this.activeShares = activeShares;
    }

    public long getCompletedShares() {
        return completedShares;
    }

    public void setCompletedShares(long completedShares) {
        this.completedShares = completedShares;
    }

    public double getTotalDurationHours() {
        return totalDurationHours;
    }

    public void setTotalDurationHours(double totalDurationHours) {
        this.totalDurationHours = totalDurationHours;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public double getApprovalRate() {
        return approvalRate;
    }

    public void setApprovalRate(double approvalRate) {
        this.approvalRate = approvalRate;
    }

    public List<Map<String, Object>> getSharesByInstitute() {
        return sharesByInstitute;
    }

    public void setSharesByInstitute(List<Map<String, Object>> sharesByInstitute) {
        this.sharesByInstitute = sharesByInstitute;
    }

    public List<Map<String, Object>> getMostFrequentlySharedEquipment() {
        return mostFrequentlySharedEquipment;
    }

    public void setMostFrequentlySharedEquipment(List<Map<String, Object>> mostFrequentlySharedEquipment) {
        this.mostFrequentlySharedEquipment = mostFrequentlySharedEquipment;
    }

    public List<Map<String, Object>> getMonthlyTrends() {
        return monthlyTrends;
    }

    public void setMonthlyTrends(List<Map<String, Object>> monthlyTrends) {
        this.monthlyTrends = monthlyTrends;
    }

    public List<Map<String, Object>> getStatusBreakdown() {
        return statusBreakdown;
    }

    public void setStatusBreakdown(List<Map<String, Object>> statusBreakdown) {
        this.statusBreakdown = statusBreakdown;
    }

    public List<Map<String, Object>> getDurationDistribution() {
        return durationDistribution;
    }

    public void setDurationDistribution(List<Map<String, Object>> durationDistribution) {
        this.durationDistribution = durationDistribution;
    }

    public List<Map<String, Object>> getInstituteComparison() {
        return instituteComparison;
    }

    public void setInstituteComparison(List<Map<String, Object>> instituteComparison) {
        this.instituteComparison = instituteComparison;
    }

    public List<Map<String, Object>> getActivityHeatmap() {
        return activityHeatmap;
    }

    public void setActivityHeatmap(List<Map<String, Object>> activityHeatmap) {
        this.activityHeatmap = activityHeatmap;
    }
}
