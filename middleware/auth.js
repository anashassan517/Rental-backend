/** @format */

const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
	const token = req.header('Authorization')?.replace('Bearer ', '');
	console.log("User authentication Auth Middleware.")
	if (!token) return res.status(401).send('Access Denied');
	try {
		const verified = jwt.verify(token, process.env.JWT_SECRET);
		req.user = verified;
		next();
	} catch (err) {
		res.status(400).send('Invalid Token');
	}
};

const adminAuth = (req, res, next) => {
	auth(req, res, () => {
		console.log(req.user.role)
		if (req.user.role === 'admin') {
			next();
		} else {
			res.status(403).send('Access Denied');
		}
	});
};

module.exports = { auth, adminAuth };
