package com.example.appointment.service;

import com.example.appointment.entity.Schedule;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ScheduleSeedRunnerTest {

    @Test
    void countsOnlyDistinctAvailableSlotsInsideTheDateWindow() {
        LocalDate firstDate = LocalDate.of(2030, 4, 1);
        LocalDate endExclusive = firstDate.plusDays(14);
        List<Schedule> schedules = List.of(
                new Schedule(7L, firstDate.toString(), "09:00 AM", true),
                new Schedule(7L, firstDate.toString(), " 09:00 AM ", true),
                new Schedule(7L, firstDate.plusDays(1).toString(), "9:00 am", true),
                new Schedule(7L, firstDate.minusDays(1).toString(), "10:00 AM", true),
                new Schedule(7L, endExclusive.toString(), "10:00 AM", true),
                new Schedule(7L, firstDate.plusDays(2).toString(), "11:00", false)
        );

        Set<String> countedSlots = ScheduleSeedRunner.availableSlotKeysInWindow(
                schedules,
                firstDate,
                endExclusive);

        assertEquals(Set.of(
                firstDate + "|09:00",
                firstDate.plusDays(1) + "|09:00"
        ), countedSlots);
    }
}