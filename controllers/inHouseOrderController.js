/** @format */

const inHouseOrder = require('../models/inHouseOrder');

// const inhouseOrder = async (req, res) => {
//     // const { name, companyName, address, paymentMethod, category, productName, quantity, price, TotalAmount, rentalDays, size } = req.body;
//     // console.log(req.body);
//     // try {
//     //     const adminOrder = new inHouseOrder({
//     //         name,
//     //         companyName, address, paymentMethod, category,
//     //         productName, quantity, price, TotalAmount, rentalDays, size
//     //     })
//     //     await adminOrder.save()
//     //     console.log(adminOrder)
//     //     res.status(200).send(adminOrder);
//     // } catch (error) {
//     //     console.log(error.message)
//     //     res.status(500).json({ message: error.message });
//     // }
//     console.log(req.body);
//     const { employeeId, clientInfo, products } = req.body;
//     console.log(employeeId,clientInfo, products);
//     try {
//         const employeeOrder = new inHouseOrder({

//         })
//         if(!employeeOrder){
//             res.status(400).json({message : 'error'})
//         }
//         await adminOrder.save()
//         console.log(adminOrder)
//         res.status(200).send(adminOrder);
//     } catch (error) {
//         console.log(error.message)
//         res.status(500).json({ message: error.message });
//     }
// };

const inhouseOrder = async (req, res) => {
    try {
        // Extracting data from the request body
        const { employeeId, clientInfo, products } = req.body;

        // Logging to verify the incoming data
        console.log('Employee ID:', employeeId);
        console.log('Client Info:', clientInfo);
        console.log('Products:', products);

        // Loop over each product to create and save a document for each
        const orders = products.map(product => {
            return new inHouseOrder({
                name: clientInfo.clientName,
                companyName: clientInfo.companyName,
                address: clientInfo.address,
                paymentMethod: clientInfo.paymentMethod,
                category: product.category,
                productName: product.name,
                quantity: parseInt(product.quantity), // Ensure the quantity is a number
                price: parseFloat(product.amount),    // Ensure the amount is a number
                TotalAmount: parseFloat(product.totalAmount), // Ensure totalAmount is a number
                rentalDays: parseInt(product.rentalDays), // Ensure rentalDays is a number
                size: product.size,
                employeeId
            });
        });

        // Save all the orders to the database
        await inHouseOrder.insertMany(orders);
        console.log(orders)
        // Respond with a success message
        res.status(201).send({ message: 'Orders created successfully', orders });

    } catch (error) {
        console.error('Error creating orders:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};



const getInhouseOrder = async (req, res) => {
    const {employeeId} = req.params
    console.log(employeeId)
    try {
        const employeeOrders = await inHouseOrder.find({employeeId})
        console.log(employeeOrders);
        res.status(200).json(employeeOrders);
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getInhouseOrder, inhouseOrder
};
