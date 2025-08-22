// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected routes (use the middleware)
// The protect middleware will run before the getExpenses function
router.get('/expenses', authMiddleware.protect, authController.getExpenses);

module.exports = router;