/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent, safe error responses
 */

// Custom error classes for specific error types
class ValidationError extends Error {
  constructor(message, fields = []) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
    this.code = 'VALIDATION_ERROR';
    this.fields = fields;
  }
}

class DatabaseError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'DatabaseError';
    this.status = 500;
    this.code = 'DATABASE_ERROR';
    this.originalError = originalError;
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
    this.status = 401;
    this.code = 'AUTHENTICATION_ERROR';
  }
}

class AuthorizationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthorizationError';
    this.status = 403;
    this.code = 'AUTHORIZATION_ERROR';
  }
}

class NotFoundError extends Error {
  constructor(resource = 'Resource') {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
    this.status = 404;
    this.code = 'NOT_FOUND';
  }
}

// Sanitize error message for production
function sanitizeErrorMessage(err, isDev) {
  if (isDev) {
    return err.message;
  }

  // In production, don't leak internal details
  const safeMessages = {
    'ValidationError': err.message,
    'AuthenticationError': err.message,
    'AuthorizationError': err.message,
    'NotFoundError': err.message,
  };

  return safeMessages[err.name] || 'Internal server error';
}

// Get error code
function getErrorCode(err) {
  if (err.code) return err.code;
  
  // Map HTTP status to error codes
  const statusCodes = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'UNPROCESSABLE_ENTITY',
    429: 'TOO_MANY_REQUESTS',
    500: 'INTERNAL_SERVER_ERROR',
    502: 'BAD_GATEWAY',
    503: 'SERVICE_UNAVAILABLE',
    504: 'GATEWAY_TIMEOUT',
  };

  return statusCodes[err.status] || 'INTERNAL_SERVER_ERROR';
}

// Main error handler middleware
function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV === 'development';
  const timestamp = new Date().toISOString();
  
  // Determine status code
  let status = err.status || err.statusCode || 500;
  
  // Handle specific Express errors
  if (err.type === 'entity.parse.failed') {
    status = 400;
    err.message = 'Invalid JSON in request body';
    err.code = 'INVALID_JSON';
  }
  
  // Handle body parser errors (payload too large)
  if (err.type === 'entity.too.large' || err.status === 413 || err.code === 'LIMIT_FILE_SIZE') {
    status = 413;
    err.message = 'Request body too large';
    err.code = 'PAYLOAD_TOO_LARGE';
  }

  // Handle database-specific errors
  if (err.code?.startsWith('08') || err.code?.startsWith('28') || err.code?.startsWith('3D')) {
    status = 503;
    err.code = 'DATABASE_UNAVAILABLE';
  }

  // Build error response
  const errorResponse = {
    error: sanitizeErrorMessage(err, isDev),
    code: err.code || getErrorCode(err),
    status,
    timestamp,
    path: req.path,
    method: req.method,
  };

  // Add validation details in dev and for validation errors
  if (err.fields && err.fields.length > 0) {
    errorResponse.fields = err.fields;
  }

  // Add stack trace and details only in development
  if (isDev) {
    errorResponse.stack = err.stack;
    errorResponse.name = err.name;
    
    if (err.originalError) {
      errorResponse.originalError = {
        message: err.originalError.message,
        code: err.originalError.code,
      };
    }
  }

  // Request ID for tracing (if available)
  if (req.id) {
    errorResponse.requestId = req.id;
  }

  // Log error (but not in test environment unless specifically requested)
  const logLevel = status >= 500 ? 'error' : 'warn';
  console[logLevel](JSON.stringify({
    level: logLevel,
    timestamp,
    status,
    code: errorResponse.code,
    message: err.message,
    path: req.path,
    method: req.method,
    ...(isDev && { stack: err.stack }),
    ...(err.originalError && { originalError: err.originalError.message }),
  }));

  // Send response
  res.status(status).json(errorResponse);
}

// 404 handler for undefined routes
function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Not found',
    code: 'NOT_FOUND',
    status: 404,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  });
}

// Async handler wrapper to catch errors in async route handlers
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = errorHandler;
module.exports.notFoundHandler = notFoundHandler;
module.exports.asyncHandler = asyncHandler;

// Export custom error classes
module.exports.ValidationError = ValidationError;
module.exports.DatabaseError = DatabaseError;
module.exports.AuthenticationError = AuthenticationError;
module.exports.AuthorizationError = AuthorizationError;
module.exports.NotFoundError = NotFoundError;
