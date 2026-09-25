package com.example.appointment.repository;

import com.example.appointment.entity.Provider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProviderRepository
        extends JpaRepository<Provider, Long> {

    Optional<Provider> findByEmail(String email);
}