const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET /api/search?q=... - Full-text search across all entries
router.get('/', async (req, res, next) => {
  try {
    const {
      q,                    // Search query (required)
      category,             // Filter by category
      type,                 // Filter by type
      limit = 20,           // Results per page
      offset = 0            // Pagination offset
    } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Build search query with ranking
    let query = `
      SELECT 
        e.*,
        ts_rank(
          to_tsvector('simple', e.title || ' ' || COALESCE(e.content, '')),
          plainto_tsquery('simple', $1)
        ) as relevance
      FROM entries e
      WHERE e.deleted_at IS NULL
        AND to_tsvector('simple', e.title || ' ' || COALESCE(e.content, '')) @@ plainto_tsquery('simple', $1)
    `;
    
    const params = [q];
    let paramCount = 1;

    // Apply filters
    if (category) {
      paramCount++;
      query += ` AND e.category = $${paramCount}`;
      params.push(category);
    }

    if (type) {
      paramCount++;
      query += ` AND e.type = $${paramCount}`;
      params.push(type);
    }

    // Order by relevance (highest first), then by date
    query += ' ORDER BY relevance DESC, e.created_at DESC';

    // Pagination
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(Math.min(parseInt(limit), 100)); // Max 100

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) 
      FROM entries e
      WHERE e.deleted_at IS NULL
        AND to_tsvector('simple', e.title || ' ' || COALESCE(e.content, '')) @@ plainto_tsquery('simple', $1)
    `;
    const countParams = [q];
    let countParamCount = 1;

    if (category) {
      countParamCount++;
      countQuery += ` AND e.category = $${countParamCount}`;
      countParams.push(category);
    }

    if (type) {
      countParamCount++;
      countQuery += ` AND e.type = $${countParamCount}`;
      countParams.push(type);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      query: q,
      results: result.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + result.rows.length < total
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
