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
        metadata,
        status
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
      if (status !== undefined) {
        updates.push(`status = $${paramIndex++}`);
        values.push(status);
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

/**
 * GET /api/entries/:id/stats
 * Get engagement stats (view count, metrics) for a specific entry
 */
router.get('/:id/stats', async (req, res, next) => {
  try {
    const { id } = req.params;

    // First check if entry exists
    const entryResult = await dbQuery(
      'SELECT id, title, category, created_at FROM entries WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (entryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Entry not found'
      });
    }

    const entry = entryResult.rows[0];

    // Get or initialize stats
    let statsResult;
    try {
      statsResult = await dbQuery(
        `SELECT 
          view_count,
          unique_viewers,
          last_viewed_at,
          avg_time_spent_seconds,
          engagement_score
         FROM entry_stats 
         WHERE entry_id = $1`,
        [id]
      );
    } catch (statsError) {
      // entry_stats table may not exist yet - return default stats
      statsResult = { rows: [] };
    }

    const stats = statsResult.rows[0] || {
      view_count: 0,
      unique_viewers: 0,
      last_viewed_at: null,
      avg_time_spent_seconds: 0,
      engagement_score: 0
    };

    // Calculate derived metrics
    const daysSinceCreated = Math.max(1, Math.floor(
      (Date.now() - new Date(entry.created_at)) / (1000 * 60 * 60 * 24)
    ));
    const viewsPerDay = (parseInt(stats.view_count) / daysSinceCreated).toFixed(2);

    res.json({
      success: true,
      data: {
        entryId: id,
        entryTitle: entry.title,
        entryCategory: entry.category,
        viewCount: parseInt(stats.view_count),
        uniqueViewers: parseInt(stats.unique_viewers),
        lastViewedAt: stats.last_viewed_at,
        avgTimeSpentSeconds: parseInt(stats.avg_time_spent_seconds) || 0,
        engagementScore: parseFloat(stats.engagement_score) || 0,
        viewsPerDay: parseFloat(viewsPerDay),
        daysSinceCreated
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/entries/:id/view
 * Track a view for an entry
 */
router.post('/:id/view', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { timeSpentSeconds = 0 } = req.body;
    const viewerIp = req.ip || req.connection.remoteAddress;

    // Check if entry exists
    const entryResult = await dbQuery(
      'SELECT id FROM entries WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (entryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Entry not found'
      });
    }

    // Try to update stats (will fail gracefully if table doesn't exist)
    try {
      // Upsert entry stats
      await dbQuery(
        `INSERT INTO entry_stats 
          (entry_id, view_count, unique_viewers, last_viewed_at, avg_time_spent_seconds, updated_at)
         VALUES 
          ($1, 1, 1, NOW(), $2, NOW())
         ON CONFLICT (entry_id) 
         DO UPDATE SET
          view_count = entry_stats.view_count + 1,
          last_viewed_at = NOW(),
          avg_time_spent_seconds = (entry_stats.avg_time_spent_seconds * entry_stats.view_count + $2) / (entry_stats.view_count + 1),
          updated_at = NOW()`,
        [id, timeSpentSeconds]
      );

      // Log activity
      await dbQuery(
        `INSERT INTO activity_log 
          (action, entity_type, entity_id, details, created_at)
         VALUES 
          ('view', 'entry', $1, $2, NOW())`,
        [id, JSON.stringify({ timeSpentSeconds, viewerIp: viewerIp ? viewerIp.toString().replace(/\d+$/, 'xxx') : null })]
      );
    } catch (statsError) {
      // Table may not exist - still return success
      console.warn('Entry stats tracking not available:', statsError.message);
    }

    res.json({
      success: true,
      message: 'View tracked'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
