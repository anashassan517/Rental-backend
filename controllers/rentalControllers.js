/** @format */

const express = require('express');
const Rental = require('../models/Rentals');
const {
	findOne,
	findByIdAndUpdate,
	findByIdAndDelete,
} = require('../models/User');

const createRental = async (req, res) => {
	const { userId, itemName, itemId, returnDate, termsAccepted } = req.body;
	try {
		const newRentals = new Rental({
			userId,
			itemName,
			itemId,
			returnDate,
			termsAccepted
		});
		await newRentals.save();
		console.log("created");
		res.status(201).json(newRentals);
	} catch (error) {
		console.error('Error while creating rental:', error);
		res.status(500).json({ message: error.message });
	}
};

const getUserRentals = async (req, res) => {
	try {
		const rentals = await Rental.find().populate('userId itemId');
		res.status(200).json(rentals);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const getRentalById = async (req, res) => {
	const { id } = req.params;

	try {
		const rental = await Rental.findById(id).populate('userId itemId');
		if (!rental) return res.status(404).json({ message: 'Rental not found' });
		res.status(200).json(rental);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const updateRental = async (req, res) => {
	const { id } = req.params;
	const { userId, itemId, rentalDate, returnDate, status } = req.body;

	try {
		const updatedRental = await Rental.findByIdAndUpdate(
			id,
			{ userId, itemId, rentalDate, returnDate, status },
			{ new: true }
		);
		res.status(200).json(updatedRental);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const getRentalHistory = async (req, res) => {
	const { userId } = req.params;

	try {
		const rentalHistory = await Rental.find({ userId }).populate('itemId');
		res.status(200).json(rentalHistory);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const getRentalStatus = async (req, res) => {
	const { rentalId } = req.params;

	try {
		const rental = await Rental.findById(rentalId);
		res.status(200).json({ status: rental.status });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const getFastRentals = async (req, res) => {
	try {
		const fastRentals = await Rental.aggregate([
			{
				$group: {
					_id: "$itemId",
					itemName: { $first: "$itemName" },
					rentCount: { $sum: 1 } // Count the number of times each item is rented
				}
			},
			{
				$sort: { rentCount: -1 } // Sort by rent count in descending order
			},
			{
				$limit: 3 // Limit to top 10 fast rentals
			}
		]);

		res.status(200).json({ fastRentals });
	} catch (err) {
		console.error("Error fetching fast rentals:", err.message);
		res.status(500).send({ error: 'Internal Server Error' });
	}
};

const getSlowRentals = async (req, res) => {
	try {
		const slowRentals = await Rental.aggregate([
			{
				$group: {
					_id: "$itemId",
					itemName: { $first: "$itemName" },
					rentCount: { $sum: 1 } // Count the number of times each item is rented
				}
			},
			{
				$sort: { rentCount: 1 } // Sort by rent count in ascending order
			},
			{
				$limit: 3 // Limit to top 10 slow rentals
			}
		]);

		res.status(200).json({ slowRentals });
	} catch (err) {
		console.error("Error fetching slow rentals:", err.message);
		res.status(500).send({ error: 'Internal Server Error' });
	}
};

module.exports = {
	getSlowRentals,
	getFastRentals,
	createRental,
	getUserRentals,
	getRentalById,
	updateRental,
	getRentalHistory,
	getRentalStatus
};
