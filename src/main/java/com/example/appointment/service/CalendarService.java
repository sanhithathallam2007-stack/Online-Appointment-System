package com.example.appointment.service;

import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.Set;

@Service
public class CalendarService {

    private static final Set<LocalDate> HOLIDAYS = Set.of(
            LocalDate.of(2026, 1, 26),
            LocalDate.of(2026, 3, 19),
            LocalDate.of(2026, 4, 3),
            LocalDate.of(2026, 8, 15),
            LocalDate.of(2026, 8, 28),
            LocalDate.of(2026, 10, 2),
            LocalDate.of(2026, 10, 20),
            LocalDate.of(2026, 11, 8),
            LocalDate.of(2026, 12, 25)
    );

    public boolean isSunday(LocalDate date) {
        return date != null && date.getDayOfWeek() == DayOfWeek.SUNDAY;
    }

    public boolean isSecondSaturday(LocalDate date) {
        if (date == null) {
            return false;
        }

        LocalDate firstSaturday = date.withDayOfMonth(1)
                .with(TemporalAdjusters.firstInMonth(DayOfWeek.SATURDAY));

        LocalDate secondSaturday = firstSaturday.plusWeeks(1);

        return date.equals(secondSaturday);
    }

    public boolean isHoliday(LocalDate date) {
        return date != null && HOLIDAYS.contains(date);
    }

    public boolean isSchoolOrGovernmentWorkingDay(LocalDate date) {
        if (date == null) {
            return false;
        }

        return !isSunday(date)
                && !isSecondSaturday(date)
                && !isHoliday(date);
    }

    public boolean isRestrictedForCategory(LocalDate date, Long categoryId) {
        if (categoryId == null) {
            return false;
        }

        if (categoryId == 2L || categoryId == 3L) {
            return !isSchoolOrGovernmentWorkingDay(date);
        }

        return false;
    }
}
