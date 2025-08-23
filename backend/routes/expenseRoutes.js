// routes/expenseRoutes.js

const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');

// All expense routes are protected
router.use(authMiddleware.protect);

// GET /api/expenses - Get all expenses for the authenticated user
router.get('/', expenseController.getExpenses);

// POST /api/expenses - Create a new expense
router.post('/', expenseController.createExpense);

// PUT /api/expenses/:id - Update an expense
router.put('/:id', expenseController.updateExpense);

// DELETE /api/expenses/:id - Delete an expense
router.delete('/:id', expenseController.deleteExpense);

// GET /api/expenses/stats - Get expense statistics
router.get('/stats', expenseController.getExpenseStats);

module.exports = router;
