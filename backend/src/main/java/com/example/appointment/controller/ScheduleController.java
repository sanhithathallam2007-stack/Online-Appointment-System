package com.example.appointment.controller;

import com.example.appointment.entity.Schedule;
import com.example.appointment.service.ScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<Schedule>> getSchedulesByProvider(
            @PathVariable Long providerId) {

        return ResponseEntity.ok(
                scheduleService.getSchedulesByProvider(providerId)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Schedule> getScheduleById(
            @PathVariable Long id) {

        Schedule schedule = scheduleService.getScheduleById(id);

        if (schedule == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(schedule);
    }

    @PostMapping
    public ResponseEntity<Schedule> addSchedule(
            @RequestBody Schedule schedule) {

        return ResponseEntity.ok(
                scheduleService.addSchedule(schedule)
        );
    }
}