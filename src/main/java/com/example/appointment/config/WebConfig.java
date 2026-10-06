package com.example.appointment.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private static final String[] REACT_ROUTES = {
            "/app", "/app/", "/app/login", "/app/register", "/app/home", "/app/categories",
            "/app/subcategories", "/app/hospitals", "/app/hospital-roles",
            "/app/hospital-specializations", "/app/schools", "/app/school-roles",
            "/app/school-subcategories", "/app/school-providers", "/app/government-offices",
            "/app/government-services", "/app/government-roles", "/app/government-providers",
            "/app/business-services", "/app/business-roles", "/app/business-providers",
            "/app/public-representatives", "/app/public-representative-offices",
            "/app/public-representative-providers", "/app/entertainment",
            "/app/entertainment-services", "/app/entertainment-providers", "/app/providers",
            "/app/providers/{id}", "/app/book/{providerId}", "/app/my-appointments", "/app/bookings",
            "/app/reschedule/{id}", "/app/provider-login", "/app/provider-dashboard",
            "/app/admin-login", "/app/admin-dashboard", "/app/admin/users", "/app/admin/providers",
            "/app/admin/categories", "/app/admin/appointments", "/app/admin/schedules", "/app/add-schedule"
    };

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
    private String allowedOrigins;

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        for (String route : REACT_ROUTES) {
            registry.addViewController(route).setViewName("forward:/app/index.html");
        }
    }

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toList();

        config.setAllowedOrigins(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Cache-Control", "Content-Type"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
