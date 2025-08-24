// services/authService.js

const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Service function to verify a Google ID Token
exports.verifyGoogleToken = async (idToken) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        return payload;
    } catch (error) {
        console.error('--- Error Verifying Google Token ---');
        console.error('Error:', error.message);
        return null;
    }
};

// Service function to find or create a user in the database
exports.findOrCreateUser = async (googlePayload) => {
    try {
        let user = await User.findOne({ googleId: googlePayload.sub });

        if (!user) {
            console.log('User not found. Creating a new user...');
            user = new User({
                googleId: googlePayload.sub,
                name: googlePayload.name,
                email: googlePayload.email,
            });
            await user.save();
            console.log('New user created successfully:', user.email);
        } else {
            console.log('User found:', user.email);
        }
        
        return user;
    } catch (error) {
        console.error('--- Database Error in findOrCreateUser ---');
        console.error('Error:', error.message);
        return null;
    }
};
