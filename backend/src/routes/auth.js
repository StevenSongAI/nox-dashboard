const express = require('express');
const crypto = require('crypto');
const { 
  authenticateApiKey, 
  requireAdmin, 
  authRateLimiter, 
  generalRateLimiter,
  apiKeys 
} = require('../middleware/auth');
const { sanitizeContent, blockPrototypePollution, keyValidationRules, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

/**
 * POST /api/auth/keys
 * Create a new API key
 * Requires authentication (any valid key can create more keys)
 * DEFECT-005: Protected by rate limiting
 */
router.post(
  '/keys',
  authRateLimiter,
  authenticateApiKey,
  blockPrototypePollution,
  keyValidationRules,
  handleValidationErrors,
  sanitizeContent,
  (req, res) => {
    const { name, metadata } = req.body;
    const keyId = crypto.randomUUID();
    const rawKey = `nox_${crypto.randomBytes(32).toString('hex')}`;
    const hash = crypto.createHash('sha256').update(rawKey).digest('hex');

    // DEFECT-004: Sanitize metadata to prevent prototype pollution
    const sanitizedMetadata = {};
    if (metadata && typeof metadata === 'object') {
      for (const [key, value] of Object.entries(metadata)) {
        // Block forbidden keys
        if (!['__proto__', 'constructor', 'prototype'].includes(key)) {
          sanitizedMetadata[key] = value;
        }
      }
    }

    apiKeys.set(keyId, {
      hash,
      name: name || 'Unnamed Key',
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      revoked: false,
      isAdmin: false, // Regular keys are not admin
      metadata: sanitizedMetadata
    });

    // DEFECT-006 (LOW): Secure cookie documentation
    // Note: Cookies should use secure flag in production
    // In development, secure:false allows testing over HTTP
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.status(201).json({
      success: true,
      data: {
        id: keyId,
        name: name || 'Unnamed Key',
        key: rawKey, // Only shown once
        createdAt: new Date().toISOString(),
        // DEFECT-006: Document secure cookie behavior
        _security: {
          note: isProduction 
            ? 'Secure cookie flag enabled in production'
            : 'Secure cookie flag disabled for development',
          secureFlag: isProduction
        }
      }
    });
  }
);

/**
 * DEFECT-002 (HIGH): GET /api/auth/keys
 * List all API keys - Now requires ADMIN authentication
 * Was previously PUBLIC - now protected with requireAdmin
 */
router.get(
  '/keys',
  authRateLimiter,
  authenticateApiKey,
  requireAdmin, // DEFECT-002 FIX: Added admin requirement
  (req, res) => {
    const keys = [];
    for (const [id, keyData] of apiKeys.entries()) {
      keys.push({
        id,
        name: keyData.name,
        createdAt: keyData.createdAt,
        lastUsedAt: keyData.lastUsedAt,
        revoked: keyData.revoked,
        isAdmin: keyData.isAdmin || false
      });
    }
    
    res.json({
      success: true,
      data: keys
    });
  }
);

/**
 * DEFECT-001 (CRITICAL): DELETE /api/auth/keys/:id
 * Revoke an API key - Now requires ADMIN authentication
 * Was previously unprotected - now protected with requireAdmin
 */
router.delete(
  '/keys/:id',
  authRateLimiter,
  authenticateApiKey,
  requireAdmin, // DEFECT-001 FIX: Added admin requirement
  (req, res) => {
    const { id } = req.params;
    const keyData = apiKeys.get(id);
    
    if (!keyData) {
      return res.status(404).json({
        success: false,
        error: 'Key not found'
      });
    }

    keyData.revoked = true;
    apiKeys.set(id, keyData);

    res.json({
      success: true,
      message: 'Key revoked successfully'
    });
  }
);

/**
 * GET /api/auth/verify
 * Verify current API key and get info
 * Any valid key can access this
 */
router.get(
  '/verify',
  generalRateLimiter,
  authenticateApiKey,
  (req, res) => {
    res.json({
      success: true,
      data: {
        keyId: req.keyId,
        isAdmin: req.isAdmin,
        timestamp: new Date().toISOString()
      }
    });
  }
);

module.exports = {
  router,
  authenticateApiKey,
  requireAdmin
};
