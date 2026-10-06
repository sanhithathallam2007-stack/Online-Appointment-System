package com.example.appointment.service;

import com.example.appointment.entity.ProviderWorkingHours;
import com.example.appointment.entity.Schedule;
import com.example.appointment.repository.AppointmentRepository;
import com.example.appointment.repository.ProviderWorkingHoursRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Component
public class AutomaticScheduleGenerator {

    private static final int BOOKING_WINDOW_DAYS = 14;

    private static final Set<String> ACTIVE_STATUSES =
            Set.of("PENDING", "APPROVED");

    private static final DateTimeFormatter SLOT_TIME_FORMAT =
            DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH);

    private final ProviderWorkingHoursRepository workingHoursRepository;
    private final AppointmentRepository appointmentRepository;
    private final ScheduleService scheduleService;
    private final CalendarService calendarService;

    public AutomaticScheduleGenerator(
            ProviderWorkingHoursRepository workingHoursRepository,
            AppointmentRepository appointmentRepository,
            ScheduleService scheduleService,
            CalendarService calendarService) {
        this.workingHoursRepository = workingHoursRepository;
        this.appointmentRepository = appointmentRepository;
        this.scheduleService = scheduleService;
        this.calendarService = calendarService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void generateSlotsOnStartup() {
        generateFutureSlots();
    }

    @Scheduled(cron = "0 0 1 * * *", zone = "Asia/Kolkata")
    public void generateSlotsDaily() {
        generateFutureSlots();
    }

    @Transactional
    public void generateFutureSlots() {
        LocalDate firstDate = LocalDate.now();
        LocalDate endExclusive = firstDate.plusDays(BOOKING_WINDOW_DAYS);

        List<ProviderWorkingHours> allWorkingHours =
                workingHoursRepository.findByActiveTrue();

        for (ProviderWorkingHours workingHours : allWorkingHours) {
            if (workingHours.getProvider() == null ||
                    workingHours.getDayOfWeek() == null ||
                    workingHours.getStartTime() == null ||
                    workingHours.getEndTime() == null ||
                    workingHours.getSlotDurationMinutes() == null) {
                continue;
            }

            Long providerId = workingHours.getProvider().getId();
            Long categoryId = workingHours.getProvider().getCategoryId();

            for (LocalDate date = firstDate;
                 date.isBefore(endExclusive);
                 date = date.plusDays(1)) {

                if (date.getDayOfWeek() != workingHours.getDayOfWeek()) {
                    continue;
                }

                if (calendarService.isRestrictedForCategory(date, categoryId)) {
                    continue;
                }

                generateSlotsForDate(providerId, date, workingHours);
            }
        }
    }

    private void generateSlotsForDate(
            Long providerId,
            LocalDate date,
            ProviderWorkingHours workingHours) {

        LocalTime start = workingHours.getStartTime();
        LocalTime end = workingHours.getEndTime();
        int duration = workingHours.getSlotDurationMinutes();

        for (LocalTime slotStart = start;
             !slotStart.plusMinutes(duration).isAfter(end);
             slotStart = slotStart.plusMinutes(duration)) {

            LocalTime slotEnd = slotStart.plusMinutes(duration);

            if (overlapsBreak(slotStart, slotEnd, workingHours)) {
                continue;
            }

            if (date.equals(LocalDate.now()) &&
                    !slotStart.isAfter(LocalTime.now())) {
                continue;
            }

            // Do not create an available slot for an active appointment.
            boolean appointmentExists = !appointmentRepository
                    .findByProvider_IdAndAppointmentDateAndAppointmentTimeAndStatusIn(
                            providerId,
                            date,
                            slotStart,
                            ACTIVE_STATUSES)
                    .isEmpty();

            if (appointmentExists) {
                continue;
            }

            String appointmentTime = slotStart.format(SLOT_TIME_FORMAT);

            Schedule schedule = new Schedule(
                    providerId,
                    date.toString(),
                    appointmentTime,
                    true
            );

            scheduleService.addSchedule(schedule);
        }
    }

    private boolean overlapsBreak(
            LocalTime slotStart,
            LocalTime slotEnd,
            ProviderWorkingHours workingHours) {

        LocalTime breakStart = workingHours.getBreakStart();
        LocalTime breakEnd = workingHours.getBreakEnd();

        if (breakStart == null || breakEnd == null) {
            return false;
        }

        return slotStart.isBefore(breakEnd) &&
                slotEnd.isAfter(breakStart);
    }
}