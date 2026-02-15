const express = require('express');
const { query: dbQuery } = require('../config/database');

const router = express.Router();

/**
 * GET /api/stats/overview
 * Get system overview statistics
 */
router.get('/overview', async (req, res, next) => {
  try {
    // Total entries count
    const totalResult = await dbQuery('SELECT COUNT(*) as total FROM entries');
    const totalEntries = parseInt(totalResult.rows[0].total);

    // Entries by category
    const categoryResult = await dbQuery(
      'SELECT category, COUNT(*) as count FROM entries GROUP BY category ORDER BY count DESC'
    );

    // Entries created in last 7 days
    const recentResult = await dbQuery(
      `SELECT COUNT(*) as count 
       FROM entries 
       WHERE created_at >= NOW() - INTERVAL '7 days'`
    );
    const recentEntries = parseInt(recentResult.rows[0].count);

    // Entries created in last 30 days
    const monthlyResult = await dbQuery(
      `SELECT COUNT(*) as count 
       FROM entries 
       WHERE created_at >= NOW() - INTERVAL '30 days'`
    );
    const monthlyEntries = parseInt(monthlyResult.rows[0].count);

    // Average confidence score
    const confidenceResult = await dbQuery(
      'SELECT AVG(confidence) as avg_confidence FROM entries'
    );
    const avgConfidence = parseFloat(confidenceResult.rows[0].avg_confidence) || 0;

    // Top tags
    const tagsResult = await dbQuery(
      `SELECT unnest(tags) as tag, COUNT(*) as count 
       FROM entries 
       GROUP BY tag 
       ORDER BY count DESC 
       LIMIT 10`
    );

    res.json({
      success: true,
      data: {
        totalEntries,
        recentEntries,
        monthlyEntries,
        avgConfidence: Math.round(avgConfidence * 100) / 100,
        categories: categoryResult.rows,
        topTags: tagsResult.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stats/timeline
 * Get entries timeline by date
 */
router.get('/timeline', async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const daysBack = Math.min(parseInt(days), 365);

    // DEFECT-RT-002 FIX: Use parameterized query to prevent SQL injection
    const result = await dbQuery(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        category
       FROM entries 
       WHERE created_at >= NOW() - INTERVAL '$1 days'
       GROUP BY DATE(created_at), category
       ORDER BY date DESC`,
      [daysBack]
    );

    // Aggregate by date
    const timeline = {};
    for (const row of result.rows) {
      if (!timeline[row.date]) {
        timeline[row.date] = {
          date: row.date,
          total: 0,
          categories: {}
        };
      }
      timeline[row.date].total += parseInt(row.count);
      timeline[row.date].categories[row.category] = parseInt(row.count);
    }

    res.json({
      success: true,
      data: {
        timeline: Object.values(timeline),
        days: daysBack
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stats/categories
 * Get detailed category statistics
 */
router.get('/categories', async (req, res, next) => {
  try {
    const result = await dbQuery(
      `SELECT 
        category,
        COUNT(*) as entry_count,
        AVG(confidence) as avg_confidence,
        MIN(created_at) as first_entry,
        MAX(created_at) as last_entry
       FROM entries 
       GROUP BY category
       ORDER BY entry_count DESC`
    );

    const categories = result.rows.map(row => ({
      category: row.category,
      entryCount: parseInt(row.entry_count),
      avgConfidence: Math.round(parseFloat(row.avg_confidence) * 100) / 100,
      firstEntry: row.first_entry,
      lastEntry: row.last_entry
    }));

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stats/activity
 * Get recent activity feed
 */
router.get('/activity', async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;
    const pageLimit = Math.min(parseInt(limit), 100);

    const result = await dbQuery(
      `SELECT 
        id,
        title,
        category,
        confidence,
        created_at,
        updated_at,
        CASE 
          WHEN updated_at > created_at + INTERVAL '1 second' THEN 'updated'
          ELSE 'created'
        END as activity_type
       FROM entries 
       ORDER BY GREATEST(created_at, updated_at) DESC
       LIMIT $1`,
      [pageLimit]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stats/confidence
 * Get confidence score distribution
 */
router.get('/confidence', async (req, res, next) => {
  try {
    const result = await dbQuery(
      `SELECT 
        CASE 
          WHEN confidence >= 0.9 THEN '0.9-1.0'
          WHEN confidence >= 0.8 THEN '0.8-0.9'
          WHEN confidence >= 0.7 THEN '0.7-0.8'
          WHEN confidence >= 0.6 THEN '0.6-0.7'
          WHEN confidence >= 0.5 THEN '0.5-0.6'
          WHEN confidence >= 0.4 THEN '0.4-0.5'
          WHEN confidence >= 0.3 THEN '0.3-0.4'
          WHEN confidence >= 0.2 THEN '0.2-0.3'
          WHEN confidence >= 0.1 THEN '0.1-0.2'
          ELSE '0.0-0.1'
        END as range,
        COUNT(*) as count
       FROM entries 
       GROUP BY 1
       ORDER BY 1 DESC`
    );

    res.json({
      success: true,
      data: {
        distribution: result.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
