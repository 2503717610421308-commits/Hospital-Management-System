import API from './api';

export const getPatients = (params) => API.get('/patients', { params });
export const getPatient = (id) => API.get(`/patients/${id}`);
export const getPatientByUserId = (userId) => API.get(`/patients/user/${userId}`);
export const createPatient = (data) => API.post('/patients', data);
export const updatePatient = (id, data) => API.put(`/patients/${id}`, data);
export const deletePatient = (id) => API.delete(`/patients/${id}`);
