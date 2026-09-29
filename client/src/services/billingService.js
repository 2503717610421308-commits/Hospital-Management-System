import API from './api';

export const getBills = (params) => API.get('/bills', { params });
export const getBill = (id) => API.get(`/bills/${id}`);
export const createBill = (data) => API.post('/bills', data);
export const updateBill = (id, data) => API.put(`/bills/${id}`, data);

export const processPayment = (data) => API.post('/payments', data);
export const getPayments = (params) => API.get('/payments', { params });
export const getPayment = (id) => API.get(`/payments/${id}`);

export const getDepartments = (params) => API.get('/departments', { params });
export const createDepartment = (data) => API.post('/departments', data);
export const updateDepartment = (id, data) => API.put(`/departments/${id}`, data);
export const deleteDepartment = (id) => API.delete(`/departments/${id}`);

export const getMedicines = (params) => API.get('/medicines', { params });
export const createMedicine = (data) => API.post('/medicines', data);
export const updateMedicine = (id, data) => API.put(`/medicines/${id}`, data);
export const deleteMedicine = (id) => API.delete(`/medicines/${id}`);

export const getMedicalRecords = (params) => API.get('/medical-records', { params });
export const getMedicalRecord = (id) => API.get(`/medical-records/${id}`);
export const createMedicalRecord = (data) => API.post('/medical-records', data);
export const updateMedicalRecord = (id, data) => API.put(`/medical-records/${id}`, data);

export const getPrescriptions = (params) => API.get('/prescriptions', { params });
export const getPrescription = (id) => API.get(`/prescriptions/${id}`);
export const createPrescription = (data) => API.post('/prescriptions', data);
export const updatePrescription = (id, data) => API.put(`/prescriptions/${id}`, data);
export const requestRefill = (id) => API.patch(`/prescriptions/${id}/refill`);

export const getTreatments = (params) => API.get('/treatments', { params });
export const createTreatment = (data) => API.post('/treatments', data);
export const updateTreatment = (id, data) => API.put(`/treatments/${id}`, data);

export const getNurses = (params) => API.get('/nurses', { params });
export const createNurse = (data) => API.post('/nurses', data);
export const updateNurse = (id, data) => API.put(`/nurses/${id}`, data);
export const deleteNurse = (id) => API.delete(`/nurses/${id}`);

export const getReceptionists = () => API.get('/receptionists');
export const createReceptionist = (data) => API.post('/receptionists', data);
export const deleteReceptionist = (id) => API.delete(`/receptionists/${id}`);

export const getNotifications = () => API.get('/notifications');
export const markNotificationRead = (id) => API.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => API.patch('/notifications/read-all');

export const getDashboardStats = () => API.get('/reports/dashboard');
export const getAppointmentReport = (params) => API.get('/reports/appointments', { params });
export const getRevenueReport = () => API.get('/reports/revenue');
export const getPatientReport = () => API.get('/reports/patients');
