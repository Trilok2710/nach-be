const express = require('express');
const router = express.Router();
const {
  sendJson,
  fetchData,
  fetchDataABC,
  createOrder,
  recurringPayments,
  statusNach,
  populateDynamo,
  healthCheck,
} = require('../controllers/nachController');

router.post('/send-json', sendJson);
router.get('/fetch-data', fetchData);
router.get('/fetch-data-abc', fetchDataABC);
router.post('/create_order', createOrder);
router.post('/recurring_payments', recurringPayments);
router.post('/status-nach', statusNach);
router.post('/populate-dynamodb', populateDynamo);
router.get('/health', healthCheck);

module.exports = router;
