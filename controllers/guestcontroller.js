

/** @format */

const GuestOrder = require('../models/GuestOrder');
const schedule = require('node-schedule');
const Rental = require('../models/Rentals'); // Ensure you import the Rental model
const InventoryItem = require('../models/InventoryItem'); // Ensure you import the InventoryItem model

// const addGuestOrder = async (req, res) => {
//     const {orderData, name, phoneNumber, address, nationalId,} = req.body;
//     const { userId, items ,customerInfo} = JSON.parse(orderData);
//     console.log(req.body);
//     console.log(req.files);
// 	if (!req.files || !req.files.imageFront || !req.files.imageBack) {
// 		console.log("Both image files are required");
// 		return res.status(400).send({ error: 'Both image files are required' });
// 	}
// 	const imageFrontPath = `${req.files.imageFront[0].filename}`;
// 	const imageBackPath = `${req.files.imageBack[0].filename}`;
//     // Check if items are provided
//     if (!items || !Array.isArray(items) || items.length === 0) {
//         console.log("empty fields");
//         return res.status(400).send({ error: 'All fields are required: productName, duration, quantity, price' });
//     }

//     try {
//         // Validate each item for availability on the rent date considering existing orders
//         for (let item of items) {
//             const { productId, quantity, rentDate, rentReturnDate } = item;
//             const newProduct = await InventoryItem.findById(productId).select('_id quantity');

//             if (!newProduct) {
//                 return res.status(404).send({ error: `Product with ID ${productId} not found` });
//             }

//             if (typeof newProduct.quantity !== 'number' || typeof quantity !== 'number') {
//                 console.log("invalid type");
//                 return res.status(400).send({ error: 'Invalid quantity type' });
//             }

//             // Check for existing orders that overlap with the requested rental period
//             const existingOrders = await Rental.find({
//                 itemId: productId,
//                 $or: [
//                     { rentalDate: { $lte: new Date(rentReturnDate) }, returnDate: { $gte: new Date(rentDate) } }
//                 ]
//             });

//             const reservedQuantity = existingOrders.reduce((total, order) => total + order.quantity, 0);
//             const availableQuantity = newProduct.quantity - reservedQuantity;

//             if (availableQuantity < quantity) {
//                 console.log("quantity error");
//                 return res.json({ message: `Sorry, only ${availableQuantity} product${availableQuantity === 1 ? '' : 's'} available during the requested rental period` });
//             }
//         }

//         // If all validations pass, create orders without updating the inventory yet
//         const orders = items.map((item) => {
//             const { productId, productName, quantity, price, rentDate, rentReturnDate, size } = item;
//             if (!productName || !quantity || !price || !rentDate || !rentReturnDate) {
//                 throw new Error('All fields are required: productName, duration, quantity, price, rent dates');
//             }

//             const startDate = new Date(rentDate);
//             const endDate = new Date(rentReturnDate);
//             const durationInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

//             // Schedule the quantity deduction on the rent date
//             schedule.scheduleJob(startDate, async () => {
//                 try {
//                     const product = await InventoryItem.findById(productId).select('_id quantity');
//                     if (product.quantity - quantity < 0) {
//                         // Handle insufficient quantity scenario
//                         console.log(`Insufficient quantity for product ${productId} on rent date`);
//                     } else {
//                         product.quantity -= quantity;
//                         await product.save();
//                         console.log(`Deducted ${quantity} from product ${productId}`);
//                     }
//                 } catch (err) {
//                     console.error('Error during scheduled quantity deduction:', err);
//                 }
//             });

//             return {
//                 name,
//                 phoneNumber,
//                 address,
//                 nationalId,
//                 imageFront:imageFrontPath,
//                 imageBack:imageBackPath,
//                 productId,
//                 productName,
//                 rentDate: startDate,
//                 rentReturnDate: endDate,
//                 duration: durationInDays,
//                 quantity,
//                 price,
//                 size
//             };
//         });

//         // Save the guest orders
//         const createdOrders = await GuestOrder.insertMany(orders);

//         // Create rental entries for each ordered item with userId set to null
//         const rentalPromises = items.map(async (item) => {
//             const { productId, quantity, productName, rentDate, rentReturnDate } = item;
//             const newRental = new Rental({
//                 userId: null, // Set userId to null for guest orders
//                 itemName: productName,
//                 itemId: productId,
//                 quantity,
//                 rentalDate: new Date(rentDate),
//                 returnDate: new Date(rentReturnDate),
//                 termsAccepted: true, // Assuming terms are accepted automatically for orders
//             });

//             await newRental.save();
//             return newRental;
//         });

//         const createdRentals = await Promise.all(rentalPromises);
//         console.log("Guest order placed successfully");
//         res.status(200).json({ message: "Order Placed Successfully", orders: createdOrders, rentals: createdRentals });
//     } catch (error) {
//         console.log('Error adding order:', error);

//         if (!res.headersSent) {
//             res.status(500).send({ error: 'An error occurred while adding the order. Please try again later.' });
//         }
//     }
// };

const addGuestOrder = async (req, res) => {
    try {
        // Parse the orderData from the request body
        const { orderData } = req.body;
        const parsedOrderData = JSON.parse(orderData);

        console.log(orderData)
        // Extract userId, items, and customerInfo from the parsed orderData
        const { userId, items, customerInfo } = parsedOrderData;
        const { name, phoneNumber, nationalId, address } = customerInfo;

        // Check if the required image files are present
        if (!req.files || !req.files.imageFront || !req.files.imageBack) {
            console.log("Both image files are required");
            return res.status(400).send({ error: 'Both image files are required' });
        }

        // Extract file paths
        const imageFrontPath = `${req.files.imageFront[0].filename}`;
        const imageBackPath = `${req.files.imageBack[0].filename}`;

        // Validate if items are provided
        if (!items || !Array.isArray(items) || items.length === 0) {
            console.log("Empty items array");
            return res.status(400).send({ error: 'Items are required for the order' });
        }

        // Validate each item for availability during the rent period
        for (let item of items) {
            const { productId, quantity, rentDate, returnDate } = item;
            console.log(rentDate)
            console.log(returnDate)
            // Convert rentDate and rentReturnDate to Date objects
            const startDate = new Date(rentDate);
            const endDate = new Date(returnDate);

            // Check if the dates are valid
            if (isNaN(startDate) || isNaN(endDate)) {
                console.log("Invalid date format");
                return res.status(400).send({ error: 'Invalid date format' });
            }

            // Fetch the product from the inventory
            const product = await InventoryItem.findById(productId).select('_id quantity');

            if (!product) {
                return res.status(404).send({ error: `Product with ID ${productId} not found` });
            }

            if (typeof product.quantity !== 'number' || typeof quantity !== 'number') {
                console.log("Invalid quantity type");
                return res.status(400).send({ error: 'Invalid quantity type' });
            }

            // Check for existing orders that overlap with the requested rental period
            const existingOrders = await Rental.find({
                itemId: productId,
                $or: [
                    { rentalDate: { $lte: endDate }, returnDate: { $gte: startDate } }
                ]
            });

            const reservedQuantity = existingOrders.reduce((total, order) => total + order.quantity, 0);
            const availableQuantity = product.quantity - reservedQuantity;

            if (availableQuantity < quantity) {
                console.log("Quantity error");
                return res.json({ message: `Sorry, only ${availableQuantity} product${availableQuantity === 1 ? '' : 's'} available during the requested rental period` });
            }
        }

        // Create orders without updating the inventory yet
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
                name,
                phoneNumber,
                address,
                nationalId,
                imageFront: imageFrontPath,
                imageBack: imageBackPath,
                productId,
                productName,
                rentDate: startDate,
                rentReturnDate: endDate,
                duration: durationInDays,
                quantity,
                price,
                size
            };
        });

        // Save the guest orders
        const createdOrders = await GuestOrder.insertMany(orders);

        // Create rental entries for each ordered item with userId set to null
        const rentalPromises = items.map(async (item) => {
            const { productId, quantity, productName, rentDate, returnDate ,price} = item;

            const newRental = new Rental({
                userId: null, // Set userId to null for guest orders
                itemName: productName,
                itemId: productId,
                quantity,
                rentalDate: new Date(rentDate),
                returnDate: new Date(returnDate),
                termsAccepted: true, // Assuming terms are accepted automatically for orders
                price
            });

            await newRental.save();
            return newRental;
        });

        const createdRentals = await Promise.all(rentalPromises);
        console.log("Guest order placed successfully");
        res.status(200).json({ message: "Order Placed Successfully", orders: createdOrders, rentals: createdRentals });
    } catch (error) {
        console.log('Error adding order:', error);

        if (!res.headersSent) {
            res.status(500).send({ error: 'An error occurred while adding the order. Please try again later.' });
        }
    }
};

const FetchGuestOrder = async (req, res) => {
    const { name } = req.params;
    console.log(req.params);
    console.log(name)
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
        const guest = await GuestOrder.find({ name });
        if (!guest) {
            return res.status(404).send({ error: 'User not found' });
        }
        console.log("fetching history : ", guest)
        res.status(200).json(guest);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'An error occurred while fetching orders' });
    }
};


const getGuest = async (req, res) => {
    
    try {
        // Find the user by their ID and return their orders
        const guest = await GuestOrder.find({});
        if (!guest) {
            return res.status(404).send({ error: 'User not found' });
        }
        console.log( guest)
        res.status(200).json(guest);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'An error occurred while fetching orders' });
    }
};


module.exports = {
    addGuestOrder, FetchGuestOrder, getGuest
};
