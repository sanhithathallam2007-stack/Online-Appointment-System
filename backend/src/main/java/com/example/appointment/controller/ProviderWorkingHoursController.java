package com.example.appointment.controller;

import com.example.appointment.dto.WorkingHoursRequest;
import com.example.appointment.entity.ProviderWorkingHours;
import com.example.appointment.service.ProviderWorkingHoursService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/providers/{providerId}/working-hours")
public class ProviderWorkingHoursController {

    private final ProviderWorkingHoursService workingHoursService;

    public ProviderWorkingHoursController(
            ProviderWorkingHoursService workingHoursService) {
        this.workingHoursService = workingHoursService;
    }

    @PostMapping
    public ResponseEntity<?> saveWorkingHours(
            @PathVariable Long providerId,
            @RequestBody WorkingHoursRequest request) {

        try {
            ProviderWorkingHours saved =
                    workingHoursService.saveWorkingHours(providerId, request);

            return ResponseEntity.ok(toResponse(saved));

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(
                    java.util.Map.of("error", exception.getMessage())
            );
        }
    }

    @GetMapping
    public ResponseEntity<List<java.util.Map<String, Object>>> getWorkingHours(
            @PathVariable Long providerId) {

        List<java.util.Map<String, Object>> result =
                workingHoursService.getWorkingHours(providerId)
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return ResponseEntity.ok(result);
    }

    private java.util.Map<String, Object> toResponse(
            ProviderWorkingHours hours) {

        java.util.Map<String, Object> response = new java.util.LinkedHashMap<>();

        response.put("id", hours.getId());
        response.put("providerId", hours.getProvider().getId());
        response.put("dayOfWeek", hours.getDayOfWeek());
        response.put("startTime", hours.getStartTime());
        response.put("endTime", hours.getEndTime());
        response.put("breakStart", hours.getBreakStart());
        response.put("breakEnd", hours.getBreakEnd());
        response.put("slotDurationMinutes", hours.getSlotDurationMinutes());
        response.put("active", hours.getActive());

        return response;
    }
}