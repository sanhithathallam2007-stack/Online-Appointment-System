# ONLINE APPOINTMENT SYSTEM

A full-stack appointment scheduling application built with React JS on the frontend and Spring Boot with Spring Data JPA on the backend.

## Technology

- React JS
- Spring Boot
- Java
- Spring Data JPA
- MySQL
- REST API

## Main Features

- User registration/login
- Appointment categories
- Provider selection
- Provider schedules
- Appointment booking
- Cancel appointment
- Reschedule appointment
- Provider dashboard
- Admin dashboard
- Appointment management
- Demo AI Assistant
- Free demo notification

## Architecture

React JS
↓
REST API
↓
Spring Boot
↓
Spring Data JPA
↓
MySQL

## Local Development

### Backend

```bash
./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Configuration

The frontend uses the `VITE_API_BASE_URL` environment variable. A sample file is included at `frontend/.env.example`.

The backend uses environment-based configuration values such as:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `APP_CORS_ALLOWED_ORIGINS`

Do not commit real secrets or live credentials to source control.
