const Nurse = require('../models/Nurse');
const User = require('../models/User');

exports.getNurses = async (req, res) => {
  try {
    const { search, shift, departmentId } = req.query;
    const query = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { nurseId: { $regex: search, $options: 'i' } }];
    if (shift) query.shift = shift;
    if (departmentId) query.departmentId = departmentId;

    const nurses = await Nurse.find(query).populate('departmentId', 'departmentName').populate('userId', 'name email isActive').sort({ name: 1 });
    res.json({ success: true, data: nurses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getNurse = async (req, res) => {
  try {
    const nurse = await Nurse.findById(req.params.id).populate('departmentId', 'departmentName').populate('userId', 'name email isActive');
    if (!nurse) return res.status(404).json({ success: false, message: 'Nurse not found' });
    res.json({ success: true, data: nurse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createNurse = async (req, res) => {
  try {
    const { name, email, password, phone, shift, departmentId } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password, role: 'nurse', phone });
    const nurse = await Nurse.create({ userId: user._id, name, phone, shift: shift || 'Morning', departmentId: departmentId || undefined });

    res.status(201).json({ success: true, message: 'Nurse created successfully', data: nurse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateNurse = async (req, res) => {
  try {
    const nurse = await Nurse.findById(req.params.id);
    if (!nurse) return res.status(404).json({ success: false, message: 'Nurse not found' });
    Object.assign(nurse, req.body);
    await nurse.save();
    if (req.body.name) await User.findByIdAndUpdate(nurse.userId, { name: req.body.name, phone: req.body.phone });
    res.json({ success: true, message: 'Nurse updated', data: nurse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteNurse = async (req, res) => {
  try {
    const nurse = await Nurse.findById(req.params.id);
    if (!nurse) return res.status(404).json({ success: false, message: 'Nurse not found' });
    await User.findByIdAndUpdate(nurse.userId, { isActive: false });
    await Nurse.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Nurse removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
