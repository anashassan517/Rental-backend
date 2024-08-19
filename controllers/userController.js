/** @format */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOtpEmail } = require('../controllers/OtpEmail');
const crypto = require('crypto');
const Rental = require('../models/Rentals')
const InventoryItem = require('../models/InventoryItem')
const Favorite = require('../models/Favorite')

//helper function
const generate4DigitOTP = () => {
	const buffer = crypto.randomBytes(2);
	const otp = buffer.readUInt16BE(0) % 10000; // Generate a number and limit it to 4 digits
	return otp.toString().padStart(4, '0'); // Ensure it is 4 digits by padding with leading zeros if necessary
};

// // helper function
// const parseDuration = (durationString) => {
// 	const match = durationString.match(/(\d+)\s+(\w+)/i); // Using 'i' flag for case-insensitive match
// 	if (match) {
// 		const value = parseInt(match[1]);
// 		const unit = match[2].toLowerCase(); // Convert to lowercase to standardize
// 		return { value, unit };
// 	}
// 	return null;
// };

function computeDuration(startDate, endDate) {
	// Calculate the difference in milliseconds
	const differenceMs = endDate.getTime() - startDate.getTime();

	// Convert milliseconds to days
	return Math.ceil(differenceMs / (1000 * 60 * 60 * 24));
}

// Helper function to calculate return date based on parsed duration
const calculateReturnDate = (value, unit) => {
	let returnDate = new Date();
	switch (unit) {
		case 'day':
		case 'days':
			returnDate.setDate(returnDate.getDate() + value);
			break;
		case 'week':
		case 'weeks':
			returnDate.setDate(returnDate.getDate() + value * 7);
			break;
		case 'month':
		case 'months':
			returnDate.setMonth(returnDate.getMonth() + value);
			break;
		default:
			// Handle other units if necessary
			break;
	}
	return returnDate;
};

//front back image, phonenumber,address,nationalId
const register = async (req, res) => {
	const { name, email, password, role, phoneNumber, address, nationalId } = req.body;
	let imageFrontPath, imageBackPath;

	console.log("Register request body:", req.body);
	console.log("Files received:", req.files);

	// Check if role is 'user' and validate image files
	// if (role === 'user') {
	// 	console.log('User signup:', role);
	// 	// if (!req.files || !req.files.imageFront || !req.files.imageBack) {
	// 	// 	console.log("Both image files are required for users");
	// 	// 	return res.status(400).send({ error: 'Both image files are required' });
	// 	// }
	// 	imageFrontPath = req.files.imageFront[0].filename;
	// 	imageBackPath = req.files.imageBack[0].filename;
	// }

	try {
		// Validate that required fields are present based on the role
		// if (role === 'user') {
		// 	if (!phoneNumber || !address || !nationalId) {
		// 		console.log("Required fields are missing for user");
		// 		return res.status(400).send({ error: 'Phone number, address, and national ID are required for user signup' });
		// 	}
		// }

		const existingUser = await User.findOne({ email });
		if (existingUser) return res.status(400).send({ error: 'User already exists' });

		const hashedPassword = await bcrypt.hash(password, 10);

		// Create the user object
		const userData = {
			name,
			email,
			password: hashedPassword,
			role,
			phoneNumber: role === 'user' ? phoneNumber : undefined,
			address: role === 'user' ? address : undefined,
			nationalId: role === 'user' ? nationalId : undefined,
			imageFront: role === 'user' ? imageFrontPath : undefined,
			imageBack: role === 'user' ? imageBackPath : undefined,
			isAdminVerified: role === 'admin' ? true : false,
			isEmployeeVerified: role === 'employee' ? false : undefined
		};

		const user = new User(userData);

		// Set additional fields based on role
		if (role === 'admin') {
			user.status = "Accepted"
			user.isVerified = true
			user.isEmployeeVerified = false; // Ensuring this is explicitly set
		}

		if (role === 'employee') {
			user.isVerified = true
			user.isAdminVerified = false; // Ensuring this is explicitly set
		}

		if (role !== 'admin' && role !== 'employee') {
			const otp = generate4DigitOTP();
			user.otp = otp;
			// Send OTP email only if the user is not an admin
			console.log(otp)
			sendOtpEmail(email, otp);
		}

		await user.save();
		console.log("Registration successful");

		res.status(201).json({ message: 'success' });
	} catch (err) {
		console.log(err);
		res.status(500).send(err.message);
	}
};


const OtpVerification = async (req, res) => {
	try {
		const { email, otp } = req.body;
		const user = await User.findOne({ email });

		if (!user) {
			console.log("user not found")
			return res.status(400).json({ message: 'User not found' });
		}

		if (user.otp !== otp) {
			console.log("invalid otp")
			return res.status(400).json({ message: 'Invalid or expired OTP' });

		}

		const token = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '3h' });
		console.log("hitt verify-otp", token, email)
		res.json({ message: 'success', token, email });
		user.isVerified = true;
		user.otp = null;
		await user.save();
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: error.message });
	}
};

const login = async (req, res) => {
	const { email, password } = req.body;
	console.log(req.body);

	try {
		const pid = await Favorite.find({})
		const user = await User.findOne({ email });
		console.log(user);

		if (!user) {
			console.log("User not found");
			return res.status(400).send('Invalid email or password');
		}

		if (!user.isVerified) {
			console.log("User not verified");
			return res.status(400).json({ message: 'Please verify your email first' });
		}

		const validPassword = await bcrypt.compare(password, user.password);
		if (!validPassword) {
			console.log("Invalid password");
			return res.status(400).json({ message: 'Invalid email or password' });
		}

		const token = jwt.sign(
			{ _id: user._id, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: '100h' }
		);
		console.log('Successful login');

		// Customize response based on user role
		let responseMessage = 'success';
		if (user.role === 'admin') {
			responseMessage = 'Welcome, Admin';
		}


		res.header('Authorization', `Bearer ${token}`).json({
			id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			phoneNumber: user.phoneNumber,
			address: user.address,
			nationalId: user.nationalId,
			imageFront: user.imageFront,
			imageBack: user.imageBack,
			status: user.status,
			token: token,
			favorite: pid
		});
	} catch (err) {
		res.status(500).send(err.message);
	}
};

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

// const OrderItem = async (req, res) => {
// 	const { name, phoneNumber, nationalId, address, orderData } = req.body;

// 	// Parse orderData from string to JSON
// 	const { userId, items } = JSON.parse(orderData);

// 	console.log(req.body);
// 	console.log(req.files);

// 	if (!req.files || !req.files.imageFront || !req.files.imageBack) {
// 		console.log("Both image files are required");
// 		return res.status(400).send({ error: 'Both image files are required' });
// 	}

// 	const imageFrontPath = `/NationalId/${req.files.imageFront[0].filename}`;
// 	const imageBackPath = `/NationalId/${req.files.imageBack[0].filename}`;

// 	// Check if customerInfo and items are provided
// 	if ( !items || !Array.isArray(items) || items.length === 0) {
// 		return res.status(400).send({ error: 'All fields are required: productName, duration, quantity, price' });
// 	}

// 	try {
// 		// Find the user by ID
// 		const user = await User.findById(userId);
// 		if (!user) {
// 			return res.status(404).send({ error: 'User not found' });
// 		}

// 		// Validate each item without updating the database yet
// 		for (let item of items) {
// 			const { productId, quantity } = item;
// 			const newProduct = await InventoryItem.findById(productId).select('_id quantity');

// 			if (!newProduct) {
// 				return res.status(404).send({ error: `Product with ID ${productId} not found` });
// 			}

// 			if (typeof newProduct.quantity !== 'number' || typeof quantity !== 'number') {
// 				return res.status(400).send({ error: 'Invalid quantity type' });
// 			}

// 			if ((newProduct.quantity - quantity) < 0) {
// 				return res.status(400).send({ error: `Sorry, only ${newProduct.quantity} products available` });
// 			}
// 		}

// 		// If all validations pass, update the inventory quantities
// 		await Promise.all(items.map(async (item) => {
// 			const { productId, quantity } = item;
// 			const newProduct = await InventoryItem.findById(productId).select('_id quantity');
// 			newProduct.quantity -= quantity;

// 			if (isNaN(newProduct.quantity)) {
// 				throw new Error('Resulting quantity is NaN');
// 			}

// 			await newProduct.save();
// 		}));

// 		// Validate each item and create order objects
// 		const orders = items.map((item) => {
// 			const { productId, productName, quantity, price, rentDate, returnDate } = item;
// 			if (!productName || !quantity || !price || !rentDate || !returnDate) {
// 				throw new Error('All fields are required: productName, duration, quantity, price, rent dates');
// 			}

// 			const startDate = new Date(rentDate);
// 			const endDate = new Date(returnDate);
// 			const durationInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

// 			return {
// 				productId,
// 				productName,
// 				rentDate: startDate,
// 				rentReturnDate: endDate,
// 				duration: durationInDays,
// 				quantity,
// 				price,
// 				name,
// 				phoneNumber,
// 				address,
// 				nationalId
// 			};
// 		});

// 		// Add the orders to the user's orders array
// 		user.orders.push(...orders);

// 		// Update the user document with the new image paths
// 		user.imageFront = imageFrontPath;
// 		user.imageBack = imageBackPath;

// 		// Save the updated user document
// 		await user.save();

// 		// Create rental entries for each ordered item
// 		const rentalPromises = items.map(async (item) => {
// 			const { productId, quantity, productName, rentDate, returnDate } = item;
// 			const newRental = new Rental({
// 				userId: user._id,
// 				itemName: productName,
// 				itemId: productId,
// 				quantity,
// 				rentalDate: new Date(rentDate),
// 				returnDate: new Date(returnDate),
// 				termsAccepted: true, // Assuming terms are accepted automatically for orders
// 			});

// 			await newRental.save();
// 			return newRental;
// 		});

// 		const createdRentals = await Promise.all(rentalPromises);
// 		console.log("order placed successfuly");
// 		res.status(200).json({user});
// 	} catch (error) {
// 		console.log('Error adding order to user:', error);

// 		if (!res.headersSent) {
// 			res.status(500).send({ error: 'An error occurred while adding the order. Please try again later.' });
// 		}
// 	}
// };

// const OrderItem = async (req, res) => {
// 	const { orderData } = req.body;

// 	// Parse orderData from string to JSON
// 	const { userId, items } = JSON.parse(orderData);

// 	console.log(req.body);

// 	// Check if customerInfo and items are provided
// 	if (!items || !Array.isArray(items) || items.length === 0) {
// 		console.log("empty fields")
// 		return res.status(400).send({ error: 'All fields are required: productName, duration, quantity, price' });
// 	}

// 	try {
// 		// Find the user by ID
// 		const user = await User.findById(userId);
// 		if (!user) {
// 			return res.status(404).send({ error: 'User not found' });
// 		}

// 		// Validate each item without updating the database yet
// 		for (let item of items) {
// 			const { productId, quantity } = item;
// 			const newProduct = await InventoryItem.findById(productId).select('_id quantity');

// 			if (!newProduct) {
// 				return res.status(404).send({ error: `Product with ID ${productId} not found` });
// 			}

// 			if (typeof newProduct.quantity !== 'number' || typeof quantity !== 'number') {
// 				console.log("invalid type")
// 				return res.status(400).send({ error: 'Invalid quantity type' });
// 			}

// 			// if ((newProduct.quantity - quantity) < 0) {
// 			// 	console.log("quantity error")
// 			// 	return res.status(400).json({ message : `Sorry, only ${newProduct.quantity} products available`});
// 			// }
// 			if ((newProduct.quantity - quantity) < 0) {
// 				console.log("quantity error");
// 				// res.json({ message: `Sorry, only ${newProduct.quantity} product(s) available` });
// 				res.json({ message: `Sorry, only ${newProduct.quantity} product${newProduct.quantity === 1 ? '' : 's'} available` });
// 				return; // Ensure the function exits here
// 			}
// 		}

// 		// If all validations pass, update the inventory quantities
// 		await Promise.all(items.map(async (item) => {
// 			const { productId, quantity } = item;
// 			const newProduct = await InventoryItem.findById(productId).select('_id quantity');
// 			newProduct.quantity -= quantity;

// 			if (isNaN(newProduct.quantity)) {
// 				throw new Error('Resulting quantity is NaN');
// 			}

// 			await newProduct.save();
// 		}));

// 		// Validate each item and create order objects
// 		const orders = items.map((item) => {
// 			const { productId, productName, quantity, price, rentDate, returnDate } = item;
// 			if (!productName || !quantity || !price || !rentDate || !returnDate) {
// 				throw new Error('All fields are required: productName, duration, quantity, price, rent dates');
// 			}

// 			const startDate = new Date(rentDate);
// 			const endDate = new Date(returnDate);
// 			const durationInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

// 			return {
// 				productId,
// 				productName,
// 				rentDate: startDate,
// 				rentReturnDate: endDate,
// 				duration: durationInDays,
// 				quantity,
// 				price,
// 			};
// 		});

// 		// Add the orders to the user's orders array
// 		user.orders.push(...orders);

// 		// Save the updated user document
// 		await user.save();

// 		// Create rental entries for each ordered item
// 		const rentalPromises = items.map(async (item) => {
// 			const { productId, quantity, productName, rentDate, returnDate } = item;
// 			const newRental = new Rental({
// 				userId: user._id,
// 				itemName: productName,
// 				itemId: productId,
// 				quantity,
// 				rentalDate: new Date(rentDate),
// 				returnDate: new Date(returnDate),
// 				termsAccepted: true, // Assuming terms are accepted automatically for orders
// 			});

// 			await newRental.save();
// 			return newRental;
// 		});

// 		const createdRentals = await Promise.all(rentalPromises);
// 		console.log("order placed successfuly");
// 		res.status(200).json({ message:"Order Placed Succesfully", user });
// 	} catch (error) {
// 		console.log('Error adding order to user:', error);

// 		if (!res.headersSent) {
// 			res.status(500).send({ error: 'An error occurred while adding the order. Please try again later.' });
// 		}
// 	}
// };

const schedule = require('node-schedule'); // For scheduling tasks

// const OrderItem = async (req, res) => {
// 	const { orderData } = req.body;

// 	// Parse orderData from string to JSON
// 	const { userId, items } = JSON.parse(orderData);

// 	console.log(req.body);

// 	// Check if customerInfo and items are provided
// 	if (!items || !Array.isArray(items) || items.length === 0) {
// 		console.log("empty fields");
// 		return res.status(400).send({ error: 'All fields are required: productName, duration, quantity, price' });
// 	}

// 	try {
// 		// Find the user by ID
// 		const user = await User.findById(userId);
// 		if (!user) {
// 			return res.status(404).send({ error: 'User not found' });
// 		}

// 		// Validate each item for availability on the rent date
// 		for (let item of items) {
// 			const { productId, quantity, rentDate } = item;
// 			const newProduct = await InventoryItem.findById(productId).select('_id quantity');

// 			if (!newProduct) {
// 				return res.status(404).send({ error: `Product with ID ${productId} not found` });
// 			}

// 			if (typeof newProduct.quantity !== 'number' || typeof quantity !== 'number') {
// 				console.log("invalid type");
// 				return res.status(400).send({ error: 'Invalid quantity type' });
// 			}

// 			// Check if the product is available on the rent date
// 			// if ((newProduct.quantity - quantity) < 0) {
// 			// 	console.log("quantity error");
// 			// 	return res.status(400).json({ message: `Sorry, only ${newProduct.quantity} product${newProduct.quantity === 1 ? '' : 's'} available` });
// 			// }
// 		}

// 		// If all validations pass, create orders without updating the inventory yet
// 		const orders = items.map((item) => {
// 			const { productId, productName, quantity, price, rentDate, returnDate } = item;
// 			if (!productName || !quantity || !price || !rentDate || !returnDate) {
// 				throw new Error('All fields are required: productName, duration, quantity, price, rent dates');
// 			}

// 			const startDate = new Date(rentDate);
// 			const endDate = new Date(returnDate);
// 			const durationInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

// 			// Schedule the quantity deduction on the rent date
// 			schedule.scheduleJob(startDate, async () => {
// 				try {
// 					const product = await InventoryItem.findById(productId).select('_id quantity');
// 					if (product.quantity - quantity < 0) {
// 						// Handle insufficient quantity scenario
// 						console.log(`Insufficient quantity for product ${productId} on rent date`);
// 					} else {
// 						product.quantity -= quantity;
// 						await product.save();
// 						console.log(`Deducted ${quantity} from product ${productId}`);
// 					}
// 				} catch (err) {
// 					console.error('Error during scheduled quantity deduction:', err);
// 				}
// 			});

// 			return {
// 				productId,
// 				productName,
// 				rentDate: startDate,
// 				rentReturnDate: endDate,
// 				duration: durationInDays,
// 				quantity,
// 				price,
// 			};
// 		});

// 		// Add the orders to the user's orders array
// 		user.orders.push(...orders);

// 		// Save the updated user document
// 		await user.save();

// 		// Create rental entries for each ordered item
// 		const rentalPromises = items.map(async (item) => {
// 			const { productId, quantity, productName, rentDate, returnDate } = item;
// 			const newRental = new Rental({
// 				userId: user._id,
// 				itemName: productName,
// 				itemId: productId,
// 				quantity,
// 				rentalDate: new Date(rentDate),
// 				returnDate: new Date(returnDate),
// 				termsAccepted: true, // Assuming terms are accepted automatically for orders
// 			});

// 			await newRental.save();
// 			return newRental;
// 		});

// 		const createdRentals = await Promise.all(rentalPromises);
// 		console.log("order placed successfully");
// 		res.status(200).json({ message: "Order Placed Successfully", user });
// 	} catch (error) {
// 		console.log('Error adding order to user:', error);

// 		if (!res.headersSent) {
// 			res.status(500).send({ error: 'An error occurred while adding the order. Please try again later.' });
// 		}
// 	}
// };


const OrderItem = async (req, res) => {
	const { orderData } = req.body;
	console.log("Order item hit:", req.body)
	// Parse orderData from string to JSON
	const { userId, items, paymentType } = JSON.parse(orderData);


	// Check if customerInfo and items are provided
	if (!items || !Array.isArray(items) || items.length === 0) {
		console.log("empty fields");
		return res.status(400).send({ error: 'All fields are required: productName, duration, quantity, price' });
	}

	try {
		// Find the user by ID
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).send({ error: 'User not found' });
		}

		// Validate each item for availability on the rent date considering existing orders
		for (let item of items) {
			const { productId, quantity, rentDate, returnDate } = item;
			const newProduct = await InventoryItem.findById(productId).select('_id quantity');

			if (!newProduct) {
				return res.status(404).send({ error: `Product with ID ${productId} not found` });
			}

			if (typeof newProduct.quantity !== 'number' || typeof quantity !== 'number') {
				console.log("invalid type");
				return res.status(400).send({ error: 'Invalid quantity type' });
			}

			// Check for existing orders that overlap with the requested rental period
			const existingOrders = await Rental.find({
				itemId: productId,
				$or: [
					{ rentalDate: { $lte: new Date(returnDate) }, returnDate: { $gte: new Date(rentDate) } }
				]
			});

			const reservedQuantity = existingOrders.reduce((total, order) => total + order.quantity, 0);
			const availableQuantity = newProduct.quantity - reservedQuantity;

			if (availableQuantity < quantity) {
				console.log("quantity error");
				return res.json({ message: `Sorry, only ${availableQuantity} product${availableQuantity === 1 ? '' : 's'} available during the requested rental period` });
			}
		}

		// If all validations pass, create orders without updating the inventory yet
		const orders = items.map((item) => {
			const { productId, productName, quantity, price, rentDate, returnDate, size } = item;
			if (!productName || !quantity || !price || !rentDate || !returnDate) {
				throw new Error('All fields are required: productName, duration, quantity, price, rent dates');
			}

			const startDate = new Date(rentDate);
			const endDate = new Date(returnDate);
			const durationInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

			// Schedule the quantity deduction on the rent date
			schedule.scheduleJob(startDate, async () => {
				try {
					const product = await InventoryItem.findById(productId).select('_id quantity');
					if (product.quantity - quantity < 0) {
						// Handle insufficient quantity scenario
						console.log(`Insufficient quantity for product ${productId} on rent date`);
					} else {
						product.quantity -= quantity;
						await product.save();
						console.log(`Deducted ${quantity} from product ${productId}`);
					}
				} catch (err) {
					console.error('Error during scheduled quantity deduction:', err);
				}
			});

			return {
				productId,
				productName,
				rentDate: startDate,
				rentReturnDate: endDate,
				duration: durationInDays,
				quantity,
				price,
				size,
				paymentType
			};
		});
		const cart = orders;
		// Add the orders to the user's orders array
		user.orders.push(...orders);

		// Save the updated user document
		await user.save();

		// Create rental entries for each ordered item
		const rentalPromises = items.map(async (item) => {
			const { productId, quantity, productName, rentDate, returnDate, price } = item;
			const newRental = new Rental({
				userId: user._id,
				itemName: productName,
				itemId: productId,
				quantity,
				rentalDate: new Date(rentDate),
				returnDate: new Date(returnDate),
				termsAccepted: true,
				price,
				paymentType
			});

			await newRental.save();
			return newRental;
		});

		const createdRentals = await Promise.all(rentalPromises);
		console.log("order placed successfully", cart);
		res.status(200).json(cart);
	} catch (error) {
		console.log('Error adding order to user:', error);

		if (!res.headersSent) {
			res.status(500).send({ error: 'An error occurred while adding the order. Please try again later.' });
		}
	}
};

const getProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		res.status(200).json(user);
	} catch (err) {
		res.status(500).send(err.message);
	}
};

const updateProfile = async (req, res) => {
	try {
		console.log("update profile hit: params:", req.params)
		console.log("user.-id, body:", req.user._id, req.body)

		const user = await User.findByIdAndUpdate(req.user._id, req.body, {
			new: true,
		});
		res.status(200).json(user);
	} catch (err) {
		res.status(500).send(err.message);
	}
};

const verifyOrder = async (req, res) => {
	const { userId, productId, isOrderVerified, comment } = req.body;
	console.log(req.body);
	try {
		// Find the user by userId
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Find the specific order by productId
		const order = user.orders.find(order => order.productId.toString() === productId);

		if (!order) {
			return res.status(404).json({ message: 'Order not found' });
		}
		console.log(isOrderVerified)
		// Update the isOrderVerified field
		order.isOrderVerified = isOrderVerified;
		order.comment = comment;
		console.log(order);
		// Save the updated user document
		await user.save();

		res.status(200).json({ message: 'Order verification status updated successfully' });
	} catch (error) {
		console.log(error.message);
		res.status(500).json({ message: error.message });
	}
};

const FetchOrder = async (req, res) => {
	const { id } = req.params;
	console.log(req.params);
	console.log(id)
	// const userId = req.headers['userId']; // Extract userId from headers
	// console.log(userId);


	// try {
	// 	// Find the user by their ID and return their orders
	// 	const user = await User.findById(id).select('orders').exec();
	// 	if (!user) {
	// 		return res.status(404).send({ error: 'User not found' });
	// 	}
	// 	console.log("fetching history : ", user.orders)
	// 	res.status(200).json(user.orders);
	try {
		// Find the user by their ID and return their orders
		const user = await User.findById(id);
		if (!user) {
			return res.status(404).send({ error: 'User not found' });
		}
		console.log("fetching history : ", user)
		res.status(200).json(user);
	} catch (error) {
		console.error(error);
		res.status(500).send({ error: 'An error occurred while fetching orders' });
	}
};

const getUserDetails = async (req, res) => {
	try {
		// Find the user by their ID
		const { id } = req.params;
		const UserProfile = await User.findById(id);
		console.log(UserProfile);

		res.status(200).json(UserProfile);
	} catch (error) {
		console.error(error);
		res.status(500).send({ error: 'An error occurred while fetching user details' });
	}
};

const updateUser = async (req, res) => {
	try {
		console.log("update user:", req.body)
		const { id } = req.params;
		console.log("update user params:", req.params)

		// Verify if the ID is correctly formatted as an ObjectId
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ error: 'Invalid user ID' });
		}

		const updateData = req.body;

		// If files are being sent, handle the file uploads here
		if (req.files) {
			if (req.files.imageFront) {
				updateData.imageFront = req.files.imageFront[0].filename; // Save filename or URL in the database
			}
			if (req.files.imageBack) {
				updateData.imageBack = req.files.imageBack[0].filename;
			}
		}

		const updatedUser = await User.findByIdAndUpdate(id, updateData, {
			new: true,
			runValidators: true,
		});

		if (!updatedUser) {
			return res.status(404).json({ error: 'User not found' });
		}

		res.status(200).json(updatedUser);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'An error occurred while updating the user' });
	}
};


module.exports = { FetchOrder, verifyOrder, OrderItem, register, login, getProfile, updateProfile, OtpVerification, getUserDetails, updateUser };