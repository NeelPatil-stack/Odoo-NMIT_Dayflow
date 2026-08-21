const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const {
  submitFeedback, getFeedback, updateFeedbackStatus,
  createApplication, getApplications, updateApplicationStatus, resumeUpload,
} = require('../controllers/feedbackRecruitmentController');

// Anonymous Feedback
router.get('/feedback', authenticateUser, authorizeRoles('admin', 'hr'), getFeedback);
router.post('/feedback', authenticateUser, submitFeedback);
router.patch('/feedback/:id', authenticateUser, authorizeRoles('admin', 'hr'), updateFeedbackStatus);

// Recruitment
router.get('/recruitment', authenticateUser, authorizeRoles('admin', 'hr'), getApplications);
router.post('/recruitment', authenticateUser, authorizeRoles('admin', 'hr'), resumeUpload.single('resume'), createApplication);
router.patch('/recruitment/:id', authenticateUser, authorizeRoles('admin', 'hr'), updateApplicationStatus);

module.exports = router;
