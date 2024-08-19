/** @format */

const Favorite = require('../models/Favorite');


const addFavorite = async (req, res) => {
	const { userId, itemId } = req.body;

	try {
		let favorite = await Favorite.findOne({ userId });

		if (favorite) {
			// Check if the item already exists in the favorites array
			if (favorite.itemIds.includes(itemId)) {
				return res.status(400).send({ error: 'This item is already in your favorites.' });
			}

			// Add the new item to the itemIds array
			favorite.itemIds.push(itemId);
		} else {
			// If no favorite document exists for the user, create a new one
			favorite = new Favorite({ userId, itemIds: [itemId] });
		}

		// Save the updated or new document
		await favorite.save();
		res.status(201).json(favorite);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const updateFavorite = async (req, res) => {
	const { id } = req.params;
	const { note } = req.body;

	try {
		const favorite = await Favorite.findByIdAndUpdate(
			id,
			{ note },
			{ new: true }
		);
		res.status(200).json(favorite);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};


const deleteFavorite = async (req, res) => {
	const { id, userId } = req.params;
	console.log("Item ID:", id, "User ID:", userId);

	try {
		// Find the favorite document by userId
		const favorite = await Favorite.findOne({ userId });

		if (!favorite) {
			return res.status(404).json({ message: 'No favorites found for this user.' });
		}

		// Check if the item exists in the favorites array
		const itemIndex = favorite.itemIds.indexOf(id);
		if (itemIndex === -1) {
			return res.status(404).json({ message: 'Item not found in favorites.' });
		}

		// Remove the item from the itemIds array
		favorite.itemIds.splice(itemIndex, 1);

		// Save the updated document
		await favorite.save();
		res.status(200).json({ message: 'Favorite item removed successfully.' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};


const getFavorites = async (req, res) => {
	const { userId } = req.params;

	try {

		// Find the favorite document by userId
		const favorite = await Favorite.findOne({ userId }).populate('itemIds');

		if (!favorite) {
			return res.status(404).json({ message: 'No favorites found for this user.' });
		}

		res.status(200).json(favorite.itemIds);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};


const getAllFavorites = async (req, res) => {
	try {
		const { userId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).json({
				success: false,
				message: "Invalid userId",
			});
		}

		const GetAllFav = await Favorite.find({ userId })
			.populate('userId', 'name email')
			.populate('itemId', 'name image rentalPrice description');

		res.status(200).json({
			success: true,
			data: GetAllFav,
			message: "Get All Data Successfully",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};



module.exports = {
	addFavorite,
	updateFavorite,
	deleteFavorite,
	getFavorites,
	getAllFavorites
};
