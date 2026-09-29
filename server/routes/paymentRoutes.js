const router = require('express').Router();
const c = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, c.processPayment);
router.get('/', protect, c.getPayments);
router.get('/:id', protect, c.getPayment);

module.exports = router;
