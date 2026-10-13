package com.example.appointment.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    public void notifyAppointmentBooking(
            String userName,
            String providerName,
            String appointmentDate,
            String appointmentTime,
            String status) {

        String message = String.format(
                "========================================%n" +
                        "NEW APPOINTMENT NOTIFICATION%n" +
                        "========================================%n" +
                        "User: %s%n" +
                        "Provider: %s%n" +
                        "Date: %s%n" +
                        "Time: %s%n" +
                        "Status: %s%n" +
                        "========================================%n" +
                        "This is ONLY a demo notification.%n" +
                        "Do NOT send a real SMS.",
                userName != null ? userName : "N/A",
                providerName != null ? providerName : "N/A",
                appointmentDate != null ? appointmentDate : "N/A",
                appointmentTime != null ? appointmentTime : "N/A",
                status != null ? status : "N/A"
        );

        System.out.println(message);
        logger.info(message);
    }
}
