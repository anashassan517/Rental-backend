/** @format */

const express = require('express');
const {
	FetchOrder,
	register,
	verifyOrder,
	login,
	getProfile,
	updateProfile,
	OtpVerification,
	OrderItem,
	getUserDetails,
	updateUser
	//imageUpload
} = require('../controllers/userController');
const { addGuestOrder, FetchGuestOrder, getGuest } = require('../controllers/guestcontroller')
const { auth } = require('../middleware/auth');
const router = express.Router();

//const upload = require('../config/multerConfig'); 
const User = require('../models/User')


const multer = require('multer');

const path = require('path');

const nicstorage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'gallery/'); // Directory where files will be stored
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname)); // Rename the file with a timestamp
	}
});

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		// Specify the directory where you want to save uploaded files
		cb(null, 'uploads/');
	},
	filename: (req, file, cb) => {
		// Set the file name to be the original name or a custom name
		cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
	}
});

const upload = multer({ storage: storage });


const national = multer({
	storage: nicstorage,
	fileFilter: function (req, file, cb) {
		checkFileType(file, cb);
	}
}).fields([
	{ name: 'imageFront', maxCount: 1 },
	{ name: 'imageBack', maxCount: 1 }
]);
//Check file type
function checkFileType(file, cb) {
	const filetypes = /jpeg|jpg|png/;
	const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
	const mimetype = filetypes.test(file.mimetype);

	if (extname) {
		return cb(null, true);
	} else {
		cb('Error: Images Only!');
	}
}


router.post('/add', national, addGuestOrder);
router.post('/verify-order', verifyOrder);
router.post('/register', national, register);
router.post('/verify-otp', OtpVerification);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.put('/profile', updateProfile);
router.post('/order-item', national, OrderItem);
router.get('/order-details/:id', FetchOrder);
router.get('/guest-order-details/:name', FetchGuestOrder),
	router.get('/get-guest', getGuest)
router.get('/getUserDetails/:id', getUserDetails)
// router.put('/updateUserDetails/:id', updateUser)
router.patch('/updateUserDetails/:id', upload.fields([{ name: 'imageFront' }, { name: 'imageBack' }]), updateUser);

//router.post('/upload/:userId', upload.single('image'), imageUpload )






//Set up storage engine


// router.post('/upload/:userId',upload.single('image'), async (req, res) => {
// 	const { userId } = req.params;
// 	console.log(req.body)

// 	if (!req.file) {
// 	  return res.status(400).send({ error: 'No file uploaded' });
// 	}
// 	console.log("1")
// 	const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

// 	try {
// 		console.log("2")
// 	  const user = await User.findById(userId);
// 	  if (!user) {
// 		return res.status(404).send({ error: 'User not found' });
// 	  }

// 	  user.image = imageUrl;
// 	  await user.save();

// 	  res.status(200).send({ success: true, imageUrl });
// 	} catch (error) {

// 	  res.status(500).send({ error: 'Failed to upload image', details: error.message });
// 	}
//   });




module.exports = router;
