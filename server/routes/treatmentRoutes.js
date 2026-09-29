const router = require('express').Router();
const c = require('../controllers/treatmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, c.getTreatments);
router.get('/:id', protect, c.getTreatment);
router.post('/', protect, authorize('admin', 'doctor'), c.createTreatment);
router.put('/:id', protect, authorize('admin', 'doctor'), c.updateTreatment);

module.exports = router;
