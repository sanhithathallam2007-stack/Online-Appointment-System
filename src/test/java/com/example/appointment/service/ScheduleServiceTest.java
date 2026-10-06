package com.example.appointment.service;

import com.example.appointment.entity.Appointment;
import com.example.appointment.entity.Provider;
import com.example.appointment.entity.Schedule;
import com.example.appointment.repository.AppointmentRepository;
import com.example.appointment.repository.ProviderRepository;
import com.example.appointment.repository.ScheduleRepository;
import com.example.appointment.util.AppointmentTimeNormalizer;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ScheduleServiceTest {

        @Test
        void normalizesTwelveHourAndTwentyFourHourTimesEquivalently() {
                LocalTime expected = LocalTime.of(9, 0);

                assertEquals(expected, AppointmentTimeNormalizer.parse("09:00 AM"));
                assertEquals(expected, AppointmentTimeNormalizer.parse("9:00 am"));
                assertEquals(expected, AppointmentTimeNormalizer.parse(" 09:00 AM "));
                assertEquals(expected, AppointmentTimeNormalizer.parse("09:00"));
        }

    @Test
    void returnsOneAvailableRowForDuplicateProviderDateAndTime() {
        ScheduleRepository scheduleRepository = mock(ScheduleRepository.class);
        ProviderRepository providerRepository = mock(ProviderRepository.class);
        AppointmentRepository appointmentRepository = mock(AppointmentRepository.class);
        CalendarService calendarService = mock(CalendarService.class);
        Provider provider = new Provider("Provider", "provider@example.com", "secret", "Doctor", "Clinic", 1L);
        provider.setId(8L);
        LocalDate date = LocalDate.now().plusDays(3);
        Schedule laterId = new Schedule(8L, date.toString(), "11:00 AM", true);
        laterId.setId(12L);
        Schedule earlierId = new Schedule(8L, date.toString(), "11:00", true);
        earlierId.setId(3L);

        when(providerRepository.findById(8L)).thenReturn(Optional.of(provider));
        when(scheduleRepository.findByProviderId(8L)).thenReturn(List.of(laterId, earlierId));
        when(appointmentRepository.findByProviderId(8L)).thenReturn(List.of());
        when(calendarService.isRestrictedForCategory(date, 1L)).thenReturn(false);

        ScheduleService service = new ScheduleService(
                scheduleRepository,
                providerRepository,
                appointmentRepository,
                calendarService);

        List<Schedule> available = service.getSchedulesByProvider(8L);

        assertEquals(1, available.size());
        assertSame(earlierId, available.get(0));
    }

    @Test
    void hidesSlotWhenProviderHasPendingAppointmentAtThatTime() {
        ScheduleRepository scheduleRepository = mock(ScheduleRepository.class);
        ProviderRepository providerRepository = mock(ProviderRepository.class);
        AppointmentRepository appointmentRepository = mock(AppointmentRepository.class);
        CalendarService calendarService = mock(CalendarService.class);
        Provider provider = new Provider("Provider", "provider@example.com", "secret", "Doctor", "Clinic", 1L);
        provider.setId(8L);
        LocalDate date = LocalDate.now().plusDays(3);
        Schedule available = new Schedule(8L, date.toString(), "09:00 AM", true);
        available.setId(3L);
        Appointment activeAppointment = new Appointment(
                null, provider, date, LocalTime.of(9, 0), "PENDING");

        when(providerRepository.findById(8L)).thenReturn(Optional.of(provider));
        when(scheduleRepository.findByProviderId(8L)).thenReturn(List.of(available));
        when(appointmentRepository.findByProviderId(8L)).thenReturn(List.of(activeAppointment));
        when(calendarService.isRestrictedForCategory(date, 1L)).thenReturn(false);

        ScheduleService service = new ScheduleService(
                scheduleRepository,
                providerRepository,
                appointmentRepository,
                calendarService);

        assertEquals(List.of(), service.getSchedulesByProvider(8L));
    }

    @Test
    void duplicateAddReturnsExistingRowWithoutChangingAvailability() {
        ScheduleRepository scheduleRepository = mock(ScheduleRepository.class);
        ProviderRepository providerRepository = mock(ProviderRepository.class);
        AppointmentRepository appointmentRepository = mock(AppointmentRepository.class);
        CalendarService calendarService = mock(CalendarService.class);
        Schedule existing = new Schedule(8L, "2026-10-10", "11:00 AM", false);
        existing.setId(12L);
        Schedule duplicate = new Schedule(8L, "2026-10-10", "11:00", true);

        when(providerRepository.findByIdForUpdate(8L)).thenReturn(Optional.of(
                new Provider("Provider", "provider@example.com", "secret", "Doctor", "Clinic", 1L)));
        when(scheduleRepository.findByProviderId(8L)).thenReturn(List.of(existing));

        ScheduleService service = new ScheduleService(
                scheduleRepository,
                providerRepository,
                appointmentRepository,
                calendarService);

        Schedule result = service.addSchedule(duplicate);

        assertSame(existing, result);
        org.junit.jupiter.api.Assertions.assertFalse(existing.isAvailable());
        verify(scheduleRepository, never()).save(duplicate);
    }

}