const express = require('express');
const connectDB = require('./config/db');
const ruleRoutes = require('./routes/ruleRoutes');
const cors = require('cors');
require('dotenv').config();

const app = express();

connectDB();

app.use(cors()); // Enable CORS for all routes
app.use(cors({
    origin: 'http://localhost:3000', // Allow only this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
}));

app.use(express.json()); // Parse JSON bodies
app.use('/api/rules', ruleRoutes); // API routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));