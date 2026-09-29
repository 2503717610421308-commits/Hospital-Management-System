/**
 * MediCore HMS - Database Layer (IndexedDB)
 * Provides persistent storage with a relational-like structure
 */

const DB = (() => {
  const DB_NAME = 'MediCoreHMS';
  const DB_VERSION = 1;
  let db = null;

  const STORES = [
    'users', 'patients', 'doctors', 'departments',
    'appointments', 'medical_records', 'prescriptions',
    'prescription_items', 'bills', 'bill_items'
  ];

  function open() {
    return new Promise((resolve, reject) => {
      if (db) { resolve(db); return; }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => { db = req.result; resolve(db); };
      req.onupgradeneeded = (e) => {
        const d = e.target.result;
        STORES.forEach(name => {
          if (!d.objectStoreNames.contains(name)) {
            const store = d.createObjectStore(name, { keyPath: 'id', autoIncrement: true });
            // Create indexes
            if (name === 'users') { store.createIndex('username', 'username', { unique: true }); store.createIndex('email', 'email', { unique: false }); }
            if (name === 'patients') { store.createIndex('patient_id', 'patient_id', { unique: true }); store.createIndex('user_id', 'user_id', { unique: false }); }
            if (name === 'doctors') { store.createIndex('user_id', 'user_id', { unique: false }); store.createIndex('department_id', 'department_id', { unique: false }); }
            if (name === 'appointments') { store.createIndex('patient_id', 'patient_id', { unique: false }); store.createIndex('doctor_id', 'doctor_id', { unique: false }); store.createIndex('date', 'date', { unique: false }); store.createIndex('status', 'status', { unique: false }); }
            if (name === 'medical_records') { store.createIndex('patient_id', 'patient_id', { unique: false }); store.createIndex('doctor_id', 'doctor_id', { unique: false }); }
            if (name === 'prescriptions') { store.createIndex('patient_id', 'patient_id', { unique: false }); store.createIndex('appointment_id', 'appointment_id', { unique: false }); }
            if (name === 'prescription_items') { store.createIndex('prescription_id', 'prescription_id', { unique: false }); }
            if (name === 'bills') { store.createIndex('patient_id', 'patient_id', { unique: false }); store.createIndex('appointment_id', 'appointment_id', { unique: false }); store.createIndex('status', 'status', { unique: false }); }
            if (name === 'bill_items') { store.createIndex('bill_id', 'bill_id', { unique: false }); }
          }
        });
      };
    });
  }

  function tx(storeName, mode = 'readonly') {
    return db.transaction(storeName, mode).objectStore(storeName);
  }

  function request(req) {
    return new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); });
  }

  async function add(store, data) {
    await open();
    const now = new Date().toISOString();
    const item = { ...data, created_at: data.created_at || now, updated_at: now };
    const id = await request(tx(store, 'readwrite').add(item));
    return { ...item, id };
  }

  async function update(store, data) {
    await open();
    const now = new Date().toISOString();
    const item = { ...data, updated_at: now };
    await request(tx(store, 'readwrite').put(item));
    return item;
  }

  async function remove(store, id) {
    await open();
    await request(tx(store, 'readwrite').delete(id));
  }

  async function getById(store, id) {
    await open();
    return request(tx(store).get(id));
  }

  async function getAll(store) {
    await open();
    return request(tx(store).getAll());
  }

  async function getByIndex(store, indexName, value) {
    await open();
    return request(tx(store).index(indexName).getAll(value));
  }

  async function getOneByIndex(store, indexName, value) {
    await open();
    return request(tx(store).index(indexName).get(value));
  }

  async function count(store) {
    await open();
    return request(tx(store).count());
  }

  async function clear(store) {
    await open();
    return request(tx(store, 'readwrite').clear());
  }

  return { open, add, update, remove, getById, getAll, getByIndex, getOneByIndex, count, clear };
})();

/**
 * Seed data loader
 */
const Seeder = (() => {
  const SEED_KEY = 'medicore_seeded_v3';

  async function seed() {
    if (localStorage.getItem(SEED_KEY)) return;
    console.log('[Seeder] Running initial seed...');

    // Departments
    const depts = [
      { name: 'Cardiology', description: 'Heart and cardiovascular system', color: '#ef4444', icon: '❤️', doctor_count: 0 },
      { name: 'Neurology', description: 'Brain, spinal cord, and nervous system', color: '#8b5cf6', icon: '🧠', doctor_count: 0 },
      { name: 'Orthopedics', description: 'Bones, joints, ligaments, and tendons', color: '#f59e0b', icon: '🦴', doctor_count: 0 },
      { name: 'Pediatrics', description: 'Medical care for infants, children, and adolescents', color: '#22c55e', icon: '👶', doctor_count: 0 },
      { name: 'General Medicine', description: 'General healthcare and primary care', color: '#0ea5e9', icon: '🏥', doctor_count: 0 },
      { name: 'Dermatology', description: 'Skin, hair, and nail conditions', color: '#ec4899', icon: '🩺', doctor_count: 0 },
      { name: 'ENT', description: 'Ear, nose, and throat specialization', color: '#14b8a6', icon: '👂', doctor_count: 0 },
      { name: 'Radiology', description: 'Diagnostic imaging services', color: '#6366f1', icon: '🔬', doctor_count: 0 },
    ];
    const deptIds = [];
    for (const d of depts) { const r = await DB.add('departments', d); deptIds.push(r.id); }

    // Users
    const users = [
      { username: 'admin', email: 'admin@medicore.com', password: btoa('admin123'), role: 'admin', name: 'Dr. Admin User', phone: '+1-555-0100', status: 'active' },
      { username: 'dr.smith', email: 'drsmith@medicore.com', password: btoa('doctor123'), role: 'doctor', name: 'Dr. James Smith', phone: '+1-555-0201', status: 'active' },
      { username: 'dr.johnson', email: 'drjohnson@medicore.com', password: btoa('doctor123'), role: 'doctor', name: 'Dr. Emily Johnson', phone: '+1-555-0202', status: 'active' },
      { username: 'dr.patel', email: 'drpatel@medicore.com', password: btoa('doctor123'), role: 'doctor', name: 'Dr. Raj Patel', phone: '+1-555-0203', status: 'active' },
      { username: 'dr.chen', email: 'drchen@medicore.com', password: btoa('doctor123'), role: 'doctor', name: 'Dr. Lisa Chen', phone: '+1-555-0204', status: 'active' },
      { username: 'reception', email: 'reception@medicore.com', password: btoa('recep123'), role: 'receptionist', name: 'Sarah Wilson', phone: '+1-555-0301', status: 'active' },
      { username: 'patient1', email: 'john.doe@email.com', password: btoa('patient123'), role: 'patient', name: 'John Doe', phone: '+1-555-0401', status: 'active' },
      { username: 'patient2', email: 'jane.smith@email.com', password: btoa('patient123'), role: 'patient', name: 'Jane Smith', phone: '+1-555-0402', status: 'active' },
      { username: 'patient3', email: 'bob.brown@email.com', password: btoa('patient123'), role: 'patient', name: 'Robert Brown', phone: '+1-555-0403', status: 'active' },
      { username: 'dr.garcia', email: 'drgarcia@medicore.com', password: btoa('doctor123'), role: 'doctor', name: 'Dr. Maria Garcia', phone: '+1-555-0205', status: 'active' },
    ];
    const userIds = [];
    for (const u of users) { const r = await DB.add('users', u); userIds.push(r.id); }

    // Doctors (linked to users and departments)
    const doctorData = [
      { user_id: userIds[1], department_id: deptIds[0], name: 'Dr. James Smith', specialization: 'Interventional Cardiology', license_no: 'MD-2021-001', experience_years: 12, consultation_fee: 150, available_days: ['Mon','Tue','Wed','Thu','Fri'], available_start: '09:00', available_end: '17:00', bio: 'Specialist in interventional cardiology with over 12 years of experience.', status: 'active' },
      { user_id: userIds[2], department_id: deptIds[1], name: 'Dr. Emily Johnson', specialization: 'Neurological Surgery', license_no: 'MD-2021-002', experience_years: 9, consultation_fee: 180, available_days: ['Mon','Wed','Fri'], available_start: '10:00', available_end: '16:00', bio: 'Expert in neurological surgery and brain disorders.', status: 'active' },
      { user_id: userIds[3], department_id: deptIds[4], name: 'Dr. Raj Patel', specialization: 'General Practice', license_no: 'MD-2021-003', experience_years: 7, consultation_fee: 100, available_days: ['Mon','Tue','Wed','Thu','Fri','Sat'], available_start: '08:00', available_end: '18:00', bio: 'Primary care physician with comprehensive approach to patient health.', status: 'active' },
      { user_id: userIds[4], department_id: deptIds[2], name: 'Dr. Lisa Chen', specialization: 'Sports Medicine & Orthopedics', license_no: 'MD-2021-004', experience_years: 11, consultation_fee: 160, available_days: ['Tue','Thu','Sat'], available_start: '09:00', available_end: '15:00', bio: 'Specialized in sports injuries and joint replacement surgeries.', status: 'active' },
      { user_id: userIds[9], department_id: deptIds[3], name: 'Dr. Maria Garcia', specialization: 'Pediatric Medicine', license_no: 'MD-2021-005', experience_years: 8, consultation_fee: 120, available_days: ['Mon','Tue','Thu','Fri'], available_start: '09:00', available_end: '17:00', bio: 'Dedicated to providing exceptional care for children of all ages.', status: 'active' },
    ];
    const doctorIds = [];
    for (const d of doctorData) { const r = await DB.add('doctors', d); doctorIds.push(r.id); }

    // Patients (linked to users)
    const patientData = [
      { user_id: userIds[6], patient_id: 'PAT-001', name: 'John Doe', dob: '1985-04-15', gender: 'Male', blood_group: 'O+', phone: '+1-555-0401', email: 'john.doe@email.com', address: '123 Main St, Springfield, IL 62701', emergency_contact: 'Mary Doe', emergency_phone: '+1-555-0411', medical_history: 'Hypertension, Diabetes Type 2', allergies: 'Penicillin', insurance: 'BlueCross PPO #BC123456', status: 'active' },
      { user_id: userIds[7], patient_id: 'PAT-002', name: 'Jane Smith', dob: '1990-08-22', gender: 'Female', blood_group: 'A+', phone: '+1-555-0402', email: 'jane.smith@email.com', address: '456 Oak Ave, Chicago, IL 60601', emergency_contact: 'Tom Smith', emergency_phone: '+1-555-0412', medical_history: 'Asthma', allergies: 'None known', insurance: 'Aetna #AE789012', status: 'active' },
      { user_id: userIds[8], patient_id: 'PAT-003', name: 'Robert Brown', dob: '1978-12-10', gender: 'Male', blood_group: 'B-', phone: '+1-555-0403', email: 'bob.brown@email.com', address: '789 Pine Rd, Rockford, IL 61101', emergency_contact: 'Alice Brown', emergency_phone: '+1-555-0413', medical_history: 'Lower back pain, High cholesterol', allergies: 'Aspirin', insurance: 'United Health #UH345678', status: 'active' },
      { user_id: null, patient_id: 'PAT-004', name: 'Alice Thompson', dob: '1995-03-28', gender: 'Female', blood_group: 'AB+', phone: '+1-555-0404', email: 'alice.t@email.com', address: '321 Elm Blvd, Aurora, IL 60505', emergency_contact: 'David Thompson', emergency_phone: '+1-555-0414', medical_history: 'Migraines', allergies: 'Sulfa drugs', insurance: 'Cigna #CI901234', status: 'active' },
      { user_id: null, patient_id: 'PAT-005', name: 'Michael Davis', dob: '1960-11-05', gender: 'Male', blood_group: 'A-', phone: '+1-555-0405', email: 'michael.d@email.com', address: '654 Maple Dr, Naperville, IL 60540', emergency_contact: 'Susan Davis', emergency_phone: '+1-555-0415', medical_history: 'Coronary artery disease, Atrial fibrillation', allergies: 'Codeine', insurance: 'Medicare #MC567890', status: 'active' },
      { user_id: null, patient_id: 'PAT-006', name: 'Emma Wilson', dob: '2010-07-14', gender: 'Female', blood_group: 'O-', phone: '+1-555-0406', email: 'emma.w@email.com', address: '987 Cedar Ln, Evanston, IL 60201', emergency_contact: 'Tom Wilson', emergency_phone: '+1-555-0416', medical_history: 'None', allergies: 'Peanuts', insurance: 'BlueCross Child #BC234567', status: 'active' },
    ];
    const patientIds = [];
    for (const p of patientData) { const r = await DB.add('patients', p); patientIds.push(r.id); }

    // Today
    const today = new Date();
    const fmt = (d) => d.toISOString().split('T')[0];
    const past = (days) => { const d = new Date(today); d.setDate(d.getDate() - days); return fmt(d); };
    const future = (days) => { const d = new Date(today); d.setDate(d.getDate() + days); return fmt(d); };

    // Appointments
    const apptData = [
      { patient_id: patientIds[0], doctor_id: doctorIds[0], department_id: deptIds[0], date: fmt(today), time: '09:00', status: 'confirmed', reason: 'Chest pain follow-up', notes: 'Patient reports improvement', created_by: 'receptionist' },
      { patient_id: patientIds[1], doctor_id: doctorIds[2], department_id: deptIds[4], date: fmt(today), time: '10:30', status: 'pending', reason: 'General check-up', notes: '', created_by: 'patient' },
      { patient_id: patientIds[2], doctor_id: doctorIds[3], department_id: deptIds[2], date: fmt(today), time: '14:00', status: 'confirmed', reason: 'Back pain consultation', notes: '', created_by: 'receptionist' },
      { patient_id: patientIds[3], doctor_id: doctorIds[1], department_id: deptIds[1], date: future(1), time: '11:00', status: 'pending', reason: 'Migraine treatment', notes: '', created_by: 'patient' },
      { patient_id: patientIds[4], doctor_id: doctorIds[0], department_id: deptIds[0], date: future(2), time: '09:30', status: 'confirmed', reason: 'Cardiology follow-up', notes: '', created_by: 'receptionist' },
      { patient_id: patientIds[0], doctor_id: doctorIds[2], department_id: deptIds[4], date: past(7), time: '10:00', status: 'completed', reason: 'Annual physical', notes: 'All vitals normal', created_by: 'patient' },
      { patient_id: patientIds[1], doctor_id: doctorIds[4], department_id: deptIds[3], date: past(14), time: '15:00', status: 'completed', reason: 'Asthma management', notes: 'Prescribed new inhaler', created_by: 'receptionist' },
      { patient_id: patientIds[5], doctor_id: doctorIds[4], department_id: deptIds[3], date: past(3), time: '09:00', status: 'completed', reason: 'Routine pediatric check', notes: 'Growth milestones normal', created_by: 'receptionist' },
      { patient_id: patientIds[2], doctor_id: doctorIds[2], department_id: deptIds[4], date: past(1), time: '11:30', status: 'cancelled', reason: 'Fever', notes: 'Cancelled by patient', created_by: 'patient' },
      { patient_id: patientIds[0], doctor_id: doctorIds[0], department_id: deptIds[0], date: future(7), time: '09:00', status: 'pending', reason: 'ECG review', notes: '', created_by: 'patient' },
    ];
    const apptIds = [];
    for (const a of apptData) { const r = await DB.add('appointments', a); apptIds.push(r.id); }

    // Medical Records
    const records = [
      { patient_id: patientIds[0], doctor_id: doctorIds[0], appointment_id: apptIds[5], visit_date: past(7), diagnosis: 'Hypertension - Stage 2', symptoms: 'Headache, dizziness, elevated BP (145/92)', treatment: 'Adjusted Lisinopril dosage to 20mg. Advised dietary changes, reduce sodium intake.', notes: 'Patient is compliant with medications. Follow up in 3 months for BP monitoring.', vitals: { bp: '145/92', pulse: '78', temp: '98.4', weight: '82kg', height: '175cm' } },
      { patient_id: patientIds[1], doctor_id: doctorIds[4], appointment_id: apptIds[6], visit_date: past(14), diagnosis: 'Mild persistent asthma', symptoms: 'Wheezing, shortness of breath on exertion', treatment: 'Prescribed Albuterol inhaler (as needed) and Fluticasone 100mcg twice daily', notes: 'Advised patient to monitor peak flow daily. Avoid known triggers.', vitals: { bp: '118/76', pulse: '82', temp: '98.6', weight: '65kg', height: '168cm' } },
      { patient_id: patientIds[5], doctor_id: doctorIds[4], appointment_id: apptIds[7], visit_date: past(3), diagnosis: 'Healthy child - routine check', symptoms: 'None', treatment: 'Vitamin D supplement recommended. All vaccinations up to date.', notes: 'Child is growing well, within 75th percentile.', vitals: { bp: '95/60', pulse: '90', temp: '98.2', weight: '35kg', height: '140cm' } },
    ];
    const recordIds = [];
    for (const r of records) { const rec = await DB.add('medical_records', r); recordIds.push(rec.id); }

    // Prescriptions
    const rxData = [
      { patient_id: patientIds[0], doctor_id: doctorIds[0], appointment_id: apptIds[5], medical_record_id: recordIds[0], prescription_date: past(7), notes: 'Take medications with food. Monitor blood pressure daily.' },
      { patient_id: patientIds[1], doctor_id: doctorIds[4], appointment_id: apptIds[6], medical_record_id: recordIds[1], prescription_date: past(14), notes: 'Use inhaler before exercise. Keep rescue inhaler available at all times.' },
    ];
    const rxIds = [];
    for (const r of rxData) { const rx = await DB.add('prescriptions', r); rxIds.push(rx.id); }

    // Prescription Items
    const rxItems = [
      { prescription_id: rxIds[0], medicine_name: 'Lisinopril', dosage: '20mg', frequency: 'Once daily', duration: '90 days', instructions: 'Take in the morning with water. Do not stop abruptly.' },
      { prescription_id: rxIds[0], medicine_name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '90 days', instructions: 'Take with meals to reduce stomach upset.' },
      { prescription_id: rxIds[0], medicine_name: 'Aspirin', dosage: '81mg', frequency: 'Once daily', duration: '90 days', instructions: 'Take at bedtime.' },
      { prescription_id: rxIds[1], medicine_name: 'Albuterol Inhaler', dosage: '90mcg/actuation', frequency: 'As needed (PRN)', duration: '30 days', instructions: '2 puffs when needed. Shake well before use.' },
      { prescription_id: rxIds[1], medicine_name: 'Fluticasone Propionate', dosage: '100mcg', frequency: 'Twice daily', duration: '30 days', instructions: 'Rinse mouth after each use to prevent oral thrush.' },
    ];
    for (const item of rxItems) { await DB.add('prescription_items', item); }

    // Bills
    const billData = [
      { patient_id: patientIds[0], appointment_id: apptIds[5], doctor_id: doctorIds[0], bill_number: 'INV-2026-001', bill_date: past(7), due_date: past(0), consultation_fee: 150, discount: 0, tax_rate: 5, status: 'paid', payment_date: past(6), payment_method: 'Credit Card', notes: '' },
      { patient_id: patientIds[1], appointment_id: apptIds[6], doctor_id: doctorIds[4], bill_number: 'INV-2026-002', bill_date: past(14), due_date: past(7), consultation_fee: 120, discount: 10, tax_rate: 5, status: 'paid', payment_date: past(13), payment_method: 'Insurance', notes: 'Insurance claim #AE789012' },
      { patient_id: patientIds[2], appointment_id: apptIds[2], doctor_id: doctorIds[3], bill_number: 'INV-2026-003', bill_date: fmt(today), due_date: future(7), consultation_fee: 160, discount: 0, tax_rate: 5, status: 'unpaid', payment_date: null, payment_method: '', notes: '' },
      { patient_id: patientIds[0], appointment_id: apptIds[0], doctor_id: doctorIds[0], bill_number: 'INV-2026-004', bill_date: fmt(today), due_date: future(7), consultation_fee: 150, discount: 0, tax_rate: 5, status: 'unpaid', payment_date: null, payment_method: '', notes: '' },
    ];
    const billIds = [];
    for (const b of billData) { const bill = await DB.add('bills', b); billIds.push(bill.id); }

    // Bill Items
    const billItems = [
      { bill_id: billIds[0], description: 'Consultation Fee', category: 'consultation', quantity: 1, unit_price: 150, amount: 150 },
      { bill_id: billIds[0], description: 'ECG Test', category: 'lab', quantity: 1, unit_price: 75, amount: 75 },
      { bill_id: billIds[0], description: 'Blood Pressure Monitor', category: 'medicine', quantity: 1, unit_price: 35, amount: 35 },
      { bill_id: billIds[1], description: 'Consultation Fee', category: 'consultation', quantity: 1, unit_price: 120, amount: 120 },
      { bill_id: billIds[1], description: 'Spirometry Test', category: 'lab', quantity: 1, unit_price: 90, amount: 90 },
      { bill_id: billIds[2], description: 'Consultation Fee', category: 'consultation', quantity: 1, unit_price: 160, amount: 160 },
      { bill_id: billIds[2], description: 'X-Ray (Lumbar Spine)', category: 'lab', quantity: 1, unit_price: 120, amount: 120 },
      { bill_id: billIds[2], description: 'Pain Medication', category: 'medicine', quantity: 2, unit_price: 25, amount: 50 },
      { bill_id: billIds[3], description: 'Consultation Fee', category: 'consultation', quantity: 1, unit_price: 150, amount: 150 },
      { bill_id: billIds[3], description: 'Blood Panel', category: 'lab', quantity: 1, unit_price: 85, amount: 85 },
    ];
    for (const item of billItems) { await DB.add('bill_items', item); }

    localStorage.setItem(SEED_KEY, '1');
    console.log('[Seeder] Seed complete.');
  }

  async function reset() {
    localStorage.removeItem(SEED_KEY);
    const stores = ['users', 'patients', 'doctors', 'departments', 'appointments', 'medical_records', 'prescriptions', 'prescription_items', 'bills', 'bill_items'];
    for (const s of stores) { await DB.clear(s); }
    await seed();
  }

  return { seed, reset };
})();

/**
 * ID Generator
 */
function generatePatientId(existingCount) {
  return `PAT-${String(existingCount + 1).padStart(3, '0')}`;
}
function generateBillNumber(existingCount) {
  const year = new Date().getFullYear();
  return `INV-${year}-${String(existingCount + 1).padStart(3, '0')}`;
}
