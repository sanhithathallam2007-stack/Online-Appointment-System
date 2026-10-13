package com.example.appointment.repository;

import com.example.appointment.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByProviderId(Long providerId);

    @Modifying(flushAutomatically = true)
    @Query("update Schedule schedule set schedule.available = false " +
            "where schedule.id = :scheduleId " +
            "and schedule.providerId = :providerId " +
            "and schedule.available = true")
    int claimAvailableSlot(
            @Param("scheduleId") Long scheduleId,
            @Param("providerId") Long providerId);
}