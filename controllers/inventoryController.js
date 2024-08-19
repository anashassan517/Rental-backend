/** @format */

const InventoryItem = require('../models/InventoryItem');


const totalitems = async (req, res) => {
	try {
		const items = await InventoryItem.find();
		const totalCount = items.length;
		console.log("items fetched");

		res.status(200).json({
			totalCount: totalCount
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}
//Awwab
const addItem = async (req, res) => {
	const { name, description, quantity, rentalPrice, duration, category, size, available, maintenance } =
		req.body;

	console.log(req.body);

	if (!req.file) {
		return res.status(400).send({ error: 'No file uploaded' });
	}

	console.log("1");

	const imageUrl = `/uploads/${req.file.filename}`;

	try {
		const newItem = new InventoryItem({
			name,
			description,
			quantity,
			rentalPrice,
			duration,
			category,
			size: Array.isArray(size) ? size : [], // Ensure size is always an array
			image: imageUrl,
			createdAt: new Date() // Set createdAt to current date
		});

		await newItem.save();

		console.log("added");
		res.status(201).json(newItem);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

//Anas short accessory:
const addShortItem = async (req, res) => {
	const { name, description, quantity, rentalPrice, duration, category, size, available, maintenance } =
		req.body;

	console.log("Add short acessory Hit:", req.body);

	if (!req.file) {
		return res.status(400).send({ error: 'No file uploaded' });
	}


	const imageUrl = `/uploads/${req.file.filename}`;

	try {
		const newShortAccessory = new InventoryItem({
			name,
			description,
			quantity,
			rentalPrice,
			duration,
			category,
			size: Array.isArray(size) ? size : [], // Ensure size is always an array
			image: imageUrl,
			shortAccessory: true,
			available,
			maintenance,
			createdAt: new Date() // Set createdAt to current date
		});

		await newShortAccessory.save();  // Save the new short accessory item
		console.log("Short accessory added");
		res.status(201).json(newShortAccessory);

	} catch (error) {
		console.log("Error", error)
		res.status(500).json({ message: error.message });
	}
};

const getShortAccessories = async (req, res) => {
	try {
		// console.log()
		console.log('Get Short Accessory Items hit')
		const shortAccessories = await InventoryItem.find({ shortAccessory: true });
		res.status(200).json(shortAccessories);
	} catch (error) {
		console.error("Error retrieving short accessories:", error.message);
		res.status(500).json({ message: error.message });
	}
};

const editItem = async (req, res) => {
	const { id } = req.params;
	const { name, quantity, description, rentalPrice, available } =
		req.body;
	if (!req.file) {
		try {
			const updatedItem = await InventoryItem.findByIdAndUpdate(
				id,
				{ name, quantity, description, rentalPrice, available },
				{ new: true }
			);
			console.log("updated")
			res.status(200).json(updatedItem);
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	}
	else {
		const imageUrl = `/uploads/${req.file.filename}`;
		try {
			const updatedItem = await InventoryItem.findByIdAndUpdate(
				id,
				{ name, quantity, description, rentalPrice, available, image: imageUrl },
				{ new: true }
			);
			console.log("updated")
			res.status(200).json(updatedItem);
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	}
};

const deleteItem = async (req, res) => {
	const { id } = req.params;

	try {
		await InventoryItem.findByIdAndDelete(id);
		res.status(200).json({ message: 'Item deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
const getCategoryItems = async (req, res) => {
	const { Category } = req.params
	console.log(Category);
	try {
		const items = await InventoryItem.find({ "category": Category });
		console.log("category inventory fetched ", items)
		res.status(200).json(items);
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: error.message });
	}
};

const getItems = async (req, res) => {
	try {
		const items = await InventoryItem.find({ "available": true });
		console.log("items fetched")
		res.status(200).json(items);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const getNewItems = async (req, res) => {
	try {
		const newItems = await InventoryItem.find({ newArrival: 'true' });
		console.log("new items fetched")
		res.status(200).json(newItems);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const getItemById = async (req, res) => {
	const { id } = req.params;

	try {
		const item = await InventoryItem.findById(id);
		if (!item) return res.status(404).json({ message: 'Item not found' });
		console.log("item by id")
		res.status(200).json(item);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const getAvailableItems = async (req, res) => {
	try {
		const availableItems = await InventoryItem.find({
			available: true,
			maintenance: false,
		});
		res.status(200).json(availableItems);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// const categorizeItem = async (req, res) => {
// 	console.log("hello")
// 	const { category } = req.body;
// 	console.log(req.body)
// 	try {
// 		const updatedItem = await InventoryItem.find({ "category": category });
// 		console.log(updatedItem);
// 		res.status(200).json(updatedItem);
// 	} catch (error) {
// 		console.log(error)
// 		res.status(500).json({ message: error.message });
// 	}
// };

const trackAvailabilityAndMaintenance = async (req, res) => {
	const { id } = req.params;
	const { available, maintenance } = req.body;

	try {
		const updatedItem = await InventoryItem.findByIdAndUpdate(
			id,
			{ available, maintenance },
			{ new: true }
		);
		res.status(200).json(updatedItem);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const getLowInventory = async (req, res) => {
	try {
		const items = await InventoryItem.find({ quantity: { $lt: 5 } });
		console.log("items fetched")
		res.status(200).json(items);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}
module.exports = {
	getLowInventory,
	getCategoryItems,
	getAvailableItems,
	// categorizeItem,
	trackAvailabilityAndMaintenance,
	addItem,
	addShortItem,
	getShortAccessories,
	editItem,
	deleteItem,
	getItems,
	getNewItems,
	getItemById,
	totalitems
};
