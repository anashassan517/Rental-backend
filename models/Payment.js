const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Payment Schema
const paymentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    // required: true
  },
  rentalId: {
    type: Schema.Types.ObjectId,
    ref: 'Rental',
    // required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    // required: true,
    enum: ['Stripe', 'PayPal', 'Credit Card', 'Bank Transfer'] // Add any other payment methods you support
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  invoice: {
    type: String,
    // required: true
  }
});

// Create the Payment model
const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
