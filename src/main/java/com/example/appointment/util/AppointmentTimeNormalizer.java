package com.example.appointment.util;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.DateTimeParseException;
import java.util.Locale;

public final class AppointmentTimeNormalizer {

    private static final DateTimeFormatter TWELVE_HOUR_FORMAT = new DateTimeFormatterBuilder()
            .parseCaseInsensitive()
            .appendPattern("h:mm a")
            .toFormatter(Locale.ROOT);
    private static final DateTimeFormatter FLEXIBLE_24_HOUR_FORMAT = DateTimeFormatter.ofPattern("H:mm", Locale.ROOT);

    private AppointmentTimeNormalizer() {
    }

    public static LocalTime parse(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Appointment time must not be blank.");
        }

        String normalized = value.trim();
        try {
            return LocalTime.parse(normalized, TWELVE_HOUR_FORMAT);
        } catch (DateTimeParseException ignored) {
            try {
                return LocalTime.parse(normalized);
            } catch (DateTimeParseException ignoredTwentyFourHourFormat) {
                try {
                    return LocalTime.parse(normalized, FLEXIBLE_24_HOUR_FORMAT);
                } catch (DateTimeParseException exception) {
                    throw new IllegalArgumentException("Invalid appointment time: " + value, exception);
                }
            }
        }
    }

    public static String normalize(String value) {
        return parse(value).toString();
    }
}