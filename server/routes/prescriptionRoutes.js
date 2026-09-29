const router = require('express').Router();
const c = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, c.getPrescriptions);
router.get('/:id', protect, c.getPrescription);
router.post('/', protect, authorize('admin', 'doctor'), c.createPrescription);
router.put('/:id', protect, authorize('admin', 'doctor'), c.updatePrescription);
router.patch('/:id/refill', protect, authorize('patient'), c.requestRefill);

module.exports = router;
