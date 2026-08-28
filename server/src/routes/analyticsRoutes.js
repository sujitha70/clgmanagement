const express = require('express');
const router = express.Router();
const { getOverviewStats, exportCSV } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const { ROLES } = require('../config/constants');

router.get('/overview', protect, restrictTo(ROLES.STAFF, ROLES.ADMIN, ROLES.SUPER_ADMIN), getOverviewStats);
router.get('/export', protect, restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN), exportCSV);

module.exports = router;
