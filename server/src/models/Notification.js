const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  recipientId: { type: String, required: true, index: true }, // User ID or 'admin' or 'dept_{id}'
  recipientRole: { type: String },
  title: { type: String, required: true },
  message: { type: String, required: true },
  ticketId: { type: String },
  type: {
    type: String,
    enum: ['STATUS_CHANGE', 'ASSIGNMENT', 'COMMENT', 'ESCALATION', 'FEEDBACK', 'ALERT'],
    default: 'STATUS_CHANGE'
  },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
