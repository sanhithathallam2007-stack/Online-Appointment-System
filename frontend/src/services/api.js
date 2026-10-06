import API_BASE_URL from '../api'

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed: ${response.status}`);
  }

  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

// Authentication
export async function registerUser(user) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(user),
  });
}

export async function loginUser(user) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(user),
  });
}

// Categories
export async function getCategories() {
  return request("/api/categories");
}

// Providers
export async function getProviders() {
  return request("/api/providers");
}

export async function getProviderById(id) {
  return request(`/api/providers/${id}`);
}

export async function loginProvider(provider) {
  return request("/api/provider-auth/login", {
    method: "POST",
    body: JSON.stringify(provider),
  });
}

// Schedules
export async function getSchedulesByProvider(providerId) {
  return request(`/api/schedules/provider/${providerId}`);
}

export async function getScheduleById(id) {
  return request(`/api/schedules/${id}`);
}

export async function addSchedule(schedule) {
  return request("/api/schedules", {
    method: "POST",
    body: JSON.stringify(schedule),
  });
}

// Appointments
export async function bookAppointment(appointment) {
  const query = new URLSearchParams({
    userId: appointment.userId,
    providerId: appointment.providerId,
    scheduleId: appointment.scheduleId,
  })

  return request(`/api/appointments/book?${query}`, {
    method: "POST",
  });
}

export async function getAppointments() {
  return request("/api/appointments");
}

export async function getUserAppointments(userId) {
  return request(`/api/appointments/user/${userId}`);
}

export async function getProviderAppointments(providerId) {
  return request(`/api/appointments/provider/${providerId}`);
}

export async function getAppointmentById(id) {
  return request(`/api/appointments/${id}`);
}

export async function cancelAppointment(id) {
  return request(`/api/appointments/${id}/cancel`, {
    method: "PUT",
  });
}

export async function approveAppointment(id) {
  return request(`/api/appointments/${id}/approve`, {
    method: "PUT",
  });
}

export async function rejectAppointment(id) {
  return request(`/api/appointments/${id}/reject`, {
    method: "PUT",
  });
}

export async function completeAppointment(id) {
  return request(`/api/appointments/${id}/complete`, {
    method: "PUT",
  });
}

export async function rescheduleAppointment(id, appointment) {
  const scheduleId = typeof appointment === "object" && appointment !== null
    ? appointment.scheduleId ?? appointment.id
    : appointment

  return request(`/api/appointments/${id}/reschedule?scheduleId=${encodeURIComponent(scheduleId)}`, {
    method: "PUT",
  });
}