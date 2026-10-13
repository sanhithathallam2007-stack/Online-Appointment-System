package com.example.appointment.controller;

import com.example.appointment.dto.AppointmentResponse;
import com.example.appointment.dto.ProviderResponse;
import com.example.appointment.dto.UserResponse;
import com.example.appointment.entity.Appointment;
import com.example.appointment.entity.Category;
import com.example.appointment.entity.Provider;
import com.example.appointment.entity.Schedule;
import com.example.appointment.entity.User;
import com.example.appointment.service.AdminAuthService;
import com.example.appointment.service.AdminService;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AdminControllerTest {

    @Test
    void getUsersDoesNotExposePasswords() {
        AdminService adminService = mock(AdminService.class);
        AdminAuthService adminAuthService = mock(AdminAuthService.class);
        AdminController controller = new AdminController(adminService, adminAuthService);

        User user = new User("Alice", "alice@example.com", "secret");
        user.setId(1L);
        when(adminService.getAllUsers()).thenReturn(List.of(user));

        ResponseEntity<List<UserResponse>> response = controller.getUsers();

        assertEquals(200, response.getStatusCode().value());
        assertEquals(1, response.getBody().size());
        assertEquals("alice@example.com", response.getBody().get(0).getEmail());
        assertFalse(response.toString().contains("secret"));
    }

    @Test
    void getProvidersDoesNotExposePasswords() {
        AdminService adminService = mock(AdminService.class);
        AdminAuthService adminAuthService = mock(AdminAuthService.class);
        AdminController controller = new AdminController(adminService, adminAuthService);

        Provider provider = new Provider(
                "Dr. Smith",
                "smith@example.com",
                "pw123",
                "Doctor",
                "City Hospital",
                1L
        );
        provider.setId(2L);
        when(adminService.getAllProviders()).thenReturn(List.of(provider));

        ResponseEntity<List<ProviderResponse>> response = controller.getProviders();

        assertEquals(200, response.getStatusCode().value());
        assertEquals(1, response.getBody().size());
        assertEquals("smith@example.com", response.getBody().get(0).getEmail());
        assertFalse(response.toString().contains("pw123"));
    }

    @Test
    void getAppointmentsAndSchedulesAreAvailable() {
        AdminService adminService = mock(AdminService.class);
        AdminAuthService adminAuthService = mock(AdminAuthService.class);
        AdminController controller = new AdminController(adminService, adminAuthService);

        User user = new User("Alice", "alice@example.com", "secret");
        user.setId(1L);

        Provider provider = new Provider(
                "Dr. Smith",
                "smith@example.com",
                "pw123",
                "Doctor",
                "City Hospital",
                1L
        );
        provider.setId(2L);

        Appointment appointment = new Appointment(
                user,
                provider,
                LocalDate.of(2025, 9, 15),
                LocalTime.of(10, 30),
                "PENDING"
        );
        appointment.setId(7L);

        Schedule schedule = new Schedule(2L, "2025-09-15", "10:30 AM", true);
        schedule.setId(9L);

        when(adminService.getAllAppointments()).thenReturn(List.of(appointment));
        when(adminService.getAllSchedules()).thenReturn(List.of(schedule));

        ResponseEntity<List<AppointmentResponse>> appointments = controller.getAppointments();
        ResponseEntity<List<Schedule>> schedules = controller.getSchedules();

        assertEquals(200, appointments.getStatusCode().value());
        assertEquals(7L, appointments.getBody().get(0).getId());
        assertEquals("PENDING", appointments.getBody().get(0).getStatus());

        assertEquals(200, schedules.getStatusCode().value());
        assertEquals(9L, schedules.getBody().get(0).getId());
        assertEquals(2L, schedules.getBody().get(0).getProviderId());
    }

    @Test
    void getCategoriesReturnsList() {
        AdminService adminService = mock(AdminService.class);
        AdminAuthService adminAuthService = mock(AdminAuthService.class);
        AdminController controller = new AdminController(adminService, adminAuthService);

        Category category = new Category("Healthcare", "Health appointments");
        category.setId(1L);
        when(adminService.getAllCategories()).thenReturn(List.of(category));

        ResponseEntity<List<Category>> response = controller.getCategories();

        assertEquals(200, response.getStatusCode().value());
        assertEquals(1, response.getBody().size());
        assertEquals("Healthcare", response.getBody().get(0).getName());
    }
}
