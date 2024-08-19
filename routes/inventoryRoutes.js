const express = require('express');
const { addShortItem, getShortAccessories, getLowInventory, getCategoryItems, totalitems, getNewItems, getAvailableItems, trackAvailabilityAndMaintenance, addItem, editItem, deleteItem, getItems, getItemById } = require('../controllers/inventoryController');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();


const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/'); // Directory where files will be stored
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname)); // Rename the file with a timestamp
	}
});

//Initialize multer with the storage engine
const upload = multer({
	storage: storage,
	limits: { fileSize: 2000000 }, // Limit file size to 2MB
	fileFilter: function (req, file, cb) {
		checkFileType(file, cb);
	}
});

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

router.get('/low-inventory', getLowInventory);
router.get('/total-items', totalitems);
router.get('/categorize-items/:Category', getCategoryItems);
router.post('/', upload.single('image'), addItem);
router.post('/short', upload.single('image'), addShortItem);
router.get('/short', upload.single('image'), getShortAccessories);
router.put('/:id', upload.single('image'), editItem);
router.delete('/:id', deleteItem);
router.get('/get-inventory', getItems);    // have to add auth later removed for testing purpose
router.get('/get-new-inventory', getNewItems);
router.get('/:id', getItemById);
router.get('/available', auth, getAvailableItems); // Place this line before the general get route
//router.get('/categorize', categorizeItem);
router.post('/track/:id', trackAvailabilityAndMaintenance);
//router.get('/',  getItems);


module.exports = router;
