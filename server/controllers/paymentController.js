const Payment = require('../models/Payment');
const Bill = require('../models/Bill');
const Patient = require('../models/Patient');
const Notification = require('../models/Notification');

// @desc    Process payment (simulated gateway)
exports.processPayment = async (req, res) => {
  try {
    const { billId, patientId, amount, paymentMethod } = req.body;
    if (!billId || !patientId || !amount || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'All payment fields are required' });
    }

    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    if (bill.paymentStatus === 'Paid') {
      return res.status(400).json({ success: false, message: 'Bill is already paid' });
    }

    // Simulate payment gateway - 95% success rate
    const isSuccess = Math.random() < 0.95;

    const payment = await Payment.create({
      billId, patientId, amount, paymentMethod,
      status: isSuccess ? 'Completed' : 'Failed'
    });

    if (isSuccess) {
      bill.paymentStatus = 'Paid';
      await bill.save();

      const patient = await Patient.findById(patientId);
      if (patient) {
        await Notification.create({
          userId: patient.userId,
          title: 'Payment Successful',
          message: `Payment of ₹${amount} for bill ${bill.billId} was successful. Transaction: ${payment.transactionId}`,
          type: 'billing'
        });
      }
    }

    res.status(201).json({
      success: true,
      message: isSuccess ? 'Payment successful' : 'Payment failed. Please try again.',
      data: payment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payment by ID
exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('billId')
      .populate('patientId', 'name patientId');
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all payments
exports.getPayments = async (req, res) => {
  try {
    const { patientId, status } = req.query;
    const query = {};
    if (patientId) query.patientId = patientId;
    if (status) query.status = status;

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (patient) query.patientId = patient._id;
    }

    const payments = await Payment.find(query)
      .populate('billId', 'billId totalAmount')
      .populate('patientId', 'name patientId')
      .sort({ paymentDate: -1 });

    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
