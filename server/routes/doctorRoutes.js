const router = require('express').Router();
const { getDoctors, getDoctor, getDoctorByUserId, createDoctor, updateDoctor, deleteDoctor } = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, getDoctors);
router.get('/user/:userId', protect, getDoctorByUserId);
router.get('/:id', protect, getDoctor);
router.post('/', protect, authorize('admin'), createDoctor);
router.put('/:id', protect, authorize('admin', 'doctor'), updateDoctor);
router.delete('/:id', protect, authorize('admin'), deleteDoctor);

module.exports = router;
