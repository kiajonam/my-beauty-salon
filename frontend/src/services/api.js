const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Anfrage fehlgeschlagen.');
  return data;
}

export const api = {
  services: () => request('/api/public/services'),
  availability: (date, serviceId) => request(`/api/public/availability?date=${encodeURIComponent(date)}${serviceId ? `&serviceId=${encodeURIComponent(serviceId)}` : ''}`),
  book: payload => request('/api/public/appointments', { method: 'POST', body: JSON.stringify(payload) }),
  login: payload => request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/admin/me'),
  dashboard: () => request('/api/admin/dashboard'),
  appointments: () => request('/api/admin/appointments'),
  updateAppointmentStatus: (id, status) => request(`/api/admin/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  customers: () => request('/api/admin/customers'),
  updateCustomer: (id, payload) => request(`/api/admin/customers/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  servicesAdmin: () => request('/api/admin/services'),
  createService: payload => request('/api/admin/services', { method: 'POST', body: JSON.stringify(payload) }),
  updateService: (id, payload) => request(`/api/admin/services/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  reviews: () => request('/api/admin/reviews'),
  updateReviewStatus: (id, status) => request(`/api/admin/reviews/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};
