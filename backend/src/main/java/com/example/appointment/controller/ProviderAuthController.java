package com.example.appointment.controller;

import com.example.appointment.dto.ProviderResponse;
import com.example.appointment.entity.Provider;
import com.example.appointment.service.ProviderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/provider-auth")
public class ProviderAuthController {

    private final ProviderService providerService;

    public ProviderAuthController(
            ProviderService providerService) {

        this.providerService = providerService;
    }


    // Provider Login
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Provider provider) {

        Optional<Provider> loggedInProvider =
                providerService.loginProvider(
                        provider.getEmail(),
                        provider.getPassword()
                );


        if (loggedInProvider.isPresent()) {

            return ResponseEntity.ok(
                    new ProviderResponse(
                            loggedInProvider.get()
                    )
            );
        }


        return ResponseEntity
                .badRequest()
                .body("Invalid provider email or password.");
    }
}