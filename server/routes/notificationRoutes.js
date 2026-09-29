const router = require('express').Router();
const c = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, c.getNotifications);
router.patch('/:id/read', protect, c.markAsRead);
router.patch('/read-all', protect, c.markAllAsRead);
router.delete('/:id', protect, c.deleteNotification);

module.exports = router;
