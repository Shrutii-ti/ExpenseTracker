// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// New public route for Google SSO.
router.post('/google-login', authController.googleLogin);

// Logout route remains unchanged.
router.post('/logout', authController.logout);

// Protected routes (use the middleware)
// The middleware will verify the existence of the session cookie.
router.get('/expenses', authMiddleware.protect, authController.getExpenses);

module.exports = router;
