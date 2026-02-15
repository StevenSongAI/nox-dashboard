const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET /api/stats - Dashboard statistics
router.get('/', async (req, res, next) => {
  try {
    // Total entries by category
    const categoryStats = await pool.query(`
      SELECT 
        category,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7_days,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as last_30_days
      FROM entries
      WHERE deleted_at IS NULL
      GROUP BY category
    `);

    // Total entries by type
    const typeStats = await pool.query(`
      SELECT 
        type,
        category,
        COUNT(*) as total
      FROM entries
      WHERE deleted_at IS NULL
      GROUP BY type, category
      ORDER BY category, total DESC
    `);

    // Recent activity
    const recentActivity = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM entries
      WHERE deleted_at IS NULL
        AND created_at > NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `);

    // Top sources
    const topSources = await pool.query(`
      SELECT 
        source,
        COUNT(*) as total
      FROM entries
      WHERE deleted_at IS NULL
      GROUP BY source
      ORDER BY total DESC
      LIMIT 10
    `);

    // Verification stats
    const verificationStats = await pool.query(`
      SELECT 
        verified,
        COUNT(*) as total
      FROM entries
      WHERE deleted_at IS NULL
      GROUP BY verified
    `);

    // Confidence distribution
    const confidenceDistribution = await pool.query(`
      SELECT 
        CASE 
          WHEN confidence >= 90 THEN '90-100'
          WHEN confidence >= 70 THEN '70-89'
          WHEN confidence >= 50 THEN '50-69'
          ELSE '0-49'
        END as range,
        COUNT(*) as total
      FROM entries
      WHERE deleted_at IS NULL
        AND confidence IS NOT NULL
      GROUP BY 1
      ORDER BY 1
    `);

    // Total counts
    const totalResult = await pool.query(`
      SELECT COUNT(*) as total FROM entries WHERE deleted_at IS NULL
    `);

    res.json({
      overview: {
        totalEntries: parseInt(totalResult.rows[0].total),
        lastUpdated: new Date().toISOString()
      },
      byCategory: categoryStats.rows,
      byType: typeStats.rows,
      recentActivity: recentActivity.rows,
      topSources: topSources.rows,
      verification: verificationStats.rows,
      confidenceDistribution: confidenceDistribution.rows
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
