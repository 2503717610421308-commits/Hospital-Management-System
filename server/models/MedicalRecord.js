const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  recordId: { type: String, unique: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  diagnosis: { type: String, required: true },
  symptoms: [{ type: String }],
  treatment: { type: String },
  notes: { type: String },
  vitals: {
    bloodPressure: String,
    heartRate: String,
    temperature: String,
    weight: String,
    height: String,
    oxygenSaturation: String
  },
  testResults: [{ testName: String, result: String, date: Date, notes: String }]
}, { timestamps: true });

medicalRecordSchema.pre('save', async function (next) {
  if (!this.recordId) {
    const count = await mongoose.model('MedicalRecord').countDocuments();
    this.recordId = 'MR-' + String(count + 1).padStart(6, '0');
  }
  next();
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
