
package com.example.appointment.dto;

import com.example.appointment.entity.Provider;

public class ProviderResponse {

    private Long id;
    private String name;
    private String email;
    private String profession;
    private String organization;
    private Long categoryId;
    private String specialization;

    public ProviderResponse(Provider provider) {
        this.id = provider.getId();
        this.name = provider.getName();
        this.email = provider.getEmail();
        this.profession = provider.getProfession();
        this.organization = provider.getOrganization();
        this.categoryId = provider.getCategoryId();
        this.specialization = provider.getSpecialization();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getProfession() {
        return profession;
    }

    public String getOrganization() {
        return organization;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getSpecialization() {
        return specialization;
    }
}