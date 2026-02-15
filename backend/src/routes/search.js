const express = require('express');
const { query: dbQuery } = require('../config/database');
const { authenticateApiKey } = require('./auth');
const { blockPrototypePollution } = require('../middleware/validation');

const router = express.Router();

/**
 * GET /api/search
 * Full-text search across entries with faceted results
 */
router.get('/', async (req, res, next) => {
  try {
    const { 
      q, 
      page = 1, 
      limit = 20,
      category,
      filters = {}
    } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const pageLimit = Math.min(parseInt(limit), 100);
    const searchTerm = `%${q.trim()}%`;

    // Build dynamic WHERE clause
    let whereClause = 'WHERE (title ILIKE $1 OR content ILIKE $1 OR description ILIKE $1 OR EXISTS (SELECT 1 FROM unnest(tags) tag WHERE tag ILIKE $1))';
    const params = [searchTerm];
    let paramIndex = 2;

    if (category) {
      whereClause += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // Handle additional filters
    if (filters.confidence_min) {
      whereClause += ` AND confidence >= $${paramIndex}`;
      params.push(parseFloat(filters.confidence_min));
      paramIndex++;
    }

    if (filters.confidence_max) {
      whereClause += ` AND confidence <= $${paramIndex}`;
      params.push(parseFloat(filters.confidence_max));
      paramIndex++;
    }

    if (filters.date_from) {
      whereClause += ` AND created_at >= $${paramIndex}`;
      params.push(filters.date_from);
      paramIndex++;
    }

    if (filters.date_to) {
      whereClause += ` AND created_at <= $${paramIndex}`;
      params.push(filters.date_to);
      paramIndex++;
    }

    // Get total count
    const countResult = await dbQuery(`SELECT COUNT(*) FROM entries ${whereClause}`, params);
    const totalCount = parseInt(countResult.rows[0].count);

    // Get search results with ranking
    const queryParams = [...params, pageLimit, offset];
    const result = await dbQuery(
      `SELECT 
        id, title, description, content, category, 
        confidence, tags, source_url, created_at, updated_at,
        CASE 
          WHEN title ILIKE $1 THEN 3
          WHEN description ILIKE $1 THEN 2
          ELSE 1
        END as relevance_score
      FROM entries 
      ${whereClause}
      ORDER BY relevance_score DESC, created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      queryParams
    );

    // Get category facets
    const facetResult = await dbQuery(
      `SELECT category, COUNT(*) as count 
       FROM entries 
       WHERE title ILIKE $1 OR content ILIKE $1 OR description ILIKE $1
       GROUP BY category 
       ORDER BY count DESC`,
      [searchTerm]
    );

    // Get tag facets
    const tagResult = await dbQuery(
      `SELECT unnest(tags) as tag, COUNT(*) as count 
       FROM entries 
       WHERE title ILIKE $1 OR content ILIKE $1 OR description ILIKE $1
       GROUP BY tag 
       ORDER BY count DESC 
       LIMIT 20`,
      [searchTerm]
    );

    res.json({
      success: true,
      data: {
        results: result.rows,
        query: q.trim(),
        facets: {
          categories: facetResult.rows,
          tags: tagResult.rows
        }
      },
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
 * GET /api/search/suggest
 * Autocomplete suggestions for search
 */
router.get('/suggest', async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({
        success: true,
        data: {
          suggestions: [],
          tags: [],
          categories: []
        }
      });
    }

    const searchTerm = `%${q.trim()}%`;
    const resultLimit = Math.min(parseInt(limit), 50);

    // Get title suggestions
    const titleResult = await dbQuery(
      `SELECT DISTINCT title, category
       FROM entries 
       WHERE title ILIKE $1
       ORDER BY 
         CASE WHEN title ILIKE $2 THEN 0 ELSE 1 END,
         title
       LIMIT $3`,
      [searchTerm, `${q.trim()}%`, resultLimit]
    );

    // Get tag suggestions
    const tagResult = await dbQuery(
      `SELECT DISTINCT unnest(tags) as tag
       FROM entries 
       WHERE EXISTS (SELECT 1 FROM unnest(tags) t WHERE t ILIKE $1)
       LIMIT $2`,
      [searchTerm, resultLimit]
    );

    // Get category suggestions
    const categoryResult = await dbQuery(
      `SELECT DISTINCT category
       FROM entries 
       WHERE category ILIKE $1
       LIMIT $2`,
      [searchTerm, resultLimit]
    );

    res.json({
      success: true,
      data: {
        suggestions: titleResult.rows.map(r => ({
          type: 'title',
          value: r.title,
          category: r.category
        })),
        tags: tagResult.rows.map(r => r.tag),
        categories: categoryResult.rows.map(r => r.category)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/search/advanced
 * Advanced search with multiple criteria
 * Requires authentication
 */
router.post('/advanced',
  authenticateApiKey,
  blockPrototypePollution,
  async (req, res, next) => {
    try {
      const {
        queries = [],
        operator = 'AND',
        page = 1,
        limit = 20
      } = req.body;

      if (!Array.isArray(queries) || queries.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'At least one search query is required'
        });
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const pageLimit = Math.min(parseInt(limit), 100);

      // Build complex WHERE clause
      const conditions = [];
      const params = [];
      let paramIndex = 1;

      for (const query of queries) {
        const { field, value, match = 'contains' } = query;
        
        if (!field || !value) continue;

        const allowedFields = ['title', 'content', 'description', 'category', 'tags'];
        if (!allowedFields.includes(field)) continue;

        let condition = '';
        
        if (field === 'tags') {
          if (match === 'contains') {
            condition = `EXISTS (SELECT 1 FROM unnest(tags) tag WHERE tag ILIKE $${paramIndex})`;
          } else {
            condition = `EXISTS (SELECT 1 FROM unnest(tags) tag WHERE tag = $${paramIndex})`;
          }
        } else if (match === 'contains') {
          condition = `${field} ILIKE $${paramIndex}`;
          params.push(`%${value}%`);
        } else if (match === 'equals') {
          condition = `${field} = $${paramIndex}`;
          params.push(value);
        } else if (match === 'startsWith') {
          condition = `${field} ILIKE $${paramIndex}`;
          params.push(`${value}%`);
        }

        if (condition) {
          conditions.push(condition);
          if (field !== 'tags') paramIndex++;
          else paramIndex++;
        }
      }

      if (conditions.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid search conditions provided'
        });
      }

      const whereClause = 'WHERE ' + conditions.join(` ${operator === 'OR' ? 'OR' : 'AND'} `);

      // Get results
      const result = await dbQuery(
        `SELECT 
          id, title, description, content, category, 
          confidence, tags, source_url, created_at, updated_at
        FROM entries 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...params, pageLimit, offset]
      );

      res.json({
        success: true,
        data: {
          results: result.rows,
          operator,
          queryCount: queries.length
        },
        pagination: {
          page: parseInt(page),
          limit: pageLimit,
          resultCount: result.rows.length,
          hasNext: result.rows.length === pageLimit,
          hasPrev: parseInt(page) > 1
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
