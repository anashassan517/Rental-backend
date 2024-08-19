/** @format */

const mongoose = require('mongoose');

const GuestOrderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phoneNumber: { type: Number, required: true },
    address: { type: String, required: true },
    nationalId: { type: String, required: true },
    imageFront: { type: String, required: true },
    imageBack: { type: String, required: true },
    productId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true
    },
    productName: {
        type: String,
        required: true
    },
    duration: {
        type: Number,

    },
    rentDate: {
        type: Date,
        required: true

    },
    rentReturnDate: {
        type: Date,
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
    size: {
        type: String
    },
});

module.exports = mongoose.model('GuestOrder', GuestOrderSchema);
