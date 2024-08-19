/** @format */

const Quote = require('../models/quotes');
const getQuotes = async (req, res) => {
	try {
        const quotes = await Quote.find({});
        if(!quotes){
            console.log("quotes not found");
            res.json({message : "no quotes available"});
        }
        console.log(quotes);
        res.status(200).json(quotes);
    } catch (error) {
        
    }
};

const postQuotes = async (req, res) => {
	const {name,email,phone,msg} = req.body;
    console.log(req.body);
    try {
        const newQuote = new Quote({ name,email,phone,msg });
		await newQuote.save();
		console.log("Quote sent successfully")
		res.status(201).json(newQuote);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
	postQuotes,getQuotes
};
