/** @format */

const mongoose = require('mongoose');

const RentalSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	itemName: {
		type: String
	},
	itemId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'InventoryItem'
	},
	quantity: { type: Number },
	rentalDate: { type: Date },
	returnDate: { type: Date },
	status: { type: String, default: 'rented' }, // Options: rented, returned, overdue
	termsAccepted: { type: Boolean, required: true },
	price: {
		type: String
	},
	paymentType:{
		type:String,
		enum: ['cash', 'online', 'bank transfer','credit card','debit card']
	}

});

module.exports = mongoose.model('Rental', RentalSchema);
