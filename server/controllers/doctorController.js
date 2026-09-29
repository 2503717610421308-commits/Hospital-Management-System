const Doctor = require('../models/Doctor');
const User = require('../models/User');

// @desc    Get all doctors
exports.getDoctors = async (req, res) => {
  try {
    const { search, specialization, departmentId, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { doctorId: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }
    if (specialization) query.specialization = { $regex: specialization, $options: 'i' };
    if (departmentId) query.departmentId = departmentId;

    const total = await Doctor.countDocuments(query);
    const doctors = await Doctor.find(query)
      .populate('departmentId', 'departmentName')
      .populate('userId', 'name email isActive')
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: doctors, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get doctor by ID
exports.getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('departmentId', 'departmentName')
      .populate('userId', 'name email isActive');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get doctor by userId
exports.getDoctorByUserId = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.params.userId })
      .populate('departmentId', 'departmentName');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create doctor
exports.createDoctor = async (req, res) => {
  try {
    const { name, email, password, phone, specialization, departmentId, experience, consultationFee } = req.body;
    if (!name || !email || !password || !phone || !specialization) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password, role: 'doctor', phone });
    const doctor = await Doctor.create({
      userId: user._id, name, phone, email, specialization,
      departmentId: departmentId || undefined,
      experience: experience || 0,
      consultationFee: consultationFee || 500
    });

    res.status(201).json({ success: true, message: 'Doctor created successfully', data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update doctor
exports.updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    Object.assign(doctor, req.body);
    await doctor.save();

    if (req.body.name) {
      await User.findByIdAndUpdate(doctor.userId, { name: req.body.name, phone: req.body.phone });
    }

    res.json({ success: true, message: 'Doctor updated', data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete doctor
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    await User.findByIdAndUpdate(doctor.userId, { isActive: false });
    await Doctor.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Doctor removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
