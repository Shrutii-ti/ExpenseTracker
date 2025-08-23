// models/User.js

const mongoose = require('mongoose');

// Define the User schema
const userSchema = mongoose.Schema(
    {
        googleId: {
            type: String,
            required: true,
            unique: true, // Ensures no two users have the same Google ID
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields automatically
    }
);

// Create the User model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
