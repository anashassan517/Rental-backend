/** @format */

const express = require('express');
const {
	getInhouseOrder,inhouseOrder
} = require('../controllers/inHouseOrderController');

const router = express.Router();

router.post('/order', inhouseOrder);
router.get('/get-order/:employeeId', getInhouseOrder);

module.exports = router;