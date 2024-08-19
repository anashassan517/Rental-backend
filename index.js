/** @format */

const express = require('express');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');
// Initialize Express app
const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(methodOverride('_method'));
app.use(cors());
app.options('*', cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve files from the 'uploads' folder

// Passport Config
require('./config/passport')(passport);

app.use(session({
    secret: 'hdydgeygdgdgd',
    resave: false,
    saveUninitialized: true,
}));

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err));

// Set up GridFS
let gfs;
const conn = mongoose.connection;
conn.once('open', () => {
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
});

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'gallery/'); // Directory where files will be stored
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Rename the file with a timestamp
    }
});

const gallery = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

// Check file type function
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// Routes for image uploads and gallery management
app.post('/upload-multiple', gallery.array('images', 10), (req, res) => {
    if (!req.files) {
        return res.status(400).send('No files uploaded.');
    }
    res.send({ message: 'Multiple images uploaded successfully', files: req.files });
});

app.get('/get-images', (req, res) => {
    fs.readdir('gallery/', (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory.');
        }
        const imageFiles = files.map(file => ({
            filename: file,
            url: `https://2lkz6gq8-5001.inc1.devtunnels.ms/:${PORT}/gallery/${file}`
        }));
        res.send(imageFiles);
    });
});

app.delete('/delete-image/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'gallery', filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.status(404).send('File not found.');
            }
            return res.status(500).send('Unable to delete file.');
        }
        res.send({ message: 'Image deleted successfully' });
    });
});

app.use('/gallery', express.static(path.join(__dirname, 'gallery')));

const API_KEY = 'l8nqngd034ut';
const BASE_URL = 'https://sandbox.wipayfinancial.com/v1/voucher_pay';


const WiPay = require('./models/wiPay');

app.post('/wipay/voucher_pay', async (req, res) => {
    const { account_number, total, details, voucher } = req.body;
    console.log(req.body);
    const payload = new URLSearchParams({
        account_number: account_number,
        details: details,
        total: total,
        voucher: voucher,
        api_key: API_KEY,
    });
    console.log("1")
    try {
        console.log("2")
        const response = await axios.post(BASE_URL, payload.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        console.log("3")

        // Extract response data
        const { status, msg, trxn_id, value } = response.data;
        console.log(status, msg, trxn_id, value);
        // Create new WiPay document
        const newWiPay = new WiPay({
            account: parseInt(account_number, 10),
            trans_id: trxn_id,
            total: parseFloat(total),
            value: parseFloat(value),
            voucher: voucher,
            status: status === 'success'
        });
        console.log("4")
        // Save document to the database
        await newWiPay.save();
        console.log("5")
        // Send success response
        res.status(200).json({ status: status, value: value, transaction: trxn_id, account: account_number, voucher: voucher });
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ message: error.message });
        }
    }
});

// app.post('/wipay/voucher_check', async (req, res) => {
//     const { voucher } = req.body;

//     const payload = new URLSearchParams({
//       voucher: voucher,
//       api_key: API_KEY,
//     });

//     try {
//       const response = await axios.post(BASE_URL, payload.toString(), {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//       });
//       res.status(200).json(response.data);
//     } catch (error) {
//       if (error.response) {
//         res.status(error.response.status).json(error.response.data);
//       } else {
//         res.status(500).json({ message: error.message });
//       }
//     }
//   });




// app.post('/wipay/creditcard', async (req, res) => {
//     const {
//         account_number,
//         amount,
//         currency,
//         description,
//         redirect_url,
//         card_number,
//         card_cvv,
//         card_expiry_month,
//         card_expiry_year
//     } = req.body;

//     const payload = new URLSearchParams({
//         account_number,
//         amount,
//         currency,
//         description,
//         redirect_url,
//         card_number,
//         card_cvv,
//         card_expiry_month,
//         card_expiry_year,
//         api_key: API_KEY,
//     });

//     try {
//         const response = await axios.post(BASE_URL, payload.toString(), {
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded',
//             },
//         });
//         res.status(200).json(response.data);
//     } catch (error) {
//         console.error('Error making request:', error);
//         if (error.response) {
//             console.error('Response data:', error.response.data);
//             res.status(error.response.status).json(error.response.data);
//         } else if (error.request) {
//             console.error('Request data:', error.request);
//             res.status(500).json({ message: 'No response received from server' });
//         } else {
//             console.error('Error message:', error.message);
//             res.status(500).json({ message: error.message });
//         }
//     }
// });













// Import and use routes
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const authRoutes = require('./routes/authRoutes'); // Adjust the path as necessary
const quoteRoutes = require('./routes/quoteRoutes')
const inHouseOrderRoutes = require('./routes/inHouseOrderRoutes');
const { urlencoded } = require('body-parser');

app.post('/create-payment', async (req, res) => {
    const { amount, currency, paymentMethod, customerId, callbackUrl } = req.body;

    try {
        const response = await axios.post('https://jm.wipayapi.com/v1/gateway/', {
            amount,
            currency,
            payment_method: paymentMethod,
            customer_id: customerId,
            callback_url: callbackUrl,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer l8nqngd034ut'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: error.message });
    }
});
app.use('/api/inhouse', inHouseOrderRoutes)
app.use('/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/favourites', favoriteRoutes);
app.use('/api/quote', quoteRoutes);
// Server listening
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
