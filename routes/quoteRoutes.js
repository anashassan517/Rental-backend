const express = require('express');
const {postQuotes,getQuotes } = require('../controllers/quoteController');
const router = express.Router();

router.post('/post', postQuotes);
router.get('/get', getQuotes);

module.exports = router;
