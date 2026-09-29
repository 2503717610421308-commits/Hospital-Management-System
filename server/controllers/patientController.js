const Patient = require('../models/Patient');
const User = require('../models/User');

// @desc    Get all patients
exports.getPatients = async (req, res) => {
  try {
    const { search, bloodGroup, gender, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (gender) query.gender = gender;

    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .populate('userId', 'name email role isActive')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: patients, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get patient by ID
exports.getPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('userId', 'name email role isActive');
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get patient by userId
exports.getPatientByUserId = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.params.userId }).populate('userId', 'name email role isActive');
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create patient (by receptionist/admin)
exports.createPatient = async (req, res) => {
  try {
    const { name, email, password, phone, dateOfBirth, gender, address, bloodGroup } = req.body;
    if (!name || !email || !password || !phone || !dateOfBirth || !gender) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password, role: 'patient', phone });
    const patient = await Patient.create({
      userId: user._id, name, phone, email, dateOfBirth, gender,
      address: address || '', bloodGroup: bloodGroup || ''
    });

    res.status(201).json({ success: true, message: 'Patient registered successfully', data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update patient
exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    Object.assign(patient, req.body);
    await patient.save();

    if (req.body.name) {
      await User.findByIdAndUpdate(patient.userId, { name: req.body.name, phone: req.body.phone });
    }

    res.json({ success: true, message: 'Patient updated', data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete patient
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    await User.findByIdAndUpdate(patient.userId, { isActive: false });
    await Patient.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Patient removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
