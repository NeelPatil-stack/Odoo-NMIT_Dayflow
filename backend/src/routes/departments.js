const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const {
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getDesignations, createDesignation, updateDesignation,
} = require('../controllers/departmentController');

// Departments
router.get('/departments', authenticateUser, getDepartments);
router.post('/departments', authenticateUser, authorizeRoles('admin', 'hr'), createDepartment);
router.put('/departments/:id', authenticateUser, authorizeRoles('admin', 'hr'), updateDepartment);
router.delete('/departments/:id', authenticateUser, authorizeRoles('admin', 'hr'), deleteDepartment);

// Designations
router.get('/designations', authenticateUser, getDesignations);
router.post('/designations', authenticateUser, authorizeRoles('admin', 'hr'), createDesignation);
router.put('/designations/:id', authenticateUser, authorizeRoles('admin', 'hr'), updateDesignation);

module.exports = router;
