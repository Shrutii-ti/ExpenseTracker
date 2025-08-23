// controllers/authController.js

const authService = require('../services/authService');

// Login logic for Google SSO.
exports.googleLogin = async (req, res) => {
    console.log('🔄 Google Login Request Received');
    console.log('Request body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);
    
    const { idToken } = req.body;
    
    if (!idToken) {
        console.error('❌ No idToken in request body');
        return res.status(400).json({ message: 'idToken is required' });
    }

    const googlePayload = await authService.verifyGoogleToken(idToken);

    if (!googlePayload) {
        console.error('❌ Google token verification failed');
        return res.status(401).json({ message: 'Invalid Google token' });
    }

    // This line is the key change! It calls the new findOrCreateUser function.
    const user = await authService.findOrCreateUser(googlePayload);

    if (!user) {
        console.error('❌ Could not create or find user');
        return res.status(500).json({ message: 'Could not create or find user.' });
    }
    
    res.cookie('session-id', user.googleId, {
        httpOnly: true,
        signed: true,
        maxAge: 3600000,
        sameSite: 'strict',
    });

    console.log('✅ Login successful for user:', user.email);
    res.status(200).json({ message: 'Login successful' });
};

// Logout logic remains unchanged.
exports.logout = (req, res) => {
    res.clearCookie('session-id');
    res.status(200).json({ message: 'Logged out successfully' });
};

// Protected route logic - redirect to expense controller
exports.getExpenses = (req, res) => {
    // This route is now handled by the expense controller
    // Redirect to the proper expense endpoint
    res.redirect('/api/expenses');
};
