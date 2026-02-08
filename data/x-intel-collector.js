#!/usr/bin/env node
/**
 * X Intelligence Data Collector
 * 
 * Collects trending AI/tech/gaming intelligence from web sources
 * and saves structured data for dashboard consumption.
 * 
 * Usage: node x-intel-collector.js
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'x-intel-data.json');
const LOG_FILE = path.join(__dirname, 'collection-log.json');

// Curated intelligence sources (simulated - would integrate with APIs)
const INTEL_CATEGORIES = {
  ai: [
    { topic: "Claude 4 Release", sentiment: "positive", momentum: "high", source: "anthropic" },
    { topic: "OpenAI GPT-5 Rumors", sentiment: "neutral", momentum: "medium", source: "x" },
    { topic: "Local LLM Progress", sentiment: "positive", momentum: "high", source: "github" },
    { topic: "AI Coding Agents", sentiment: "positive", momentum: "very-high", source: "producthunt" },
    { topic: "Multimodal AI Tools", sentiment: "positive", momentum: "high", source: "techcrunch" }
  ],
  tech: [
    { topic: "Apple M4 Ultra Leaks", sentiment: "positive", momentum: "medium", source: "macrumors" },
    { topic: "Cloud Cost Optimization", sentiment: "neutral", momentum: "high", source: "hackernews" },
    { topic: "Rust Adoption Enterprise", sentiment: "positive", momentum: "medium", source: "github" },
    { topic: "Edge Computing Growth", sentiment: "positive", momentum: "medium", source: "x" }
  ],
  gaming: [
    { topic: "Indie Game Revenue Models", sentiment: "positive", momentum: "high", source: "gamedev" },
    { topic: "YouTube Gaming Algorithm", sentiment: "neutral", momentum: "high", source: "x" },
    { topic: "Minecraft Content Trends", sentiment: "positive", momentum: "medium", source: "youtube" },
    { topic: "AI Game Development Tools", sentiment: "positive", momentum: "very-high", source: "producthunt" }
  ],
  business: [
    { topic: "Creator Economy 2026", sentiment: "positive", momentum: "high", source: "bloomberg" },
    { topic: "SaaS Micro-tools Trend", sentiment: "positive", momentum: "very-high", source: "indiehackers" },
    { topic: "Solo Founder Success", sentiment: "positive", momentum: "medium", source: "x" }
  ]
};

function generateTimestamp() {
  return new Date().toISOString();
}

function calculateTrendScore(item) {
  const momentumScores = {
    'very-high': 100,
    'high': 75,
    'medium': 50,
    'low': 25
  };
  const sentimentMultipliers = {
    'positive': 1.2,
    'neutral': 1.0,
    'negative': 0.8
  };
  const base = momentumScores[item.momentum] || 50;
  const mult = sentimentMultipliers[item.sentiment] || 1.0;
  return Math.round(base * mult);
}

function collectIntelligence() {
  const collection = {
    timestamp: generateTimestamp(),
    categories: {},
    topTrending: [],
    summary: {}
  };

  // Process each category
  for (const [category, items] of Object.entries(INTEL_CATEGORIES)) {
    collection.categories[category] = items.map(item => ({
      ...item,
      trendScore: calculateTrendScore(item),
      id: `${category}-${Buffer.from(item.topic).toString('base64').slice(0, 8)}`
    }));
  }

  // Generate top trending across all categories
  const allItems = Object.values(collection.categories).flat();
  collection.topTrending = allItems
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, 5)
    .map(item => ({
      topic: item.topic,
      category: Object.entries(collection.categories).find(([cat, items]) => 
        items.some(i => i.id === item.id)
      )?.[0],
      score: item.trendScore,
      momentum: item.momentum
    }));

  // Generate summary stats
  collection.summary = {
    totalTopics: allItems.length,
    highMomentumCount: allItems.filter(i => i.momentum === 'high' || i.momentum === 'very-high').length,
    positiveSentimentCount: allItems.filter(i => i.sentiment === 'positive').length,
    categoriesCovered: Object.keys(collection.categories).length,
    lastUpdated: collection.timestamp
  };

  return collection;
}

function loadExistingData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading existing data:', e.message);
  }
  return { history: [] };
}

function saveData(data) {
  // Save current intelligence
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  console.log(`✅ Intelligence data saved to ${DATA_FILE}`);

  // Update log
  const log = fs.existsSync(LOG_FILE) ? JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')) : { runs: [] };
  log.runs.push({
    timestamp: data.timestamp,
    topicsCollected: data.summary.totalTopics,
    topTrending: data.topTrending[0]?.topic || 'N/A'
  });
  // Keep last 50 runs
  log.runs = log.runs.slice(-50);
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
}

function main() {
  console.log('⚡ X Intelligence Collector');
  console.log('==========================');
  console.log(`Starting collection at ${generateTimestamp()}`);
  console.log('');

  const existing = loadExistingData();
  const fresh = collectIntelligence();

  // Merge with history
  const data = {
    ...fresh,
    history: [
      ...(existing.history || []),
      { timestamp: fresh.timestamp, summary: fresh.summary }
    ].slice(-10) // Keep last 10 snapshots
  };

  saveData(data);

  console.log('');
  console.log('📊 Collection Summary:');
  console.log(`   Topics collected: ${data.summary.totalTopics}`);
  console.log(`   High momentum: ${data.summary.highMomentumCount}`);
  console.log(`   Top trending: ${data.topTrending[0]?.topic}`);
  console.log('');
  console.log('✨ Done! Data ready for dashboard consumption.');
}

main();
