package com.example.appointment.service;

import com.example.appointment.entity.Appointment;
import com.example.appointment.entity.Provider;
import com.example.appointment.entity.Schedule;
import com.example.appointment.repository.AppointmentRepository;
import com.example.appointment.repository.ProviderRepository;
import com.example.appointment.repository.ScheduleRepository;
import com.example.appointment.util.AppointmentTimeNormalizer;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@ConditionalOnProperty(name = "app.schedule-seed.enabled", havingValue = "true")
public class ScheduleSeedRunner implements ApplicationRunner {

    private static final int MINIMUM_AVAILABLE_SLOTS = 10;
    private static final List<String> SLOT_TIMES = List.of(
            "09:00 AM",
            "10:00 AM",
            "11:00 AM",
            "12:00 PM",
            "02:00 PM",
            "03:00 PM",
            "04:00 PM"
    );
    private static final Set<String> ACTIVE_STATUSES = Set.of("PENDING", "APPROVED");

    private final ProviderRepository providerRepository;
    private final ScheduleRepository scheduleRepository;
    private final AppointmentRepository appointmentRepository;
    private final ScheduleService scheduleService;
    private final CalendarService calendarService;

    public ScheduleSeedRunner(
            ProviderRepository providerRepository,
            ScheduleRepository scheduleRepository,
            AppointmentRepository appointmentRepository,
            ScheduleService scheduleService,
            CalendarService calendarService) {
        this.providerRepository = providerRepository;
        this.scheduleRepository = scheduleRepository;
        this.appointmentRepository = appointmentRepository;
        this.scheduleService = scheduleService;
        this.calendarService = calendarService;
    }

    @Override
    public void run(ApplicationArguments args) {
        LocalDate firstDate = LocalDate.now().plusDays(1);
        LocalDate endExclusive = firstDate.plusDays(14);

        for (Provider provider : providerRepository.findAll()) {
            addMissingSlots(provider, firstDate, endExclusive);
        }
    }

    private void addMissingSlots(Provider provider, LocalDate firstDate, LocalDate endExclusive) {
        List<Schedule> existingSchedules = scheduleRepository.findByProviderId(provider.getId());
        Set<String> existingSlotKeys = new HashSet<>();
        for (Schedule schedule : existingSchedules) {
            if (schedule.getAppointmentDate() != null && schedule.getAppointmentTime() != null) {
                existingSlotKeys.add(slotKey(schedule.getAppointmentDate(), schedule.getAppointmentTime()));
            }
        }

        Set<String> activeAppointmentKeys = new HashSet<>();
        for (Appointment appointment : appointmentRepository.findByProviderId(provider.getId())) {
            if (ACTIVE_STATUSES.contains(appointment.getStatus()) &&
                    appointment.getAppointmentDate() != null && appointment.getAppointmentTime() != null) {
                activeAppointmentKeys.add(slotKey(
                        appointment.getAppointmentDate().toString(),
                        appointment.getAppointmentTime().toString()
                ));
            }
        }

        Set<String> availableSlotKeys = availableSlotKeysInWindow(
                scheduleService.getSchedulesByProvider(provider.getId()),
                firstDate,
                endExclusive);

        for (LocalDate date = firstDate;
             date.isBefore(endExclusive) && availableSlotKeys.size() < MINIMUM_AVAILABLE_SLOTS;
             date = date.plusDays(1)) {
            if (calendarService.isRestrictedForCategory(date, provider.getCategoryId())) {
                continue;
            }

            int firstTimeIndex = Math.floorMod(date.toEpochDay(), SLOT_TIMES.size());
            for (int offset = 0; offset < SLOT_TIMES.size(); offset++) {
                if (availableSlotKeys.size() >= MINIMUM_AVAILABLE_SLOTS) {
                    break;
                }

                String time = SLOT_TIMES.get((firstTimeIndex + offset) % SLOT_TIMES.size());
                if (addIfMissing(provider, date, time, existingSlotKeys, activeAppointmentKeys, availableSlotKeys)) {
                    break;
                }
            }
        }

        if (availableSlotKeys.size() < MINIMUM_AVAILABLE_SLOTS) {
            for (LocalDate date = firstDate;
                 date.isBefore(endExclusive) && availableSlotKeys.size() < MINIMUM_AVAILABLE_SLOTS;
                 date = date.plusDays(1)) {
                if (calendarService.isRestrictedForCategory(date, provider.getCategoryId())) {
                    continue;
                }

                for (String time : SLOT_TIMES) {
                    if (availableSlotKeys.size() >= MINIMUM_AVAILABLE_SLOTS) {
                        break;
                    }
                    addIfMissing(provider, date, time, existingSlotKeys, activeAppointmentKeys, availableSlotKeys);
                }
            }
        }
    }

    private boolean addIfMissing(
            Provider provider,
            LocalDate date,
            String time,
            Set<String> existingSlotKeys,
            Set<String> activeAppointmentKeys,
            Set<String> availableSlotKeys) {
        String key = slotKey(date.toString(), time);
        if (existingSlotKeys.contains(key) || activeAppointmentKeys.contains(key)) {
            return false;
        }

        Schedule created = new Schedule(provider.getId(), date.toString(), time, true);
        Schedule result = scheduleService.addSchedule(created);
        if (result != null) {
            existingSlotKeys.add(key);
            if (Boolean.TRUE.equals(result.isAvailable())) {
                return availableSlotKeys.add(key);
            }
        }
        return false;
    }

    static Set<String> availableSlotKeysInWindow(
            List<Schedule> schedules,
            LocalDate firstDate,
            LocalDate endExclusive) {
        Set<String> slotKeys = new HashSet<>();
        for (Schedule schedule : schedules) {
            if (!Boolean.TRUE.equals(schedule.isAvailable()) ||
                    schedule.getAppointmentDate() == null || schedule.getAppointmentTime() == null) {
                continue;
            }

            LocalDate scheduleDate = LocalDate.parse(schedule.getAppointmentDate());
            if (!scheduleDate.isBefore(firstDate) && scheduleDate.isBefore(endExclusive)) {
                slotKeys.add(slotKey(scheduleDate.toString(), schedule.getAppointmentTime()));
            }
        }
        return slotKeys;
    }

    private static String slotKey(String date, String time) {
        return date + "|" + normalizeTime(time);
    }

    private static String normalizeTime(String time) {
        return AppointmentTimeNormalizer.normalize(time);
    }
}
