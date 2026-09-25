package com.example.appointment.controller;

import com.example.appointment.dto.AppointmentResponse;
import com.example.appointment.entity.Appointment;
import com.example.appointment.entity.Schedule;
import com.example.appointment.service.AppointmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(
            AppointmentService appointmentService) {

        this.appointmentService = appointmentService;
    }


    // Book appointment
    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(
            @RequestParam Long userId,
            @RequestParam Long providerId,
            @RequestParam Long scheduleId) {

        Schedule schedule =
                appointmentService.getScheduleById(scheduleId);

        if (schedule != null && appointmentService.isScheduleExpired(schedule)) {
            return ResponseEntity.badRequest()
                    .body("This appointment slot has expired.");
        }

        if (schedule != null && appointmentService.isProviderUnavailableOnDate(
                providerId,
                LocalDate.parse(schedule.getAppointmentDate()))) {
            return ResponseEntity.badRequest()
                    .body("This provider is unavailable on this date.");
        }

        Appointment appointment =
                appointmentService.bookAppointment(
                        userId,
                        providerId,
                        scheduleId
                );

        if (appointment == null) {

            return ResponseEntity.badRequest()
                    .body(
                        "Unable to book appointment. " +
                        "User, provider, or schedule is invalid, " +
                        "or the slot is already booked."
                    );
        }

        return ResponseEntity.ok(new AppointmentResponse(appointment));
    }


    // Get all appointments
    @GetMapping
    public ResponseEntity<List<AppointmentResponse>>
    getAllAppointments() {

        List<AppointmentResponse> response =
                appointmentService.getAllAppointments()
                        .stream()
                        .map(AppointmentResponse::new)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }


    // Get appointments for one user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AppointmentResponse>>
    getAppointmentsByUser(
            @PathVariable Long userId) {

        List<AppointmentResponse> response =
                appointmentService
                        .getAppointmentsByUser(userId)
                        .stream()
                        .map(AppointmentResponse::new)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }


    // Get appointments for one provider
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<AppointmentResponse>>
    getAppointmentsByProvider(
            @PathVariable Long providerId) {

        List<AppointmentResponse> response =
                appointmentService
                        .getAppointmentsByProvider(providerId)
                        .stream()
                        .map(AppointmentResponse::new)
                        .toList();

        return ResponseEntity.ok(response);
    }


    // Get appointment by ID
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse>
    getAppointmentById(
            @PathVariable Long id) {

        Appointment appointment =
                appointmentService
                        .getAppointmentById(id);

        if (appointment == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(new AppointmentResponse(appointment));
    }


    // Cancel appointment
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(
            @PathVariable Long id) {

        boolean cancelled =
                appointmentService
                        .cancelAppointment(id);

        if (!cancelled) {

            return ResponseEntity
                    .badRequest()
                    .body(
                        "Appointment cannot be cancelled."
                    );
        }

        return ResponseEntity.ok(
                "Appointment cancelled successfully."
        );
    }


    // Approve appointment
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveAppointment(
            @PathVariable Long id) {

        boolean approved =
                appointmentService
                        .approveAppointment(id);

        if (!approved) {

            return ResponseEntity
                    .badRequest()
                    .body(
                        "Appointment cannot be approved."
                    );
        }

        return ResponseEntity.ok(
                "Appointment approved successfully."
        );
    }


    // Reject appointment
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectAppointment(
            @PathVariable Long id) {

        boolean rejected =
                appointmentService
                        .rejectAppointment(id);

        if (!rejected) {

            return ResponseEntity
                    .badRequest()
                    .body(
                        "Appointment cannot be rejected."
                    );
        }

        return ResponseEntity.ok(
                "Appointment rejected successfully."
        );
    }


    // Reschedule appointment
    @PutMapping("/{id}/reschedule")
    public ResponseEntity<?> rescheduleAppointment(
            @PathVariable Long id,
            @RequestParam Long scheduleId) {

        boolean rescheduled =
                appointmentService
                        .rescheduleAppointment(
                                id,
                                scheduleId
                        );

        if (!rescheduled) {

            return ResponseEntity
                    .badRequest()
                    .body(
                        "Unable to reschedule appointment. " +
                        "The appointment or new slot is invalid, " +
                        "or the new slot is already booked."
                    );
        }

        return ResponseEntity.ok(
                "Appointment rescheduled successfully."
        );
    }


    // Complete appointment
    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeAppointment(
            @PathVariable Long id) {

        boolean completed =
                appointmentService
                        .completeAppointment(id);

        if (!completed) {

            return ResponseEntity
                    .badRequest()
                    .body(
                        "Appointment cannot be completed. " +
                        "Only approved appointments can be completed."
                    );
        }

        return ResponseEntity.ok(
                "Appointment completed successfully."
        );
    }
}