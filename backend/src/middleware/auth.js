const { pool } = require('../config/database');
const crypto = require('crypto');

// Middleware to validate API key
async function validateApiKey(req, res, next) {
  try {
    // Check header first, then cookie
    const authHeader = req.headers.authorization;
    const cookieKey = req.cookies?.apiKey;
    
    const apiKey = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader || cookieKey;
    
    if (!apiKey) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'API key required. Provide it in Authorization header: Bearer YOUR_KEY'
      });
    }

    if (!apiKey || apiKey.length < 32) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid API key format'
      });
    }

    // Hash the key for comparison
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    // Check database
    const result = await pool.query(
      'SELECT * FROM api_keys WHERE key_hash = $1 AND is_active = TRUE',
      [keyHash]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Invalid or revoked API key'
      });
    }

    // Update last used timestamp
    await pool.query(
      'UPDATE api_keys SET last_used_at = NOW() WHERE id = $1',
      [result.rows[0].id]
    );

    // Attach key info to request
    req.apiKey = result.rows[0];
    next();
  } catch (err) {
    next(err);
  }
}

// Middleware for optional auth (for GET endpoints)
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const cookieKey = req.cookies?.apiKey;
    
    const apiKey = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader || cookieKey;
    
    if (!apiKey) {
      req.apiKey = null;
      return next();
    }

    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    const result = await pool.query(
      'SELECT * FROM api_keys WHERE key_hash = $1 AND is_active = TRUE',
      [keyHash]
    );

    if (result.rows.length > 0) {
      req.apiKey = result.rows[0];
      await pool.query(
        'UPDATE api_keys SET last_used_at = NOW() WHERE id = $1',
        [result.rows[0].id]
      );
    } else {
      req.apiKey = null;
    }

    next();
  } catch (err) {
    next(err);
  }
}

// Middleware to require admin access for key generation
function requireAdmin(req, res, next) {
  const adminKey = process.env.ADMIN_API_KEY;
  const providedKey = req.headers['x-admin-key'];
  
  if (!adminKey) {
    return res.status(500).json({ 
      error: 'Server configuration error',
      message: 'Admin key not configured'
    });
  }
  
  if (providedKey !== adminKey) {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Admin access required'
    });
  }
  
  next();
}

module.exports = { validateApiKey, optionalAuth, requireAdmin };
