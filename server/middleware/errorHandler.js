const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message };

  // Operational errors we threw ourselves
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Bad ObjectId
  if (err.name === 'CastError') {
    error = new ApiError('Resource not found', 400);
  }

  // Duplicate key (e.g. email already taken)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    error = new ApiError(`Duplicate field value: ${field}`, 400);
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(messages.join('. '), 400);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  const response = { success: false, message };
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
