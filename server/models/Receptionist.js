const mongoose = require('mongoose');

const receptionistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receptionistId: { type: String, unique: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  shift: { type: String, enum: ['Morning', 'Afternoon', 'Night'], default: 'Morning' }
}, { timestamps: true });

receptionistSchema.pre('save', async function (next) {
  if (!this.receptionistId) {
    const count = await mongoose.model('Receptionist').countDocuments();
    this.receptionistId = 'REC-' + String(count + 1).padStart(5, '0');
  }
  next();
});

module.exports = mongoose.model('Receptionist', receptionistSchema);
