// server.js

// Import necessary libraries
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// Import the database connection function
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Create the Express app
const app = express();
const port = process.env.PORT || 3001;

// Import route modules
const authRoutes = require('./routes/authRoutes');

// Connect to the database
connectDB();

// Set up middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

// Use the imported routes
app.use('/', authRoutes);

// Start the server
app.listen(port, () => {
    console.log(`BFF server running on http://localhost:${port}`);
});