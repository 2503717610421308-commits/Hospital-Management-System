const router = require('express').Router();
const c = require('../controllers/medicineController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, c.getMedicines);
router.get('/:id', protect, c.getMedicine);
router.post('/', protect, authorize('admin'), c.createMedicine);
router.put('/:id', protect, authorize('admin'), c.updateMedicine);
router.delete('/:id', protect, authorize('admin'), c.deleteMedicine);

module.exports = router;
