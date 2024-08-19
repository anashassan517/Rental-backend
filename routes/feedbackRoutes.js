/** @format */

const express = require('express');
const {
	submitFeedback,
	getFeedbacks,
} = require('../controllers/feedbackControllers');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

router.post('/', submitFeedback);
router.get('/get-feedback', getFeedbacks);

module.exports = router;
