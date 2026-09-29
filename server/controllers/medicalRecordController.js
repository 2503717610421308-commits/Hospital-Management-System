const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

exports.getMedicalRecords = async (req, res) => {
  try {
    const { patientId, doctorId } = req.query;
    const query = {};
    if (patientId) query.patientId = patientId;
    if (doctorId) query.doctorId = doctorId;

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (patient) query.patientId = patient._id;
    }
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (doctor) query.doctorId = doctor._id;
    }

    const records = await MedicalRecord.find(query)
      .populate('patientId', 'name patientId')
      .populate('doctorId', 'name doctorId specialization')
      .populate('appointmentId', 'appointmentId appointmentDate')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('patientId', 'name patientId phone email dateOfBirth gender bloodGroup')
      .populate('doctorId', 'name doctorId specialization')
      .populate('appointmentId', 'appointmentId appointmentDate appointmentTime');
    if (!record) return res.status(404).json({ success: false, message: 'Medical record not found' });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createMedicalRecord = async (req, res) => {
  try {
    const { patientId, doctorId, appointmentId, diagnosis, symptoms, treatment, notes, vitals, testResults } = req.body;
    if (!patientId || !doctorId || !diagnosis) {
      return res.status(400).json({ success: false, message: 'Patient, doctor and diagnosis are required' });
    }
    const record = await MedicalRecord.create({ patientId, doctorId, appointmentId, diagnosis, symptoms, treatment, notes, vitals, testResults });
    res.status(201).json({ success: true, message: 'Medical record created', data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Medical record not found' });
    Object.assign(record, req.body);
    await record.save();
    res.json({ success: true, message: 'Medical record updated', data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
