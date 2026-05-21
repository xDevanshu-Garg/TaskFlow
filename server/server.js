const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');

// Connect to database
connectDB();

const app = express();

// Global middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Avidus Task Manager API is running' });
});

// Error handler (must be after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections so the process doesn't silently swallow them
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
