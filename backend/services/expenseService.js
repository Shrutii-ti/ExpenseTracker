// services/expenseService.js

const Expense = require('../models/Expense');
const Tesseract = require('tesseract.js');

// @desc    Get all expenses for a specific user
// @param   {string} userId - The user's ID
// @returns {Array} An array of expense objects
exports.getExpenses = async (userId) => {
    return await Expense.find({ user: userId });
};

// @desc    Create a new expense
// @param   {object} expenseData - The expense details
// @returns {object} The newly created expense object
exports.createExpense = async (expenseData) => {
    return await Expense.create(expenseData);
};

// @desc    Get a single expense by ID
// @param   {string} id - Expense ID
// @param   {string} userId - The user's ID
// @returns {object} The expense object
exports.getExpenseById = async (id, userId) => {
    return await Expense.findOne({ _id: id, user: userId });
};

// @desc    Update an expense by ID
// @param   {string} id - Expense ID
// @param   {string} userId - The user's ID
// @param   {object} updateData - The data to update
// @returns {object} The updated expense object
exports.updateExpense = async (id, userId, updateData) => {
    return await Expense.findOneAndUpdate({ _id: id, user: userId }, updateData, { new: true });
};

// @desc    Delete an expense by ID
// @param   {string} id - Expense ID
// @param   {string} userId - The user's ID
// @returns {object} The deleted expense object
exports.deleteExpense = async (id, userId) => {
    return await Expense.findOneAndDelete({ _id: id, user: userId });
};

// --- New Functions Below ---

// @desc    Get monthly expense summary
// @param   {string} userId - The user's ID
// @returns {Array} Monthly spending totals and categories
exports.getMonthlySummary = async (userId) => {
    return await Expense.aggregate([
        { $match: { user: userId } },
        {
            $group: {
                _id: { $month: '$date' }, // Group by month
                totalAmount: { $sum: '$amount' },
                categories: {
                    $push: { category: '$category', amount: '$amount' }
                }
            }
        },
        { $sort: { _id: 1 } }
    ]);
};

// @desc    Get daily spending trends
// @param   {string} userId - The user's ID
// @param   {number} month - The month to filter by (1-12)
// @param   {number} year - The year to filter by
// @returns {Array} Daily spending totals
exports.getDailyTrends = async (userId, month, year) => {
    return await Expense.aggregate([
        {
            $match: {
                user: userId,
                date: {
                    $gte: new Date(year, month - 1, 1),
                    $lt: new Date(year, month, 1)
                }
            }
        },
        {
            $group: {
                _id: { $dayOfMonth: '$date' },
                totalAmount: { $sum: '$amount' }
            }
        },
        { $sort: { _id: 1 } }
    ]);
};

// @desc    Get total number of expenses and total amount
// @param   {string} userId - The user's ID
// @returns {object} Total expenses and total amount
exports.getTotals = async (userId) => {
    const totalExpenses = await Expense.countDocuments({ user: userId });
    const totalAmountResult = await Expense.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;

    return { totalExpenses, totalAmount };
};

// @desc    Generate AI summary using LLM
// @param   {string} prompt - The prompt for the LLM
// @returns {string} The AI-generated summary
exports.getAiSummary = async (prompt) => {
    // This part simulates a call to an LLM. For a real app, you'd use a library like Axios.
    // We'll use the Gemini API for this example.
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    
    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    const payload = { contents: chatHistory };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        const text = result.candidates[0].content.parts[0].text;
        return text;
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return 'Could not generate AI summary. Please try again later.';
    }
};

// @desc    Perform OCR on a receipt image
// @param   {Buffer} imageBuffer - The image data as a buffer
// @returns {object} Extracted amount, date, and category
exports.performOcr = async (imageBuffer) => {
    try {
        const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng');

        // This is a basic pattern matching to simulate data extraction
        const amountMatch = text.match(/Total\s*₹?([\d.]+)/i);
        const dateMatch = text.match(/\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/);
        
        return {
            amount: amountMatch ? parseFloat(amountMatch[1]) : null,
            date: dateMatch ? dateMatch[0] : null,
            // Categories would be inferred from keywords
            category: 'Food'
        };
    } catch (error) {
        console.error('Error during OCR process:', error);
        return null;
    }
};
