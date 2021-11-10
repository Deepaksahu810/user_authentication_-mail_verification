const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, "Please enter your name!"],
        trim: true
    },
    middlename: {
        type: String,     
    },lastname: {
        type: String,
    },
    email: {
        type: String,
        required: [true, "Please enter your email!"],
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: [true, "Please enter your password!"]
    },
    role: {
        type: Number,
        default: 0 // 0 = user, 1 = admin
    },mobilenu: {
        type: Number,
        required: [true, "Please enter your name!"],
        trim: true
    },gender: {
        type: String,
        required: [true, "Please enter your name!"],
        trim: true
    },business: {
        type: String,
        required: [true, "Please enter your name!"],
        trim: true
    },city: {
        type: String,
        required: [true, "Please enter your name!"],
        trim: true
    },pincode: {
        type: Number,
        required: [true, "Please enter your name!"],
        trim: true
    }

}, {
    timestamps: true
})

module.exports = mongoose.model("Users", userSchema)