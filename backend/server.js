// server.js

// Import necessary libraries
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');

// Import the database connection function
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Create the Express app
const app = express();
const port = process.env.PORT || 3001;

// Import route modules
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

// Connect to the database
connectDB();

// Set up middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Use the imported routes
app.use('/', authRoutes);
app.use('/api/expenses', expenseRoutes);

// Route to serve the login test page
app.get('/test-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login_test.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`BFF server running on http://localhost:${port}`);
});