// const { paypal } = require('../config/PaymentConfig');
const Payment = require('../models/Payment');

// Stripe Payment Endpoint
// const processStripePayment = async (req, res) => {
//     try {
//         console.log("heloo")
//         // const { token, amount, userId, rentalId } = req.body;

//         const { amount } = req.body;

//         const charge = await stripe.charges.create({
//             amount: amount * 100,
//             currency: 'usd',
//             source: token,
//             // description: `Payment for rental ${rentalId}`
//         });

//         const payment = new Payment({
//             // userId,
//             // rentalId,
//             amount,
//             paymentMethod: 'Stripe',
//             paymentDate: new Date(),
//             invoice: charge.receipt_url
//         });

//         await payment.save();

//         res.status(200).send({ success: true, payment });
//     } catch (error) {
//         res.status(500).send({ error: 'Payment failed', details: error.message });
//     }
// };
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Load Stripe with secret key

const processStripePayment = async (req, res) => {
    try {
        const { products } = req.body;

        const lineItems = products.map((product) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: product.name // Make sure this matches the frontend data structure
                },
                unit_amount: product.price * 100, // Ensure price is in the smallest currency unit
            },
            quantity: product.qnty // Make sure this matches the frontend data structure
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: "http://localhost:5173/success", // Corrected typo in the URL
            cancel_url: "http://localhost:5002/cancel",
        });

        res.json({ id: session.id });

    } catch (error) {
        console.error("Payment processing error:", error.message);
        res.status(500).send({ error: 'Payment failed', details: error.message });
    }
};

module.exports = processStripePayment;


// PayPal Payment Endpoint
const processPayPalPayment = (req, res) => {
    const { amount, userId, rentalId } = req.body;

    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://yoururl.com/success",
            "cancel_url": "http://yoururl.com/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": `Rental ${rentalId}`,
                    "sku": "001",
                    "price": amount,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": amount
            },
            "description": `Payment for rental ${rentalId}`
        }]
    };

    paypal.payment.create(create_payment_json, async (error, payment) => {
        if (error) {
            res.status(500).send({ error: 'Payment failed', details: error.message });
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    const paymentDoc = new Payment({
                        userId,
                        rentalId,
                        amount,
                        paymentMethod: 'PayPal',
                        paymentDate: new Date(),
                        invoice: payment.links[i].href
                    });
                    await paymentDoc.save();

                    res.status(200).send({ success: true, approval_url: payment.links[i].href });
                }
            }
        }
    });
};

// PayPal Success Callback Endpoint
const executePayPalPayment = (req, res) => {
    const { PayerID, paymentId } = req.query;
    const execute_payment_json = {
        "payer_id": PayerID
    };

    paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
        if (error) {
            res.status(500).send({ error: 'Payment execution failed', details: error.message });
        } else {
            res.status(200).send({ success: true, payment });
        }
    });
};

// Track Payment Status Endpoint
const trackPaymentStatus = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await Payment.findById(paymentId);

        if (!payment) {
            return res.status(404).send({ error: 'Payment not found' });
        }

        res.status(200).send({ success: true, payment });
    } catch (error) {
        res.status(500).send({ error: 'Failed to track payment status', details: error.message });
    }
};

const trackUserPaymentStatus = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const userPayments = await Payment.findById(paymentId);
        if (!userPayments) {
            return res.status(404).send({ error: 'Payment not found' });
        }
        res.status(200).send({ success: true, userPayments });
    } catch (error) {
        res.status(500).send({ error: 'Failed to track payment status', details: error.message });
    }
};

// List Payments by User Endpoint
const listPaymentsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const payments = await Payment.find({ userId });

        res.status(200).send({ success: true, payments });
    } catch (error) {
        res.status(500).send({ error: 'Failed to list payments', details: error.message });
    }
};


module.exports = {
    trackPaymentStatus,
    listPaymentsByUser,
    executePayPalPayment,
    processPayPalPayment,
    processStripePayment,
    trackUserPaymentStatus
};