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

### Run the combined application

1. From the project root, install the frontend dependencies once:

```bash
cd frontend && npm ci
```

2. Return to the project root and start Spring Boot:

```bash
cd ..
./mvnw spring-boot:run
```

The Maven build runs the React production build and places its output under generated `static/app` resources. Spring Boot serves the React application at `http://localhost:8080`; the original static HTML files remain in `src/main/resources/static` and are not overwritten. React routes are forwarded to the app entry point so they can be refreshed directly.

During development, run Spring Boot on port 8080 and Vite on port 5173. Vite proxies `/api` requests to Spring Boot. For deployments where the frontend and API use different origins, set `VITE_API_BASE_URL` before building; leave it blank when Spring Boot serves both on the same origin.

## Environment Configuration

The frontend uses the `VITE_API_BASE_URL` environment variable. A sample file is included at `frontend/.env.example`.

The backend uses environment-based configuration values such as:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `APP_CORS_ALLOWED_ORIGINS`

Do not commit real secrets or live credentials to source control.
