// ============================================================
// SIPCOT Industrial Data Management System - Main Server
// ============================================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://sipcot-project.vercel.app"
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/industries', require('./routes/industryRoutes'));
app.use('/api/data', require('./routes/dataRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/content', require('./routes/contentRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'SIPCOT Server Running' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 SIPCOT Server running on port ${PORT}`));
