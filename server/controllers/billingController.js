const Bill = require('../models/Bill');
const Patient = require('../models/Patient');
const Notification = require('../models/Notification');

exports.getBills = async (req, res) => {
  try {
    const { patientId, paymentStatus } = req.query;
    const query = {};
    if (patientId) query.patientId = patientId;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (patient) query.patientId = patient._id;
    }

    const bills = await Bill.find(query)
      .populate('patientId', 'name patientId phone email')
      .populate('appointmentId', 'appointmentId appointmentDate doctorId')
      .sort({ billDate: -1 });

    res.json({ success: true, data: bills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('patientId', 'name patientId phone email address dateOfBirth gender')
      .populate({ path: 'appointmentId', populate: { path: 'doctorId', select: 'name doctorId specialization consultationFee' } });
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, data: bill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBill = async (req, res) => {
  try {
    const { patientId, appointmentId, items, tax, discount } = req.body;
    if (!patientId || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Patient and at least one item are required' });
    }

    const bill = await Bill.create({
      patientId, appointmentId, items, tax: tax || 0, discount: discount || 0
    });

    const patient = await Patient.findById(patientId);
    if (patient) {
      await Notification.create({
        userId: patient.userId, title: 'Bill Generated',
        message: `Bill ${bill.billId} of ₹${bill.totalAmount} has been generated.`,
        type: 'billing'
      });
    }

    res.status(201).json({ success: true, message: 'Bill generated', data: bill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    if (req.body.items) bill.items = req.body.items;
    if (req.body.tax !== undefined) bill.tax = req.body.tax;
    if (req.body.discount !== undefined) bill.discount = req.body.discount;
    if (req.body.paymentStatus) bill.paymentStatus = req.body.paymentStatus;
    await bill.save();
    res.json({ success: true, message: 'Bill updated', data: bill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
