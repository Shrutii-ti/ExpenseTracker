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

// Main CRUD routes
router.get('/', expenseController.getExpenses);
router.post('/', expenseController.createExpense);
router.get('/:id', expenseController.getExpenseById);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

// New dashboard and AI routes
router.get('/monthly-summary', expenseController.getMonthlySummary);
router.get('/daily-trends/:year/:month', expenseController.getDailyTrends);
router.get('/totals', expenseController.getTotals);
router.post('/ai-summary', expenseController.getAiSummary);

// OCR route with multer middleware
router.post('/ocr-scan', upload.single('receipt'), expenseController.ocrScan);

module.exports = router;
