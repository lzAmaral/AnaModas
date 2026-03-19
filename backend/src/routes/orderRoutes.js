const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.getAll.bind(orderController));
router.get('/:id', orderController.getById.bind(orderController));
router.post('/', orderController.create.bind(orderController));
router.put('/:id/status', orderController.updateStatus.bind(orderController));
router.put('/:id/payment', orderController.updatePaymentStatus.bind(orderController));
router.delete('/:id', orderController.delete.bind(orderController));

module.exports = router;
