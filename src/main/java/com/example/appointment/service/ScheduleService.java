package com.example.appointment.service;

import com.example.appointment.entity.Provider;
import com.example.appointment.entity.Schedule;
import com.example.appointment.repository.ProviderRepository;
import com.example.appointment.repository.ScheduleRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final ProviderRepository providerRepository;
    private final CalendarService calendarService;

    public ScheduleService(
            ScheduleRepository scheduleRepository,
            ProviderRepository providerRepository,
            CalendarService calendarService) {
        this.scheduleRepository = scheduleRepository;
        this.providerRepository = providerRepository;
        this.calendarService = calendarService;
    }

    public List<Schedule> getSchedulesByProvider(Long providerId) {
        Long categoryId = getProviderCategoryId(providerId);

        return scheduleRepository.findByProviderId(providerId)
                .stream()
                .filter(schedule -> Boolean.TRUE.equals(schedule.isAvailable()))
                .filter(schedule -> !isExpired(schedule))
                .filter(schedule -> !isBlockedByCalendar(schedule, categoryId))
                .collect(Collectors.toList());
    }

    public Schedule addSchedule(Schedule schedule) {

        // Every newly created schedule starts as available
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
        if (time == null) {
            return "00:00";
        }

        if (time.contains("AM") || time.contains("PM")) {
            String[] parts = time.split(" ");
            String[] hm = parts[0].split(":");

            int hour = Integer.parseInt(hm[0]);
            int minute = Integer.parseInt(hm[1]);
            String amPm = parts[1];

            if (amPm.equalsIgnoreCase("PM") && hour != 12) {
                hour += 12;
            }

            if (amPm.equalsIgnoreCase("AM") && hour == 12) {
                hour = 0;
            }

            return String.format("%02d:%02d", hour, minute);
        }

        return time;
    }
}