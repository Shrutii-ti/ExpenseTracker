// services/authService.js

const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.verifyGoogleToken = async (idToken) => {
    console.log('--- Starting Google Token Verification ---');
    console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
    console.log('Received idToken (first 50 chars):', idToken ? idToken.substring(0, 50) + '...' : 'NO TOKEN');
    
    // Check if we have a valid Google Client ID
    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your_google_client_id_here') {
        console.error('❌ GOOGLE_CLIENT_ID is not properly configured in .env file');
        console.error('Current value:', process.env.GOOGLE_CLIENT_ID);
        return null;
    }
    
    if (!idToken) {
        console.error('❌ No idToken provided');
        return null;
    }
    
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        console.log('✅ Google Token Verified Successfully');
        console.log('User info:', {
            sub: payload.sub,
            email: payload.email,
            name: payload.name
        });
        return payload;
    } catch (error) {
        console.error('❌ Error Verifying Google Token');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Full error:', error);
        return null;
    }
};

exports.findOrCreateUser = async (googlePayload) => {
    console.log('--- Attempting to Find or Create User ---');
    console.log('Searching for user with googleId:', googlePayload.sub);

    // Use a try/catch block to catch potential database errors
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

exports.getExpensesData = () => {
    return [
        { id: 1, category: 'Food', amount: 500 },
        { id: 2, category: 'Travel', amount: 1500 },
    ];
};
