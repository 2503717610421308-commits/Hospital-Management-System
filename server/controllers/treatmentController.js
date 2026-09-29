const Treatment = require('../models/Treatment');

exports.getTreatments = async (req, res) => {
  try {
    const { patientId, doctorId } = req.query;
    const query = {};
    if (patientId) query.patientId = patientId;
    if (doctorId) query.doctorId = doctorId;

    const treatments = await Treatment.find(query)
      .populate('patientId', 'name patientId')
      .populate('doctorId', 'name doctorId specialization')
      .populate('appointmentId', 'appointmentId appointmentDate')
      .populate('prescriptionId', 'prescriptionId')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: treatments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTreatment = async (req, res) => {
  try {
    const treatment = await Treatment.findById(req.params.id)
      .populate('patientId', 'name patientId')
      .populate('doctorId', 'name doctorId specialization')
      .populate('prescriptionId');
    if (!treatment) return res.status(404).json({ success: false, message: 'Treatment not found' });
    res.json({ success: true, data: treatment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createTreatment = async (req, res) => {
  try {
    const { patientId, doctorId, diagnosis } = req.body;
    if (!patientId || !doctorId || !diagnosis) {
      return res.status(400).json({ success: false, message: 'Patient, doctor and diagnosis are required' });
    }
    const treatment = await Treatment.create(req.body);
    res.status(201).json({ success: true, message: 'Treatment created', data: treatment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTreatment = async (req, res) => {
  try {
    const treatment = await Treatment.findById(req.params.id);
    if (!treatment) return res.status(404).json({ success: false, message: 'Treatment not found' });
    Object.assign(treatment, req.body);
    await treatment.save();
    res.json({ success: true, message: 'Treatment updated', data: treatment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
