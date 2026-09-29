const router = require('express').Router();
const c = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, c.getDepartments);
router.get('/:id', protect, c.getDepartment);
router.post('/', protect, authorize('admin'), c.createDepartment);
router.put('/:id', protect, authorize('admin'), c.updateDepartment);
router.delete('/:id', protect, authorize('admin'), c.deleteDepartment);

module.exports = router;
