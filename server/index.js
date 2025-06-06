const express = require('express');
const cors = require('cors');
const session = require('express-session');
const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const bidRoutes = require('./routes/bidRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const multer = require('multer');

const app = express();
const PORT = 5000;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'stanislav',
  name: 'sessionId',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Статична папка для доступу до завантажених файлів
app.use('/uploads', express.static('uploads'));

app.use('/api/v1', userRoutes);
app.use('/api/v1', itemRoutes);
app.use('/api/v1', bidRoutes);
app.use('/api/v1', reviewRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1', paymentRoutes);

// Обработка ошибок multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File is too large. Maximum size is 5MB'
      });
    }
    return res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
  next(error);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});