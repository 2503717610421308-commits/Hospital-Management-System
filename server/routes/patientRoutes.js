const router = require('express').Router();
const { getPatients, getPatient, getPatientByUserId, createPatient, updatePatient, deletePatient } = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, authorize('admin', 'receptionist', 'doctor', 'nurse'), getPatients);
router.get('/user/:userId', protect, getPatientByUserId);
router.get('/:id', protect, getPatient);
router.post('/', protect, authorize('admin', 'receptionist'), createPatient);
router.put('/:id', protect, authorize('admin', 'receptionist', 'patient'), updatePatient);
router.delete('/:id', protect, authorize('admin'), deletePatient);

module.exports = router;
