package com.example.appointment.service;

import com.example.appointment.dto.WorkingHoursRequest;
import com.example.appointment.entity.Provider;
import com.example.appointment.entity.ProviderWorkingHours;
import com.example.appointment.repository.ProviderRepository;
import com.example.appointment.repository.ProviderWorkingHoursRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;

@Service
public class ProviderWorkingHoursService {

    private final ProviderRepository providerRepository;
    private final ProviderWorkingHoursRepository workingHoursRepository;
    private final AutomaticScheduleGenerator scheduleGenerator;

    public ProviderWorkingHoursService(
            ProviderRepository providerRepository,
            ProviderWorkingHoursRepository workingHoursRepository,
            AutomaticScheduleGenerator scheduleGenerator) {
        this.providerRepository = providerRepository;
        this.workingHoursRepository = workingHoursRepository;
        this.scheduleGenerator = scheduleGenerator;
    }

    @Transactional
    public ProviderWorkingHours saveWorkingHours(
            Long providerId,
            WorkingHoursRequest request) {

        if (request == null || request.getDayOfWeek() == null ||
                request.getStartTime() == null || request.getEndTime() == null) {
            throw new IllegalArgumentException(
                    "Day, start time, and end time are required.");
        }

        LocalTime start = request.getStartTime();
        LocalTime end = request.getEndTime();

        if (!start.isBefore(end)) {
            throw new IllegalArgumentException(
                    "End time must be after start time.");
        }

        Integer duration = request.getSlotDurationMinutes();
        if (duration == null) {
            duration = 30;
        }

        if (duration < 5 || duration > 240) {
            throw new IllegalArgumentException(
                    "Slot duration must be between 5 and 240 minutes.");
        }

        LocalTime breakStart = request.getBreakStart();
        LocalTime breakEnd = request.getBreakEnd();

        if ((breakStart == null) != (breakEnd == null)) {
            throw new IllegalArgumentException(
                    "Both break start and break end must be provided.");
        }

        if (breakStart != null) {
            if (!breakStart.isBefore(breakEnd) ||
                    breakStart.isBefore(start) || breakEnd.isAfter(end)) {
                throw new IllegalArgumentException(
                        "Break must be within working hours and end after it starts.");
            }
        }

        Provider provider = providerRepository.findById(providerId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Provider not found."));

        List<ProviderWorkingHours> existingHours =
                workingHoursRepository.findByProviderId(providerId);

        ProviderWorkingHours workingHours = existingHours.stream()
                .filter(item -> item.getDayOfWeek() == request.getDayOfWeek())
                .findFirst()
                .orElseGet(ProviderWorkingHours::new);

        workingHours.setProvider(provider);
        workingHours.setDayOfWeek(request.getDayOfWeek());
        workingHours.setStartTime(start);
        workingHours.setEndTime(end);
        workingHours.setBreakStart(breakStart);
        workingHours.setBreakEnd(breakEnd);
        workingHours.setSlotDurationMinutes(duration);
        workingHours.setActive(true);

        ProviderWorkingHours savedHours =
                workingHoursRepository.save(workingHours);

        // Create upcoming slots immediately after saving working hours.
        scheduleGenerator.generateFutureSlots();

        return savedHours;
    }

    public List<ProviderWorkingHours> getWorkingHours(Long providerId) {
        return workingHoursRepository.findByProviderIdAndActiveTrue(providerId);
    }
}