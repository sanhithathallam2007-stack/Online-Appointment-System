package com.example.appointment.controller;

import com.example.appointment.dto.ProviderResponse;
import com.example.appointment.entity.Provider;
import com.example.appointment.service.ProviderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/providers")
public class ProviderController {

    private final ProviderService providerService;

    public ProviderController(
            ProviderService providerService) {

        this.providerService = providerService;
    }

    @GetMapping
    public ResponseEntity<List<ProviderResponse>> getAllProviders() {

        return ResponseEntity.ok(
                providerService.getAllProviders()
                        .stream()
                        .map(ProviderResponse::new)
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProviderResponse> getProviderById(
            @PathVariable Long id) {

        Provider provider =
                providerService.getProviderById(id);

        if (provider == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(new ProviderResponse(provider));
    }

    @PostMapping
    public ResponseEntity<ProviderResponse> addProvider(
            @RequestBody Provider provider) {

        return ResponseEntity.ok(
                new ProviderResponse(providerService.addProvider(provider))
        );
    }
}