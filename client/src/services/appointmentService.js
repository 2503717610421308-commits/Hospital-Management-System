import API from './api';

export const getAppointments = (params) => API.get('/appointments', { params });
export const getAppointment = (id) => API.get(`/appointments/${id}`);
export const checkAvailability = (params) => API.get('/appointments/availability', { params });
export const createAppointment = (data) => API.post('/appointments', data);
export const updateAppointment = (id, data) => API.put(`/appointments/${id}`, data);
export const updateAppointmentStatus = (id, data) => API.patch(`/appointments/${id}/status`, data);
export const deleteAppointment = (id) => API.delete(`/appointments/${id}`);
