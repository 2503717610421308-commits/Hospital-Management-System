const Receptionist = require('../models/Receptionist');
const User = require('../models/User');

exports.getReceptionists = async (req, res) => {
  try {
    const receptionists = await Receptionist.find().populate('userId', 'name email isActive').sort({ name: 1 });
    res.json({ success: true, data: receptionists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReceptionist = async (req, res) => {
  try {
    const receptionist = await Receptionist.findById(req.params.id).populate('userId', 'name email isActive');
    if (!receptionist) return res.status(404).json({ success: false, message: 'Receptionist not found' });
    res.json({ success: true, data: receptionist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createReceptionist = async (req, res) => {
  try {
    const { name, email, password, phone, shift } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password, role: 'receptionist', phone });
    const receptionist = await Receptionist.create({ userId: user._id, name, phone, shift: shift || 'Morning' });

    res.status(201).json({ success: true, message: 'Receptionist created successfully', data: receptionist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateReceptionist = async (req, res) => {
  try {
    const receptionist = await Receptionist.findById(req.params.id);
    if (!receptionist) return res.status(404).json({ success: false, message: 'Receptionist not found' });
    Object.assign(receptionist, req.body);
    await receptionist.save();
    if (req.body.name) await User.findByIdAndUpdate(receptionist.userId, { name: req.body.name, phone: req.body.phone });
    res.json({ success: true, message: 'Receptionist updated', data: receptionist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteReceptionist = async (req, res) => {
  try {
    const receptionist = await Receptionist.findById(req.params.id);
    if (!receptionist) return res.status(404).json({ success: false, message: 'Receptionist not found' });
    await User.findByIdAndUpdate(receptionist.userId, { isActive: false });
    await Receptionist.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Receptionist removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
