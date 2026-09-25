package com.example.appointment.service;

import com.example.appointment.entity.Appointment;
import com.example.appointment.entity.Category;
import com.example.appointment.entity.Provider;
import com.example.appointment.entity.Schedule;
import com.example.appointment.entity.User;
import com.example.appointment.repository.AppointmentRepository;
import com.example.appointment.repository.CategoryRepository;
import com.example.appointment.repository.ProviderRepository;
import com.example.appointment.repository.ScheduleRepository;
import com.example.appointment.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ProviderRepository providerRepository;
    private final AppointmentRepository appointmentRepository;
    private final CategoryRepository categoryRepository;
    private final ScheduleRepository scheduleRepository;

    public AdminService(
            UserRepository userRepository,
            ProviderRepository providerRepository,
            AppointmentRepository appointmentRepository,
            CategoryRepository categoryRepository,
            ScheduleRepository scheduleRepository) {
        this.userRepository = userRepository;
        this.providerRepository = providerRepository;
        this.appointmentRepository = appointmentRepository;
        this.categoryRepository = categoryRepository;
        this.scheduleRepository = scheduleRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<Provider> getAllProviders() {
        return providerRepository.findAll();
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public long getTotalUsers() {
        return userRepository.count();
    }

    public long getTotalProviders() {
        return providerRepository.count();
    }

    public long getTotalAppointments() {
        return appointmentRepository.count();
    }

    public long getTotalCategories() {
        return categoryRepository.count();
    }
}
