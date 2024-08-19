// paymentConfig.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox', // or 'live'
  'client_id': process.env.PAYPAL_CLIENT_ID,
  'client_secret': process.env.PAYPAL_CLIENT_SECRET
});

module.exports = { stripe, paypal };
