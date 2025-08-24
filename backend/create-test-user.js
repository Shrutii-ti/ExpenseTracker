// create-test-user.js - Create a test user for API testing

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createTestUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('Connected to MongoDB');
        
        // Check if test user already exists
        const existingUser = await User.findOne({ googleId: 'test-google-id-123' });
        
        if (existingUser) {
            console.log('Test user already exists:', existingUser.email);
        } else {
            // Create test user
            const testUser = new User({
                googleId: 'test-google-id-123',
                name: 'Test User',
                email: 'testuser@example.com'
            });
            
            await testUser.save();
            console.log('Test user created:', testUser.email);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    }
};

createTestUser();
