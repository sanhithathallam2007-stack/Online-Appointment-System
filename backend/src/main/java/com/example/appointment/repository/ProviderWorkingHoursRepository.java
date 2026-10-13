package com.example.appointment.repository;

import com.example.appointment.entity.ProviderWorkingHours;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProviderWorkingHoursRepository
        extends JpaRepository<ProviderWorkingHours, Long> {

    List<ProviderWorkingHours> findByProviderIdAndActiveTrue(Long providerId);

    List<ProviderWorkingHours> findByProviderId(Long providerId);

    @EntityGraph(attributePaths = "provider")
    List<ProviderWorkingHours> findByActiveTrue();
}