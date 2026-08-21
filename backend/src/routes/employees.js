const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const {
  getEmployees, getEmployee, createEmployee, updateEmployee, updateEmployeeStatus,
} = require('../controllers/employeeController');

router.get('/', authenticateUser, getEmployees);
router.get('/:id', authenticateUser, getEmployee);
router.post('/', authenticateUser, authorizeRoles('admin', 'hr'), createEmployee);
router.put('/:id', authenticateUser, updateEmployee);
router.patch('/:id/status', authenticateUser, authorizeRoles('admin', 'hr'), updateEmployeeStatus);

module.exports = router;
