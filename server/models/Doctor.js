const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: String, unique: true },
  name: { type: String, required: true, trim: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  specialization: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  experience: { type: Number, default: 0 },
  consultationFee: { type: Number, default: 500 },
  availability: {
    days: { type: [String], default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '17:00' },
    slotDuration: { type: Number, default: 30 }
  }
}, { timestamps: true });

doctorSchema.pre('save', async function (next) {
  if (!this.doctorId) {
    const count = await mongoose.model('Doctor').countDocuments();
    this.doctorId = 'DOC-' + String(count + 1).padStart(5, '0');
  }
  next();
});

module.exports = mongoose.model('Doctor', doctorSchema);
