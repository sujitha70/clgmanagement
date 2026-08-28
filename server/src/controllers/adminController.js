const inMemoryStore = require('../store/inMemoryStore');
const { STATUSES, PRIORITIES } = require('../config/constants');

// @desc    Get all complaints with multi-faceted filtering & search
// @route   GET /api/admin/complaints
// @access  Private (Staff / Admin)
const getAllComplaints = async (req, res, next) => {
  try {
    const { status, department, priority, search, isEscalated, assignedStaffId } = req.query;

    const complaints = await inMemoryStore.getAllComplaints({
      status,
      department,
      priority,
      search,
      isEscalated,
      assignedStaffId: req.user.role === 'staff' && req.query.onlyMyTasks === 'true' ? req.user._id : assignedStaffId
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

// @desc    Get all escalated & urgent complaints
// @route   GET /api/admin/escalations
// @access  Private (Admin)
const getEscalations = async (req, res, next) => {
  try {
    const all = await inMemoryStore.getAllComplaints();
    const escalations = all.filter(c =>
      (c.isEscalated || c.priority === PRIORITIES.CRITICAL) &&
      c.status !== STATUSES.RESOLVED &&
      c.status !== STATUSES.CLOSED
    );

    res.json({
      success: true,
      count: escalations.length,
      escalations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk update complaint statuses
// @route   POST /api/admin/bulk-status
// @access  Private (Admin)
const bulkUpdateStatus = async (req, res, next) => {
  try {
    const { ticketIds, status, note } = req.body;

    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0 || !status) {
      return res.status(400).json({ success: false, message: 'Please provide ticketIds array and target status.' });
    }

    const updatedTickets = [];
    const now = new Date();

    for (const tid of ticketIds) {
      const cmp = await inMemoryStore.findComplaintById(tid);
      if (cmp) {
        const timeline = [...(cmp.timeline || []), {
          status,
          updatedBy: req.user.name,
          role: req.user.role,
          timestamp: now,
          note: note || `Bulk status update to ${status}.`
        }];

        const updated = await inMemoryStore.updateComplaint(cmp._id, {
          status,
          timeline,
          updatedAt: now
        });
        updatedTickets.push(updated);
      }
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('bulk_updated', { ticketIds, status });
    }

    res.json({
      success: true,
      updatedCount: updatedTickets.length,
      updatedTickets,
      message: `Successfully updated ${updatedTickets.length} ticket(s) to ${status}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all staff members
// @route   GET /api/admin/staff
// @access  Private (Staff / Admin)
const getStaffList = async (req, res, next) => {
  try {
    const { department } = req.query;
    const staff = await inMemoryStore.getAllStaff(department);
    const safeStaff = staff.map(({ password, ...s }) => s);

    res.json({
      success: true,
      staff: safeStaff
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all departments
// @route   GET /api/admin/departments
// @access  Public / Private
const getDepartments = async (req, res, next) => {
  try {
    const departments = await inMemoryStore.getAllDepartments();
    res.json({
      success: true,
      departments
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllComplaints,
  getEscalations,
  bulkUpdateStatus,
  getStaffList,
  getDepartments
};
