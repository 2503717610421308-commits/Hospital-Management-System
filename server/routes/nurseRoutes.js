const router = require('express').Router();
const c = require('../controllers/nurseController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, authorize('admin'), c.getNurses);
router.get('/:id', protect, authorize('admin', 'nurse'), c.getNurse);
router.post('/', protect, authorize('admin'), c.createNurse);
router.put('/:id', protect, authorize('admin', 'nurse'), c.updateNurse);
router.delete('/:id', protect, authorize('admin'), c.deleteNurse);

module.exports = router;
