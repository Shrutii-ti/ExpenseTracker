// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

// Middleware to verify the session ID and set user info.
exports.protect = (req, res, next) => {
    const sessionId = req.signedCookies['session-id'];

    if (!sessionId) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    // Set the user info based on the session ID (which is the Google ID)
    // The session ID is the Google ID from the login process
    req.user = {
        googleId: sessionId
    };
    
    console.log('Auth middleware: User authenticated with googleId:', sessionId);
    next();
};
