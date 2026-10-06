package com.example.appointment.service;

import com.example.appointment.entity.Provider;
import com.example.appointment.entity.Schedule;
import com.example.appointment.repository.AppointmentRepository;
import com.example.appointment.repository.ProviderRepository;
import com.example.appointment.repository.ScheduleRepository;
import com.example.appointment.util.AppointmentTimeNormalizer;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final ProviderRepository providerRepository;
    private final AppointmentRepository appointmentRepository;
    private final CalendarService calendarService;

    public ScheduleService(
            ScheduleRepository scheduleRepository,
            ProviderRepository providerRepository,
            AppointmentRepository appointmentRepository,
            CalendarService calendarService) {
        this.scheduleRepository = scheduleRepository;
        this.providerRepository = providerRepository;
        this.appointmentRepository = appointmentRepository;
        this.calendarService = calendarService;
    }

    public List<Schedule> getSchedulesByProvider(Long providerId) {
        Long categoryId = getProviderCategoryId(providerId);
        List<Schedule> providerSchedules = new ArrayList<>(scheduleRepository.findByProviderId(providerId));
        providerSchedules.sort(Comparator.comparing(Schedule::getId));

        Set<String> activelyBookedSlots = appointmentRepository.findByProviderId(providerId)
            .stream()
            .filter(appointment -> "PENDING".equals(appointment.getStatus()) ||
                "APPROVED".equals(appointment.getStatus()))
            .filter(appointment -> appointment.getAppointmentDate() != null &&
                appointment.getAppointmentTime() != null)
            .map(appointment -> appointment.getAppointmentDate() + "|" + appointment.getAppointmentTime())
            .collect(Collectors.toSet());
        Set<String> seenSlots = new HashSet<>();
        return providerSchedules.stream()
                .filter(schedule -> Boolean.TRUE.equals(schedule.isAvailable()))
                .filter(schedule -> schedule.getAppointmentDate() != null && schedule.getAppointmentTime() != null)
                .filter(schedule -> !isExpired(schedule))
                .filter(schedule -> !isBlockedByCalendar(schedule, categoryId))
            .filter(schedule -> !activelyBookedSlots.contains(slotKey(schedule)))
            .filter(schedule -> seenSlots.add(slotKey(schedule)))
                .collect(Collectors.toList());
    }

    @Transactional
    public Schedule addSchedule(Schedule schedule) {
        if (schedule == null || schedule.getProviderId() == null ||
                schedule.getAppointmentDate() == null || schedule.getAppointmentTime() == null) {
            return null;
        }

        if (providerRepository.findByIdForUpdate(schedule.getProviderId()).isEmpty()) {
            return null;
        }

        for (Schedule existing : scheduleRepository.findByProviderId(schedule.getProviderId())) {
            if (existing.getAppointmentDate() != null && existing.getAppointmentTime() != null &&
                    existing.getAppointmentDate().equals(schedule.getAppointmentDate()) &&
                    convertTime(existing.getAppointmentTime()).equals(convertTime(schedule.getAppointmentTime()))) {
                return existing;
            }
        }

        schedule.setAvailable(true);

        return scheduleRepository.save(schedule);
    }

    public Schedule getScheduleById(Long id) {
        return scheduleRepository.findById(id).orElse(null);
    }

    public boolean isExpired(Schedule schedule) {
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

        if (scheduleDate.isEqual(today) && scheduleTime.isBefore(now)) {
            return true;
        }

        return false;
    }

    private boolean isBlockedByCalendar(Schedule schedule, Long categoryId) {
        if (schedule == null || schedule.getAppointmentDate() == null) {
            return false;
        }

        LocalDate slotDate = LocalDate.parse(schedule.getAppointmentDate());

        return calendarService.isRestrictedForCategory(slotDate, categoryId);
    }

    private Long getProviderCategoryId(Long providerId) {
        if (providerId == null) {
            return null;
        }

        Provider provider = providerRepository.findById(providerId).orElse(null);

        if (provider == null) {
            return null;
        }

        return provider.getCategoryId();
    }

    private String convertTime(String time) {
        return AppointmentTimeNormalizer.normalize(time);
    }

    private String slotKey(Schedule schedule) {
        return schedule.getAppointmentDate() + "|" + convertTime(schedule.getAppointmentTime());
    }
}