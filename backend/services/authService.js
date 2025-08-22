// services/authService.js

const jwt = require('jsonwebtoken');

// This is a mock user database. In a real application, this logic
// would interact with your database (e.g., using Mongoose).
const users = [
    { id: 1, email: 'user@example.com', password: 'password123' }
];

// Service function to handle user validation
exports.validateUser = (email, password) => {
    return users.find(u => u.email === email && u.password === password);
};

// Service function to generate a JWT
exports.generateToken = (user) => {
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Service function to verify a JWT
exports.verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

// Service function to fetch expenses (mock data)
exports.getExpensesData = () => {
    return [
        { id: 1, category: 'Food', amount: 500 },
        { id: 2, category: 'Travel', amount: 1500 },
    ];
};