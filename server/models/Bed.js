const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  bedId: { type: String, unique: true },
  bedNumber: { type: String, required: true },
  wardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ward', required: true },
  status: { type: String, enum: ['Available', 'Occupied', 'Reserved', 'Maintenance'], default: 'Available' },
  charges: { type: Number, default: 0 },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }
}, { timestamps: true });

bedSchema.pre('save', async function (next) {
  if (!this.bedId) {
    const count = await mongoose.model('Bed').countDocuments();
    this.bedId = 'BED-' + String(count + 1).padStart(4, '0');
  }
  next();
});

module.exports = mongoose.model('Bed', bedSchema);
