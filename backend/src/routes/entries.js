const express = require('express');
const router = express.Router();
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const { pool } = require('../config/database');
const { validateApiKey } = require('../middleware/auth');
const {
  validateCreateEntry,
  validateUpdateEntry,
  validateId,
  handleValidationErrors
} = require('../validators/entryValidator');

// Initialize DOMPurify with jsdom for server-side sanitization
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * XSS Sanitization Middleware
 * Sanitizes content, title, and summary fields to prevent stored XSS attacks
 */
const sanitizeEntryContent = (req, res, next) => {
  if (req.body.content) {
    req.body.content = DOMPurify.sanitize(req.body.content, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
      ALLOWED_ATTR: ['href', 'target', 'rel']
    });
  }
  
  if (req.body.title) {
    req.body.title = DOMPurify.sanitize(req.body.title, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  }
  
  if (req.body.summary) {
    req.body.summary = DOMPurify.sanitize(req.body.summary, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    });
  }
  
  next();
};

// GET /api/entries - List entries with filters
router.get('/', async (req, res, next) => {
  try {
    const {
      category,
      type,
      source,
      verified,
      search,
      limit = 50,
      offset = 0,
      sort = 'created_at:desc',
      includeDeleted = false
    } = req.query;

    // Pagination limits
    const MAX_LIMIT = 100;
    const ABUSE_LIMIT = 1000;
    let parsedLimit = parseInt(limit);
    
    if (parsedLimit > ABUSE_LIMIT) {
      return res.status(400).json({ 
        error: 'Limit exceeds maximum allowed',
        maxAllowed: ABUSE_LIMIT
      });
    }
    
    if (parsedLimit > MAX_LIMIT) {
      parsedLimit = MAX_LIMIT;
    }

    let query = 'SELECT * FROM entries WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Handle deleted entries filter
    if (includeDeleted !== 'true') {
      query += ' AND deleted_at IS NULL';
    }

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      params.push(type);
    }

    if (source) {
      paramCount++;
      query += ` AND source = $${paramCount}`;
      params.push(source);
    }

    if (verified !== undefined) {
      paramCount++;
      query += ` AND verified = $${paramCount}`;
      params.push(verified === 'true');
    }

    if (search) {
      paramCount++;
      query += ` AND to_tsvector('simple', title || ' ' || COALESCE(content, '')) @@ plainto_tsquery('simple', $${paramCount})`;
      params.push(search);
    }

    // Sorting
    const [sortField, sortOrder] = sort.split(':');
    const allowedFields = ['created_at', 'updated_at', 'title', 'confidence'];
    const allowedOrders = ['asc', 'desc'];
    
    if (allowedFields.includes(sortField) && allowedOrders.includes(sortOrder)) {
      query += ` ORDER BY ${sortField} ${sortOrder.toUpperCase()}`;
    } else {
      query += ' ORDER BY created_at DESC';
    }

    // Pagination
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(parsedLimit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM entries WHERE 1=1';
    const countParams = [];
    let countParamCount = 0;

    // Handle deleted entries in count
    if (includeDeleted !== 'true') {
      countQuery += ' AND deleted_at IS NULL';
    }

    if (category) {
      countParamCount++;
      countQuery += ` AND category = $${countParamCount}`;
      countParams.push(category);
    }

    if (type) {
      countParamCount++;
      countQuery += ` AND type = $${countParamCount}`;
      countParams.push(type);
    }

    if (source) {
      countParamCount++;
      countQuery += ` AND source = $${countParamCount}`;
      countParams.push(source);
    }

    if (verified !== undefined) {
      countParamCount++;
      countQuery += ` AND verified = $${countParamCount}`;
      countParams.push(verified === 'true');
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND to_tsvector('simple', title || ' ' || COALESCE(content, '')) @@ plainto_tsquery('simple', $${countParamCount})`;
      countParams.push(search);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      entries: result.rows,
      pagination: {
        total,
        limit: parsedLimit,
        offset: parseInt(offset),
        hasMore: offset + result.rows.length < total
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/entries/:id - Get single entry
router.get('/:id', validateId, handleValidationErrors, async (req, res, next) => {
  try {
    const { includeDeleted = 'false' } = req.query;
    
    let query = 'SELECT * FROM entries WHERE id = $1';
    const params = [req.params.id];
    
    // Only filter out deleted entries if not explicitly requesting them
    if (includeDeleted !== 'true') {
      query += ' AND deleted_at IS NULL';
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/entries - Create new entry (protected)
router.post('/', validateApiKey, sanitizeEntryContent, validateCreateEntry, handleValidationErrors, async (req, res, next) => {
  try {
    const {
      category,
      type,
      title,
      content,
      summary,
      source,
      source_url,
      source_id,
      metadata,
      confidence
    } = req.body;

    const result = await pool.query(
      `INSERT INTO entries (category, type, title, content, summary, source, source_url, source_id, metadata, confidence)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [category, type, title, content, summary, source, source_url, source_id, JSON.stringify(metadata || {}), confidence]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/entries/:id - Update entry (protected)
router.patch('/:id', validateApiKey, validateId, sanitizeEntryContent, validateUpdateEntry, handleValidationErrors, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const allowedFields = ['title', 'content', 'summary', 'source_url', 'metadata', 'confidence', 'verified'];
    const setClause = [];
    const values = [];
    let paramCount = 0;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        paramCount++;
        setClause.push(`${key} = $${paramCount}`);
        values.push(key === 'metadata' ? JSON.stringify(value) : value);
      }
    }

    if (setClause.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    paramCount++;
    values.push(id);

    const query = `UPDATE entries SET ${setClause.join(', ')} WHERE id = $${paramCount} AND deleted_at IS NULL RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/entries/:id - Soft delete entry (protected)
router.delete('/:id', validateApiKey, validateId, handleValidationErrors, async (req, res, next) => {
  try {
    const result = await pool.query(
      'UPDATE entries SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({ message: 'Entry deleted', entry: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
