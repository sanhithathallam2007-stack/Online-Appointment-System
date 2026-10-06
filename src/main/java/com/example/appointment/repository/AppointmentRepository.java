package com.example.appointment.repository;

import com.example.appointment.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Collection;
import java.time.LocalDate;
import java.time.LocalTime;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByUserId(Long userId);

    List<Appointment> findByProviderId(Long providerId);

    List<Appointment> findByProvider_IdAndAppointmentDateAndAppointmentTimeAndStatusIn(
            Long providerId,
            LocalDate appointmentDate,
            LocalTime appointmentTime,
            Collection<String> statuses);

        List<Appointment> findByProvider_IdAndAppointmentDateAndAppointmentTimeAndIdNotAndStatusIn(
            Long providerId,
            LocalDate appointmentDate,
            LocalTime appointmentTime,
            Long excludedAppointmentId,
            Collection<String> statuses);
}