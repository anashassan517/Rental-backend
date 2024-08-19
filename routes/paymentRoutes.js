const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth')
const { trackPaymentStatus,
    listPaymentsByUser,
    executePayPalPayment,
    processPayPalPayment,
    processStripePayment, trackUserPaymentStatus } = require('../controllers/PaymentController');
const { generateInvoice,
    listInvoices } = require('../controllers/InvoiceController');


// Payment Processing Routes
router.post('/stripe', processStripePayment);
router.post('/paypal', auth, processPayPalPayment);
router.get('/paypal/success', auth, executePayPalPayment);

// Invoice Generation Routes
router.get('/invoices/:paymentId', auth, generateInvoice);
router.get('/invoices', auth, listInvoices);

// Payment Tracking Routes
router.get('/:paymentId', adminAuth, trackPaymentStatus);
router.get('/:paymentId', auth, trackUserPaymentStatus);
router.get('/user/:userId', adminAuth, listPaymentsByUser);

module.exports = router;
