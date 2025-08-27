// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify the session ID and set user info.
exports.protect = async (req, res, next) => {
    const sessionId = req.signedCookies['session-id'];

    if (!sessionId) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        // Find the user by googleId from the database
        const user = await User.findOne({ googleId: sessionId });
        
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Set the complete user object
        req.user = user;
        
        console.log('Auth middleware: User authenticated with googleId:', sessionId);
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ message: 'Authentication error' });
    }
};
