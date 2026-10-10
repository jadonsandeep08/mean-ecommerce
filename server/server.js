require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

// CORS
app.use(cors({
  origin: [
    'http://localhost:4200',
    'http://127.0.0.1:4200'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// API Health Check
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MEAN Ecommerce API Running'
  });
});

// Authentication Routes
app.use('/api/auth', authRoutes);

// Future Ecommerce Routes
// app.use('/api/users', userRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/cart', cartRoutes);
// app.use('/api/orders', orderRoutes);

// Unknown Routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.status && err.status < 500
      ? err.message
      : 'Internal Server Error'
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log('================================');
      console.log('MEAN Ecommerce Backend Started');
      console.log(`Server: http://localhost:${PORT}`);
      console.log(`API: http://localhost:${PORT}/api`);
      console.log('MongoDB Connected Successfully');
      console.log('================================');
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
}

startServer();