/** @format */

const express = require('express');
const {
	getSlowRentals,
	getFastRentals,
	createRental,
	getUserRentals,
	getRentalById,
	updateRental,
	getRentalHistory,
	getRentalStatus
} = require('../controllers/rentalControllers');
const { auth } = require('../middleware/auth');
const router = express.Router();
router.get('/slow-rentals',getSlowRentals)
router.get('/fast-rentals', getFastRentals)
router.post('/', createRental);
router.get('/', auth, getUserRentals);
router.get('/:id', auth, getRentalById);
router.put('/:id', auth, updateRental);
router.get('/history/:userId', auth, getRentalHistory);
router.get('/status/:rentalId', auth, getRentalStatus);
router.get('/fast-rentals', getFastRentals)
module.exports = router;
