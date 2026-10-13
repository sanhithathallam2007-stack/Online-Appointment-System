
package com.example.appointment.repository;

import com.example.appointment.entity.Provider;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProviderRepository extends JpaRepository<Provider, Long> {

    Optional<Provider> findByEmail(String email);

    List<Provider> findByCategoryId(Long categoryId);

    List<Provider> findBySpecializationIgnoreCase(String specialization);

    List<Provider> findByCategoryIdAndSpecializationIgnoreCase(
            Long categoryId, String specialization);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select provider from Provider provider where provider.id = :providerId")
    Optional<Provider> findByIdForUpdate(@Param("providerId") Long providerId);
}