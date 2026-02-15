const crypto = require('crypto');

// In-memory key storage for testing
const apiKeys = new Map(); // id -> { hash, name, createdAt, lastUsedAt, revoked, isAdmin }

// Store admin key hash separately for verification
let adminKeyHash = null;

/**
 * Initialize admin key
 * Call this on server startup to set the admin key
 */
const initializeAdminKey = (adminApiKey) => {
  if (adminApiKey) {
    adminKeyHash = crypto.createHash('sha256').update(adminApiKey).digest('hex');
  }
};

/**
 * Authentication Middleware
 * Validates API key from X-API-Key header
 */
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized - API key required'
    });
  }

  // Hash the provided key for comparison
  const providedHash = crypto.createHash('sha256').update(apiKey).digest('hex');
  
  // Check if it's the admin key
  if (adminKeyHash && providedHash === adminKeyHash) {
    req.isAdmin = true;
    req.keyId = 'admin';
    return next();
  }
  
  // Find key by hash
  let foundKey = null;
  let keyId = null;
  
  for (const [id, keyData] of apiKeys.entries()) {
    if (keyData.hash === providedHash) {
      foundKey = keyData;
      keyId = id;
      break;
    }
  }

  if (!foundKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized - Invalid API key'
    });
  }

  if (foundKey.revoked) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden - API key has been revoked'
    });
  }

  // Update last used timestamp
  foundKey.lastUsedAt = new Date().toISOString();
  apiKeys.set(keyId, foundKey);

  req.keyId = keyId;
  req.isAdmin = foundKey.isAdmin || false;
  next();
};

/**
 * Admin Authorization Middleware
 * Requires admin privileges to access sensitive endpoints
 */
const requireAdmin = (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden - Admin privileges required'
    });
  }
  next();
};

/**
 * Simple in-memory rate limiter
 */
const rateLimits = new Map();

const rateLimiter = (options = {}) => {
  const { windowMs = 15 * 60 * 1000, maxRequests = 100, keyPrefix = '' } = options;
  
  return (req, res, next) => {
    const key = `${keyPrefix}:${req.ip}`;
    const now = Date.now();
    
    if (!rateLimits.has(key)) {
      rateLimits.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const limit = rateLimits.get(key);
    
    // Reset if window has passed
    if (now > limit.resetTime) {
      limit.count = 1;
      limit.resetTime = now + windowMs;
      return next();
    }
    
    // Check limit
    if (limit.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests - rate limit exceeded',
        retryAfter: Math.ceil((limit.resetTime - now) / 1000)
      });
    }
    
    limit.count++;
    next();
  };
};

// Rate limiter configs
const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 50,
  keyPrefix: 'auth'
});

const generalRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
  keyPrefix: 'general'
});

module.exports = {
  authenticateApiKey,
  requireAdmin,
  initializeAdminKey,
  rateLimiter,
  authRateLimiter,
  generalRateLimiter,
  apiKeys
};
