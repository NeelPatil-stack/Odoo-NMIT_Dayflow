const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { login, refreshToken, logout, changePassword, forgotPassword, resetPassword, getMe } = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');

// Rate limit auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', authLimiter, login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticateUser, logout);
router.post('/change-password', authenticateUser, changePassword);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authenticateUser, getMe);

module.exports = router;
