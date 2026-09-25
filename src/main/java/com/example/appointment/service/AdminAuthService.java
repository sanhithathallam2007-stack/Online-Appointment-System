package com.example.appointment.service;

import org.springframework.stereotype.Service;

@Service
public class AdminAuthService {

    private static final String ADMIN_EMAIL = "admin@appointment.com";
    private static final String ADMIN_PASSWORD = "admin123";

    public boolean authenticate(String email, String password) {
        if (email == null || password == null) {
            return false;
        }

        return ADMIN_EMAIL.equalsIgnoreCase(email.trim())
                && ADMIN_PASSWORD.equals(password);
    }

    public String getAdminEmail() {
        return ADMIN_EMAIL;
    }
}
