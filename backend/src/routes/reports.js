const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const {
  attendanceReport, leaveReport, employeeReport, payrollReport,
  dashboardAnalytics, monthlyAttendanceTrend,
} = require('../controllers/reportsController');

router.get('/dashboard', authenticateUser, authorizeRoles('admin', 'hr'), dashboardAnalytics);
router.get('/attendance-trend', authenticateUser, authorizeRoles('admin', 'hr'), monthlyAttendanceTrend);
router.get('/attendance', authenticateUser, authorizeRoles('admin', 'hr'), attendanceReport);
router.get('/leave', authenticateUser, authorizeRoles('admin', 'hr'), leaveReport);
router.get('/employees', authenticateUser, authorizeRoles('admin', 'hr'), employeeReport);
router.get('/payroll', authenticateUser, authorizeRoles('admin', 'hr'), payrollReport);

module.exports = router;
