
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// =====================================
// CORS CONFIGURATION
// =====================================

const normalizeOrigin = (url = '') =>
  url.trim().replace(/\/+$/, '');

const allowedOrigins = [
  'https://shopco-ten-umber.vercel.app',
  'https://shop-co-admin-panel-murex.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',

  ...(process.env.CLIENT_URL || '').split(','),
  ...(process.env.ADMIN_URL || '').split(','),
  ...(process.env.CORS_ORIGINS || '').split(',')
]
  .map(normalizeOrigin)
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(normalizeOrigin(origin))) {
      return callback(null, true);
    }

    console.error('CORS BLOCKED:', origin);
    return callback(new Error('Origin not allowed by CORS'));
  },

  credentials: true,

  methods: [
    'GET',
    'HEAD',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With'
  ],

  optionsSuccessStatus: 204
};

// CORS FIRST
// This also handles OPTIONS preflight requests.
app.use(cors(corsOptions));

// =====================================
// BODY PARSERS
// =====================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// =====================================
// STATIC FILES
// =====================================

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

// =====================================
// HEALTH CHECK
// =====================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running'
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running'
  });
});

// =====================================
// MONGODB CONNECTION
// =====================================

let dbConnectionPromise;

app.use('/api', async (req, res, next) => {
  try {
    if (!dbConnectionPromise) {
      dbConnectionPromise = connectDB().catch(error => {
        dbConnectionPromise = null;
        throw error;
      });
    }

    await dbConnectionPromise;
    next();

  } catch (error) {
    console.error('Database middleware error:', error.message);
    next(error);
  }
});

// =====================================
// API ROUTES
// =====================================

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// =====================================
// 404 HANDLER
// =====================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// =====================================
// ERROR HANDLER
// =====================================

app.use(errorHandler);

// =====================================
// SERVER START
// =====================================

if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
