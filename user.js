/*RMIT University Vietnam
Course: COSC2430 Web Programming
Semester: 2023A
Assessment: Assignment 2
Author: Ho Minh Duc, Nguyen Bao Hoang, Muhammad Zainulabideen Noaman, Pham Tuan Vy 
ID: s3994277, s3978685, s4021266, s3989482
Acknowledgement: chatGPT*/
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const uniqueValidator = require('mongoose-unique-validator');

const options = { discriminatorKey: 'userType' };

const commonUserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        match: /^[A-Za-z0-9]{8,15}$/,
        minlength: 8,
        maxlength: 15,
    },
    password: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
    },
});

commonUserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

const User = mongoose.model('User', new mongoose.Schema(commonUserSchema, options));

const vendorSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            maxlength: 20,
        },
        password: {
            type: String,
            required: true
        },
        businessName: {
            type: String,
            maxlength: 20,
            required: true,
            unique: true
        },
        businessAddress: {
            type: String,
            maxlength: 100,
            required: true,
        }
    },
    options
);

vendorSchema.plugin(uniqueValidator, { message: '{VALUE} has been used. Go back and change your {PATH}' });
const Vendor = User.discriminator('vendor', vendorSchema);

const customerSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            maxlength: 20,
        },
        password: {
            type: String,
            required: true
        },
        name: String,
        address: String,
    },
    options
);
const Customer = User.discriminator('customer', customerSchema);

const shipperSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            maxlength: 20,
        },
        password: {
            type: String,
            required: true
        },
        distributionHub: {
            type: String,
            required: true,
            default: "d1",
            enum: ["d1", "d7", "abd"]
        }
    },
    options
);
const Shipper = User.discriminator('shipper', shipperSchema);

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            minlength: 10,
            maxlength: 30,
        },
        category: {
            type: String,
            enum: ['shoes', 'stationery', 'phone case'],
        },
        price: {
            type: Number,
            required: true,
            min: 1,
        },
        description: {
            type: String,
            maxlength: 500,
        },
        image: {
            type: String,
            required: true,
        },
    },
    options
);

const Product = mongoose.model('Product', productSchema);

const products = [
    {
        name: 'Men Sport-wear Shoe',
        category: 'shoes',
        price: 14,
        description: 'Mens sportswear shoes are athletic footwear designed for performance and style during physical activities',
        image: 'shoe1.webp'
    },
    {
        name: 'Female Sport-wear Shoe',
        category: 'shoes',
        price: 12,
        description: 'Women sport shoes: stylish, supportive, and built for active pursuits.',
        image: 'shoe2.png'
    },
    {
        name: 'Golden Sport Shoes',
        category: 'shoes',
        price: 999,
        description: 'Golden sport shoes: performance and style in one.',
        image: 'shoe3.webp'
    },
    {
        name: "Correction Tape",
        category: 'stationery',
        price: 5,
        description: 'White adhesive strip for document errors.',
        image: 'stationeryob1.jpg'
    },
    {
        name: "Rollerball Pen",
        category: 'stationery',
        price: 1,
        description: 'Smooth writing with rolling ball tip',
        image: 'stationeryob2.jpg'
    },
    {
        name: "Fountain-desk Pen stand",
        category: 'stationery',
        price: 3,
        description: 'An elegant addition to your workspace.',
        image: 'stationeryob3.jpg'
    },
    {
        name: "Summer Phone Case",
        category: 'phone case',
        price: 1,
        description: 'Protect your device with a touch of seasonal style.',
        image: 'phonecase1.jpg'
    },
    {
        name: "Cute Transparent Phone Case",
        category: 'phone case',
        price: 1,
        description: 'Showcase your style while keeping your device safe.',
        image: 'phonecase2.jpg'
    },
    {
        name: "Beach-Wave Phone Case",
        category: 'phone case',
        price: 1,
        description: 'Bring coastal vibes to your device.',
        image: 'phonecase3.jpg'
    }
];

// Insert many documents
Product.insertMany(products)
    .then(() => console.log('Many products are saved'))
    .catch((error) => console.log(error.message));

const orderSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
    },
    customer_name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    total_price: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "Active",
        required: true
    },
    business_name: {
        type: String,
        required: true
    },
    business_address: {
        type: String,
        required: true
    },
    products_list: {
        type: Array,
        required: true
    },
    products_count: {
        type: Number,
        required: false,
    }
}, options);

orderSchema.pre('validate', function (next) {
    this.products_count = this.products_list.length
    next();
});

const Order = mongoose.model('order-info', orderSchema);

module.exports = { Vendor, Customer, Shipper, User, Product, Order };