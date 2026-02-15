const express = require('express');
const { query: dbQuery } = require('../config/database');
const { authenticateApiKey, requireAdmin } = require('./auth');
const { sanitizeContent, blockPrototypePollution } = require('../middleware/validation');

const router = express.Router();

/**
 * GET /api/entries
 * List entries with pagination and filtering
 */
router.get('/', async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      search,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const pageLimit = Math.min(parseInt(limit), 100);

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (category) {
      whereClause += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (title ILIKE $${paramIndex} OR content ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Validate sort column to prevent SQL injection
    const allowedSortColumns = ['created_at', 'updated_at', 'title', 'category', 'confidence'];
    const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortDir = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Get total count
    const countResult = await dbQuery(`SELECT COUNT(*) FROM entries ${whereClause}`, params);
    const totalCount = parseInt(countResult.rows[0].count);

    // Get entries
    const queryParams = [...params, pageLimit, offset];
    const result = await dbQuery(
      `SELECT 
        id, title, description, content, category, 
        confidence, tags, source_url, created_at, updated_at
      FROM entries 
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDir}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      queryParams
    );

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: pageLimit,
        totalCount,
        totalPages: Math.ceil(totalCount / pageLimit),
        hasNext: offset + result.rows.length < totalCount,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/entries/:id
 * Get a single entry by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await dbQuery(
      `SELECT 
        id, title, description, content, category, 
        confidence, tags, source_url, metadata, created_at, updated_at
      FROM entries 
      WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Entry not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/entries
 * Create a new entry
 * Requires authentication
 */
router.post('/', 
  authenticateApiKey,
  blockPrototypePollution,
  sanitizeContent,
  async (req, res, next) => {
    try {
      const { 
        title, 
        description, 
        content, 
        category, 
        confidence = 0.5,
        tags = [],
        source_url,
        metadata = {}
      } = req.body;

      // Validation
      if (!title || !content || !category) {
        return res.status(400).json({
          success: false,
          error: 'Title, content, and category are required'
        });
      }

      const result = await dbQuery(
        `INSERT INTO entries 
          (title, description, content, category, confidence, tags, source_url, metadata, created_at, updated_at)
         VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING *`,
        [title, description, content, category, confidence, tags, source_url, metadata]
      );

      res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/entries/:id
 * Update an entry
 * Requires authentication
 */
router.put('/:id',
  authenticateApiKey,
  blockPrototypePollution,
  sanitizeContent,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { 
        title, 
        description, 
        content, 
        category, 
        confidence,
        tags,
        source_url,
        metadata
      } = req.body;

      // Build dynamic update query
      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (title !== undefined) {
        updates.push(`title = $${paramIndex++}`);
        values.push(title);
      }
      if (description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        values.push(description);
      }
      if (content !== undefined) {
        updates.push(`content = $${paramIndex++}`);
        values.push(content);
      }
      if (category !== undefined) {
        updates.push(`category = $${paramIndex++}`);
        values.push(category);
      }
      if (confidence !== undefined) {
        updates.push(`confidence = $${paramIndex++}`);
        values.push(confidence);
      }
      if (tags !== undefined) {
        updates.push(`tags = $${paramIndex++}`);
        values.push(tags);
      }
      if (source_url !== undefined) {
        updates.push(`source_url = $${paramIndex++}`);
        values.push(source_url);
      }
      if (metadata !== undefined) {
        updates.push(`metadata = $${paramIndex++}`);
        values.push(metadata);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      updates.push(`updated_at = NOW()`);

      const query = `
        UPDATE entries 
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;
      values.push(id);

      const result = await dbQuery(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Entry not found'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/entries/:id
 * Delete an entry
 * Requires admin authentication
 */
router.delete('/:id',
  authenticateApiKey,
  requireAdmin,
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const result = await dbQuery(
        'DELETE FROM entries WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Entry not found'
        });
      }

      res.json({
        success: true,
        message: 'Entry deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
