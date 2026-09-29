const router = require('express').Router();
const c = require('../controllers/receptionistController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, authorize('admin'), c.getReceptionists);
router.get('/:id', protect, authorize('admin', 'receptionist'), c.getReceptionist);
router.post('/', protect, authorize('admin'), c.createReceptionist);
router.put('/:id', protect, authorize('admin', 'receptionist'), c.updateReceptionist);
router.delete('/:id', protect, authorize('admin'), c.deleteReceptionist);

module.exports = router;
