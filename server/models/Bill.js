const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  billId: { type: String, unique: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  items: [{
    description: { type: String, required: true },
    category: { type: String, enum: ['Consultation', 'Medicine', 'Lab', 'Room', 'Other'], default: 'Other' },
    amount: { type: Number, required: true }
  }],
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
  billDate: { type: Date, default: Date.now }
}, { timestamps: true });

billSchema.pre('save', async function (next) {
  if (!this.billId) {
    const count = await mongoose.model('Bill').countDocuments();
    this.billId = 'BILL-' + String(count + 1).padStart(6, '0');
  }
  this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
  this.totalAmount = this.subtotal + this.tax - this.discount;
  next();
});

module.exports = mongoose.model('Bill', billSchema);
