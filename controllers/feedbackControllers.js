/** @format */

const Feedback = require('../models/Feedback');
const User = require('../models/User')
const submitFeedback = async (req, res) => {
	const { userId, message } = req.body;

	try {
		const newFeedback = new Feedback({ userId, message });
		await newFeedback.save();
		console.log("fedback submitted")
		res.status(201).json(newFeedback);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const getFeedbacks = async (req, res) => {
	try {
		//const feedbacks = await Feedback.find().populate('userId');
		const feedbacks = await Feedback.find().select('userId message')
		const feedbackWithUserNames = await Promise.all(feedbacks.map(async feedback => {
			const user = await User.findById(feedback.userId).select('name');
			return {
				...feedback._doc,
				userName: user ? user.name : 'User not found'
			};
		}));
		res.status(200).json({
			feedback: feedbackWithUserNames
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

module.exports = {
	submitFeedback,
	getFeedbacks,
};
