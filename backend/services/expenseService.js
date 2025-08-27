// services/expenseService.js

const Expense = require('../models/Expense');
const mongoose = require('mongoose');
const Tesseract = require('tesseract.js');

// Google Gemini API configuration
const GOOGLE_API_KEY = 'AIzaSyBUbngB9B_i_96ARzKDidagPTgYanIrXAQ';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`;

console.log('Google Gemini API configured for OCR');

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

// @desc    Get monthly expense summary (corrected version)
// @param   {string} userId - The user's ID
// @returns {Array} Monthly spending totals and categories
exports.getMonthlySummary = async (userId) => {
    try {
        const summary = await Expense.aggregate([
            {
                $match: {
                    // Convert the userId string to an ObjectId
                    user: new mongoose.Types.ObjectId(userId),
                    // Filter out documents with missing or invalid dates and amounts
                    date: { $exists: true, $ne: null },
                    amount: { $exists: true, $ne: null, $type: "number" }
                }
            },
            {
                $group: {
                    _id: { $month: '$date' },
                    totalAmount: { $sum: '$amount' },
                    categories: {
                        $push: { category: '$category', amount: '$amount' }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        return summary;
    } catch (error) {
        console.error('Error in monthly summary aggregation:', error);
        return [];
    }
};

// @desc    Get daily spending trends
// @param   {string} userId - The user's ID
// @param   {number} month - The month to filter by (1-12)
// @param   {number} year - The year to filter by
// @returns {Array} Daily spending totals
exports.getDailyTrends = async (userId, month, year) => {
    try {
        const trends = await Expense.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId),
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
        return trends;
    } catch (error) {
        console.error('Error in daily trends aggregation:', error);
        return [];
    }
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
    // Using Google Gemini API for AI summary
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`;
    
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

// @desc    Perform AI-powered receipt analysis using OpenAI GPT-4o-mini
// @param   {Buffer} imageBuffer - The image data as a buffer
// @returns {object} Extracted amount, date, and category
exports.performOcr = async (imageBuffer) => {
    console.log('=== OCR PROCESS STARTED ===');
    console.log('Image buffer size:', imageBuffer.length, 'bytes');
    
    try {
        console.log('Starting Google Gemini receipt analysis...');
        
        const base64Image = imageBuffer.toString('base64');
        
        const requestBody = {
            contents: [{
                parts: [
                    {
                        text: `You are an expert at reading receipts. Analyze this receipt image carefully and extract the following information in JSON format:

{
    "amount": <total bill amount as number (not individual items)>,
    "date": "<date in YYYY-MM-DD format>",
    "category": "<Food/Transport/Shopping/Medical/Entertainment/Other>",
    "merchant": "<store/company name>"
}

IMPORTANT RULES:
- Look for TOTAL, GRAND TOTAL, NET AMOUNT, or similar final amount
- Convert any date to YYYY-MM-DD format
- Choose the most appropriate category based on the merchant type
- Return ONLY valid JSON, no extra text`
                    },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: base64Image
                        }
                    }
                ]
            }],
            generationConfig: {
                temperature: 0.1,
                topK: 32,
                topP: 1,
                maxOutputTokens: 200,
            }
        };

        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Gemini API Response:', result);
        
        const aiResponse = result.candidates[0].content.parts[0].text;
        console.log('Gemini Response Text:', aiResponse);
        
        // Clean the response to extract JSON
        let jsonString = aiResponse.trim();
        if (jsonString.startsWith('```json')) {
            jsonString = jsonString.replace(/```json\n?/, '').replace(/\n?```/, '');
        }
        
        const extractedData = JSON.parse(jsonString);
        console.log('Extracted Data:', extractedData);
        
        return {
            amount: extractedData.amount,
            date: extractedData.date,
            category: extractedData.category,
            merchant: extractedData.merchant,
            extractedText: aiResponse
        };
    } catch (error) {
        console.error('Gemini OCR failed:', error);
        console.error('Error details:', error.message);
        
        console.log('Gemini failed, using Tesseract.js as fallback...');
        return await performTesseractOcr(imageBuffer);
    }
};

// Perform Tesseract.js OCR as fallback
async function performTesseractOcr(imageBuffer) {
    try {
        console.log('Starting Tesseract.js OCR...');
        console.log('Image buffer type:', typeof imageBuffer);
        console.log('Image buffer length:', imageBuffer.length);
        
        // Enhanced Tesseract configuration for better accuracy
        const { data: { text, confidence } } = await Tesseract.recognize(imageBuffer, 'eng', {
            logger: m => {
                if (m.status === 'recognizing text') {
                    console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                }
            },
            tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
            tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,/-:₹',
        });
        
        console.log('=== OCR CONFIDENCE ===');
        console.log('Confidence level:', confidence, '%');
        console.log('=== RAW EXTRACTED TEXT ===');
        console.log(JSON.stringify(text, null, 2));
        console.log('Text length:', text.length);
        console.log('=== TEXT BY LINES ===');
        text.split('\n').forEach((line, index) => {
            console.log(`Line ${index + 1}: "${line.trim()}"`);
        });
        console.log('=== END RAW TEXT ===');

        // Parse the actual extracted text
        console.log('\n=== STARTING PARSING ===');
        const amount = extractAmountFromText(text);
        const date = extractDateFromText(text);
        const category = extractCategoryFromText(text);
        const merchant = extractMerchantFromText(text);
        
        console.log('=== FINAL PARSED RESULTS ===');
        console.log('Amount:', amount, '(type:', typeof amount, ')');
        console.log('Date:', date, '(type:', typeof date, ')');
        console.log('Category:', category, '(type:', typeof category, ')');
        console.log('Merchant:', merchant, '(type:', typeof merchant, ')');
        console.log('=== END RESULTS ===');
        
        const result = {
            amount: amount || 0,
            date: date || new Date().toISOString().split('T')[0],
            category: category || 'Other',
            merchant: merchant || 'Unknown',
            extractedText: text,
            confidence: confidence
        };
        
        console.log('=== RETURNING RESULT ===');
        console.log(JSON.stringify(result, null, 2));
        
        return result;
    } catch (tesseractError) {
        console.error('Tesseract OCR failed:', tesseractError);
        console.error('Error stack:', tesseractError.stack);
        return null;
    }
}

// Helper functions to extract data from OCR text
function extractAmountFromText(text) {
    console.log('Extracting amount from text...');
    console.log('Text length:', text.length);
    
    // Clean and normalize text
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    // Multiple amount patterns for different receipt formats
    const amountPatterns = [
        // Total patterns - more comprehensive
        /(?:total|grand\s*total|net\s*amount|amount\s*due|bill\s*amount|final\s*amount|payable)[\s:]*₹?\s*([\d,]+\.?\d*)/gi,
        /(?:total|grand\s*total|net\s*amount|amount\s*due|bill\s*amount|final\s*amount|payable)[\s:]*rs\.?\s*([\d,]+\.?\d*)/gi,
        
        // Currency symbol patterns
        /₹\s*([\d,]+\.?\d*)/g,
        /rs\.?\s*([\d,]+\.?\d*)/gi,
        /inr\s*([\d,]+\.?\d*)/gi,
        
        // Decimal amounts (like 1128.60, 45.50)
        /(\d{2,6}\.\d{2})(?!\d)/g,
        
        // Large whole numbers that could be amounts
        /(?<!\d)(\d{3,6})(?!\d)/g,
        
        // Amount in words context
        /([\d,]+\.?\d*)\s*(?:only|rupees|\/\-)/gi,
        
        // Line ending with amount
        /([\d,]+\.?\d*)\s*$/gm
    ];
    
    const amounts = [];
    
    for (const pattern of amountPatterns) {
        let match;
        const regex = new RegExp(pattern.source, pattern.flags);
        
        if (pattern.global) {
            while ((match = regex.exec(cleanText)) !== null) {
                const cleanAmount = match[1].replace(/[,\s]/g, '');
                const amount = parseFloat(cleanAmount);
                if (amount >= 1 && amount <= 1000000) {
                    amounts.push({ amount, context: match[0] });
                    console.log('Found potential amount:', amount, 'Context:', match[0]);
                }
            }
        } else {
            match = cleanText.match(pattern);
            if (match) {
                const cleanAmount = match[1].replace(/[,\s]/g, '');
                const amount = parseFloat(cleanAmount);
                if (amount >= 1 && amount <= 1000000) {
                    amounts.push({ amount, context: match[0] });
                    console.log('Found potential amount:', amount, 'Context:', match[0]);
                }
            }
        }
    }
    
    if (amounts.length > 0) {
        // Prioritize amounts with 'total' context, then largest amount
        const totalAmounts = amounts.filter(a => /total|grand|final|payable/i.test(a.context));
        const selectedAmount = totalAmounts.length > 0 
            ? Math.max(...totalAmounts.map(a => a.amount))
            : Math.max(...amounts.map(a => a.amount));
        
        console.log('Selected amount:', selectedAmount);
        return selectedAmount;
    }
    
    console.log('No amount found');
    return null;
}

function extractDateFromText(text) {
    console.log('Extracting date from text...');
    
    const datePatterns = [
        // Standard formats with more variations
        /\b(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})\b/g,
        /\b(\d{1,2}[-\/]\w{3}[-\/]\d{2,4})\b/gi,
        /\b(\d{1,2}\s+\w{3}\s+\d{2,4})\b/gi,
        /\b(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})\b/g,
        
        // With keywords
        /(?:date|invoice\s*date|bill\s*date|transaction\s*date)[\s:]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/gi,
        /(?:date|invoice\s*date|bill\s*date|transaction\s*date)[\s:]*(\d{1,2}[-\/]\w{3}[-\/]\d{2,4})/gi,
        /(?:date|invoice\s*date|bill\s*date|transaction\s*date)[\s:]*(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/gi,
        
        // Time stamps
        /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})\s+\d{1,2}:\d{2}/g,
        
        // Indian date formats
        /(\d{1,2})\.(\d{1,2})\.(\d{2,4})/g
    ];
    
    for (const pattern of datePatterns) {
        const matches = text.match(pattern);
        if (matches) {
            for (const match of matches) {
                let dateStr = match;
                
                // Extract just the date part if it's a capture group
                if (pattern.source.includes('(')) {
                    const captureMatch = text.match(new RegExp(pattern.source, 'i'));
                    if (captureMatch && captureMatch[1]) {
                        dateStr = captureMatch[1];
                    }
                }
                
                console.log('Found potential date:', dateStr);
                
                // Convert to YYYY-MM-DD format
                try {
                    // Handle dot format (DD.MM.YYYY)
                    if (dateStr.includes('.')) {
                        const parts = dateStr.split('.');
                        if (parts.length === 3) {
                            const day = parts[0].padStart(2, '0');
                            const month = parts[1].padStart(2, '0');
                            const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
                            return `${year}-${month}-${day}`;
                        }
                    }
                    
                    const date = new Date(dateStr);
                    if (!isNaN(date.getTime()) && date.getFullYear() > 2000) {
                        return date.toISOString().split('T')[0];
                    }
                } catch (e) {
                    console.log('Date parsing failed for:', dateStr);
                }
            }
        }
    }
    
    console.log('No valid date found');
    return null;
}

function extractCategoryFromText(text) {
    console.log('Extracting category from text...');
    
    const lowerText = text.toLowerCase();
    
    // Food keywords
    if (lowerText.includes('tea') || lowerText.includes('coffee') || lowerText.includes('restaurant') || 
        lowerText.includes('food') || lowerText.includes('cafe') || lowerText.includes('hotel') ||
        lowerText.includes('kitchen') || lowerText.includes('dining') || lowerText.includes('meal')) {
        console.log('Category: Food');
        return 'Food';
    }
    
    // Transport keywords
    if (lowerText.includes('taxi') || lowerText.includes('uber') || lowerText.includes('ola') ||
        lowerText.includes('fuel') || lowerText.includes('petrol') || lowerText.includes('diesel') ||
        lowerText.includes('transport') || lowerText.includes('bus') || lowerText.includes('train')) {
        console.log('Category: Transport');
        return 'Transport';
    }
    
    // Medical keywords
    if (lowerText.includes('pharmacy') || lowerText.includes('medical') || lowerText.includes('hospital') ||
        lowerText.includes('clinic') || lowerText.includes('doctor') || lowerText.includes('medicine')) {
        console.log('Category: Medical');
        return 'Medical';
    }
    
    // Shopping keywords
    if (lowerText.includes('mall') || lowerText.includes('store') || lowerText.includes('shop') ||
        lowerText.includes('retail') || lowerText.includes('market') || lowerText.includes('amazon') ||
        lowerText.includes('flipkart')) {
        console.log('Category: Shopping');
        return 'Shopping';
    }
    
    // Entertainment keywords
    if (lowerText.includes('movie') || lowerText.includes('cinema') || lowerText.includes('theater') ||
        lowerText.includes('entertainment') || lowerText.includes('game')) {
        console.log('Category: Entertainment');
        return 'Entertainment';
    }
    
    console.log('Category: Other');
    return 'Other';
}

function extractMerchantFromText(text) {
    console.log('Extracting merchant from text...');
    
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    console.log('First 5 lines:', lines.slice(0, 5));
    
    // Look for company names in the first few lines
    for (let i = 0; i < Math.min(8, lines.length); i++) {
        const line = lines[i];
        
        // Skip lines that are just numbers, symbols, or very short
        if (/^[\d\s\-_=.,:;]+$/.test(line) || line.length < 3) continue;
        
        // Skip common receipt headers
        if (/^(receipt|bill|invoice|tax|gst|cgst|sgst|igst)$/i.test(line)) continue;
        
        // Look for lines that might be company names
        if (line.length >= 3 && line.length <= 50) {
            // Common company indicators
            if (line.toLowerCase().includes('company') || 
                line.toLowerCase().includes('ltd') ||
                line.toLowerCase().includes('pvt') ||
                line.toLowerCase().includes('inc') ||
                line.toLowerCase().includes('corp') ||
                line.toLowerCase().includes('restaurant') ||
                line.toLowerCase().includes('cafe') ||
                line.toLowerCase().includes('hotel') ||
                line.toLowerCase().includes('store') ||
                /^[A-Z\s&]+$/.test(line) ||
                /^[A-Z][a-z]+\s+[A-Z][a-z]+/.test(line)) {
                
                console.log('Found merchant:', line);
                return line.replace(/[^a-zA-Z0-9\s&]/g, '').trim();
            }
        }
    }
    
    // If no clear merchant found, look for any meaningful text in first 3 lines
    for (const line of lines.slice(0, 3)) {
        if (line.length >= 4 && line.length <= 40 && 
            !/^[\d\s\-_=.,:;]+$/.test(line) &&
            !/^(receipt|bill|invoice|tax|gst|cgst|sgst|igst)$/i.test(line)) {
            console.log('Found potential merchant:', line);
            return line.replace(/[^a-zA-Z0-9\s&]/g, '').trim();
        }
    }
    
    console.log('No merchant found');
    return null;
}
