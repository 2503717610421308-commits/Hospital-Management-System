const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Notification = require('../models/Notification');

exports.getPrescriptions = async (req, res) => {
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

    const prescriptions = await Prescription.find(query)
      .populate('patientId', 'name patientId')
      .populate('doctorId', 'name doctorId specialization')
      .populate('appointmentId', 'appointmentId appointmentDate')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patientId', 'name patientId phone email dateOfBirth gender')
      .populate('doctorId', 'name doctorId specialization')
      .populate('appointmentId', 'appointmentId appointmentDate appointmentTime');
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
    res.json({ success: true, data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPrescription = async (req, res) => {
  try {
    const { patientId, doctorId, appointmentId, medicines, instructions } = req.body;
    if (!patientId || !doctorId || !medicines || medicines.length === 0) {
      return res.status(400).json({ success: false, message: 'Patient, doctor and at least one medicine are required' });
    }
    const prescription = await Prescription.create({ patientId, doctorId, appointmentId, medicines, instructions });

    const patient = await Patient.findById(patientId);
    if (patient) {
      await Notification.create({
        userId: patient.userId, title: 'New Prescription',
        message: `A new prescription ${prescription.prescriptionId} has been created for you.`,
        type: 'prescription'
      });
    }

    res.status(201).json({ success: true, message: 'Prescription created', data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
    Object.assign(prescription, req.body);
    await prescription.save();
    res.json({ success: true, message: 'Prescription updated', data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.requestRefill = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
    prescription.refillStatus = 'Requested';
    await prescription.save();
    res.json({ success: true, message: 'Refill requested', data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
