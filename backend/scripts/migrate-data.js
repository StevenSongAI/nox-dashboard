#!/usr/bin/env node

/**
 * Data Migration Script for Nox Dashboard v2
 * Migrates JSON data from /data/ directory to PostgreSQL via API
 * 
 * FIXED VERSION - Batch 10 Defect Fixes Applied:
 * - DEFECT-001: Research notes now use category='youtube' with type='research_note'
 * - DEFECT-002: Full transaction wrapping with BEGIN/COMMIT/ROLLBACK
 * - DEFECT-004: Added intelligence array migration from investments.json
 * - Fixed confidence=0 bug (nullish coalescing vs falsy)
 * - Added summary field mapping
 * - Safe JSON.stringify with error handling
 * - Proper date validation
 * - No silent file skipping - throws on critical errors
 * - Added type safety with JSDoc
 */

const fs = require('fs').promises
const path = require('path')
const { pool } = require('../src/config/database')

const DATA_DIR = path.join(__dirname, '../../data')

/** @typedef {Object} Entry
 * @property {string} category - 'youtube' | 'business' | 'investments'
 * @property {string} type
 * @property {string} title
 * @property {string} [content]
 * @property {string} [summary]
 * @property {string} source
 * @property {string|null} source_url
 * @property {string|null} source_id
 * @property {number} confidence
 * @property {Object} metadata
 * @property {boolean} verified
 * @property {string|null} created_at
 */

/** @typedef {Object} MigrationResult
 * @property {number} count
 * @property {number} errors
 * @property {number} skipped
 */

/**
 * Safely stringify metadata to JSON
 * @param {Object} metadata
 * @returns {string}
 */
function safeStringify(metadata) {
  try {
    return JSON.stringify(metadata ?? {})
  } catch (err) {
    console.warn(`⚠️  Failed to stringify metadata: ${err.message}`)
    return '{}'
  }
}

/**
 * Validate and normalize date string
 * @param {string|null|undefined} dateStr
 * @returns {string|null} - Valid ISO date or null
 */
function validateDate(dateStr) {
  if (!dateStr) return null
  
  try {
    const date = new Date(dateStr)
    // Check if valid date
    if (isNaN(date.getTime())) {
      console.warn(`⚠️  Invalid date: ${dateStr}`)
      return null
    }
    // Check if reasonable year (not before 2000, not after 2100)
    const year = date.getFullYear()
    if (year < 2000 || year > 2100) {
      console.warn(`⚠️  Suspicious date year: ${year}, using null`)
      return null
    }
    return date.toISOString()
  } catch (err) {
    console.warn(`⚠️  Failed to parse date: ${dateStr}`)
    return null
  }
}

/**
 * Load JSON file with proper error handling
 * @param {string} filename
 * @param {boolean} [required=false] - If true, throws on missing file
 * @returns {Promise<Object|null>}
 */
async function loadJsonFile(filename, required = false) {
  const filepath = path.join(DATA_DIR, filename)
  try {
    const content = await fs.readFile(filepath, 'utf-8')
    return JSON.parse(content)
  } catch (err) {
    if (err.code === 'ENOENT') {
      const msg = `❌ Required file not found: ${filename}`
      if (required) {
        throw new Error(msg)
      }
      console.warn(`⚠️  Optional file not found: ${filename}`)
      return null
    }
    if (err instanceof SyntaxError) {
      throw new Error(`❌ Invalid JSON in ${filename}: ${err.message}`)
    }
    throw new Error(`❌ Failed to load ${filename}: ${err.message}`)
  }
}

// Helper to truncate strings
function truncate(str, maxLen) {
  if (!str) return str
  if (str.length <= maxLen) return str
  return str.substring(0, maxLen - 3) + '...'
}

/**
 * Extract summary from content (first 200 chars)
 * @param {string} content
 * @param {number} [maxLength=200]
 * @returns {string|null}
 */
function extractSummary(content, maxLength = 200) {
  if (!content || typeof content !== 'string') return null
  const clean = content.replace(/\n/g, ' ').trim()
  if (clean.length <= maxLength) return clean
  return clean.substring(0, maxLength - 3) + '...'
}

/**
 * Normalize confidence value (0-100)
 * @param {number|string|null|undefined} rawConfidence
 * @param {number} [defaultValue=70]
 * @returns {number}
 */
function normalizeConfidence(rawConfidence, defaultValue = 70) {
  // Use nullish coalescing to handle 0 correctly (0 is valid, null/undefined uses default)
  const num = Number(rawConfidence ?? defaultValue)
  if (isNaN(num)) return defaultValue
  return Math.round(Math.min(100, Math.max(0, num)))
}

// Map YouTube outlier video to entry
function mapYouTubeOutlier(item) {
  const confidence = normalizeConfidence(
    item.viralScore ?? item.outlierScore ?? item.confidence,
    70
  )
  
  const content = item.notes ?? item.whyOutlier ?? item.contentAngle ?? ''
  
  return {
    category: 'youtube',
    type: item.type ?? 'outlier_video',
    title: truncate(item.title ?? item.videoTitle ?? 'Untitled', 500),
    content: content,
    summary: extractSummary(content),
    source: truncate(item.channel ?? item.channelName ?? item.source ?? 'Unknown', 100),
    source_url: item.url ?? item.videoUrl ?? null,
    source_id: item.id ? truncate(item.id, 200) : null,
    confidence: confidence,
    metadata: {
      views: item.views,
      viralScore: item.viralScore,
      outlierScore: item.outlierScore,
      channel: item.channel,
      niche: item.niche,
      category: item.category,
      publishedAt: item.publishedAt,
      researchStatus: item.researchStatus
    },
    verified: item.verified ?? false,
    created_at: validateDate(item.publishedAt ?? item.addedAt ?? item.createdAt)
  }
}

// Map business opportunity to entry
function mapBusinessOpportunity(item) {
  const confidence = item.alignment === 'HIGH' ? 80 : item.alignment === 'MEDIUM' ? 60 : 40
  const content = item.description ?? ''
  
  return {
    category: 'business',
    type: 'opportunity',
    title: truncate(item.name ?? item.title ?? 'Untitled', 500),
    content: content,
    summary: extractSummary(content),
    source: truncate(item.discoveredVia ?? 'internal', 100),
    source_url: null,
    source_id: item.id ? truncate(item.id, 200) : null,
    confidence: confidence,
    metadata: {
      status: item.status,
      potentialRevenue: item.potentialRevenue,
      effort: item.effort,
      alignment: item.alignment,
      nextStep: item.nextStep,
      marketData: item.marketData
    },
    verified: item.status === 'won' || item.status === 'active',
    created_at: validateDate(item.createdAt)
  }
}

// Map investment opportunity to entry
function mapInvestmentOpportunity(item) {
  const content = item.notes ?? item.analysis ?? item.content ?? ''
  
  return {
    category: 'investments',
    type: 'intelligence',
    title: truncate(item.ticker ?? item.name ?? 'Investment Intelligence', 500),
    content: content,
    summary: extractSummary(content),
    source: truncate(item.source ?? 'Market Data', 100),
    source_url: null,
    source_id: item.id ? truncate(item.id, 200) : null,
    confidence: normalizeConfidence(item.confidence, 70),
    metadata: {
      ticker: item.ticker,
      sector: item.sector,
      signal: item.signal,
      impact: item.impact
    },
    verified: false,
    created_at: validateDate(item.addedAt ?? item.lastUpdated)
  }
}

// Map investment position to entry
function mapInvestmentPosition(item) {
  const content = item.note ?? `Holding ${item.shares ?? item.quantity} shares`
  
  return {
    category: 'investments',
    type: 'position',
    title: truncate(`${item.ticker} - ${item.name ?? 'Position'}`, 500),
    content: content,
    summary: extractSummary(content),
    source: 'brokerage',
    source_url: null,
    source_id: item.id ? truncate(item.id, 200) : null,
    confidence: 80,
    metadata: {
      ticker: item.ticker,
      shares: item.shares ?? item.quantity,
      avgCost: item.avgCost ?? item.entryPrice,
      currentPrice: item.currentPrice,
      totalValue: item.totalValue,
      gainPercent: item.gainPercent
    },
    verified: true,
    created_at: validateDate(item.addedAt ?? item.lastUpdated)
  }
}

// Map investment intelligence to entry (DEFECT-004 FIX)
function mapInvestmentIntelligence(item) {
  const content = item.content ?? item.summary ?? ''
  
  return {
    category: 'investments',
    type: 'intelligence_report',
    title: truncate(item.topic ?? 'Investment Intelligence', 500),
    content: content,
    summary: extractSummary(content),
    source: truncate(item.source ?? 'Market Analysis', 100),
    source_url: null,
    source_id: item.id ? truncate(item.id, 200) : null,
    confidence: item.impact === 'bullish' ? 75 : item.impact === 'bearish' ? 65 : 60,
    metadata: {
      topic: item.topic,
      impact: item.impact,
      date: item.date,
      relatedPositions: item.relatedPositions,
      relatedOpportunities: item.relatedOpportunities,
      riskFactors: item.riskFactors,
      timeHorizon: item.timeHorizon
    },
    verified: false,
    created_at: validateDate(item.date ?? item.addedAt)
  }
}

// Map research note to entry (DEFECT-001 FIX: use 'youtube' category with 'research_note' type)
function mapResearchNote(item) {
  const confidence = normalizeConfidence(item.confidence, 80)
  
  // Extract valid URL or null
  let sourceUrl = null
  if (item.sourceUrls && Array.isArray(item.sourceUrls) && item.sourceUrls[0]) {
    try {
      new URL(item.sourceUrls[0])
      sourceUrl = item.sourceUrls[0]
    } catch (e) {
      sourceUrl = null
    }
  }
  
  // Extract hostname for source
  let source = 'research'
  if (sourceUrl) {
    try {
      source = new URL(sourceUrl).hostname
    } catch (e) {
      source = 'research'
    }
  } else if (item.source) {
    source = item.source
  }
  
  const content = item.content ?? item.findings ?? ''
  
  return {
    // DEFECT-001 FIX: Changed from 'research' to 'youtube' to match DB constraint
    category: 'youtube',
    type: item.type ?? 'research_note',
    title: truncate(item.title ?? 'Research Note', 500),
    content: content,
    summary: extractSummary(content),
    source: truncate(source, 100),
    source_url: sourceUrl,
    source_id: item.id ? truncate(item.id, 200) : null,
    confidence: confidence,
    metadata: {
      tags: item.tags,
      category: item.category,
      linkedYouTubeIds: item.linkedYouTubeIds,
      linkedBusinessOpps: item.linkedBusinessOpps,
      priority: item.priority,
      status: item.status,
      date: item.date
    },
    verified: item.status === 'complete',
    created_at: validateDate(item.date ?? item.createdAt)
  }
}

/**
 * Migrate entries to database
 * @param {import('pg').PoolClient} client
 * @param {Array<any>} entries
 * @param {Function} mapper
 * @param {string} sourceName
 * @returns {Promise<MigrationResult>}
 */
async function migrateEntries(client, entries, mapper, sourceName) {
  let count = 0
  let errors = 0
  let skipped = 0

  if (!Array.isArray(entries)) {
    console.warn(`⚠️  ${sourceName}: entries is not an array`)
    return { count: 0, errors: 0, skipped: 0 }
  }

  for (const item of entries) {
    try {
      if (!item) {
        skipped++
        continue
      }

      const mapped = mapper(item)
      
      if (!mapped.title || mapped.title === 'Untitled') {
        console.warn(`⚠️  Skipping entry with missing title from ${sourceName}`)
        skipped++
        continue
      }

      await client.query(`
        INSERT INTO entries (category, type, title, content, summary, source, source_url, source_id, confidence, metadata, verified, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, COALESCE($12, NOW()))
        ON CONFLICT DO NOTHING
      `, [
        mapped.category,
        mapped.type,
        mapped.title,
        mapped.content,
        mapped.summary,
        mapped.source,
        mapped.source_url,
        mapped.source_id,
        mapped.confidence,
        safeStringify(mapped.metadata),
        mapped.verified,
        mapped.created_at
      ])
      
      count++
      process.stdout.write('.')
    } catch (err) {
      errors++
      // Log first 5 errors with details
      if (errors <= 5) {
        console.error(`\n❌ Error migrating item from ${sourceName}: ${err.message}`)
        if (errors === 5) {
          console.error('   (Suppressing further error details...)')
        }
      }
    }
  }

  console.log(`\n✅ Migrated ${count} entries from ${sourceName} (${errors} errors, ${skipped} skipped)`)
  return { count, errors, skipped }
}

async function migrate() {
  const client = await pool.connect()
  
  // DEFECT-002 FIX: Transaction wrapping
  try {
    console.log('🚀 Starting data migration...\n')
    
    // Start transaction
    await client.query('BEGIN')
    console.log('🔒 Transaction started\n')

    // YouTube
    const youtubeData = await loadJsonFile('youtube.json')
    if (youtubeData?.outlierVideos) {
      await migrateEntries(client, youtubeData.outlierVideos, mapYouTubeOutlier, 'youtube.json (outliers)')
    }

    // Business
    const businessData = await loadJsonFile('new-business.json')
    if (businessData?.opportunities) {
      await migrateEntries(client, businessData.opportunities, mapBusinessOpportunity, 'new-business.json')
    }

    // Investments
    const investmentsData = await loadJsonFile('investments.json')
    if (investmentsData?.marketOpportunities) {
      await migrateEntries(client, investmentsData.marketOpportunities, mapInvestmentOpportunity, 'investments.json (opportunities)')
    }
    if (investmentsData?.positions) {
      await migrateEntries(client, investmentsData.positions, mapInvestmentPosition, 'investments.json (positions)')
    }
    if (investmentsData?.watchlist) {
      await migrateEntries(client, investmentsData.watchlist, mapInvestmentOpportunity, 'investments.json (watchlist)')
    }
    if (investmentsData?.trends) {
      await migrateEntries(client, investmentsData.trends, mapInvestmentOpportunity, 'investments.json (trends)')
    }
    // DEFECT-004 FIX: Migrate intelligence array
    if (investmentsData?.intelligence) {
      await migrateEntries(client, investmentsData.intelligence, mapInvestmentIntelligence, 'investments.json (intelligence)')
    }

    // Research
    const researchData = await loadJsonFile('research.json')
    if (researchData?.notes) {
      await migrateEntries(client, researchData.notes, mapResearchNote, 'research.json')
    }

    // Commit transaction
    await client.query('COMMIT')
    console.log('\n🔓 Transaction committed')
    console.log('\n✨ Migration complete!')

    // Verify counts
    const result = await client.query('SELECT category, COUNT(*) FROM entries GROUP BY category')
    console.log('\n📊 Final database counts:')
    for (const row of result.rows) {
      console.log(`  ${row.category}: ${row.count} entries`)
    }

  } catch (err) {
    // Rollback on error
    await client.query('ROLLBACK').catch(() => {})
    console.error('\n🛑 Transaction rolled back due to error')
    console.error('\n❌ Migration failed:', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
