const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId: { type: String, unique: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  appointmentDate: { type: Date, required: true },
  appointmentTime: { type: String, required: true },
  reason: { type: String },
  tokenNumber: { type: Number },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected', 'In-Progress'],
    default: 'Pending'
  },
  notes: { type: String }
}, { timestamps: true });

appointmentSchema.pre('save', async function (next) {
  if (!this.appointmentId) {
    const count = await mongoose.model('Appointment').countDocuments();
    this.appointmentId = 'APT-' + String(count + 1).padStart(6, '0');
  }
  if (!this.tokenNumber) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await mongoose.model('Appointment').countDocuments({
      appointmentDate: { $gte: today, $lt: new Date(today.getTime() + 86400000) }
    });
    this.tokenNumber = todayCount + 1;
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
