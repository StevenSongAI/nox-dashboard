#!/usr/bin/env node
/**
 * X Intelligence Trend Analyzer & Briefing Generator
 * 
 * Analyzes x-intel-data.json trends and generates:
 * - Morning briefing markdown
 * - Trend comparison reports
 * - Actionable opportunity alerts
 * 
 * Usage: node x-intel-analyzer.js [--briefing|--alerts|--full]
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'x-intel-data.json');
const LOG_FILE = path.join(__dirname, 'collection-log.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'briefings');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    console.error('❌ Error loading data:', e.message);
    process.exit(1);
  }
}

function loadHistory() {
  try {
    if (fs.existsSync(LOG_FILE)) {
      return JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('⚠️  Error loading history:', e.message);
  }
  return { runs: [] };
}

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function generateMorningBriefing(data) {
  const timestamp = formatDate(data.timestamp);
  const { topTrending, categories, summary } = data;
  
  // Build opportunities list
  const opportunities = [];
  
  // AI opportunities
  if (categories.ai.some(i => i.momentum === 'very-high')) {
    opportunities.push({
      category: 'AI',
      action: 'Create content about AI Coding Agents',
      urgency: 'HIGH',
      reasoning: 'Very high momentum topic with positive sentiment'
    });
  }
  
  // Gaming opportunities  
  if (categories.gaming.some(i => i.topic.includes('Minecraft'))) {
    opportunities.push({
      category: 'Gaming',
      action: 'Double down on Minecraft content',
      urgency: 'MEDIUM',
      reasoning: 'Consistent trend in your niche'
    });
  }
  
  // Business opportunities
  if (categories.business.some(i => i.topic.includes('SaaS') || i.topic.includes('Creator'))) {
    opportunities.push({
      category: 'Business',
      action: 'Consider micro-SaaS tool development',
      urgency: 'MEDIUM',
      reasoning: 'Trending: SaaS micro-tools for creators'
    });
  }

  const briefing = `# Morning Intelligence Briefing
**Generated:** ${timestamp}

---

## 📊 Snapshot
- **Total Topics Tracked:** ${summary.totalTopics}
- **High Momentum Items:** ${summary.highMomentumCount}
- **Positive Sentiment:** ${summary.positiveSentimentCount}/${summary.totalTopics} (${Math.round(summary.positiveSentimentCount/summary.totalTopics*100)}%)
- **Categories:** ${summary.categoriesCovered}

---

## 🔥 Top 5 Trending Topics

${topTrending.map((t, i) => `${i + 1}. **${t.topic}** (${t.category.toUpperCase()})
   - Score: ${t.score} | Momentum: ${t.momentum}`).join('\n\n')}

---

## 💡 Actionable Opportunities

${opportunities.map(o => `### ${o.category}: ${o.action}
- **Urgency:** ${o.urgency}
- **Why:** ${o.reasoning}`).join('\n\n')}

---

## 📈 By Category

### AI (${categories.ai.length} topics)
${categories.ai.sort((a,b) => b.trendScore - a.trendScore).slice(0, 3).map(i => `- **${i.topic}** (${i.momentum}) - Score: ${i.trendScore}`).join('\n')}

### Tech (${categories.tech.length} topics)
${categories.tech.sort((a,b) => b.trendScore - a.trendScore).slice(0, 3).map(i => `- **${i.topic}** (${i.momentum}) - Score: ${i.trendScore}`).join('\n')}

### Gaming (${categories.gaming.length} topics)
${categories.gaming.sort((a,b) => b.trendScore - a.trendScore).slice(0, 3).map(i => `- **${i.topic}** (${i.momentum}) - Score: ${i.trendScore}`).join('\n')}

### Business (${categories.business.length} topics)
${categories.business.sort((a,b) => b.trendScore - a.trendScore).slice(0, 3).map(i => `- **${i.topic}** (${i.momentum}) - Score: ${i.trendScore}`).join('\n')}

---

*Next update: Run \`node data/x-intel-collector.js\` to refresh data*
`;

  return briefing;
}

function generateAlerts(data, history) {
  const alerts = [];
  const prevRun = history.runs[history.runs.length - 2];
  
  // Check for new high-momentum items
  const allCurrent = Object.values(data.categories).flat();
  const veryHighItems = allCurrent.filter(i => i.momentum === 'very-high');
  
  if (veryHighItems.length > 0) {
    alerts.push({
      type: 'OPPORTUNITY',
      severity: 'HIGH',
      message: `${veryHighItems.length} very-high momentum topic(s) detected`,
      items: veryHighItems.map(i => i.topic)
    });
  }
  
  // Check AI coding agents specifically (Steven's interest)
  const aiCoding = allCurrent.find(i => i.topic.includes('Coding Agents'));
  if (aiCoding && aiCoding.trendScore >= 100) {
    alerts.push({
      type: 'CONTENT_IDEA',
      severity: 'MEDIUM', 
      message: 'AI Coding Agents trending - content opportunity',
      action: 'Create video about AI coding tools'
    });
  }
  
  return alerts;
}

function saveBriefing(briefing) {
  const date = new Date().toISOString().split('T')[0];
  const filename = `briefing-${date}.md`;
  const filepath = path.join(OUTPUT_DIR, filename);
  
  fs.writeFileSync(filepath, briefing);
  console.log(`✅ Briefing saved: ${filepath}`);
  return filepath;
}

function saveAlerts(alerts) {
  const filepath = path.join(OUTPUT_DIR, 'latest-alerts.json');
  fs.writeFileSync(filepath, JSON.stringify({ 
    timestamp: new Date().toISOString(), 
    alerts 
  }, null, 2));
  console.log(`✅ Alerts saved: ${filepath}`);
  return filepath;
}

function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || '--full';
  
  console.log('⚡ X Intelligence Analyzer');
  console.log('==========================\n');
  
  const data = loadData();
  const history = loadHistory();
  
  let briefingPath = null;
  let alertsPath = null;
  
  if (mode === '--briefing' || mode === '--full') {
    console.log('📝 Generating morning briefing...');
    const briefing = generateMorningBriefing(data);
    briefingPath = saveBriefing(briefing);
    console.log('\n--- BRIEFING PREVIEW ---\n');
    console.log(briefing.split('\n').slice(0, 30).join('\n'));
    console.log('\n... (truncated) ...\n');
  }
  
  if (mode === '--alerts' || mode === '--full') {
    console.log('🚨 Checking for alerts...');
    const alerts = generateAlerts(data, history);
    alertsPath = saveAlerts(alerts);
    
    if (alerts.length > 0) {
      console.log(`\n⚠️  ${alerts.length} alert(s) detected:`);
      alerts.forEach(a => {
        console.log(`   [${a.severity}] ${a.type}: ${a.message}`);
      });
    } else {
      console.log('\n✅ No alerts - all metrics nominal');
    }
  }
  
  console.log('\n==========================');
  console.log('✨ Analysis complete!');
  console.log(`   Briefing: ${briefingPath || 'N/A'}`);
  console.log(`   Alerts: ${alertsPath || 'N/A'}`);
}

main();
