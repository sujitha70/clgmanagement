const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateStatus,
  assignComplaint,
  addComment,
  rateResolution,
  getAITriage
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { ROLES } = require('../config/constants');

// AI Triage route (can be called before submitting)
router.post('/ai-triage', getAITriage);

// Student complaints
router.post('/', protect, upload.array('attachments', 5), createComplaint);
router.get('/my', protect, getMyComplaints);
router.get('/:id', protect, getComplaintById);

// Comments & Feedback
router.post('/:id/comments', protect, addComment);
router.post('/:id/rate', protect, restrictTo(ROLES.STUDENT), rateResolution);

// Staff / Admin lifecycle routes
router.patch('/:id/status', protect, restrictTo(ROLES.STAFF, ROLES.ADMIN, ROLES.SUPER_ADMIN), updateStatus);
router.patch('/:id/assign', protect, restrictTo(ROLES.STAFF, ROLES.ADMIN, ROLES.SUPER_ADMIN), assignComplaint);

module.exports = router;
