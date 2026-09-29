const mongoose = require('mongoose');

const nurseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nurseId: { type: String, unique: true },
  name: { type: String, required: true, trim: true },
  shift: { type: String, enum: ['Morning', 'Afternoon', 'Night'], default: 'Morning' },
  phone: { type: String, required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }
}, { timestamps: true });

nurseSchema.pre('save', async function (next) {
  if (!this.nurseId) {
    const count = await mongoose.model('Nurse').countDocuments();
    this.nurseId = 'NUR-' + String(count + 1).padStart(5, '0');
  }
  next();
});

module.exports = mongoose.model('Nurse', nurseSchema);
