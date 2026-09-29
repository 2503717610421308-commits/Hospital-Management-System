const router = require('express').Router();
const c = require('../controllers/billingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, c.getBills);
router.get('/:id', protect, c.getBill);
router.post('/', protect, authorize('admin', 'receptionist', 'doctor'), c.createBill);
router.put('/:id', protect, authorize('admin', 'receptionist'), c.updateBill);

module.exports = router;
