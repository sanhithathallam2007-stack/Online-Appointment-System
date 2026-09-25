package com.example.appointment.service;

import com.example.appointment.entity.Provider;
import com.example.appointment.repository.ProviderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProviderService {

    private final ProviderRepository providerRepository;

    public ProviderService(ProviderRepository providerRepository) {
        this.providerRepository = providerRepository;
    }

    // Get all providers
    public List<Provider> getAllProviders() {
        return providerRepository.findAll();
    }

    // Add provider
    public Provider addProvider(Provider provider) {
        return providerRepository.save(provider);
    }

    // Get provider by ID
    public Provider getProviderById(Long id) {
        return providerRepository
                .findById(id)
                .orElse(null);
    }

    // Provider login
    public Optional<Provider> loginProvider(
            String email,
            String password) {

        Optional<Provider> provider =
                providerRepository.findByEmail(email);

        if (provider.isPresent()
                && provider.get()
                        .getPassword()
                        .equals(password)) {

            return provider;
        }

        return Optional.empty();
    }
}