const inMemoryStore = require('../store/inMemoryStore');
const aiTriageService = require('../services/aiTriageService');
const slaEscalationService = require('../services/slaEscalationService');
const { generateTicketId } = require('../utils/ticketGenerator');
const { STATUSES, PRIORITIES } = require('../config/constants');

// @desc    Lodge a new complaint
// @route   POST /api/complaints
// @access  Private (Student/All)
const createComplaint = async (req, res, next) => {
  try {
    const {
      title,
      description,
      department,
      location,
      priority,
      isAnonymous
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Please provide both title and description.' });
    }

    // Run AI analysis
    const aiAnalysis = await aiTriageService.analyzeComplaint(title, description, location || '');

    const resolvedDept = department && department !== 'auto' ? department : aiAnalysis.suggestedCategory;
    const resolvedPriority = priority && priority !== 'auto' ? priority : aiAnalysis.suggestedPriority;

    const ticketId = generateTicketId();
    const createdAt = new Date();
    const slaDeadline = slaEscalationService.calculateDeadline(createdAt, resolvedPriority);

    // Process file attachments if any
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push({
          url: `/uploads/${file.filename}`,
          filename: file.originalname,
          fileType: file.mimetype,
          size: file.size
        });
      });
    }

    const complaintData = {
      ticketId,
      title: title.trim(),
      description: description.trim(),
      department: resolvedDept,
      location: location || 'Main Campus',
      priority: resolvedPriority,
      status: STATUSES.SUBMITTED,
      studentId: req.user._id,
      studentName: isAnonymous === 'true' || isAnonymous === true ? 'Anonymous Student' : req.user.name,
      studentEmail: isAnonymous === 'true' || isAnonymous === true ? '' : req.user.email,
      studentRollNumber: isAnonymous === 'true' || isAnonymous === true ? '' : req.user.rollNumber,
      studentPhone: isAnonymous === 'true' || isAnonymous === true ? '' : req.user.phone,
      isAnonymous: isAnonymous === 'true' || isAnonymous === true,
      attachments,
      timeline: [
        {
          status: STATUSES.SUBMITTED,
          updatedBy: isAnonymous ? 'Anonymous Student' : req.user.name,
          role: req.user.role,
          timestamp: createdAt,
          note: 'Complaint lodged successfully in the portal.'
        }
      ],
      comments: [],
      aiAnalysis,
      slaDeadline,
      isEscalated: false,
      createdAt,
      updatedAt: createdAt
    };

    const newComplaint = await inMemoryStore.createComplaint(complaintData);

    // Create notification for admin & department
    const notif = await inMemoryStore.createNotification({
      recipientId: 'admin',
      recipientRole: 'admin',
      title: `New Ticket: ${ticketId} (${resolvedPriority})`,
      message: `A new grievance has been lodged for ${resolvedDept}: "${title}"`,
      ticketId,
      type: 'STATUS_CHANGE'
    });

    // Real-time broadcast via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('new_complaint', {
        complaint: newComplaint,
        notification: notif
      });
    }

    res.status(201).json({
      success: true,
      complaint: newComplaint,
      message: `Grievance registered successfully with Ticket ID: ${ticketId}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaints lodged by the logged-in student
// @route   GET /api/complaints/my
// @access  Private
const getMyComplaints = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const complaints = await inMemoryStore.getAllComplaints({
      studentId: req.user._id,
      status,
      search
    });

    res.json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint by ID or Ticket ID
// @route   GET /api/complaints/:id
// @access  Public / Private
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await inMemoryStore.findComplaintById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Grievance ticket not found.' });
    }

    // Hide internal comments if caller is a student
    let comments = complaint.comments || [];
    if (req.user && req.user.role === 'student') {
      comments = comments.filter(c => !c.isInternal);
    }

    res.json({
      success: true,
      complaint: {
        ...complaint,
        comments
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status
// @route   PATCH /api/complaints/:id/status
// @access  Private (Staff / Admin)
const updateStatus = async (req, res, next) => {
  try {
    const { status, note, resolutionNotes, proofUrl } = req.body;
    const complaint = await inMemoryStore.findComplaintById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const previousStatus = complaint.status;
    const now = new Date();

    const updates = {
      status,
      updatedAt: now
    };

    // If resolving, populate resolution details
    if (status === STATUSES.RESOLVED) {
      updates.resolutionDetails = {
        resolvedAt: now,
        resolvedBy: req.user.name,
        resolvedById: req.user._id,
        resolutionNotes: resolutionNotes || note || 'Resolved by department staff.',
        proofUrl: proofUrl || ''
      };
    } else if (status === STATUSES.CLOSED) {
      if (!updates.resolutionDetails) {
        updates.resolutionDetails = complaint.resolutionDetails || {};
      }
      updates.resolutionDetails.closedAt = now;
    }

    // Add timeline entry
    const newTimeline = [...(complaint.timeline || []), {
      status,
      updatedBy: req.user.name,
      role: req.user.role,
      timestamp: now,
      note: note || `Status transitioned from ${previousStatus} to ${status}.`
    }];

    updates.timeline = newTimeline;

    const updated = await inMemoryStore.updateComplaint(complaint._id, updates);

    // Create notification for student
    const notif = await inMemoryStore.createNotification({
      recipientId: complaint.studentId,
      recipientRole: 'student',
      title: `Status Updated: ${complaint.ticketId}`,
      message: `Your grievance has been updated to "${status}" by ${req.user.name}.`,
      ticketId: complaint.ticketId,
      type: 'STATUS_CHANGE'
    });

    // Real-time broadcast
    const io = req.app.get('io');
    if (io) {
      io.emit(`complaint_updated_${complaint.ticketId}`, {
        complaint: updated,
        notification: notif
      });
      io.emit('complaint_status_changed', {
        ticketId: complaint.ticketId,
        status,
        updatedBy: req.user.name
      });
    }

    res.json({
      success: true,
      complaint: updated,
      message: `Status successfully updated to ${status}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign complaint to department and staff
// @route   PATCH /api/complaints/:id/assign
// @access  Private (Staff / Admin)
const assignComplaint = async (req, res, next) => {
  try {
    const { department, assignedStaffId, note } = req.body;
    const complaint = await inMemoryStore.findComplaintById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const updates = {};
    let staffName = '';

    if (department) {
      updates.department = department;
    }

    if (assignedStaffId) {
      const staffUser = await inMemoryStore.findUserById(assignedStaffId);
      if (staffUser) {
        updates.assignedStaffId = staffUser._id;
        updates.assignedStaffName = `${staffUser.name} (${staffUser.department || 'Staff'})`;
        staffName = staffUser.name;
      }
    }

    // Advance status to ASSIGNED if currently SUBMITTED or UNDER_REVIEW
    if (complaint.status === STATUSES.SUBMITTED || complaint.status === STATUSES.UNDER_REVIEW) {
      updates.status = STATUSES.ASSIGNED;
    }

    const now = new Date();
    const newTimeline = [...(complaint.timeline || []), {
      status: updates.status || complaint.status,
      updatedBy: req.user.name,
      role: req.user.role,
      timestamp: now,
      note: note || `Assigned to ${staffName || updates.department || 'Department'}`
    }];

    updates.timeline = newTimeline;
    const updated = await inMemoryStore.updateComplaint(complaint._id, updates);

    // Notify student & assigned staff
    await inMemoryStore.createNotification({
      recipientId: complaint.studentId,
      recipientRole: 'student',
      title: `Staff Assigned: ${complaint.ticketId}`,
      message: `Ticket ${complaint.ticketId} has been assigned to ${staffName || 'department specialists'}.`,
      ticketId: complaint.ticketId,
      type: 'ASSIGNMENT'
    });

    const io = req.app.get('io');
    if (io) {
      io.emit(`complaint_updated_${complaint.ticketId}`, { complaint: updated });
    }

    res.json({
      success: true,
      complaint: updated,
      message: 'Assignment updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment or admin internal note
// @route   POST /api/complaints/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { text, isInternal = false } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text cannot be empty.' });
    }

    const complaint = await inMemoryStore.findComplaintById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const newComment = {
      authorId: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
      text: text.trim(),
      isInternal: isInternal === true || isInternal === 'true',
      createdAt: new Date()
    };

    const comments = [...(complaint.comments || []), newComment];
    const updated = await inMemoryStore.updateComplaint(complaint._id, { comments });

    // Notify appropriate recipient
    if (!newComment.isInternal) {
      const recipientId = req.user.role === 'student' ? 'admin' : complaint.studentId;
      await inMemoryStore.createNotification({
        recipientId,
        title: `New Comment on ${complaint.ticketId}`,
        message: `${req.user.name}: "${text.substring(0, 60)}..."`,
        ticketId: complaint.ticketId,
        type: 'COMMENT'
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit(`complaint_updated_${complaint.ticketId}`, { complaint: updated });
    }

    res.status(201).json({
      success: true,
      comment: newComment,
      complaint: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate resolution and close complaint
// @route   POST /api/complaints/:id/rate
// @access  Private (Student)
const rateResolution = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Please provide a valid rating between 1 and 5 stars.' });
    }

    const complaint = await inMemoryStore.findComplaintById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const now = new Date();
    const feedback = {
      rating: Number(rating),
      comment: comment ? comment.trim() : '',
      submittedAt: now
    };

    // Transition to Closed
    const newTimeline = [...(complaint.timeline || []), {
      status: STATUSES.CLOSED,
      updatedBy: req.user.name,
      role: 'student',
      timestamp: now,
      note: `Student rated resolution ${rating}/5 stars and closed the grievance ticket.`
    }];

    const updated = await inMemoryStore.updateComplaint(complaint._id, {
      feedback,
      status: STATUSES.CLOSED,
      timeline: newTimeline
    });

    // Notify admin
    await inMemoryStore.createNotification({
      recipientId: 'admin',
      recipientRole: 'admin',
      title: `Feedback Received (${rating}⭐): ${complaint.ticketId}`,
      message: `Student submitted ${rating}-star rating: "${comment || 'No review comment'}"`,
      ticketId: complaint.ticketId,
      type: 'FEEDBACK'
    });

    const io = req.app.get('io');
    if (io) {
      io.emit(`complaint_updated_${complaint.ticketId}`, { complaint: updated });
    }

    res.json({
      success: true,
      feedback,
      complaint: updated,
      message: 'Thank you for your feedback! The grievance has been marked as Closed.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Live AI Triage & Suggestion
// @route   POST /api/complaints/ai-triage
// @access  Public / Private
const getAITriage = async (req, res, next) => {
  try {
    const { title = '', description = '', location = '' } = req.body;
    const analysis = await aiTriageService.analyzeComplaint(title, description, location);

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateStatus,
  assignComplaint,
  addComment,
  rateResolution,
  getAITriage
};
