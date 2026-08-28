const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  icon: { type: String, default: 'Building' },
  headName: { type: String },
  headEmail: { type: String },
  slaHoursMultiplier: { type: Number, default: 1.0 },
  activeTicketsCount: { type: Number, default: 0 },
  resolvedTicketsCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Department', departmentSchema);
