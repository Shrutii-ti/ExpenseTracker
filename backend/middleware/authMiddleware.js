// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

// Middleware to protect routes by verifying the session token
exports.protect = (req, res, next) => {
    const sessionToken = req.signedCookies['session-token'];

    if (!sessionToken) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        // Verify the token using your secret key
        jwt.verify(sessionToken, process.env.JWT_SECRET);
        // If the token is valid, pass control to the next middleware or route handler
        next();
    } catch (err) {
        // If the token is invalid or expired, clear the cookie and send an error
        res.clearCookie('session-token');
        return res.status(401).json({ message: 'Session expired' });
    }
};