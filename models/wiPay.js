/** @format */

const mongoose = require('mongoose');

const wiPaySchema = new mongoose.Schema({
    account: {
        type: Number,
        required: true
    },
    trans_id: {
        type: String,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    voucher: {
        type: String,
        required: true
    },
    status: {
        type: Boolean
    }
});

module.exports = mongoose.model('WiPay', wiPaySchema);
