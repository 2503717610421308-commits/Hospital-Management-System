const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema({
  treatmentId: { type: String, unique: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  diagnosis: { type: String, required: true },
  description: { type: String },
  cost: { type: Number, default: 0 },
  prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  status: { type: String, enum: ['Ongoing', 'Completed', 'Cancelled'], default: 'Ongoing' }
}, { timestamps: true });

treatmentSchema.pre('save', async function (next) {
  if (!this.treatmentId) {
    const count = await mongoose.model('Treatment').countDocuments();
    this.treatmentId = 'TRT-' + String(count + 1).padStart(6, '0');
  }
  next();
});

module.exports = mongoose.model('Treatment', treatmentSchema);
