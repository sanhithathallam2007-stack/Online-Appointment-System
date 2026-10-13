
package com.example.appointment.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "appointment_providers")
public class Provider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String email;

    private String password;

    private String profession;

    private String organization;

    private Long categoryId;

    private String specialization;

    public Provider() {
    }

    // Existing constructor — kept for compatibility
    public Provider(String name, String email, String password,
                    String profession, String organization, Long categoryId) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.profession = profession;
        this.organization = organization;
        this.categoryId = categoryId;
    }

    // New constructor with specialization
    public Provider(String name, String email, String password,
                    String profession, String organization, Long categoryId,
                    String specialization) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.profession = profession;
        this.organization = organization;
        this.categoryId = categoryId;
        this.specialization = specialization;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getProfession() {
        return profession;
    }

    public void setProfession(String profession) {
        this.profession = profession;
    }

    public String getOrganization() {
        return organization;
    }

    public void setOrganization(String organization) {
        this.organization = organization;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }
}