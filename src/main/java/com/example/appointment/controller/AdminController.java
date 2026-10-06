package com.example.appointment.controller;

import com.example.appointment.dto.AdminStatsResponse;
import com.example.appointment.dto.AppointmentResponse;
import com.example.appointment.dto.ProviderResponse;
import com.example.appointment.dto.UserResponse;
import com.example.appointment.entity.Category;
import com.example.appointment.entity.Schedule;
import com.example.appointment.service.AdminAuthService;
import com.example.appointment.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final AdminAuthService adminAuthService;

    public AdminController(AdminService adminService, AdminAuthService adminAuthService) {
        this.adminService = adminService;
        this.adminAuthService = adminAuthService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        if (adminAuthService.authenticate(email, password)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("email", adminAuthService.getAdminEmail());
            response.put("role", "ADMIN");
            return ResponseEntity.ok(response);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Invalid admin credentials");

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getAdminStats() {
        AdminStatsResponse response = new AdminStatsResponse(
                adminService.getTotalUsers(),
                adminService.getTotalProviders(),
                adminService.getTotalAppointments(),
                adminService.getTotalCategories()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getUsers() {
        List<UserResponse> response = adminService.getAllUsers()
                .stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/providers")
    public ResponseEntity<List<ProviderResponse>> getProviders() {
        List<ProviderResponse> response = adminService.getAllProviders()
                .stream()
                .map(ProviderResponse::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentResponse>> getAppointments() {
        List<AppointmentResponse> response = adminService.getAllAppointments()
                .stream()
                .map(AppointmentResponse::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(adminService.getAllCategories());
    }

    @GetMapping("/schedules")
    public ResponseEntity<List<Schedule>> getSchedules() {
        return ResponseEntity.ok(adminService.getAllSchedules());
    }
}
