const Medicine = require('../models/Medicine');

exports.getMedicines = async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = {};
    if (search) query.medicineName = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    const medicines = await Medicine.find(query).sort({ medicineName: 1 });
    res.json({ success: true, data: medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, data: medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createMedicine = async (req, res) => {
  try {
    const { medicineName, price } = req.body;
    if (!medicineName || price === undefined) {
      return res.status(400).json({ success: false, message: 'Medicine name and price are required' });
    }
    if (price < 0) return res.status(400).json({ success: false, message: 'Price must be positive' });
    const medicine = await Medicine.create(req.body);
    res.status(201).json({ success: true, message: 'Medicine added', data: medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMedicine = async (req, res) => {
  try {
    if (req.body.price !== undefined && req.body.price < 0) {
      return res.status(400).json({ success: false, message: 'Price must be positive' });
    }
    if (req.body.stock !== undefined && req.body.stock < 0) {
      return res.status(400).json({ success: false, message: 'Stock cannot be negative' });
    }
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, message: 'Medicine updated', data: medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, message: 'Medicine deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
