/** @format */

const mongoose = require('mongoose');

const inHouseOrderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    TotalAmount: {
        type: Number,
        required: true
    },
    rentalDays: {
        type: Number,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    employeeId:{
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    }

});

module.exports = mongoose.model('InHouseOrder', inHouseOrderSchema);
