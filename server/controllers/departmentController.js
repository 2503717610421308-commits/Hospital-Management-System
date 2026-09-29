const Department = require('../models/Department');

exports.getDepartments = async (req, res) => {
  try {
    const { search } = req.query;
    const query = {};
    if (search) query.departmentName = { $regex: search, $options: 'i' };
    const departments = await Department.find(query).populate('headDoctor', 'name specialization').sort({ departmentName: 1 });
    res.json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate('headDoctor', 'name specialization');
    if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { departmentName, description, location } = req.body;
    if (!departmentName) return res.status(400).json({ success: false, message: 'Department name is required' });
    const department = await Department.create({ departmentName, description, location });
    res.status(201).json({ success: true, message: 'Department created', data: department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, message: 'Department updated', data: department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, message: 'Department removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
