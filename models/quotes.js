/** @format */

const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({

    name: { type: String , required:true},
    email: { type: String , required:true},
    phone: { type: Number , required:true},
    msg: { type: String , required:true }

});

module.exports = mongoose.model('Quote', QuoteSchema);
