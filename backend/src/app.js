const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

// ===== Security & Middleware =====
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== Static Files (uploads) =====
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ===== Routes =====
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api', require('./routes/departments'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/leaves', require('./routes/leaves'));
app.use('/api/payroll', require('./routes/payroll'));
app.use('/api', require('./routes/communications'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api', require('./routes/extras'));

// ===== Health Check =====
app.get('/health', (req, res) => {
  res.json({ status: 'OK', project: 'KaaryaSetu Dayflow HRMS', timestamp: new Date().toISOString() });
});

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

// ===== Global Error Handler =====
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (err.message === 'Only PDF, DOC, and DOCX files are allowed.') {
    return res.status(400).json({ success: false, message: err.message });
  }
  res.status(500).json({ success: false, message: 'An unexpected error occurred. Please try again.' });
});

module.exports = app;
