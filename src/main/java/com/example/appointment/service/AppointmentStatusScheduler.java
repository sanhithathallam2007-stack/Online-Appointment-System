package com.example.appointment.service;

import com.example.appointment.entity.Appointment;
import com.example.appointment.repository.AppointmentRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class AppointmentStatusScheduler {

    private final AppointmentRepository appointmentRepository;

    public AppointmentStatusScheduler(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    @Scheduled(fixedDelay = 60000)
    public void updateCompletedAppointments() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        List<Appointment> appointments = appointmentRepository.findAll();

        for (Appointment appointment : appointments) {
            String status = appointment.getStatus();

            if (!"PENDING".equals(status) && !"APPROVED".equals(status)) {
                continue;
            }

            if (appointment.getAppointmentDate() == null || appointment.getAppointmentTime() == null) {
                continue;
            }

            boolean shouldComplete = appointment.getAppointmentDate().isBefore(today)
                    || (appointment.getAppointmentDate().isEqual(today)
                    && appointment.getAppointmentTime().isBefore(now));

            if (shouldComplete) {
                appointment.setStatus("COMPLETED");
                appointmentRepository.save(appointment);
                System.out.println("Appointment " + appointment.getId() + " automatically marked COMPLETED.");
            }
        }
    }
}
