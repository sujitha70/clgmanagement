const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../config/constants');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: {
    type: String,
    enum: [ROLES.STUDENT, ROLES.STAFF, ROLES.ADMIN, ROLES.SUPER_ADMIN],
    default: ROLES.STUDENT
  },
  rollNumber: { type: String, trim: true },
  department: { type: String, trim: true },
  semester: { type: String },
  hostelBlock: { type: String },
  roomNumber: { type: String },
  phone: { type: String },
  avatar: { type: String },
  isStaff: { type: Boolean, default: false },
  assignedDepartment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
