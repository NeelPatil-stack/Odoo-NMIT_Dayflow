const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const { applyLeave, getLeaves, reviewLeave, cancelLeave, getLeaveBalances, updateLeaveBalance } = require('../controllers/leaveController');

router.get('/', authenticateUser, getLeaves);
router.post('/', authenticateUser, authorizeRoles('employee'), applyLeave);
router.patch('/:id/review', authenticateUser, authorizeRoles('admin', 'hr'), reviewLeave);
router.patch('/:id/cancel', authenticateUser, authorizeRoles('employee'), cancelLeave);

// Leave Balances
router.get('/balances', authenticateUser, getLeaveBalances);
router.put('/balances/:employeeId', authenticateUser, authorizeRoles('admin', 'hr'), updateLeaveBalance);

module.exports = router;
