const router = require('express').Router();
const c = require('../controllers/medicalRecordController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, c.getMedicalRecords);
router.get('/:id', protect, c.getMedicalRecord);
router.post('/', protect, authorize('admin', 'doctor'), c.createMedicalRecord);
router.put('/:id', protect, authorize('admin', 'doctor', 'nurse'), c.updateMedicalRecord);

module.exports = router;
