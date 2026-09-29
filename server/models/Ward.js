const mongoose = require('mongoose');

const wardSchema = new mongoose.Schema({
  wardId: { type: String, unique: true },
  wardName: { type: String, required: true },
  floor: { type: Number, default: 1 },
  type: { type: String, enum: ['General', 'Private', 'ICU', 'Emergency', 'Pediatric'], default: 'General' },
  capacity: { type: Number, default: 10 },
  availableBeds: { type: Number, default: 10 }
}, { timestamps: true });

wardSchema.pre('save', async function (next) {
  if (!this.wardId) {
    const count = await mongoose.model('Ward').countDocuments();
    this.wardId = 'WARD-' + String(count + 1).padStart(3, '0');
  }
  next();
});

module.exports = mongoose.model('Ward', wardSchema);
