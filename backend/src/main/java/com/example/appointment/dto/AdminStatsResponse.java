package com.example.appointment.dto;

public class AdminStatsResponse {

    private Long totalUsers;
    private Long totalProviders;
    private Long totalAppointments;
    private Long totalCategories;

    public AdminStatsResponse() {
    }

    public AdminStatsResponse(
            Long totalUsers,
            Long totalProviders,
            Long totalAppointments,
            Long totalCategories) {
        this.totalUsers = totalUsers;
        this.totalProviders = totalProviders;
        this.totalAppointments = totalAppointments;
        this.totalCategories = totalCategories;
    }

    public Long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(Long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public Long getTotalProviders() {
        return totalProviders;
    }

    public void setTotalProviders(Long totalProviders) {
        this.totalProviders = totalProviders;
    }

    public Long getTotalAppointments() {
        return totalAppointments;
    }

    public void setTotalAppointments(Long totalAppointments) {
        this.totalAppointments = totalAppointments;
    }

    public Long getTotalCategories() {
        return totalCategories;
    }

    public void setTotalCategories(Long totalCategories) {
        this.totalCategories = totalCategories;
    }
}
