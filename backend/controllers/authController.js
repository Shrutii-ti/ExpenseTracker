// controllers/authController.js

const authService = require('../services/authService');

// Login logic
exports.login = (req, res) => {
    // ... (rest of the login code is the same)
    const { email, password } = req.body;
    const user = authService.validateUser(email, password);

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = authService.generateToken(user);

    res.cookie('session-token', token, {
        httpOnly: true,
        signed: true,
        maxAge: 3600000,
        sameSite: 'strict',
    });

    res.status(200).json({ message: 'Login successful' });
};

// Logout logic
exports.logout = (req, res) => {
    res.clearCookie('session-token');
    res.status(200).json({ message: 'Logged out successfully' });
};

// Protected route logic (now much cleaner!)
exports.getExpenses = (req, res) => {
    // The middleware already handled the authentication.
    // We just need to fetch the data and send it back.
    const expenses = authService.getExpensesData();
    res.status(200).json(expenses);
};