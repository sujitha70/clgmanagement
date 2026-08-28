const express = require('express');
const router = express.Router();
const {
  getAllComplaints,
  getEscalations,
  bulkUpdateStatus,
  getStaffList,
  getDepartments
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const { ROLES } = require('../config/constants');

// Public departments list
router.get('/departments', getDepartments);

// Staff and Admin routes
router.get('/complaints', protect, restrictTo(ROLES.STAFF, ROLES.ADMIN, ROLES.SUPER_ADMIN), getAllComplaints);
router.get('/escalations', protect, restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN), getEscalations);
router.post('/bulk-status', protect, restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN), bulkUpdateStatus);
router.get('/staff', protect, restrictTo(ROLES.STAFF, ROLES.ADMIN, ROLES.SUPER_ADMIN), getStaffList);

module.exports = router;
