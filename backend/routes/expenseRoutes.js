// routes/expenseRoutes.js

const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// All expense routes are protected
router.use(authMiddleware.protect);

// Dashboard and AI routes (must come before /:id routes)
router.get('/monthly-summary', expenseController.getMonthlySummary);
router.get('/daily-trends/:year/:month', expenseController.getDailyTrends);
router.get('/totals', expenseController.getTotals);
router.get('/ai-summary', expenseController.getAiSummary);

// Main CRUD routes (/:id routes must come last)
router.get('/', expenseController.getExpenses);
router.post('/', expenseController.createExpense);
router.get('/:id', expenseController.getExpenseById);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

// OCR route with multer middleware
router.post('/ocr-scan', upload.single('receipt'), expenseController.ocrScan);

module.exports = router;
