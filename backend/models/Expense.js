// models/Expense.js

const mongoose = require('mongoose');

// Define the Expense schema
const expenseSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        title: { // <-- New field
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: [true, 'Please add an amount'],
        },
        category: {
            type: String,
            required: [true, 'Please add a category'],
        },
        description: { // <-- New field
            type: String,
        },
        date: {
            type: Date,
            required: [true, 'Please add a date'],
        },
        note: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
