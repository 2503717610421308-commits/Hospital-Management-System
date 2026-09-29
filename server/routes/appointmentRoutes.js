const router = require('express').Router();
const c = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/availability', protect, c.checkAvailability);
router.get('/', protect, c.getAppointments);
router.get('/:id', protect, c.getAppointment);
router.post('/', protect, authorize('admin', 'receptionist', 'patient'), c.createAppointment);
router.put('/:id', protect, authorize('admin', 'receptionist', 'doctor'), c.updateAppointment);
router.patch('/:id/status', protect, authorize('admin', 'receptionist', 'doctor'), c.updateAppointmentStatus);
router.delete('/:id', protect, authorize('admin', 'receptionist', 'patient'), c.deleteAppointment);

module.exports = router;
