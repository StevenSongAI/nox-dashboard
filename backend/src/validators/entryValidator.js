// Request validation for entries
const { body, param, validationResult } = require('express-validator');

/**
 * Check for prototype pollution attempts in metadata
 * Blocks __proto__, constructor, prototype keys
 */
const hasPrototypePollution = (obj, path = '') => {
  const forbiddenKeys = ['__proto__', 'constructor', 'prototype'];
  
  if (typeof obj !== 'object' || obj === null) {
    return null;
  }
  
  for (const key of Object.keys(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    
    // Check if key is forbidden
    if (forbiddenKeys.includes(key)) {
      return currentPath;
    }
    
    // Recursively check nested objects
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      const found = hasPrototypePollution(obj[key], currentPath);
      if (found) return found;
    }
  }
  
  return null;
};

const validateCreateEntry = [
  body('category')
    .isIn(['youtube', 'business', 'investments', 'research'])
    .withMessage('Category must be youtube, business, investments, or research'),
  body('type')
    .isString()
    .notEmpty()
    .withMessage('Type is required'),
  body('title')
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Title is required (max 500 chars)'),
  body('content')
    .optional()
    .isString(),
  body('source')
    .isString()
    .notEmpty()
    .withMessage('Source is required'),
  body('source_url')
    .optional({ nullable: true })
    .isURL()
    .withMessage('Source URL must be valid'),
  body('confidence')
    .optional()
    .isNumeric()
    .withMessage('Confidence must be a number')
    .isInt({ min: 0, max: 100 })
    .withMessage('Confidence must be 0-100')
    .custom((value) => {
      if (typeof value === 'string') {
        throw new Error('Confidence must be a number, not a string');
      }
      return true;
    }),
  body('metadata')
    .optional()
    .isObject()
    .custom((value) => {
      const pollutionPath = hasPrototypePollution(value);
      if (pollutionPath) {
        throw new Error(`Prototype pollution attempt detected: forbidden key '${pollutionPath}'`);
      }
      return true;
    })
];

const validateUpdateEntry = [
  param('id')
    .isUUID()
    .withMessage('ID must be a valid UUID'),
  body('title')
    .optional()
    .isString()
    .isLength({ min: 1, max: 500 }),
  body('content')
    .optional()
    .isString(),
  body('confidence')
    .optional()
    .isNumeric()
    .withMessage('Confidence must be a number')
    .isInt({ min: 0, max: 100 })
    .withMessage('Confidence must be 0-100')
    .custom((value) => {
      if (typeof value === 'string') {
        throw new Error('Confidence must be a number, not a string');
      }
      return true;
    }),
  body('verified')
    .optional()
    .isBoolean(),
  body('metadata')
    .optional()
    .isObject()
    .custom((value) => {
      const pollutionPath = hasPrototypePollution(value);
      if (pollutionPath) {
        throw new Error(`Prototype pollution attempt detected: forbidden key '${pollutionPath}'`);
      }
      return true;
    })
];

const validateId = [
  param('id')
    .isUUID()
    .withMessage('ID must be a valid UUID')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

module.exports = {
  validateCreateEntry,
  validateUpdateEntry,
  validateId,
  handleValidationErrors
};
