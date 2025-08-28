// controllers/expenseController.js

const expenseService = require('../services/expenseService');
const User = require('../models/User'); 

// @desc    Get all expenses for the authenticated user
// @route   GET /expenses
// @access  Private
exports.getExpenses = async (req, res) => {
    try {
        const expenses = await expenseService.getExpenses(req.user._id);
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching expenses' });
    }
};

// @desc    Create a new expense
// @route   POST /expenses
// @access  Private
exports.createExpense = async (req, res) => {
    try {
        const { title, amount, category, description, date, note } = req.body; 

        if (!title || !amount || !category) {
            return res.status(400).json({ message: 'Title, amount, and category are required' });
        }

        const newExpense = await expenseService.createExpense({
            user: req.user._id, // Pass the user's MongoDB ObjectId
            title,
            amount,
            category,
            description,
            date,
            note
        });

        res.status(201).json(newExpense);
    } catch (error) {
        console.error('Error in createExpense:', error);
        res.status(500).json({ message: 'Server error while creating expense' });
    }
};

// @desc    Get a single expense by ID
// @route   GET /expenses/:id
// @access  Private
exports.getExpenseById = async (req, res) => {
    try {
        const expense = await expenseService.getExpenseById(req.params.id, req.user._id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update an expense by ID
// @route   PUT /expenses/:id
// @access  Private
exports.updateExpense = async (req, res) => {
    try {
        const updatedExpense = await expenseService.updateExpense(req.params.id, req.user._id, req.body);
        if (!updatedExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json(updatedExpense);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete an expense by ID
// @route   DELETE /expenses/:id
// @access  Private
exports.deleteExpense = async (req, res) => {
    try {
        const deletedExpense = await expenseService.deleteExpense(req.params.id, req.user._id);
        if (!deletedExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get monthly summary
// @route   GET /expenses/monthly-summary
// @access  Private
exports.getMonthlySummary = async (req, res) => {
    try {
        const summary = await expenseService.getMonthlySummary(req.user._id);
        res.status(200).json(summary);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get daily spending trends
// @route   GET /expenses/daily-trends/:year/:month
// @access  Private
exports.getDailyTrends = async (req, res) => {
    try {
        const { year, month } = req.params;
        const trends = await expenseService.getDailyTrends(req.user._id, parseInt(month), parseInt(year));
        res.status(200).json(trends);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get total expenses and total amount
// @route   GET /expenses/totals
// @access  Private
exports.getTotals = async (req, res) => {
    try {
        const totals = await expenseService.getTotals(req.user._id);
        res.status(200).json(totals);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Generate AI summary
// @route   POST /expenses/ai-summary
// @access  Private
exports.getAiSummary = async (req, res) => {
    try {
        // 1. Fetch the user's expenses first.
        const expenses = await expenseService.getExpenses(req.user._id);
        
        // 2. Pass only the expenses to the service. The service will create the prompt.
        const summary = await expenseService.getAiSummary(expenses);
        
        res.status(200).json({ summary });
    } catch (error) {
        console.error('Error generating AI summary:', error);
        res.status(500).json({ message: 'Server error while generating AI summary' });
    }
};

// @desc    OCR scan a receipt
// @route   POST /expenses/ocr-scan
// @access  Private
exports.ocrScan = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    
    try {
        const result = await expenseService.performOcr(req.file.buffer);
        
        if (!result) {
            return res.status(500).json({ message: 'OCR failed to process image' });
        }

        // --- The Fix ---
        // Validate required fields before saving to the database
        if (!result.amount || !result.category || !result.merchant) {
            console.error('OCR missing required fields:', { amount: result.amount, category: result.category, merchant: result.merchant });
            return res.status(400).json({ message: 'OCR could not extract all required data (amount, category, or merchant)' });
        }
        
        const expenseData = {
            user: req.user._id,
            title: result.merchant,
            amount: result.amount,
            category: result.category,
            description: `Expense from receipt scan - ${req.file.originalname}`,
            date: result.date || new Date().toISOString().split('T')[0]
        };

        const savedExpense = await expenseService.createExpense(expenseData);
        
        res.status(200).json({
            ocrResult: result,
            savedExpense: savedExpense,
            message: 'Receipt processed and expense saved successfully'
        });
    } catch (error) {
        console.error('OCR Error:', error);
        res.status(500).json({ message: 'Server error during OCR' });
    }
};
