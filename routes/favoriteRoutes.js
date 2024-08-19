/** @format */

const express = require('express');
const {
	addFavorite,
	updateFavorite,
	deleteFavorite,
	getFavorites,
	getAllFavorites,
} = require('../controllers/favoritecontroller');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/add', addFavorite);
router.put('/:id', updateFavorite);
router.delete('/:userId/:id', deleteFavorite);
router.get('/:userId', getFavorites);
// router.get('/getAllFav/:userId', getAllFavorites)

module.exports = router;
