const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const {
  getHolidays, createHoliday, updateHoliday, deleteHoliday,
  getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
  getNotifications, markNotificationRead, markAllNotificationsRead,
} = require('../controllers/communicationsController');

// Holidays
router.get('/holidays', authenticateUser, getHolidays);
router.post('/holidays', authenticateUser, authorizeRoles('admin', 'hr'), createHoliday);
router.put('/holidays/:id', authenticateUser, authorizeRoles('admin', 'hr'), updateHoliday);
router.delete('/holidays/:id', authenticateUser, authorizeRoles('admin', 'hr'), deleteHoliday);

// Announcements
router.get('/announcements', authenticateUser, getAnnouncements);
router.post('/announcements', authenticateUser, authorizeRoles('admin', 'hr'), createAnnouncement);
router.put('/announcements/:id', authenticateUser, authorizeRoles('admin', 'hr'), updateAnnouncement);
router.delete('/announcements/:id', authenticateUser, authorizeRoles('admin', 'hr'), deleteAnnouncement);

// Notifications
router.get('/notifications', authenticateUser, getNotifications);
router.patch('/notifications/:id/read', authenticateUser, markNotificationRead);
router.patch('/notifications/read-all', authenticateUser, markAllNotificationsRead);

module.exports = router;
