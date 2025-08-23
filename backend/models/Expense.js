// models/Expense.js

const mongoose = require('mongoose');

// Define the Expense schema
const expenseSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        category: {
            type: String,
            required: true,
            enum: ['Food', 'Travel', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Other'],
        },
        description: {
            type: String,
            default: '',
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields automatically
    }
);

// Create the Expense model from the schema
const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
