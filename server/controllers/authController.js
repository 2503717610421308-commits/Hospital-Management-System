const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Nurse = require('../models/Nurse');
const Receptionist = require('../models/Receptionist');
const { logActivity } = require('../utils/logger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, dateOfBirth, gender, address, bloodGroup } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ success: false, message: 'User already exists with this email' });
    }

    const userRole = role || 'patient';
    const user = await User.create({ name, email, password, role: userRole, phone });

    // Create role-specific profile
    if (userRole === 'patient') {
      await Patient.create({
        userId: user._id, name, phone, email,
        dateOfBirth: dateOfBirth || new Date('2000-01-01'),
        gender: gender || 'Other',
        address: address || '',
        bloodGroup: bloodGroup || ''
      });
    }

    await logActivity(user._id, 'REGISTER', `New ${userRole} registered: ${email}`, req.ip);

    const token = generateToken(user._id);
    res.status(201).json({
      success: true, message: 'Registration successful',
      data: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, token }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated. Contact admin.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    await logActivity(user._id, 'LOGIN', `User logged in: ${email}`, req.ip);

    const token = generateToken(user._id);
    res.json({
      success: true, message: 'Login successful',
      data: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, token }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;

    if (user.role === 'patient') profile = await Patient.findOne({ userId: user._id });
    else if (user.role === 'doctor') profile = await Doctor.findOne({ userId: user._id }).populate('departmentId');
    else if (user.role === 'nurse') profile = await Nurse.findOne({ userId: user._id }).populate('departmentId');
    else if (user.role === 'receptionist') profile = await Receptionist.findOne({ userId: user._id });

    res.json({ success: true, data: { user, profile } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { name, phone } = req.body;
    if (name) user.name = name;
    if (phone) user.phone = phone;
    await user.save();

    // Update role-specific profile
    if (user.role === 'patient') {
      await Patient.findOneAndUpdate({ userId: user._id }, { ...req.body, name: user.name }, { new: true });
    } else if (user.role === 'doctor') {
      await Doctor.findOneAndUpdate({ userId: user._id }, { ...req.body, name: user.name }, { new: true });
    }

    res.json({ success: true, message: 'Profile updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
