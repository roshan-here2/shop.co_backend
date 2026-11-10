
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200
    ? 500
    : res.statusCode;

  let message = err.message || 'Internal Server Error';

  // MongoDB invalid ObjectId
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Duplicate MongoDB field
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
  }

  // CORS errors
  if (message === 'Origin not allowed by CORS') {
    statusCode = 403;
    message = 'Origin not allowed';
  }

  console.error('API ERROR:', {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production'
      ? { stack: err.stack }
      : {})
  });
};

module.exports = errorHandler;
