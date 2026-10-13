package com.example.appointment.dto;

import com.example.appointment.entity.Appointment;

public class AppointmentResponse {

    private Long id;
    private UserResponse user;
    private ProviderResponse provider;
    private String appointmentDate;
    private String appointmentTime;
    private String status;

    public AppointmentResponse(Appointment appointment) {

        this.id = appointment.getId();

        if (appointment.getUser() != null) {
            this.user = new UserResponse(appointment.getUser());
        }

        if (appointment.getProvider() != null) {
            this.provider =
                    new ProviderResponse(appointment.getProvider());
        }

        if (appointment.getAppointmentDate() != null) {
            this.appointmentDate =
                    appointment.getAppointmentDate().toString();
        }

        if (appointment.getAppointmentTime() != null) {
            this.appointmentTime =
                    appointment.getAppointmentTime().toString();
        }

        this.status = appointment.getStatus();
    }

    public Long getId() {
        return id;
    }

    public UserResponse getUser() {
        return user;
    }

    public ProviderResponse getProvider() {
        return provider;
    }

    public String getAppointmentDate() {
        return appointmentDate;
    }

    public String getAppointmentTime() {
        return appointmentTime;
    }

    public String getStatus() {
        return status;
    }
}
