package com.example.appointment.service;

import com.example.appointment.entity.Appointment;
import com.example.appointment.entity.Provider;
import com.example.appointment.entity.Schedule;
import com.example.appointment.entity.User;
import com.example.appointment.notification.NotificationService;
import com.example.appointment.repository.AppointmentRepository;
import com.example.appointment.repository.ProviderRepository;
import com.example.appointment.repository.ScheduleRepository;
import com.example.appointment.repository.UserRepository;
import org.springframework.aop.framework.ProxyFactory;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.annotation.AnnotationTransactionAttributeSource;
import org.springframework.transaction.interceptor.TransactionInterceptor;
import org.springframework.transaction.support.SimpleTransactionStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AppointmentServiceTest {

    @Test
    void rejectsScheduleThatBelongsToAnotherProvider() {
        BookingFixture fixture = new BookingFixture();
        fixture.schedule.setProviderId(99L);
        fixture.prepareBooking();

        assertNull(fixture.service.bookAppointment(4L, 7L, 12L));
        verify(fixture.scheduleRepository, never()).claimAvailableSlot(12L, 7L);
        verify(fixture.appointmentRepository, never()).save(any(Appointment.class));
    }

    @Test
    void rejectsTimeAlreadyOccupiedByAnActiveAppointment() {
        BookingFixture fixture = new BookingFixture();
        Appointment activeAppointment = new Appointment(
                fixture.user,
                fixture.provider,
                fixture.appointmentDate,
                java.time.LocalTime.of(9, 0),
                "PENDING");
        fixture.prepareBooking();
        when(fixture.appointmentRepository
                .findByProvider_IdAndAppointmentDateAndAppointmentTimeAndStatusIn(
                        eq(7L),
                        eq(fixture.appointmentDate),
                        eq(java.time.LocalTime.of(9, 0)),
                        anyList()))
                .thenReturn(List.of(activeAppointment));

        assertNull(fixture.service.bookAppointment(4L, 7L, 12L));
        verify(fixture.scheduleRepository, never()).claimAvailableSlot(12L, 7L);
        verify(fixture.appointmentRepository, never()).save(any(Appointment.class));
    }

    @Test
    void savesAppointmentOnlyAfterSlotIsClaimed() {
        BookingFixture fixture = new BookingFixture();
        fixture.prepareBooking();
        when(fixture.scheduleRepository.claimAvailableSlot(12L, 7L)).thenReturn(1);
        when(fixture.appointmentRepository.save(any(Appointment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Appointment result = fixture.service.bookAppointment(4L, 7L, 12L);

        assertEquals("PENDING", result.getStatus());
        assertEquals(7L, result.getProvider().getId());
        assertEquals(fixture.appointmentDate, result.getAppointmentDate());
        verify(fixture.scheduleRepository).claimAvailableSlot(12L, 7L);
    }

    @Test
    void rejectsSlotIfAtomicClaimWasAlreadyLost() {
        BookingFixture fixture = new BookingFixture();
        fixture.prepareBooking();
        when(fixture.scheduleRepository.claimAvailableSlot(12L, 7L)).thenReturn(0);

        assertNull(fixture.service.bookAppointment(4L, 7L, 12L));
        verify(fixture.appointmentRepository, never()).save(any(Appointment.class));
    }

        @Test
        void cancellationReopensAnUnoccupiedMatchingSlot() {
        BookingFixture fixture = new BookingFixture();
        Appointment appointment = new Appointment(
            fixture.user,
            fixture.provider,
            fixture.appointmentDate,
            java.time.LocalTime.of(9, 0),
            "PENDING");
        appointment.setId(20L);
        fixture.schedule.setAvailable(false);
        when(fixture.appointmentRepository.findById(20L)).thenReturn(Optional.of(appointment));
        when(fixture.providerRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(fixture.provider));
        when(fixture.appointmentRepository.save(appointment)).thenReturn(appointment);
        when(fixture.appointmentRepository
            .findByProvider_IdAndAppointmentDateAndAppointmentTimeAndIdNotAndStatusIn(
                eq(7L),
                eq(fixture.appointmentDate),
                eq(java.time.LocalTime.of(9, 0)),
                eq(20L),
                anyList()))
            .thenReturn(List.of());
        when(fixture.scheduleRepository.findByProviderId(7L)).thenReturn(List.of(fixture.schedule));
        when(fixture.scheduleRepository.save(fixture.schedule)).thenReturn(fixture.schedule);

        org.junit.jupiter.api.Assertions.assertTrue(fixture.service.cancelAppointment(20L));

        assertEquals("CANCELLED", appointment.getStatus());
        org.junit.jupiter.api.Assertions.assertTrue(fixture.schedule.isAvailable());
        verify(fixture.scheduleRepository, times(1)).save(fixture.schedule);
        }

        @Test
        void cancellationDoesNotReopenAnExtraDuplicateWhenOneIsAlreadyAvailable() {
        BookingFixture fixture = new BookingFixture();
        Appointment appointment = new Appointment(
            fixture.user,
            fixture.provider,
            fixture.appointmentDate,
            LocalTime.of(9, 0),
            "PENDING");
        appointment.setId(21L);
        fixture.schedule.setAvailable(false);
        Schedule availableDuplicate = new Schedule(
            7L, fixture.appointmentDate.toString(), "9:00 am", true);
        availableDuplicate.setId(13L);
        prepareDuplicateRelease(fixture, appointment, availableDuplicate);

        assertTrue(fixture.service.cancelAppointment(21L));

        assertEquals("CANCELLED", appointment.getStatus());
        assertFalse(fixture.schedule.isAvailable());
        assertTrue(availableDuplicate.isAvailable());
        verify(fixture.scheduleRepository, never()).save(any(Schedule.class));
        }

        @Test
        void rejectionDoesNotReopenAnExtraDuplicateWhenOneIsAlreadyAvailable() {
        BookingFixture fixture = new BookingFixture();
        Appointment appointment = new Appointment(
            fixture.user,
            fixture.provider,
            fixture.appointmentDate,
            LocalTime.of(9, 0),
            "PENDING");
        appointment.setId(22L);
        fixture.schedule.setAvailable(false);
        Schedule availableDuplicate = new Schedule(
            7L, fixture.appointmentDate.toString(), "09:00", true);
        availableDuplicate.setId(13L);
        prepareDuplicateRelease(fixture, appointment, availableDuplicate);

        assertTrue(fixture.service.rejectAppointment(22L));

        assertEquals("REJECTED", appointment.getStatus());
        assertFalse(fixture.schedule.isAvailable());
        assertTrue(availableDuplicate.isAvailable());
        verify(fixture.scheduleRepository, never()).save(any(Schedule.class));
        }

        @Test
        void rescheduleDoesNotReleaseOldSlotWhenNewSlotClaimFails() {
        RescheduleFixture fixture = new RescheduleFixture();
        fixture.prepare();
        when(fixture.scheduleRepository.claimAvailableSlot(13L, 7L)).thenReturn(0);

        assertFalse(fixture.service.rescheduleAppointment(20L, 13L));

        assertFalse(fixture.oldSchedule.isAvailable());
        verify(fixture.scheduleRepository, never()).save(any(Schedule.class));
        verify(fixture.appointmentRepository, never()).save(fixture.appointment);
        }

        @Test
        void rescheduleRequestsRollbackWhenSavingAppointmentFails() {
        RescheduleFixture fixture = new RescheduleFixture();
        fixture.prepare();
        when(fixture.scheduleRepository.claimAvailableSlot(13L, 7L)).thenReturn(1);
        doThrow(new IllegalStateException("Synthetic save failure"))
            .when(fixture.appointmentRepository).save(fixture.appointment);

        PlatformTransactionManager transactionManager = mock(PlatformTransactionManager.class);
        TransactionStatus transactionStatus = new SimpleTransactionStatus();
        when(transactionManager.getTransaction(any(TransactionDefinition.class)))
            .thenReturn(transactionStatus);
        ProxyFactory proxyFactory = new ProxyFactory(fixture.service);
        TransactionInterceptor transactionInterceptor = new TransactionInterceptor();
        transactionInterceptor.setTransactionManager(transactionManager);
        transactionInterceptor.setTransactionAttributeSource(new AnnotationTransactionAttributeSource());
        proxyFactory.addAdvice(transactionInterceptor);
        AppointmentService transactionalService = (AppointmentService) proxyFactory.getProxy();

        assertThrows(IllegalStateException.class,
            () -> transactionalService.rescheduleAppointment(20L, 13L));

        verify(transactionManager).rollback(transactionStatus);
        verify(transactionManager, never()).commit(transactionStatus);
        }

        private void prepareDuplicateRelease(
            BookingFixture fixture,
            Appointment appointment,
            Schedule availableDuplicate) {
        when(fixture.appointmentRepository.findById(appointment.getId()))
            .thenReturn(Optional.of(appointment));
        when(fixture.providerRepository.findByIdForUpdate(7L))
            .thenReturn(Optional.of(fixture.provider));
        when(fixture.appointmentRepository.save(appointment)).thenReturn(appointment);
        when(fixture.appointmentRepository
            .findByProvider_IdAndAppointmentDateAndAppointmentTimeAndIdNotAndStatusIn(
                eq(7L),
                eq(fixture.appointmentDate),
                eq(LocalTime.of(9, 0)),
                eq(appointment.getId()),
                anyList()))
            .thenReturn(List.of());
        when(fixture.scheduleRepository.findByProviderId(7L))
            .thenReturn(List.of(fixture.schedule, availableDuplicate));
        }

        private static class RescheduleFixture {
        private final AppointmentRepository appointmentRepository = mock(AppointmentRepository.class);
        private final UserRepository userRepository = mock(UserRepository.class);
        private final ProviderRepository providerRepository = mock(ProviderRepository.class);
        private final ScheduleRepository scheduleRepository = mock(ScheduleRepository.class);
        private final CalendarService calendarService = mock(CalendarService.class);
        private final NotificationService notificationService = mock(NotificationService.class);
        private final Provider provider = new Provider(
            "Test Provider", "provider@example.com", "not-a-real-password", "Doctor", "Clinic", 1L);
        private final LocalDate oldDate = LocalDate.now().plusDays(2);
        private final LocalDate newDate = LocalDate.now().plusDays(4);
        private final Appointment appointment = new Appointment(
            new User("Test User", "test@example.com", "not-a-real-password"),
            provider,
            oldDate,
            LocalTime.of(9, 0),
            "PENDING");
        private final Schedule oldSchedule = new Schedule(7L, oldDate.toString(), "09:00 AM", false);
        private final Schedule newSchedule = new Schedule(7L, newDate.toString(), "10:00 AM", true);
        private final AppointmentService service;

        private RescheduleFixture() {
            provider.setId(7L);
            appointment.setId(20L);
            oldSchedule.setId(12L);
            newSchedule.setId(13L);
            service = new AppointmentService(
                appointmentRepository,
                userRepository,
                providerRepository,
                scheduleRepository,
                calendarService,
                notificationService);
        }

        private void prepare() {
            when(appointmentRepository.findById(20L)).thenReturn(Optional.of(appointment));
            when(providerRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(provider));
            when(scheduleRepository.findById(13L)).thenReturn(Optional.of(newSchedule));
            when(calendarService.isRestrictedForCategory(newDate, 1L)).thenReturn(false);
            when(appointmentRepository
                .findByProvider_IdAndAppointmentDateAndAppointmentTimeAndIdNotAndStatusIn(
                    eq(7L),
                    any(LocalDate.class),
                    any(LocalTime.class),
                    eq(20L),
                    anyList()))
                .thenReturn(List.of());
            when(scheduleRepository.findByProviderId(7L)).thenReturn(List.of(oldSchedule));
            when(scheduleRepository.save(oldSchedule)).thenReturn(oldSchedule);
        }
        }

    private static class BookingFixture {
        private final AppointmentRepository appointmentRepository = mock(AppointmentRepository.class);
        private final UserRepository userRepository = mock(UserRepository.class);
        private final ProviderRepository providerRepository = mock(ProviderRepository.class);
        private final ScheduleRepository scheduleRepository = mock(ScheduleRepository.class);
        private final CalendarService calendarService = mock(CalendarService.class);
        private final NotificationService notificationService = mock(NotificationService.class);
        private final LocalDate appointmentDate = LocalDate.now().plusDays(1);
        private final User user = new User("Test User", "test@example.com", "not-a-real-password");
        private final Provider provider = new Provider(
                "Test Provider", "provider@example.com", "not-a-real-password", "Doctor", "Clinic", 1L);
        private final Schedule schedule = new Schedule(7L, appointmentDate.toString(), "09:00 AM", true);
        private final AppointmentService service;

        private BookingFixture() {
            provider.setId(7L);
            schedule.setId(12L);
            service = new AppointmentService(
                    appointmentRepository,
                    userRepository,
                    providerRepository,
                    scheduleRepository,
                    calendarService,
                    notificationService);
        }

        private void prepareBooking() {
            when(providerRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(provider));
            when(userRepository.findById(4L)).thenReturn(Optional.of(user));
            when(providerRepository.findById(7L)).thenReturn(Optional.of(provider));
            when(scheduleRepository.findById(12L)).thenReturn(Optional.of(schedule));
            when(calendarService.isRestrictedForCategory(eq(appointmentDate), eq(1L))).thenReturn(false);
            when(appointmentRepository
                    .findByProvider_IdAndAppointmentDateAndAppointmentTimeAndStatusIn(
                            eq(7L),
                            eq(appointmentDate),
                            eq(java.time.LocalTime.of(9, 0)),
                            anyList()))
                    .thenReturn(List.of());
        }
    }
}