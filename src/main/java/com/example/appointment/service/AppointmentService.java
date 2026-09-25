package com.example.appointment.service;

import com.example.appointment.entity.Appointment;
import com.example.appointment.entity.Provider;
import com.example.appointment.entity.Schedule;
import com.example.appointment.entity.User;
import com.example.appointment.notification.NotificationService;
import com.example.appointment.repository.AppointmentRepository;
import com.example.appointment.repository.ProviderRepository;
import com.example.appointment.repository.ScheduleRepository;
import com.example.appointment.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final ProviderRepository providerRepository;
    private final ScheduleRepository scheduleRepository;
    private final CalendarService calendarService;
    private final NotificationService notificationService;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            UserRepository userRepository,
            ProviderRepository providerRepository,
            ScheduleRepository scheduleRepository,
            CalendarService calendarService,
            NotificationService notificationService) {

        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.providerRepository = providerRepository;
        this.scheduleRepository = scheduleRepository;
        this.calendarService = calendarService;
        this.notificationService = notificationService;
    }

    public Appointment bookAppointment(
            Long userId,
            Long providerId,
            Long scheduleId) {

        User user =
                userRepository.findById(userId).orElse(null);

        Provider provider =
                providerRepository.findById(providerId).orElse(null);

        Schedule schedule =
                scheduleRepository.findById(scheduleId).orElse(null);

        // DEBUG INFORMATION
        System.out.println("===== BOOKING DEBUG =====");
        System.out.println("userId = " + userId);
        System.out.println("user found = " + (user != null));

        System.out.println("providerId = " + providerId);
        System.out.println("provider found = " + (provider != null));

        System.out.println("scheduleId = " + scheduleId);
        System.out.println("schedule found = " + (schedule != null));

        if (schedule != null) {
            System.out.println(
                    "schedule available = "
                            + schedule.isAvailable()
            );

            System.out.println(
                    "schedule date = "
                            + schedule.getAppointmentDate()
            );

            System.out.println(
                    "schedule time = "
                            + schedule.getAppointmentTime()
            );
        }

        System.out.println("=========================");

        if (user == null ||
            provider == null ||
            schedule == null) {

            return null;
        }

        if (schedule.isAvailable() == null || !schedule.isAvailable()) {

            return null;
        }

        if (isScheduleExpired(schedule)) {

            return null;
        }

        if (isProviderUnavailableOnDate(providerId, LocalDate.parse(schedule.getAppointmentDate()))) {
            return null;
        }

        Appointment appointment = new Appointment();

        appointment.setUser(user);
        appointment.setProvider(provider);

        appointment.setAppointmentDate(
                LocalDate.parse(
                        schedule.getAppointmentDate()
                )
        );

        appointment.setAppointmentTime(
                LocalTime.parse(
                        convertTime(
                                schedule.getAppointmentTime()
                        )
                )
        );

        appointment.setStatus("PENDING");

        schedule.setAvailable(false);

        scheduleRepository.save(schedule);

        Appointment savedAppointment = appointmentRepository.save(appointment);

        if (savedAppointment != null) {
            notificationService.notifyAppointmentBooking(
                    user.getName(),
                    provider.getName(),
                    savedAppointment.getAppointmentDate().toString(),
                    formatNotificationTime(savedAppointment.getAppointmentTime()),
                    savedAppointment.getStatus()
            );
        }

        return savedAppointment;
    }

    public List<Appointment> getAllAppointments() {

        return appointmentRepository.findAll();
    }

    public List<Appointment> getAppointmentsByUser(
            Long userId) {

        return appointmentRepository.findByUserId(userId);
    }

    public List<Appointment> getAppointmentsByProvider(
            Long providerId) {

        return appointmentRepository.findByProviderId(providerId);
    }

    public Appointment getAppointmentById(Long id) {

        return appointmentRepository
                .findById(id)
                .orElse(null);
    }

    public Schedule getScheduleById(Long id) {
        return scheduleRepository.findById(id).orElse(null);
    }

    public boolean isProviderUnavailableOnDate(Long providerId, LocalDate date) {
        if (providerId == null || date == null) {
            return false;
        }

        Provider provider = providerRepository.findById(providerId).orElse(null);

        if (provider == null) {
            return false;
        }

        return calendarService.isRestrictedForCategory(date, provider.getCategoryId());
    }

    public boolean isScheduleExpired(Schedule schedule) {
        if (schedule == null || schedule.getAppointmentDate() == null || schedule.getAppointmentTime() == null) {
            return false;
        }

        LocalDate scheduleDate = LocalDate.parse(schedule.getAppointmentDate());
        LocalTime scheduleTime = LocalTime.parse(convertTime(schedule.getAppointmentTime()));

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        if (scheduleDate.isBefore(today)) {
            return true;
        }

        return scheduleDate.isEqual(today) && scheduleTime.isBefore(now);
    }

    public boolean cancelAppointment(Long id) {

        Appointment appointment =
                appointmentRepository
                        .findById(id)
                        .orElse(null);

        if (appointment == null) {
            return false;
        }

        if (appointment.getStatus().equals("CANCELLED")) {
            return false;
        }

        if (appointment.getStatus().equals("COMPLETED")) {
            return false;
        }

        appointment.setStatus("CANCELLED");

        makeSlotAvailable(appointment);

        appointmentRepository.save(appointment);

        return true;
    }

    public boolean approveAppointment(Long id) {

        Appointment appointment =
                appointmentRepository
                        .findById(id)
                        .orElse(null);

        if (appointment == null) {
            return false;
        }

        if (!appointment.getStatus().equals("PENDING")) {
            return false;
        }

        appointment.setStatus("APPROVED");

        appointmentRepository.save(appointment);

        return true;
    }

    public boolean rejectAppointment(Long id) {

        Appointment appointment =
                appointmentRepository
                        .findById(id)
                        .orElse(null);

        if (appointment == null) {
            return false;
        }

        if (!appointment.getStatus().equals("PENDING")) {
            return false;
        }

        appointment.setStatus("REJECTED");

        makeSlotAvailable(appointment);

        appointmentRepository.save(appointment);

        return true;
    }

    public boolean rescheduleAppointment(
            Long appointmentId,
            Long newScheduleId) {

        Appointment appointment =
                appointmentRepository
                        .findById(appointmentId)
                        .orElse(null);

        Schedule newSchedule =
                scheduleRepository
                        .findById(newScheduleId)
                        .orElse(null);

        if (appointment == null ||
            newSchedule == null) {

            return false;
        }

        if (!appointment.getStatus().equals("PENDING") &&
            !appointment.getStatus().equals("APPROVED")) {

            return false;
        }

        if (!newSchedule.isAvailable()) {

            return false;
        }

        if (calendarService.isRestrictedForCategory(
                LocalDate.parse(newSchedule.getAppointmentDate()),
                appointment.getProvider().getCategoryId())) {
            return false;
        }

        makeSlotAvailable(appointment);

        appointment.setAppointmentDate(
                LocalDate.parse(
                        newSchedule.getAppointmentDate()
                )
        );

        appointment.setAppointmentTime(
                LocalTime.parse(
                        convertTime(
                                newSchedule.getAppointmentTime()
                        )
                )
        );

        newSchedule.setAvailable(false);

        scheduleRepository.save(newSchedule);

        appointment.setStatus("PENDING");

        appointmentRepository.save(appointment);

        return true;
    }

    public boolean completeAppointment(Long id) {

        Appointment appointment =
                appointmentRepository
                        .findById(id)
                        .orElse(null);

        if (appointment == null) {
            return false;
        }

        if (!appointment.getStatus().equals("APPROVED")) {
            return false;
        }

        appointment.setStatus("COMPLETED");

        appointmentRepository.save(appointment);

        return true;
    }

    private void makeSlotAvailable(
            Appointment appointment) {

        if (appointment.getProvider() == null) {
            return;
        }

        List<Schedule> schedules =
                scheduleRepository.findByProviderId(
                        appointment.getProvider().getId()
                );

        for (Schedule schedule : schedules) {

            LocalDate scheduleDate =
                    LocalDate.parse(
                            schedule.getAppointmentDate()
                    );

            LocalTime scheduleTime =
                    LocalTime.parse(
                            convertTime(
                                    schedule.getAppointmentTime()
                            )
                    );

            if (scheduleDate.equals(
                        appointment.getAppointmentDate())
                    &&
                scheduleTime.equals(
                        appointment.getAppointmentTime())) {

                schedule.setAvailable(true);

                scheduleRepository.save(schedule);

                break;
            }
        }
    }

    private String formatNotificationTime(LocalTime time) {
        if (time == null) {
            return "N/A";
        }

        int hour = time.getHour();
        int minute = time.getMinute();
        String period = hour >= 12 ? "PM" : "AM";
        int displayHour = hour % 12;
        if (displayHour == 0) {
            displayHour = 12;
        }

        return String.format("%d:%02d %s", displayHour, minute, period);
    }

    private String convertTime(String time) {

        if (time.contains("AM") ||
            time.contains("PM")) {

            String[] parts =
                    time.split(" ");

            String[] hm =
                    parts[0].split(":");

            int hour =
                    Integer.parseInt(hm[0]);

            int minute =
                    Integer.parseInt(hm[1]);

            String amPm =
                    parts[1];

            if (amPm.equalsIgnoreCase("PM")
                    && hour != 12) {

                hour += 12;
            }

            if (amPm.equalsIgnoreCase("AM")
                    && hour == 12) {

                hour = 0;
            }

            return String.format(
                    "%02d:%02d",
                    hour,
                    minute
            );
        }

        return time;
    }
}