package com.example.appointment.controller;

import com.example.appointment.dto.ProviderResponse;
import com.example.appointment.dto.UserResponse;
import com.example.appointment.entity.Provider;
import com.example.appointment.entity.User;
import com.example.appointment.service.ProviderService;
import com.example.appointment.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final ProviderService providerService;

    public AuthController(
            UserService userService,
            ProviderService providerService) {
        this.userService = userService;
        this.providerService = providerService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody User user) {
        User savedUser = userService.registerUser(user);
        return ResponseEntity.ok(new UserResponse(savedUser));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        Optional<User> loggedInUser =
                userService.loginUser(user.getEmail(), user.getPassword());

        if (loggedInUser.isPresent()) {
            return ResponseEntity.ok(new UserResponse(loggedInUser.get()));
        }

        return ResponseEntity
                .badRequest()
                .body("Invalid email or password");
    }

    @PostMapping("/provider-login")
    public ResponseEntity<?> providerLogin(@RequestBody User user) {
        Optional<Provider> loggedInProvider =
                providerService.loginProvider(
                        user.getEmail(),
                        user.getPassword()
                );

        if (loggedInProvider.isPresent()) {
            return ResponseEntity.ok(
                    new ProviderResponse(loggedInProvider.get())
            );
        }

        return ResponseEntity
                .badRequest()
                .body("Invalid provider email or password");
    }
}