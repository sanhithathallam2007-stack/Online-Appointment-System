package com.example.appointment.config;

import com.example.appointment.repository.ProviderRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class ProviderProfessionInitializer implements CommandLineRunner {

    private static final Map<Long, String> DESIRED_PROFESSIONS = new LinkedHashMap<>();

    static {
        DESIRED_PROFESSIONS.put(1L, "Doctor");
        DESIRED_PROFESSIONS.put(2L, "Specialist");
        DESIRED_PROFESSIONS.put(3L, "Nurse");
        DESIRED_PROFESSIONS.put(4L, "Doctor");
        DESIRED_PROFESSIONS.put(5L, "Hospital Administrator");

        DESIRED_PROFESSIONS.put(6L, "Principal");
        DESIRED_PROFESSIONS.put(7L, "HOD");
        DESIRED_PROFESSIONS.put(8L, "Teacher");
        DESIRED_PROFESSIONS.put(9L, "Administrative Staff");
        DESIRED_PROFESSIONS.put(10L, "Support Staff");

        DESIRED_PROFESSIONS.put(11L, "Government Officer");
        DESIRED_PROFESSIONS.put(12L, "Department Head");
        DESIRED_PROFESSIONS.put(13L, "Clerk");
        DESIRED_PROFESSIONS.put(14L, "Public Service Staff");
        DESIRED_PROFESSIONS.put(15L, "Government Officer");

        DESIRED_PROFESSIONS.put(16L, "CEO");
        DESIRED_PROFESSIONS.put(17L, "Manager");
        DESIRED_PROFESSIONS.put(18L, "Business Consultant");
        DESIRED_PROFESSIONS.put(19L, "Manager");
        DESIRED_PROFESSIONS.put(20L, "Business Executive");

        DESIRED_PROFESSIONS.put(21L, "MLA");
        DESIRED_PROFESSIONS.put(22L, "MP");
        DESIRED_PROFESSIONS.put(23L, "Municipal Representative");
        DESIRED_PROFESSIONS.put(24L, "Public Official");
        DESIRED_PROFESSIONS.put(25L, "MLA");

        DESIRED_PROFESSIONS.put(26L, "Actor");
        DESIRED_PROFESSIONS.put(27L, "Director");
        DESIRED_PROFESSIONS.put(28L, "Producer");
        DESIRED_PROFESSIONS.put(29L, "Artist");
        DESIRED_PROFESSIONS.put(30L, "Actor");
    }

    private final ProviderRepository providerRepository;

    public ProviderProfessionInitializer(ProviderRepository providerRepository) {
        this.providerRepository = providerRepository;
    }

    @Override
    public void run(String... args) {
        DESIRED_PROFESSIONS.forEach((providerId, desiredProfession) ->
                providerRepository.findById(providerId).ifPresent(provider -> {
                    String currentProfession = provider.getProfession();
                    if (currentProfession == null || !currentProfession.trim().equalsIgnoreCase(desiredProfession.trim())) {
                        provider.setProfession(desiredProfession);
                        providerRepository.save(provider);
                    }
                })
        );
    }
}
