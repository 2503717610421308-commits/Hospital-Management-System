const router = require('express').Router();
const c = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/dashboard', protect, c.getDashboardStats);
router.get('/appointments', protect, authorize('admin'), c.getAppointmentReport);
router.get('/revenue', protect, authorize('admin'), c.getRevenueReport);
router.get('/patients', protect, authorize('admin'), c.getPatientReport);

module.exports = router;
