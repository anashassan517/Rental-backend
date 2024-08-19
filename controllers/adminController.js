/** @format */

const User = require('../models/User');
const InventoryItem = require('../models/InventoryItem')
const Rental = require('../models/Rentals')
const GuestOrder = require('../models/GuestOrder')


// const rentalsget = async (req, res) => {
// 	console.log("hello")
// 	try {
// 		const rentals = await Rental.find({});
// 		console.log(rentals);
// 		const count = rentals.length;
// 		// console.log("rentals fetched");
// 		// const rentalsWithUserNames = await Promise.all(rentals.map(async rental => {
// 		// 	const user = await User.findById(rental.userId).select('name');
// 		// 	return {
// 		// 		...rental._doc,
// 		// 		userName: user ? user.name : 'User not found'
// 		// 	};
// 		// }));
// 		console.log("hit")
// 		res.status(200).json({
// 			rentals: rentals,
// 			totalCount: count
// 		});
// 		// res.status(200).json({
// 		// 	rentals : rentals,
// 		// 	totalCount: count
// 		// });
// 	} catch (err) {
// 		console.log(err)
// 		res.status(500).send(err.message);
// 	}
// };

// const rentalsget = async (req, res) => {
//     try {
//         // Fetch all rentals
//         const rentals = await Rental.find({});

//         // Map rentals to include the user/guest name
//         const rentalsWithNames = await Promise.all(
//             rentals.map(async (rental) => {
//                 let userName;

//                 if (rental.userId) {
//                     // Fetch user name if userId is present
//                     const user = await User.findById(rental.userId).select('name');
//                     userName = user ? user.name : 'User not found';
//                 } else {
//                     // Fetch guest name from GuestOrder if userId is null
//                     const guestOrder = await GuestOrder.findOne({
//                         productId: rental.itemId,
//                         rentDate: rental.rentalDate,
//                         returnDate: rental.returnDate,
//                         quantity: rental.quantity,
//                     }).select('name');
//                     userName = guestOrder ? guestOrder.name : 'Guest not found';
//                 }

//                 return {
//                     ...rental._doc,
//                     userName,
//                 };
//             })
//         );

//         // Return the rentals with names
//         res.status(200).json({
//             rentals: rentalsWithNames,
//             totalCount: rentalsWithNames.length,
//         });
//     } catch (err) {
//         console.error('Error fetching rentals:', err.message);
//         res.status(500).send(err.message);
//     }
// };

const rentalsget = async (req, res) => {
	try {
		// Fetch all rentals
		const rentals = await Rental.find({});

		// Get the current date
		const currentDate = new Date();

		// Map rentals to include the user/guest name and update status if overdue
		const rentalsWithNamesAndStatus = await Promise.all(
			rentals.map(async (rental) => {
				let userName;

				// Check if the rental is overdue
				if (rental.returnDate < currentDate && rental.status !== 'overdue') {
					rental.status = 'overdue';
					await rental.save(); // Save the updated rental status
				}

				if (rental.userId) {
					// Fetch user name if userId is present
					const user = await User.findById(rental.userId).select('name');
					userName = user ? user.name : 'User not found';
				} else {
					// Fetch guest name from GuestOrder if userId is null
					const guestOrder = await GuestOrder.findOne({
						productId: rental.itemId,
						rentDate: rental.rentalDate,
						returnDate: rental.returnDate,
						quantity: rental.quantity,
					}).select('name');
					userName = guestOrder ? guestOrder.name : 'Guest not found';
				}

				return {
					...rental._doc,
					userName,
				};
			})
		);

		// Return the rentals with names and updated statuses
		res.status(200).json({
			rentals: rentalsWithNamesAndStatus,
			totalCount: rentalsWithNamesAndStatus.length,
		});
	} catch (err) {
		console.error('Error fetching rentals:', err.message);
		res.status(500).send(err.message);
	}
};

const getUsers = async (req, res) => {
	try {
		const users = await User.find();
		console.log("users fetched")
		res.status(200).json(users);
	} catch (err) {
		res.status(500).send(err.message);
	}
};

const countUsers = async (req, res) => {
	try {
		const users = await User.find();
		const totalCount = users.length;
		console.log("hittt")
		res.status(200).json(totalCount);
	} catch (err) {
		res.status(500).send(err.message);
	}
};



const updateUser = async (req, res) => {
	try {
		const user = await User.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		console.log("user Updated")
		res.status(200).json(user);
	} catch (err) {
		res.status(500).send(err.message);
	}
};

const deleteUser = async (req, res) => {
	try {
		await User.findByIdAndDelete(req.params.id);
		console.log("user Deleted")
		res.status(200).send('User deleted');
	} catch (err) {
		res.status(500).send(err.message);
	}
};


// const verifyAdmin = async (req, res) => {
// 	const { adminId, status } = req.body;
// 	try {

// 		if (!adminId) {
// 			console.log('admin id missing');
// 			return res.status(400).send({ error: 'Admin id missing' });
// 		}
// 		const verified = await User.findOne({ '_id': adminId });
// 		if (!verified) {
// 			console.log('admin not found');
// 			return res.status(400).send({ error: 'Admin not found' });
// 		}
// 		console.log(verified);
// 		if (status) {

// 			verified.isAdminVerified = true;
// 			console.log('accepted')
// 			verified.status = 'Accepted'
// 			await verified.save();
// 			console.log('saved')
// 			const updatedStatus = verified.status;
// 			res.status(200).json({ message: "admin accepted successfully", updatedStatus });
// 		} else {

// 			verified.isAdminVerified = true;
// 			console.log('rejected')
// 			verified.status = 'Rejected'
// 			await verified.save();
// 			console.log('saved')
// 			const updatedStatus = verified.status;
// 			const id = verified._id;
// 			res.status(200).json({ message: "admin rejected successfully", id, updatedStatus });
// 		}



// 	} catch (error) {
// 		console.log(error)
// 		return res.status(500).send({ error });
// 	}


// };

const verifyEmployee = async (req, res) => {
	const { employeeId, status } = req.body;
	try {

		if (!employeeId) {
			console.log('employee id missing');
			return res.status(400).send({ error: 'employee id missing' });
		}
		const verified = await User.findOne({ '_id': employeeId });
		if (!verified) {
			console.log('employee not found');
			return res.status(400).send({ error: 'employee not found' });
		}
		console.log(verified);
		if (status) {

			verified.isEmployeeVerified = true;
			console.log('accepted')
			verified.status = 'Accepted'
			await verified.save();
			console.log('saved')
			const updatedStatus = verified.status;
			res.status(200).json({ message: "employee accepted successfully", updatedStatus });
		} else {

			verified.isEmployeeVerified = true;
			console.log('rejected')
			verified.status = 'Rejected'
			await verified.save();
			console.log('saved')
			const updatedStatus = verified.status;
			const id = verified._id;
			res.status(200).json({ message: "employee rejected successfully", id, updatedStatus });
		}



	} catch (error) {
		console.log(error)
		return res.status(500).send({ error });
	}


};


const getAdmin = async (req, res) => {
	try {
		const admins = await User.find({ role: 'admin' }).select('name email isAdminVerified status')
		console.log(admins);
		res.status(200).json(admins);
	} catch (error) {
		res.status(500).send(err.message);
	}

};

const getEmployees = async (req, res) => {
	try {
		const employee = await User.find({ role: 'employee' }).select('name email isEmployeeVerified status')
		console.log(employee);
		res.status(200).json(employee);
	} catch (error) {
		res.status(500).send(err.message);
	}

};


const updateQuantity = async (req, res) => {
	const { quantity, itemId, rentId, userId } = req.body;
	console.log(req.body);
	try {
		// Find the inventory item by itemId
		const item = await InventoryItem.findOne({ "_id": itemId }).select('quantity');
		if (!item) {
			return res.status(404).json({ message: 'Item not found' });
		}
		console.log(item);
		console.log(quantity);

		// Update the quantity of the inventory item
		const newQuantity = item.quantity + quantity;
		console.log(newQuantity);
		item.quantity = newQuantity;
		console.log(item.quantity);
		await item.save();

		// Find and update the rental
		const rental = await Rental.findById({ "_id": rentId });
		if (!rental) {
			return res.status(404).json({ message: 'Rental not found' });
		}
		rental.status = 'returned';
		await rental.save();
		console.log("rental dtatus updated: ", rental.status);

		// Find the user by userId and remove the order from the orders array
		const user = await User.findOneAndUpdate(
			{ _id: userId },
			{ $pull: { orders: { _id: rentId } } },
			{ new: true }
		);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		console.log("Order removed from user's orders: ", user);

		res.status(200).json({ message: item.quantity });

	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
};


const activeRentals = async (req, res) => {
	try {
		const activerentals = await Rental.find();
		const totalCount = activerentals.length;
		console.log(totalCount)
		res.status(200).json(totalCount);
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message);
	}
}

// const totalOrders = async (req,res) => {
// 	try {
//         const totalOrders = await User.aggregate([
//             { $unwind: "$orders" },
//             { $group: { _id: null, totalOrders: { $sum: 1 } } }
//         ]);

//         const totalOrderCount = totalOrders.length ? totalOrders[0].totalOrders : 0;
// 		console.log(totalOrderCount);
//         res.status(200).json({totalOrderCount,totalOrders});
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Server error' });
//     }
// }

const totalOrders = async (req, res) => {
	try {
		// Aggregate to get the count of orders and the details of each order
		const result = await User.aggregate([
			{ $unwind: "$orders" },
			{
				$group: {
					_id: null,
					totalOrders: { $sum: 1 },
					ordersDetails: { $push: "$orders" }
				}
			}
		]);

		// Extract the total order count and details from the result
		const totalOrderCount = result.length ? result[0].totalOrders : 0;
		const ordersDetails = result.length ? result[0].ordersDetails : [];

		console.log(`Total Orders Count: ${totalOrderCount}`);
		console.log(`Order Details: ${JSON.stringify(ordersDetails, null, 2)}`);

		// Send the response with both the count and the details
		res.status(200).json({ totalOrderCount, ordersDetails });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
};


const getUserbyid = async (req, res) => {
	try {
		const { id } = req.params;
		const UserProfile = await User.findById(id);
		res.status(200).json(UserProfile);
	} catch (error) {
		console.error(error);
		res.status(500).send({ error: 'An error occurred while fetching user details' });
	}
}

const getTotalIncome = async (req, res) => {
	try {
		// Fetch all rentals
		const rentals = await Rental.find();

		if (rentals.length === 0) {
			return res.status(200).json({ message: 'No rentals found', dailyIncome: [] });
		}

		// Initialize an object to store income per day
		const incomePerDay = {};

		// Iterate over each rental
		rentals.forEach(rental => {
			const startDate = new Date(rental.rentalDate);
			const endDate = new Date(rental.returnDate);

			// Ensure endDate is greater than or equal to startDate
			if (endDate < startDate) {
				throw new Error('Invalid rental period: returnDate is before rentalDate');
			}

			// Calculate daily price
			const dailyPrice = rental.price * rental.quantity;

			// Iterate through each day in the rental period
			for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
				const currentDateString = d.toISOString().split('T')[0]; // Get date string in 'YYYY-MM-DD' format

				// Accumulate daily income
				if (!incomePerDay[currentDateString]) {
					incomePerDay[currentDateString] = 0;
				}
				incomePerDay[currentDateString] += dailyPrice;
			}
		});

		// Convert the incomePerDay object to an array and sort by date
		const dailyIncomeArray = Object.keys(incomePerDay).map(date => ({
			date,
			totalIncome: incomePerDay[date]
		})).sort((a, b) => new Date(a.date) - new Date(b.date));

		// Return the result
		res.status(200).json({ dailyIncome: dailyIncomeArray });
	} catch (err) {
		console.error("Error calculating daily income:", err.message);
		res.status(500).send({ error: 'Internal Server Error' });
	}
}

const getTotalIncomeByCategory = async (req, res) => {
	try {
		// Fetch all rentals with their associated inventory items to get the category
		const rentals = await Rental.find().populate('itemId');

		if (rentals.length === 0) {
			return res.status(200).json({ message: 'No rentals found', dailyIncome: [] });
		}

		// Initialize an object to store income per day by category
		const incomePerDayByCategory = {};

		// Iterate over each rental
		rentals.forEach(rental => {
			const startDate = new Date(rental.rentalDate);
			const endDate = new Date(rental.returnDate);
			const category = rental.itemId.category;

			// Ensure endDate is greater than or equal to startDate
			if (endDate < startDate) {
				throw new Error('Invalid rental period: returnDate is before rentalDate');
			}

			// Calculate daily price
			const dailyPrice = rental.price * rental.quantity;

			// Iterate through each day in the rental period
			for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
				const currentDateString = d.toISOString().split('T')[0]; // Get date string in 'YYYY-MM-DD' format

				// Initialize date in the incomePerDayByCategory object if not exists
				if (!incomePerDayByCategory[currentDateString]) {
					incomePerDayByCategory[currentDateString] = {};
				}

				// Initialize category in the date object if not exists
				if (!incomePerDayByCategory[currentDateString][category]) {
					incomePerDayByCategory[currentDateString][category] = 0;
				}

				// Accumulate income for the category on this date
				incomePerDayByCategory[currentDateString][category] += dailyPrice;
			}
		});

		// Convert the incomePerDayByCategory object to an array and sort by date
		const dailyIncomeArray = Object.keys(incomePerDayByCategory).map(date => ({
			date,
			categories: Object.keys(incomePerDayByCategory[date]).map(category => ({
				category,
				totalIncome: incomePerDayByCategory[date][category]
			}))
		})).sort((a, b) => new Date(a.date) - new Date(b.date));

		// Return the result
		res.status(200).json({ dailyIncome: dailyIncomeArray });
	} catch (err) {
		console.error("Error calculating daily income by category:", err.message);
		res.status(500).send({ error: 'Internal Server Error' });
	}
}


const classifyCustomers = async (req, res) => {
	try {
		// Fetch all rentals
		const rentals = await Rental.find({});

		// Create a dictionary to count rentals per user/guest
		const customerRentalCounts = {};

		// Aggregate rental counts
		for (const rental of rentals) {
			const customerKey = rental.userId
				? `user-${rental.userId}`
				: `guest-${rental.itemId}-${rental.rentDate}-${rental.returnDate}-${rental.quantity}`;

			if (!customerRentalCounts[customerKey]) {
				customerRentalCounts[customerKey] = 0;
			}
			customerRentalCounts[customerKey] += 1;
		}

		// Separate repeat customers from first-time customers
		const firstTimeCustomers = [];
		const repeatCustomers = [];

		for (const key in customerRentalCounts) {
			const rentalCount = customerRentalCounts[key];

			if (rentalCount > 1) {
				// Extract user or guest information
				const [type, idOrDetails] = key.split('-');
				if (type === 'user') {
					const user = await User.findById(idOrDetails).select('name email');
					if (user) {
						repeatCustomers.push(user);
					}
				} else if (type === 'guest') {
					// Extract details
					const [itemId, rentDateStr, returnDateStr, quantity] = idOrDetails.split(',');
					const rentDate = new Date(rentDateStr);
					const returnDate = new Date(returnDateStr);

					if (!isNaN(rentDate) && !isNaN(returnDate)) {
						// Fetch guest details
						const guestOrder = await GuestOrder.findOne({
							itemId,
							rentDate,
							returnDate,
							quantity,
						}).select('name');

						if (guestOrder) {
							firstTimeCustomers.push(guestOrder);
						}
					}
				}
			}
		}
		// Return the classified customers
		res.status(200).json({
			repeatCustomers,
			firstTimeCustomers,
		});

	} catch (error) {
		console.error('Error classifying customers:', error);
		res.status(500).send('Error classifying customers');
	}
};


const getTotalIncomeByCategoryAndPaymentType = async (req, res) => {
	try {
		// Fetch all rentals with their associated inventory items to get the category and payment type
		const rentals = await Rental.find().populate('itemId');

		if (rentals.length === 0) {
			return res.status(200).json({ message: 'No rentals found', dailyIncome: [] });
		}

		// Initialize an object to store income per day by category and payment type
		const incomePerDayByCategoryAndPaymentType = {};

		// Iterate over each rental
		rentals.forEach(rental => {
			const startDate = new Date(rental.rentalDate);
			const endDate = new Date(rental.returnDate);
			const category = rental.itemId.category;
			const paymentType = rental.paymentType; // Assuming you've added this field

			// Ensure endDate is greater than or equal to startDate
			if (endDate < startDate) {
				throw new Error('Invalid rental period: returnDate is before rentalDate');
			}

			// Calculate daily price
			const dailyPrice = rental.price * rental.quantity;

			// Iterate through each day in the rental period
			for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
				const currentDateString = d.toISOString().split('T')[0]; // Get date string in 'YYYY-MM-DD' format

				// Initialize date in the incomePerDayByCategoryAndPaymentType object if not exists
				if (!incomePerDayByCategoryAndPaymentType[currentDateString]) {
					incomePerDayByCategoryAndPaymentType[currentDateString] = {};
				}

				// Initialize category in the date object if not exists
				if (!incomePerDayByCategoryAndPaymentType[currentDateString][category]) {
					incomePerDayByCategoryAndPaymentType[currentDateString][category] = {};
				}

				// Initialize payment type in the category object if not exists
				if (!incomePerDayByCategoryAndPaymentType[currentDateString][category][paymentType]) {
					incomePerDayByCategoryAndPaymentType[currentDateString][category][paymentType] = 0;
				}

				// Accumulate income for the payment type in the category on this date
				incomePerDayByCategoryAndPaymentType[currentDateString][category][paymentType] += dailyPrice;
			}
		});

		// Convert the incomePerDayByCategoryAndPaymentType object to an array and sort by date
		const dailyIncomeArray = Object.keys(incomePerDayByCategoryAndPaymentType).map(date => ({
			date,
			categories: Object.keys(incomePerDayByCategoryAndPaymentType[date]).map(category => ({
				category,
				paymentTypes: Object.keys(incomePerDayByCategoryAndPaymentType[date][category]).map(paymentType => ({
					paymentType,
					totalIncome: incomePerDayByCategoryAndPaymentType[date][category][paymentType]
				}))
			}))
		})).sort((a, b) => new Date(a.date) - new Date(b.date));

		// Return the result
		res.status(200).json({ dailyIncome: dailyIncomeArray });
	} catch (err) {
		console.error("Error calculating daily income by category and payment type:", err.message);
		res.status(500).send({ error: 'Internal Server Error' });
	}
}



module.exports = {
	getTotalIncomeByCategoryAndPaymentType, getTotalIncomeByCategory, classifyCustomers,
	getTotalIncome, rentalsget, getUserbyid, totalOrders, activeRentals, updateQuantity, verifyEmployee,
	getEmployees, getAdmin, getUsers, countUsers, updateUser, deleteUser
};
