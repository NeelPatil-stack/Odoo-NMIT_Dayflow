const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const {
  checkIn, checkOut, getAttendance, getTodayStatus,
  requestCorrection, getRegularizationRequests, reviewRegularization,
} = require('../controllers/attendanceController');

router.get('/', authenticateUser, getAttendance);
router.get('/today', authenticateUser, getTodayStatus);
router.post('/checkin', authenticateUser, authorizeRoles('employee'), checkIn);
router.post('/checkout', authenticateUser, authorizeRoles('employee'), checkOut);

// Regularization
router.get('/regularization', authenticateUser, getRegularizationRequests);
router.post('/regularization', authenticateUser, authorizeRoles('employee'), requestCorrection);
router.patch('/regularization/:id/review', authenticateUser, authorizeRoles('admin', 'hr'), reviewRegularization);

module.exports = router;
