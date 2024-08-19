/** @format */

const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
	name: { type: String, required: true },
	description: { type: String },
	rentalPrice: { type: Number },
	quantity: { type: Number },
	duration: { type: String, required: true },
	category: { type: String, required: true },
	available: { type: Boolean, default: true },
	size: [{ type: String }],
	shortAccessory: { type: Boolean, default: false },
	maintenance: { type: Boolean, default: true },
	newArrival: { type: Boolean, default: true },
	image: { type: String, required: true },
	createdAt: { type: Date, default: Date.now }
});

InventoryItemSchema.methods.updateNewArrivalStatus = async function () {
	const currentDate = new Date();
	const createdAtDate = new Date(this.createdAt);
	const diffTime = Math.abs(currentDate - createdAtDate);
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays > 30) {
		this.newArrival = false;
		await this.save();
	}
};

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);



