/**
 * Validation Middleware
 * Provides content sanitization and security validation
 */

const { ValidationError } = require('./errorHandler');

// Constants for validation
const MAX_TITLE_LENGTH = 255;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_CONTENT_LENGTH = 50000;
const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 50;
const MAX_METADATA_DEPTH = 3;
const MAX_METADATA_SIZE = 10000; // bytes

// Allowed categories
const ALLOWED_CATEGORIES = [
  'insight',
  'research',
  'analysis',
  'idea',
  'resource',
  'note',
  'task',
  'event'
];

// Prototype pollution keys to block
const DANGEROUS_KEYS = [
  '__proto__',
  'constructor',
  'prototype',
  '__defineGetter__',
  '__defineSetter__',
  '__lookupGetter__',
  '__lookupSetter__'
];

/**
 * Sanitize HTML content - removes dangerous tags
 * @param {string} content - Raw content
 * @returns {string} Sanitized content
 */
function sanitizeHtml(content) {
  if (typeof content !== 'string') return '';
  
  // Remove script tags and their contents
  let sanitized = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: URLs (potential XSS vector)
  sanitized = sanitized.replace(/data:[^;]*;base64,/gi, '');
  
  return sanitized;
}

/**
 * Middleware: Sanitize content fields in request body
 */
function sanitizeContent(req, res, next) {
  if (!req.body || typeof req.body !== 'object') {
    return next();
  }

  const sanitizeField = (field) => {
    if (typeof field === 'string') {
      return sanitizeHtml(field.trim());
    }
    return field;
  };

  // Sanitize specific fields
  const fieldsToSanitize = ['title', 'description', 'content'];
  fieldsToSanitize.forEach(field => {
    if (req.body[field] !== undefined) {
      req.body[field] = sanitizeField(req.body[field]);
    }
  });

  next();
}

/**
 * Middleware: Block prototype pollution attempts
 */
function blockPrototypePollution(req, res, next) {
  function checkObject(obj, path = '') {
    if (obj === null || typeof obj !== 'object') {
      return;
    }

    for (const key of Object.keys(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      // Check for dangerous keys
      if (DANGEROUS_KEYS.includes(key)) {
        throw new ValidationError(
          `Invalid key detected: ${key}`,
          [{ field: currentPath, message: 'Prohibited key name' }]
        );
      }

      // Recursively check nested objects
      if (typeof obj[key] === 'object') {
        checkObject(obj[key], currentPath);
      }
    }
  }

  try {
    if (req.body && typeof req.body === 'object') {
      checkObject(req.body);
    }
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware: Validate field lengths
 */
function validateFieldLengths(req, res, next) {
  const errors = [];

  const { title, description, content, tags } = req.body;

  if (title !== undefined) {
    if (title.length > MAX_TITLE_LENGTH) {
      errors.push({
        field: 'title',
        message: `Title must not exceed ${MAX_TITLE_LENGTH} characters`
      });
    }
    if (title.length < 1) {
      errors.push({
        field: 'title',
        message: 'Title is required'
      });
    }
  }

  if (description !== undefined && description.length > MAX_DESCRIPTION_LENGTH) {
    errors.push({
      field: 'description',
      message: `Description must not exceed ${MAX_DESCRIPTION_LENGTH} characters`
    });
  }

  if (content !== undefined) {
    if (content.length > MAX_CONTENT_LENGTH) {
      errors.push({
        field: 'content',
        message: `Content must not exceed ${MAX_CONTENT_LENGTH} characters`
      });
    }
    if (content.length < 1) {
      errors.push({
        field: 'content',
        message: 'Content is required'
      });
    }
  }

  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      errors.push({
        field: 'tags',
        message: 'Tags must be an array'
      });
    } else {
      if (tags.length > MAX_TAGS) {
        errors.push({
          field: 'tags',
          message: `Maximum ${MAX_TAGS} tags allowed`
        });
      }
      tags.forEach((tag, index) => {
        if (typeof tag !== 'string') {
          errors.push({
            field: `tags[${index}]`,
            message: 'Each tag must be a string'
          });
        } else if (tag.length > MAX_TAG_LENGTH) {
          errors.push({
            field: `tags[${index}]`,
            message: `Tag must not exceed ${MAX_TAG_LENGTH} characters`
          });
        }
      });
    }
  }

  if (errors.length > 0) {
    return next(new ValidationError('Field validation failed', errors));
  }

  next();
}

/**
 * Middleware: Validate metadata object
 */
function validateMetadata(req, res, next) {
  const { metadata } = req.body;

  if (metadata === undefined) {
    return next();
  }

  if (metadata !== null && typeof metadata !== 'object') {
    return next(new ValidationError(
      'Metadata must be an object',
      [{ field: 'metadata', message: 'Invalid type' }]
    ));
  }

  // Check metadata size (approximate)
  try {
    const metadataString = JSON.stringify(metadata);
    if (metadataString.length > MAX_METADATA_SIZE) {
      return next(new ValidationError(
        `Metadata size must not exceed ${MAX_METADATA_SIZE} bytes`,
        [{ field: 'metadata', message: 'Metadata too large' }]
      ));
    }
  } catch (e) {
    return next(new ValidationError(
      'Invalid metadata format',
      [{ field: 'metadata', message: 'Must be JSON serializable' }]
    ));
  }

  // Check metadata depth
  function checkDepth(obj, currentDepth = 0) {
    if (currentDepth > MAX_METADATA_DEPTH) {
      throw new Error('Metadata nesting too deep');
    }
    if (obj !== null && typeof obj === 'object') {
      for (const key of Object.keys(obj)) {
        checkDepth(obj[key], currentDepth + 1);
      }
    }
  }

  try {
    checkDepth(metadata);
  } catch (e) {
    return next(new ValidationError(
      `Metadata nesting must not exceed ${MAX_METADATA_DEPTH} levels`,
      [{ field: 'metadata', message: 'Nesting too deep' }]
    ));
  }

  next();
}

/**
 * Middleware: Validate category
 */
function validateCategory(req, res, next) {
  const { category } = req.body;

  if (category === undefined) {
    return next();
  }

  if (!ALLOWED_CATEGORIES.includes(category)) {
    return next(new ValidationError(
      `Invalid category. Allowed values: ${ALLOWED_CATEGORIES.join(', ')}`,
      [{ field: 'category', message: 'Invalid category value' }]
    ));
  }

  next();
}

/**
 * Middleware: Validate source URL
 */
function validateSourceUrl(req, res, next) {
  const { source_url } = req.body;

  if (source_url === undefined || source_url === null || source_url === '') {
    return next();
  }

  if (typeof source_url !== 'string') {
    return next(new ValidationError(
      'Source URL must be a string',
      [{ field: 'source_url', message: 'Invalid type' }]
    ));
  }

  // URL validation regex
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
  
  // More comprehensive URL validation
  try {
    const url = new URL(source_url);
    const allowedProtocols = ['http:', 'https:'];
    
    if (!allowedProtocols.includes(url.protocol)) {
      return next(new ValidationError(
        'Source URL must use HTTP or HTTPS protocol',
        [{ field: 'source_url', message: 'Invalid protocol' }]
      ));
    }

    // Block localhost and private IPs in production
    if (process.env.NODE_ENV === 'production') {
      const hostname = url.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.')
      ) {
        return next(new ValidationError(
          'Private URLs are not allowed',
          [{ field: 'source_url', message: 'Private network access blocked' }]
        ));
      }
    }
  } catch (e) {
    // URL constructor failed, try regex fallback
    if (!urlRegex.test(source_url)) {
      return next(new ValidationError(
        'Invalid source URL format',
        [{ field: 'source_url', message: 'Invalid URL' }]
      ));
    }
  }

  // Check URL length
  if (source_url.length > 2048) {
    return next(new ValidationError(
      'Source URL must not exceed 2048 characters',
      [{ field: 'source_url', message: 'URL too long' }]
    ));
  }

  next();
}

/**
 * Validation rules for API key creation
 */
const keyValidationRules = [
  // Add validation rules here if needed
];

/**
 * Handle validation errors from express-validator
 */
function handleValidationErrors(req, res, next) {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
}

module.exports = {
  sanitizeContent,
  blockPrototypePollution,
  validateFieldLengths,
  validateMetadata,
  validateCategory,
  validateSourceUrl,
  keyValidationRules,
  handleValidationErrors,
  // Export constants for testing
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_CONTENT_LENGTH,
  MAX_TAGS,
  MAX_TAG_LENGTH,
  ALLOWED_CATEGORIES
};
