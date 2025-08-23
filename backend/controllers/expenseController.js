// controllers/expenseController.js

const Expense = require('../models/Expense');
const User = require('../models/User');

// Get all expenses for the authenticated user
exports.getExpenses = async (req, res) => {
    try {
        const user = await User.findOne({ googleId: req.user.googleId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const expenses = await Expense.find({ userId: user._id }).sort({ date: -1 });
        res.status(200).json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Server error while fetching expenses' });
    }
};

// Create a new expense
exports.createExpense = async (req, res) => {
    try {
        const { title, amount, category, description, date } = req.body;
        
        // Validate required fields
        if (!title || !amount || !category) {
            return res.status(400).json({ message: 'Title, amount, and category are required' });
        }

        const user = await User.findOne({ googleId: req.user.googleId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const expense = new Expense({
            userId: user._id,
            title,
            amount: parseFloat(amount),
            category,
            description: description || '',
            date: date ? new Date(date) : new Date(),
        });

        await expense.save();
        console.log('New expense created:', expense);
        res.status(201).json(expense);
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ message: 'Server error while creating expense' });
    }
};

// Update an expense
exports.updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, amount, category, description, date } = req.body;

        const user = await User.findOne({ googleId: req.user.googleId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const expense = await Expense.findOneAndUpdate(
            { _id: id, userId: user._id },
            {
                title,
                amount: parseFloat(amount),
                category,
                description,
                date: date ? new Date(date) : undefined,
            },
            { new: true, runValidators: true }
        );

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        console.log('Expense updated:', expense);
        res.status(200).json(expense);
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ message: 'Server error while updating expense' });
    }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findOne({ googleId: req.user.googleId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const expense = await Expense.findOneAndDelete({ _id: id, userId: user._id });

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        console.log('Expense deleted:', expense._id);
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: 'Server error while deleting expense' });
    }
};

// Get expense statistics
exports.getExpenseStats = async (req, res) => {
    try {
        const user = await User.findOne({ googleId: req.user.googleId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const stats = await Expense.aggregate([
            { $match: { userId: user._id } },
            {
                $group: {
                    _id: '$category',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { totalAmount: -1 } },
        ]);

        const totalExpenses = await Expense.countDocuments({ userId: user._id });
        const totalAmount = await Expense.aggregate([
            { $match: { userId: user._id } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        res.status(200).json({
            categoryStats: stats,
            totalExpenses,
            totalAmount: totalAmount[0]?.total || 0,
        });
    } catch (error) {
        console.error('Error fetching expense stats:', error);
        res.status(500).json({ message: 'Server error while fetching stats' });
    }
};
