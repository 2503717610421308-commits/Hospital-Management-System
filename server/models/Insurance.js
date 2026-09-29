const mongoose = require('mongoose');

const insuranceSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  provider: { type: String, required: true },
  policyNumber: { type: String, required: true },
  coverageAmount: { type: Number, default: 0 },
  validFrom: { type: Date },
  validTo: { type: Date },
  status: { type: String, enum: ['Active', 'Expired', 'Pending', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Insurance', insuranceSchema);
