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
import com.example.appointment.util.AppointmentTimeNormalizer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
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

    @Transactional
    public Appointment bookAppointment(
            Long userId,
            Long providerId,
            Long scheduleId) {

        Provider provider =
            providerRepository.findByIdForUpdate(providerId).orElse(null);

        User user =
                userRepository.findById(userId).orElse(null);

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

        if (!providerId.equals(schedule.getProviderId())) {
            return null;
        }

        if (schedule.isAvailable() == null || !schedule.isAvailable()) {

            return null;
        }

        if (isScheduleExpired(schedule)) {

            return null;
        }

        LocalDate appointmentDate = LocalDate.parse(schedule.getAppointmentDate());
        LocalTime appointmentTime = AppointmentTimeNormalizer.parse(schedule.getAppointmentTime());

        if (isProviderUnavailableOnDate(providerId, appointmentDate)) {
            return null;
        }

        List<Appointment> activeAppointments = appointmentRepository
                .findByProvider_IdAndAppointmentDateAndAppointmentTimeAndStatusIn(
                        providerId,
                        appointmentDate,
                        appointmentTime,
                        List.of("PENDING", "APPROVED"));
        if (!activeAppointments.isEmpty()) {
            return null;
        }

        if (scheduleRepository.claimAvailableSlot(scheduleId, providerId) != 1) {
            return null;
        }

        Appointment appointment = new Appointment();

        appointment.setUser(user);
        appointment.setProvider(provider);

        appointment.setAppointmentDate(appointmentDate);
        appointment.setAppointmentTime(appointmentTime);

        appointment.setStatus("PENDING");

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
        LocalTime scheduleTime = AppointmentTimeNormalizer.parse(schedule.getAppointmentTime());

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        if (scheduleDate.isBefore(today)) {
            return true;
        }

        return scheduleDate.isEqual(today) && scheduleTime.isBefore(now);
    }

    @Transactional
    public boolean cancelAppointment(Long id) {

        Appointment appointment =
                appointmentRepository
                        .findById(id)
                        .orElse(null);

        if (appointment == null) {
            return false;
        }

        if (!lockProviderForAppointment(appointment)) {
            return false;
        }

        if (appointment.getStatus().equals("CANCELLED")) {
            return false;
        }

        if (appointment.getStatus().equals("COMPLETED")) {
            return false;
        }

        appointment.setStatus("CANCELLED");

        appointmentRepository.save(appointment);
        makeSlotAvailable(appointment);

        return true;
    }

    @Transactional
    public boolean approveAppointment(Long id) {

        Appointment appointment =
                appointmentRepository
                        .findById(id)
                        .orElse(null);

        if (appointment == null) {
            return false;
        }

        if (!lockProviderForAppointment(appointment)) {
            return false;
        }

        if (!appointment.getStatus().equals("PENDING")) {
            return false;
        }

        appointment.setStatus("APPROVED");

        appointmentRepository.save(appointment);

        return true;
    }

    @Transactional
    public boolean rejectAppointment(Long id) {

        Appointment appointment =
                appointmentRepository
                        .findById(id)
                        .orElse(null);

        if (appointment == null) {
            return false;
        }

        if (!lockProviderForAppointment(appointment)) {
            return false;
        }

        if (!appointment.getStatus().equals("PENDING")) {
            return false;
        }

        appointment.setStatus("REJECTED");

        appointmentRepository.save(appointment);
        makeSlotAvailable(appointment);

        return true;
    }

    @Transactional
    public boolean rescheduleAppointment(
            Long appointmentId,
            Long newScheduleId) {

        Appointment appointment =
                appointmentRepository
                        .findById(appointmentId)
                        .orElse(null);

        if (appointment == null || appointment.getProvider() == null) {

            return false;
        }

        Long providerId = appointment.getProvider().getId();
        if (providerRepository.findByIdForUpdate(providerId).isEmpty()) {
            return false;
        }

        Schedule newSchedule =
                scheduleRepository
                        .findById(newScheduleId)
                        .orElse(null);

        if (newSchedule == null || !providerId.equals(newSchedule.getProviderId())) {
            return false;
        }

        if (!appointment.getStatus().equals("PENDING") &&
            !appointment.getStatus().equals("APPROVED")) {

            return false;
        }

        if (!Boolean.TRUE.equals(newSchedule.isAvailable()) || isScheduleExpired(newSchedule)) {

            return false;
        }

        LocalDate newDate = LocalDate.parse(newSchedule.getAppointmentDate());
        LocalTime newTime = AppointmentTimeNormalizer.parse(newSchedule.getAppointmentTime());
        if (newDate.equals(appointment.getAppointmentDate()) &&
            newTime.equals(appointment.getAppointmentTime())) {
            return false;
        }

        if (calendarService.isRestrictedForCategory(
            newDate,
                appointment.getProvider().getCategoryId())) {
            return false;
        }

        List<Appointment> conflictingAppointments = appointmentRepository
            .findByProvider_IdAndAppointmentDateAndAppointmentTimeAndIdNotAndStatusIn(
                providerId,
                newDate,
                newTime,
                appointmentId,
                List.of("PENDING", "APPROVED"));
        if (!conflictingAppointments.isEmpty() ||
            scheduleRepository.claimAvailableSlot(newScheduleId, providerId) != 1) {
            return false;
        }

        makeSlotAvailable(appointment);

        appointment.setAppointmentDate(newDate);
        appointment.setAppointmentTime(newTime);

        appointment.setStatus("PENDING");

        appointmentRepository.save(appointment);

        return true;
    }

    @Transactional
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

        List<Appointment> activeAppointments = appointmentRepository
            .findByProvider_IdAndAppointmentDateAndAppointmentTimeAndIdNotAndStatusIn(
                appointment.getProvider().getId(),
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime(),
                appointment.getId(),
                List.of("PENDING", "APPROVED"));
        if (!activeAppointments.isEmpty()) {
            return;
        }

        List<Schedule> matchingSchedules = new ArrayList<>();
        for (Schedule schedule : schedules) {
            if (schedule.getAppointmentDate() == null || schedule.getAppointmentTime() == null) {
                continue;
            }

            LocalDate scheduleDate = LocalDate.parse(schedule.getAppointmentDate());
            LocalTime scheduleTime = AppointmentTimeNormalizer.parse(schedule.getAppointmentTime());
            if (scheduleDate.equals(appointment.getAppointmentDate()) &&
                    scheduleTime.equals(appointment.getAppointmentTime())) {
                matchingSchedules.add(schedule);
            }
        }

        matchingSchedules.sort(Comparator.comparing(Schedule::getId));
        if (matchingSchedules.stream().anyMatch(schedule -> Boolean.TRUE.equals(schedule.isAvailable()))) {
            return;
        }

        if (!matchingSchedules.isEmpty()) {
            Schedule slotToReopen = matchingSchedules.get(0);
            slotToReopen.setAvailable(true);
            scheduleRepository.save(slotToReopen);
        }
    }

    private boolean lockProviderForAppointment(Appointment appointment) {
        if (appointment.getProvider() == null) {
            return true;
        }

        return providerRepository.findByIdForUpdate(appointment.getProvider().getId()).isPresent();
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

}