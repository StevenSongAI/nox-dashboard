const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { pool } = require('../config/database');
const { requireAdmin } = require('../middleware/auth');

// POST /api/auth/cookie - Set API key as httpOnly cookie
router.post('/cookie', async (req, res, next) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey || apiKey.length < 32) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Valid API key required'
      });
    }
    
    // Validate the key exists in database
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
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
    
    // Set httpOnly cookie
    res.cookie('apiKey', apiKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.json({ success: true, message: 'Cookie set successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/keys - Generate new API key (ADMIN ONLY)
router.post('/keys', requireAdmin, async (req, res, next) => {
  try {
    const { name } = req.body;
    
    // Generate secure random API key (64 characters)
    const apiKey = crypto.randomBytes(32).toString('hex');
    
    // Hash for storage
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    
    // Store in database
    const result = await pool.query(
      'INSERT INTO api_keys (key_hash, name) VALUES ($1, $2) RETURNING id, name, created_at',
      [keyHash, name || 'Generated Key']
    );
    
    // Return the plain key ONCE (never stored)
    res.status(201).json({
      message: 'API key generated',
      key: apiKey,  // This is the ONLY time you'll see the plain key
      id: result.rows[0].id,
      name: result.rows[0].name,
      created_at: result.rows[0].created_at
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/keys - List all API keys (without the actual keys) - ADMIN ONLY
router.get('/keys', requireAdmin, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, name, created_at, last_used_at, is_active FROM api_keys ORDER BY created_at DESC'
    );
    
    res.json({
      keys: result.rows
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/auth/keys/:id - Revoke an API key - ADMIN ONLY
router.delete('/keys/:id', requireAdmin, async (req, res, next) => {
  try {
    const result = await pool.query(
      'UPDATE api_keys SET is_active = FALSE WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Key not found' });
    }
    
    res.json({ message: 'API key revoked', key: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/auth/keys - Bulk revoke API keys - ADMIN ONLY
router.delete('/keys', requireAdmin, async (req, res, next) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Array of key IDs required in request body'
      });
    }
    
    // Validate all IDs are UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const invalidIds = ids.filter(id => !uuidRegex.test(id));
    
    if (invalidIds.length > 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid UUID format in ids array',
        invalidIds
      });
    }
    
    const result = await pool.query(
      'UPDATE api_keys SET is_active = FALSE WHERE id = ANY($1::uuid[]) RETURNING *',
      [ids]
    );
    
    res.json({ 
      message: 'API keys revoked', 
      revoked: result.rows.length,
      keys: result.rows 
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout - Clear API key cookie
router.post('/logout', (req, res) => {
  res.clearCookie('apiKey', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
