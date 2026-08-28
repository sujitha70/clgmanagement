const mongoose = require('mongoose');
const { STATUSES, PRIORITIES } = require('../config/constants');

const timelineEntrySchema = new mongoose.Schema({
  status: { type: String, required: true },
  updatedBy: { type: String, required: true },
  role: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String }
}, { _id: false });

const commentSchema = new mongoose.Schema({
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  authorRole: { type: String, required: true },
  text: { type: String, required: true },
  isInternal: { type: Boolean, default: false }, // Internal staff/admin note vs public
  createdAt: { type: Date, default: Date.now }
});

const complaintSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  department: { type: String, required: true, index: true },
  location: { type: String, default: 'Main Campus' },
  priority: {
    type: String,
    enum: [PRIORITIES.LOW, PRIORITIES.MEDIUM, PRIORITIES.HIGH, PRIORITIES.CRITICAL],
    default: PRIORITIES.MEDIUM,
    index: true
  },
  status: {
    type: String,
    enum: [
      STATUSES.SUBMITTED,
      STATUSES.UNDER_REVIEW,
      STATUSES.ASSIGNED,
      STATUSES.IN_PROGRESS,
      STATUSES.RESOLVED,
      STATUSES.CLOSED
    ],
    default: STATUSES.SUBMITTED,
    index: true
  },
  studentId: { type: String, required: true, index: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String },
  studentRollNumber: { type: String },
  studentPhone: { type: String },
  isAnonymous: { type: Boolean, default: false },

  assignedStaffId: { type: String },
  assignedStaffName: { type: String },

  attachments: [{
    url: String,
    filename: String,
    fileType: String,
    size: Number
  }],

  timeline: [timelineEntrySchema],
  comments: [commentSchema],

  resolutionDetails: {
    resolvedAt: Date,
    resolvedBy: String,
    resolvedById: String,
    resolutionNotes: String,
    proofUrl: String,
    closedAt: Date
  },

  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    submittedAt: Date
  },

  aiAnalysis: {
    suggestedCategory: String,
    suggestedPriority: String,
    urgencyScore: Number,
    sentiment: String,
    summary: String,
    isPotentialDuplicate: Boolean,
    duplicateTicketId: String,
    duplicateSimilarity: Number
  },

  slaDeadline: { type: Date, index: true },
  isEscalated: { type: Boolean, default: false, index: true },
  escalatedAt: Date,
  escalationReason: String,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', complaintSchema);
