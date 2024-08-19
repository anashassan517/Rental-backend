// /** @format */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const bcrypt = require('bcryptjs');

const orderSchema = new Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true
    },
    productName: {
        type: String,
        required: true
    },
    duration: {
        type: Number,

    },
    rentDate: {
        type: Date,
        required: true

    },
    rentReturnDate: {
        type: Date,
        required: true

    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    size: {
        type: String
    },
    isAgreed: { type: Boolean, default: true },
    isOrderVerified: {
        type: String,
        enum: ['Rejected', 'Pending Client', 'Pending Payment', 'Hold', 'Delivered', 'Out for Delivery', 'Delivery Scheduled'],
        default: 'Pending Client'
    },
    comment: {
        type: String
    }
}, { _id: false }); // Disable _id for subdocuments

// Define the user schema
const userSchema = new Schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows the field to be optional
    },
    password: {
        type: String,
        validate: {
            validator: function (v) {
                // Password is required only if googleId is not present
                return this.googleId ? true : v.length > 0;
            },
            message: props => 'Password is required'
        }
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'superAdmin', 'employee'],
        default: 'user'
    },
    name: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        //required: true,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['Accepted', 'Rejected', 'Pending'],
        default: 'Pending'
    },
    isAdminVerified: {
        type: Boolean,
        default: false
    },
    isEmployeeVerified: {
        type: Boolean,
        default: false
    },
    name: { type: String, required: true },
    phoneNumber: { type: Number },
    address: { type: String },
    nationalId: { type: String },
    imageFront: { type: String },
    imageBack: { type: String },
    orders: [orderSchema] // Array of order subdocuments

});

// userSchema.pre('save', async function (next) {
//     if (this.isModified('password')) {
//         this.password = bcrypt.hash(this.password, 10);
//     }
//     next();
// });

// userSchema.methods.comparePassword = async function (password) {
//     return await bcrypt.compare(password, this.password);
// };

// Create the model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
