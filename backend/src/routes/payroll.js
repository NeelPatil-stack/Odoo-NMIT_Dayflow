const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const { createSalaryStructure, getSalaryStructure, generatePayroll, getPayroll, updatePayrollStatus } = require('../controllers/payrollController');

router.get('/', authenticateUser, getPayroll);
router.post('/generate', authenticateUser, authorizeRoles('admin', 'hr'), generatePayroll);
router.patch('/:id/status', authenticateUser, authorizeRoles('admin', 'hr'), updatePayrollStatus);

// Salary structures
router.get('/salary/:employeeId', authenticateUser, getSalaryStructure);
router.post('/salary', authenticateUser, authorizeRoles('admin', 'hr'), createSalaryStructure);

module.exports = router;
