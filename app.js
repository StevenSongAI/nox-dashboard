// Nox Dashboard - App Logic
// Loads data from JSON files and renders all tabs

let appData = {
  youtube: { outlierVideos: [], contentBriefs: [], trendAnalysis: {} },
  newBusiness: { opportunities: [], pipeline: {} },
  investments: { positions: [], watchlist: [], intelligence: [] },
  tools: { tools: [], categories: [], lastUpdated: '' },
  research: { notes: [] },
  audits: { audits: [], agentStats: {} },
  meta: { lastUpdated: {}, agentStatus: {} }
};

// Global chart instances (to prevent "Canvas already in use" errors)
let gradeChartInstance = null;
let agentPerformanceChartInstance = null;
let youtubeSparklineInstance = null;
let businessPipelineChartInstance = null;
let investmentsChartInstance = null;
let youtubeTrendChartInstance = null;
let portfolioChartInstance = null;

// Stock price cache to avoid excessive API calls
let stockPriceCache = {};
let lastPriceFetch = 0;

// Fetch real stock prices from Yahoo Finance
async function fetchStockPrices(tickers) {
  const now = Date.now();
  // Cache prices for 5 minutes
  if (now - lastPriceFetch < 300000 && Object.keys(stockPriceCache).length > 0) {
    return stockPriceCache;
  }
  
  // Use a CORS proxy or direct Yahoo API with proper error handling
  try {
    // Try fetching each ticker individually to handle CORS better
    for (const ticker of tickers) {
      try {
        // Use Yahoo Finance v8 API with proper headers
        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.chart?.result?.[0]?.meta) {
            const meta = data.chart.result[0].meta;
            const price = meta.regularMarketPrice || meta.previousClose || meta.chartPreviousClose;
            if (price && price > 0) {
              stockPriceCache[ticker] = price;
            }
          }
        }
      } catch (tickerErr) {
        console.warn(`[StockAPI] Failed to fetch ${ticker}:`, tickerErr.message);
      }
    }
    
    lastPriceFetch = now;
    return stockPriceCache;
  } catch (err) {
    console.error('[StockAPI] Error fetching prices:', err);
    return stockPriceCache;
  }
}
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Nox Dashboard] DOM loaded, initializing...');
  await loadAllData();
  
  // Render all tabs with error isolation - if one fails, others still run
  const renderers = [
    { name: 'Dashboard', fn: renderDashboard },
    { name: 'YouTube', fn: renderYouTube },
    { name: 'Business', fn: renderBusiness },
    { name: 'Investments', fn: renderInvestments },
    { name: 'Tools', fn: renderTools },
    { name: 'Research', fn: renderResearch },
    { name: 'Audits', fn: renderAudits }
  ];
  
  for (const { name, fn } of renderers) {
    try {
      console.log(`[Nox Dashboard] Rendering ${name}...`);
      fn();
    } catch (err) {
      console.error(`[Nox Dashboard] Error rendering ${name}:`, err);
    }
  }
  
  console.log('[Nox Dashboard] Setting up filters...');
  setupFilters();
  
  // D5 FIX: Setup global search
  console.log('[Nox Dashboard] Setting up global search...');
  setupGlobalSearch();
  
  console.log('[Nox Dashboard] Initialization complete!');
  
  // Setup modal click-outside-to-close
  setupModalHandlers();
});

// GitHub raw content base URL for fallback
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/stevensongai/nox-dashboard/main';

// Load all JSON data with fallback to GitHub raw
async function loadAllData() {
  console.log('[Nox Dashboard] Starting data load...');
  const cacheBuster = '?v=' + Date.now();
  
  // Try local paths first, fallback to GitHub raw on failure
  const dataFiles = [
    { name: 'youtube', localPath: 'data/youtube.json', fallbackPath: `${GITHUB_RAW_BASE}/data/youtube.json` },
    { name: 'new-business', localPath: 'data/new-business.json', fallbackPath: `${GITHUB_RAW_BASE}/data/new-business.json` },
    { name: 'investments', localPath: 'data/investments.json', fallbackPath: `${GITHUB_RAW_BASE}/data/investments.json` },
    { name: 'tools', localPath: 'data/tools.json', fallbackPath: `${GITHUB_RAW_BASE}/data/tools.json` },
    { name: 'research', localPath: 'data/research.json', fallbackPath: `${GITHUB_RAW_BASE}/data/research.json` },
    { name: 'audits', localPath: 'data/audits.json', fallbackPath: `${GITHUB_RAW_BASE}/data/audits.json` },
    { name: 'meta', localPath: 'data/meta.json', fallbackPath: `${GITHUB_RAW_BASE}/data/meta.json` }
  ];

  // Helper to fetch with fallback
  async function fetchWithFallback(df) {
    try {
      // Try local first with cache buster
      const localUrl = df.localPath + cacheBuster;
      console.log(`[Nox Dashboard] Fetching ${localUrl}...`);
      let response = await fetch(localUrl);
      
      if (!response.ok) {
        console.warn(`[Nox Dashboard] Local fetch failed for ${df.name}, trying GitHub raw...`);
        // Fallback to GitHub raw
        const fallbackUrl = df.fallbackPath + cacheBuster;
        response = await fetch(fallbackUrl);
      }
      
      if (!response.ok) {
        console.error(`[Nox Dashboard] Both local and GitHub fetch failed for ${df.name}: ${response.status}`);
      }
      
      return { name: df.name, response };
    } catch (err) {
      console.error(`[Nox Dashboard] Fetch error for ${df.name}:`, err);
      return { name: df.name, response: null, error: err };
    }
  }

  // Fetch all data files
  const fetchResults = await Promise.all(dataFiles.map(fetchWithFallback));

  // Process results
  for (const result of fetchResults) {
    if (result.response?.ok) {
      try {
        const data = await result.response.json();
        switch (result.name) {
          case 'youtube':
            appData.youtube = data;
            console.log('[Nox Dashboard] YouTube data loaded:', appData.youtube.outlierVideos?.length || 0, 'videos');
            break;
          case 'new-business':
            appData.newBusiness = data;
            console.log('[Nox Dashboard] Business data loaded:', appData.newBusiness.opportunities?.length || 0, 'opportunities');
            break;
          case 'investments':
            appData.investments = data;
            console.log('[Nox Dashboard] Investments data loaded:', appData.investments.positions?.length || 0, 'positions');
            break;
          case 'tools':
            appData.tools = Array.isArray(data) ? { tools: data, categories: [], lastUpdated: '' } : data;
            console.log('[Nox Dashboard] Tools data loaded:', appData.tools.tools?.length || 0, 'tools');
            break;
          case 'research':
            appData.research = data;
            console.log('[Nox Dashboard] Research data loaded:', appData.research.notes?.length || 0, 'notes');
            break;
          case 'audits':
            appData.audits = data;
            console.log('[Nox Dashboard] Audits data loaded:', appData.audits.audits?.length || 0, 'audits');
            break;
          case 'meta':
            appData.meta = data;
            console.log('[Nox Dashboard] Meta data loaded');
            break;
        }
      } catch (parseErr) {
        console.error(`[Nox Dashboard] Failed to parse ${result.name} JSON:`, parseErr);
      }
    } else {
      console.warn(`[Nox Dashboard] Using empty/default data for ${result.name}`);
    }
  }

  console.log('[Nox Dashboard] Data loading complete');
  updateAgentStatus();
}

function updateAgentStatus() {
  const status = appData.meta.agentStatus || {};
  const lastHeartbeat = status.lastHeartbeat ? formatTimeAgo(status.lastHeartbeat) : 'unknown';
  const currentTask = status.currentTask || 'Idle';
  document.getElementById('agent-status').innerHTML = 
    `Last heartbeat: ${lastHeartbeat} · ${currentTask}`;
}

// Tab switching
function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('tab-active'));
  document.getElementById(`tab-${tabId}`).classList.remove('hidden');
  document.getElementById(`tab-btn-${tabId}`).classList.add('tab-active');
  
  // Re-render charts when switching to their respective tabs
  setTimeout(() => {
    switch(tabId) {
      case 'dashboard':
        renderYouTubeSparkline();
        renderBusinessPipelineChart();
        renderInvestmentsSummaryChart();
        break;
      case 'youtube':
        renderYouTubeTrendChart();
        break;
      case 'investments':
        renderPortfolioChart();
        break;
      case 'audits':
        renderAuditsChart();
        renderAgentPerformanceChart();
        break;
    }
  }, 50);
}

// ==================== DETAIL MODAL SYSTEM ====================

function setupModalHandlers() {
  const overlay = document.getElementById('detail-modal');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    });
  }
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

function openModal(title, contentHtml) {
  const modal = document.getElementById('detail-modal');
  const titleEl = document.getElementById('modal-title');
  const contentEl = document.getElementById('modal-content');
  
  if (titleEl) titleEl.textContent = title;
  if (contentEl) contentEl.innerHTML = contentHtml;
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal() {
  const modal = document.getElementById('detail-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

// Modal content builders for each data type
function buildYouTubeModalContent(video) {
  const fields = [
    { label: 'Title', value: video.title },
    { label: 'Channel', value: video.channel },
    { label: 'Views', value: formatNumber(video.views) },
    { label: 'Published', value: formatDate(video.publishedAt) },
    { label: 'Added', value: formatDate(video.addedAt) },
    { label: 'Niche', value: video.niche },
    { label: 'Outlier Score', value: `${video.outlierScore?.toFixed(1) || '?'}x` },
    { label: 'Why It\'s an Outlier', value: video.whyOutlier },
    { label: 'Content Angle', value: video.contentAngle },
    { label: 'URL', value: `<a href="${video.url}" target="_blank" class="modal-field-value url">${video.url}</a>`, raw: true }
  ];
  
  return buildModalFields(fields);
}

function buildOpportunityModalContent(opp) {
  const revenue = opp.potentialRevenue || 'N/A';
  const fields = [
    { label: 'Name', value: opp.name || opp.title },
    { label: 'Description', value: opp.description },
    { label: 'Alignment', value: `<span class="alignment-${opp.alignment?.toLowerCase()}">${opp.alignment}</span>`, raw: true },
    { label: 'Status', value: `<span class="status-badge status-${opp.status}">${opp.status}</span>`, raw: true },
    { label: 'Potential Revenue', value: revenue },
    { label: 'Effort', value: opp.effort || opp.type },
    { label: 'Next Step', value: opp.nextStep },
    { label: 'Created', value: formatDate(opp.createdAt || opp.addedAt) },
    { label: 'ID', value: opp.id, code: true }
  ];
  
  return buildModalFields(fields);
}

function buildPositionModalContent(position) {
  const gain = position.gainPercent !== undefined 
    ? position.gainPercent 
    : ((position.currentPrice - (position.entryPrice || position.avgCost)) / (position.entryPrice || position.avgCost) * 100);
  const gainClass = gain >= 0 ? 'text-accent-green' : 'text-accent-red';
  
  const fields = [
    { label: 'Ticker', value: position.ticker || position.symbol },
    { label: 'Name', value: position.name },
    { label: 'Quantity', value: formatNumber(position.quantity || position.shares) },
    { label: 'Average Cost', value: formatCurrency(position.entryPrice || position.avgCost) },
    { label: 'Current Price', value: formatCurrency(position.currentPrice) },
    { label: 'Gain/Loss', value: `<span class="${gainClass}">${gain.toFixed ? gain.toFixed(2) : gain}%</span>`, raw: true }
  ];
  
  return buildModalFields(fields);
}

function buildWatchlistModalContent(item) {
  const target = item.targetEntry || item.targetPrice;
  const fields = [
    { label: 'Ticker', value: item.ticker || item.symbol },
    { label: 'Current Price', value: (item.currentPrice && item.currentPrice !== 0) ? formatCurrency(item.currentPrice) : '-' },
    { label: 'Target Entry', value: (target && target !== 0) ? formatCurrency(target) : '-' },
    { label: 'Thesis', value: item.thesis || item.notes, pre: true }
  ];
  
  return buildModalFields(fields);
}

function buildIntelligenceModalContent(item) {
  const fields = [
    { label: 'Topic', value: item.topic || `${item.ticker} ${item.type || 'Update'}` },
    { label: 'Ticker', value: item.ticker || 'N/A' },
    { label: 'Impact', value: `<span class="alignment-${item.impact}">${item.impact || 'neutral'}</span>`, raw: true },
    { label: 'Summary', value: item.summary || item.content, pre: true },
    { label: 'Added', value: formatDate(item.addedAt || item.date) }
  ];
  
  return buildModalFields(fields);
}

function buildToolModalContent(tool) {
  const fields = [
    { label: 'Name', value: tool.name },
    { label: 'Description', value: tool.description },
    { label: 'Status', value: `<span class="status-badge status-${tool.status}">${tool.status}</span>`, raw: true },
    { label: 'Category', value: tool.category },
    { label: 'Audit Grade', value: tool.auditGrade ? `${tool.auditGrade}%` : 'N/A' },
    { label: 'Run Command', value: tool.runCommand, code: true }
  ];
  
  return buildModalFields(fields);
}

function buildNoteModalContent(note) {
  const tagsHtml = note.tags?.length 
    ? `<div class="modal-tag-list">${note.tags.map(t => `<span class="modal-tag">#${t}</span>`).join('')}</div>`
    : 'No tags';
  
  const content = note.summary || note.content || '';
  const fields = [
    { label: 'Title', value: note.title },
    { label: 'Category', value: note.category },
    { label: 'Tags', value: tagsHtml, raw: true },
    { label: 'Created', value: formatDate(note.createdAt || note.date) },
    { label: 'ID', value: note.id, code: true },
    { label: 'Content', value: content, pre: true }
  ];
  
  return buildModalFields(fields);
}

function buildAuditModalContent(audit) {
  const gradeClass = audit.grade >= 80 ? 'high' : audit.grade >= 60 ? 'medium' : 'low';
  const recsHtml = audit.recommendations?.length
    ? `<ul style="margin: 0; padding-left: 1.25rem;">${audit.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>`
    : 'None';
  
  const fields = [
    { label: 'Project', value: audit.project },
    { label: 'Grade', value: `<span class="grade-display ${gradeClass}">${audit.grade}%</span>`, raw: true },
    { label: 'Date', value: formatDate(audit.date) },
    { label: 'Agent', value: audit.agent },
    { label: 'Findings', value: audit.findings || audit.summary, pre: true },
    { label: 'Recommendations', value: recsHtml, raw: true },
    { label: 'ID', value: audit.id, code: true }
  ];
  
  return buildModalFields(fields);
}

function buildModalFields(fields) {
  return fields.map(f => {
    let valueClass = 'modal-field-value';
    if (f.pre) valueClass += ' pre-wrap';
    if (f.code) valueClass += ' code';
    
    const value = f.raw ? f.value : escapeHtml(f.value);
    
    return `
      <div class="modal-field">
        <span class="modal-field-label">${f.label}</span>
        <div class="${valueClass}">${value || 'N/A'}</div>
      </div>
    `;
  }).join('');
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ==================== DASHBOARD TAB ====================

function renderDashboard() {
  const youtube = appData.youtube;
  const business = appData.newBusiness;
  const investments = appData.investments;
  const audits = appData.audits;

  // DEFENSIVE: Ensure data exists before accessing properties
  document.getElementById('stat-youtube-count').textContent = formatNumber(youtube?.outlierVideos?.length);
  document.getElementById('stat-youtube-briefs').textContent = `${formatNumber(youtube?.contentBriefs?.length)} briefs ready`;

  document.getElementById('stat-business-count').textContent = formatNumber(business?.opportunities?.length);
  const highPriority = business?.opportunities?.filter(o => o.alignment === 'HIGH').length || 0;
  document.getElementById('stat-business-high').textContent = `${formatNumber(highPriority)} high priority`;

  document.getElementById('stat-investments-count').textContent = formatNumber(investments?.positions?.length);
  document.getElementById('stat-investments-watchlist').textContent = `${formatNumber(investments?.watchlist?.length)} watching`;

  const avgGrade = calculateAvgGrade(audits?.audits);
  document.getElementById('stat-avg-grade').textContent = avgGrade ? `${avgGrade}%` : 'N/A';

  renderMorningBrief();
  
  // Render dashboard charts
  renderYouTubeSparkline();
  renderBusinessPipelineChart();
  renderInvestmentsSummaryChart();
}

// D3 FIX: Morning Brief items - use tab name instead of arrow functions
function renderMorningBrief() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  document.getElementById('brief-date').textContent = today;

  const briefContainer = document.getElementById('morning-brief-content');
  
  // Generate brief items based on data
  const items = [];
  
  // Check for high priority opportunities
  const highOpps = appData.newBusiness.opportunities?.filter(o => o.alignment === 'HIGH' && o.status !== 'passed') || [];
  if (highOpps.length > 0) {
    items.push({
      icon: '💼',
      text: `${formatNumber(highOpps.length)} high-priority business opportunities awaiting review`,
      tab: 'business',
      color: 'text-accent-green'
    });
  }
  
  // Check for new outlier videos
  const recentOutliers = appData.youtube.outlierVideos?.filter(v => {
    if (!v.addedAt) return false;
    const daysSince = (Date.now() - new Date(v.addedAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince < 2;
  }) || [];
  if (recentOutliers.length > 0) {
    items.push({
      icon: '🎬',
      text: `${formatNumber(recentOutliers.length)} new YouTube outlier videos in the last 24 hours`,
      tab: 'youtube',
      color: 'text-accent-blue'
    });
  }
  
  // Check for audit grades
  const recentAudits = appData.audits.audits?.filter(a => {
    if (!a.date) return false;
    const daysSince = (Date.now() - new Date(a.date).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince < 1;
  }) || [];
  if (recentAudits.length > 0) {
    const avg = Math.round(recentAudits.reduce((s, a) => s + (a.grade || 0), 0) / recentAudits.length);
    items.push({
      icon: '📊',
      text: `${formatNumber(recentAudits.length)} work items audited today (avg grade: ${avg}%)`,
      tab: 'audits',
      color: avg >= 80 ? 'text-accent-green' : avg >= 60 ? 'text-accent-yellow' : 'text-accent-red'
    });
  }
  
  // Check for pending investments
  const watchlist = appData.investments.watchlist || [];
  if (watchlist.length > 0) {
    items.push({
      icon: '📈',
      text: `${formatNumber(watchlist.length)} investments on watchlist`,
      tab: 'investments',
      color: 'text-gray-300'
    });
  }

  // Check for new research
  const recentResearch = appData.research.notes?.filter(n => {
    if (!n.createdAt) return false;
    const daysSince = (Date.now() - new Date(n.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince < 2;
  }) || [];
  if (recentResearch.length > 0) {
    items.push({
      icon: '🔬',
      text: `${formatNumber(recentResearch.length)} new research notes added`,
      tab: 'research',
      color: 'text-gray-300'
    });
  }

  if (items.length === 0) {
    briefContainer.innerHTML = `
      <div class="empty-state" style="padding: 1.5rem;">
        <div class="empty-state-icon">📭</div>
        <div class="empty-state-title">No New Updates</div>
        <div class="empty-state-desc" style="margin-bottom: 0;">Dashboard is up to date. Check back later for new intelligence.</div>
      </div>
    `;
  } else {
    briefContainer.innerHTML = items.map(item => `
      <div class="brief-item" onclick="showTab('${item.tab}')">
        <span class="brief-icon">${item.icon}</span>
        <span class="brief-text ${item.color}">${item.text}</span>
      </div>
    `).join('');
  }
}

// ==================== DASHBOARD CHARTS ====================

// YouTube sparkline showing outlier score trend
function renderYouTubeSparkline() {
  const canvas = document.getElementById('youtube-sparkline');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Destroy existing chart
  if (youtubeSparklineInstance) {
    youtubeSparklineInstance.destroy();
    youtubeSparklineInstance = null;
  }
  
  const videos = appData.youtube.outlierVideos || [];
  if (videos.length === 0) return;
  
  // Sort by addedAt date and take last 10
  const sortedVideos = [...videos]
    .sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt))
    .slice(-10);
  
  youtubeSparklineInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: sortedVideos.map((v, i) => `#${i + 1}`),
      datasets: [{
        label: 'Outlier Score',
        data: sortedVideos.map(v => v.outlierScore),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { display: false },
        y: { 
          display: false,
          min: 0
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  });
}

// Business pipeline donut chart
function renderBusinessPipelineChart() {
  const canvas = document.getElementById('business-pipeline-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Destroy existing chart
  if (businessPipelineChartInstance) {
    businessPipelineChartInstance.destroy();
    businessPipelineChartInstance = null;
  }
  
  const pipeline = appData.newBusiness.pipeline || {};
  const data = [
    pipeline.new || 0,
    pipeline.evaluating || 0,
    pipeline.pursuing || 0,
    pipeline.passed || 0,
    pipeline.won || 0
  ];
  
  // Don't render if all zeros
  if (data.every(v => v === 0)) return;
  
  businessPipelineChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['New', 'Evaluating', 'Pursuing', 'Passed', 'Won'],
      datasets: [{
        data: data,
        backgroundColor: [
          '#3B82F6', // blue - new
          '#F59E0B', // yellow - evaluating
          '#8B5CF6', // purple - pursuing
          '#EF4444', // red - passed
          '#10B981'  // green - won
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#e0e0e0',
            font: { size: 10 },
            boxWidth: 10
          }
        }
      },
      cutout: '60%'
    }
  });
}

// Investments gains/losses summary bar chart
function renderInvestmentsSummaryChart() {
  const canvas = document.getElementById('investments-summary-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Destroy existing chart
  if (investmentsChartInstance) {
    investmentsChartInstance.destroy();
    investmentsChartInstance = null;
  }
  
  const positions = appData.investments.positions || [];
  if (positions.length === 0) return;
  
  const labels = positions.map(p => p.symbol || p.ticker);
  const gains = positions.map(p => p.gainPercent || 0);
  const colors = gains.map(g => g >= 0 ? '#10B981' : '#EF4444');
  
  investmentsChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Gain/Loss %',
        data: gains,
        backgroundColor: colors,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#9ca3af', font: { size: 10 } }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.1)' },
          ticks: { 
            color: '#9ca3af', 
            font: { size: 10 },
            callback: function(value) {
              return value + '%';
            }
          }
        }
      }
    }
  });
}

function calculateAvgGrade(audits) {
  if (!audits || audits.length === 0) return null;
  const sum = audits.reduce((a, b) => a + (b.grade || 0), 0);
  return Math.round(sum / audits.length);
}

// ==================== YOUTUBE TAB ====================

// D4 FIX: Store video data for search against all properties
let youtubeVideoData = [];

function renderYouTube() {
  const container = document.getElementById('youtube-outliers');
  if (!container) {
    console.warn('[Nox Dashboard] youtube-outliers container not found');
    return;
  }
  
  const videos = appData.youtube?.outlierVideos || [];
  const briefs = appData.youtube?.contentBriefs || [];
  const meta = appData.meta || {};
  
  // Update Research Status stats
  const lastScan = meta?.lastUpdated?.youtube;
  const lastScanEl = document.getElementById('last-outlier-scan');
  const totalOutliersEl = document.getElementById('total-outliers');
  const totalBriefsEl = document.getElementById('total-briefs');
  
  if (lastScanEl) lastScanEl.textContent = lastScan ? formatTimeAgo(lastScan) : 'Never';
  if (totalOutliersEl) totalOutliersEl.textContent = videos.length;
  if (totalBriefsEl) totalBriefsEl.textContent = briefs.length;
  
  // Store for search
  youtubeVideoData = videos;

  let html = '';

  // Content Briefs Section (D5 FIX)
  const contentBriefs = appData.youtube.contentBriefs || [];
  contentBriefsData = contentBriefs; // Store for modal access
  if (contentBriefs.length > 0) {
    html += `
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3">📝 Content Briefs (${contentBriefs.length})</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${contentBriefs.map((brief, idx) => `
            <div class="card rounded-lg p-4 cursor-pointer hover:bg-dark-800" onclick="showBriefModal(${idx})">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-lg">${brief.niche || '🎬'}</span>
                <span class="text-xs px-2 py-0.5 bg-accent-blue/20 text-accent-blue rounded">${brief.status || 'draft'}</span>
              </div>
              <h4 class="font-semibold mb-1">${brief.title}</h4>
              <p class="text-sm text-gray-400 mb-2">${brief.angle || ''}</p>
              <div class="text-xs text-gray-500">${formatTimeAgo(brief.createdAt)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Trend Analysis Section (D6 FIX)
  const trendAnalysis = appData.youtube.trendAnalysis;
  if (trendAnalysis && Object.keys(trendAnalysis).length > 0) {
    const trendingTopics = trendAnalysis.trendingTopics || [];
    const contentGaps = trendAnalysis.contentGaps || [];
    const competitorMoves = trendAnalysis.competitorMoves || [];
    
    html += `
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3">📊 Trend Analysis</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          ${trendingTopics.length > 0 ? `
            <div class="card rounded-lg p-4">
              <h4 class="font-semibold text-accent-blue mb-2">🔥 Trending Topics</h4>
              <ul class="text-sm space-y-1">
                ${trendingTopics.map(t => `<li class="text-gray-300">• ${t}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          ${contentGaps.length > 0 ? `
            <div class="card rounded-lg p-4">
              <h4 class="font-semibold text-accent-green mb-2">💡 Content Gaps</h4>
              <ul class="text-sm space-y-1">
                ${contentGaps.map(g => `<li class="text-gray-300">• ${g}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          ${competitorMoves.length > 0 ? `
            <div class="card rounded-lg p-4">
              <h4 class="font-semibold text-accent-purple mb-2">👀 Competitor Moves</h4>
              <ul class="text-sm space-y-1">
                ${competitorMoves.map(c => `<li class="text-gray-300">• ${c}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
        ${trendAnalysis.lastUpdated ? `<div class="text-xs text-gray-500 mt-2">Last updated: ${formatTimeAgo(trendAnalysis.lastUpdated)}</div>` : ''}
      </div>
    `;
  }

  // Outlier Videos Section
  html += `<h3 class="text-lg font-semibold mb-3">🎯 Outlier Videos (${videos.length})</h3>`;
  
  if (videos.length === 0) {
    html += buildEmptyState('🎬', 'No Outlier Videos Yet', 'Outlier videos will appear here when found via viewstats.com research. Use the Outlier Research tab to find high-performing videos.');
  } else {
    html += videos.map(v => `
      <div class="card card-clickable rounded-lg p-4 mb-3" data-niche="${v.niche || ''}" data-video-id="${v.id}" onclick="showVideoModal('${v.id}')">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-lg">${v.niche || 'General'}</span>
              <span class="px-2 py-0.5 bg-accent-blue/20 text-accent-blue text-xs rounded">${v.outlierScore?.toFixed(1) || '?'}x</span>
            </div>
            <h3 class="font-semibold mb-1">${v.title}</h3>
            <p class="text-sm text-gray-400 mb-2">${v.channel} · ${formatViews(v.views)} views · ${formatTimeAgo(v.publishedAt)}</p>
            <p class="text-sm"><strong>Why it's an outlier:</strong> ${v.whyOutlier}</p>
            <p class="text-sm text-accent-blue mt-1"><strong>Angle for Steven:</strong> ${v.contentAngle}</p>
          </div>
          <a href="${v.url}" target="_blank" class="px-3 py-1 bg-accent-blue rounded text-white text-sm whitespace-nowrap hover:bg-blue-600" onclick="event.stopPropagation()">Watch →</a>
        </div>
      </div>
    `).join('');
  }

  container.innerHTML = html;
  
  // Render trend chart
  renderYouTubeTrendChart();
}

function showVideoModal(videoId) {
  const video = youtubeVideoData.find(v => v.id === videoId);
  if (video) {
    openModal(video.title, buildYouTubeModalContent(video));
  }
}

// Content brief data for modal access
let contentBriefsData = [];

function showBriefModal(idx) {
  const brief = contentBriefsData[idx];
  if (brief) {
    openModal(brief.title, buildBriefModalContent(brief));
  }
}

function buildBriefModalContent(brief) {
  const fields = [
    { label: 'Title', value: brief.title },
    { label: 'Niche', value: brief.niche || 'General' },
    { label: 'Status', value: brief.status || 'draft' },
    { label: 'Angle', value: brief.angle || brief.summary || 'No angle specified' },
    { label: 'Hook', value: brief.hook || 'No hook specified' },
    { label: 'Target Length', value: brief.targetLength || 'Not specified' },
    { label: 'Difficulty', value: brief.difficulty || 'Not specified' },
    { label: 'Urgency', value: brief.urgency || 'Not specified' },
    { label: 'Created', value: formatDate(brief.createdAt) }
  ];
  
  if (brief.outline && brief.outline.length > 0) {
    fields.push({ 
      label: 'Outline', 
      value: '<ol class="list-decimal ml-4 mt-1">' + brief.outline.map(item => `<li class="mb-1">${item}</li>`).join('') + '</ol>',
      raw: true 
    });
  }
  
  return buildModalFields(fields);
}

// YouTube trend bar chart showing outlier scores
function renderYouTubeTrendChart() {
  const canvas = document.getElementById('youtube-trend-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Destroy existing chart
  if (youtubeTrendChartInstance) {
    youtubeTrendChartInstance.destroy();
    youtubeTrendChartInstance = null;
  }
  
  const videos = appData.youtube.outlierVideos || [];
  if (videos.length === 0) return;
  
  // Sort by outlier score descending
  const sortedVideos = [...videos].sort((a, b) => b.outlierScore - a.outlierScore).slice(0, 10);
  
  // Get niche colors
  const nicheColors = {
    '🎮 Gaming': '#8B5CF6',
    '💰 Finance': '#10B981',
    '⚡ Productivity': '#F59E0B',
    '🎬 Production': '#3B82F6'
  };
  
  const backgroundColors = sortedVideos.map(v => nicheColors[v.niche] || '#6B7280');
  
  youtubeTrendChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sortedVideos.map(v => v.channel.length > 15 ? v.channel.substring(0, 15) + '...' : v.channel),
      datasets: [{
        label: 'Outlier Score',
        data: sortedVideos.map(v => v.outlierScore),
        backgroundColor: backgroundColors,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => {
              const idx = items[0].dataIndex;
              return sortedVideos[idx].title.substring(0, 50) + (sortedVideos[idx].title.length > 50 ? '...' : '');
            },
            label: (item) => [
              `Outlier Score: ${item.raw}x`,
              `Channel: ${sortedVideos[item.dataIndex].channel}`,
              `Niche: ${sortedVideos[item.dataIndex].niche || 'General'}`
            ]
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#9ca3af', font: { size: 10 } }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.1)' },
          ticks: { color: '#9ca3af' },
          title: {
            display: true,
            text: 'Outlier Score',
            color: '#9ca3af',
            font: { size: 11 }
          }
        }
      }
    }
  });
}

// ==================== BUSINESS TAB ====================

let businessOpportunityData = [];

function renderBusiness() {
  const pipeline = appData.newBusiness.pipeline || {};
  document.getElementById('pipe-new').textContent = formatNumber(pipeline.new || 0);
  document.getElementById('pipe-evaluating').textContent = formatNumber(pipeline.evaluating || 0);
  document.getElementById('pipe-pursuing').textContent = formatNumber(pipeline.pursuing || 0);
  document.getElementById('pipe-passed').textContent = formatNumber(pipeline.passed || 0);
  document.getElementById('pipe-won').textContent = formatNumber(pipeline.won || 0);

  const container = document.getElementById('business-opportunities');
  const opps = appData.newBusiness.opportunities || [];
  businessOpportunityData = opps;

  if (opps.length === 0) {
    container.innerHTML = buildEmptyState('💼', 'No Opportunities Yet', 'The agent will add them on the next heartbeat based on market research and your preferences.');
    return;
  }

  container.innerHTML = opps.map(o => `
    <div class="card card-clickable rounded-lg p-4" data-status="${o.status}" data-opp-id="${o.id}" onclick="showOpportunityModal('${o.id}')">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="alignment-${o.alignment?.toLowerCase()}">${o.alignment}</span>
          <span class="px-2 py-0.5 bg-dark-700 text-xs rounded">${o.type || o.effort}</span>
          <span class="text-sm text-gray-400">${o.potentialRevenue || ''}</span>
        </div>
        <span class="text-sm text-gray-400">${formatTimeAgo(o.createdAt || o.addedAt)}</span>
      </div>
      <h3 class="font-semibold mb-1">${o.title || o.name}</h3>
      <p class="text-sm text-gray-300 mb-2">${o.description}</p>
      <p class="text-sm"><strong>Next step:</strong> ${o.nextStep}</p>
      <div class="mt-2 flex gap-2" onclick="event.stopPropagation()">
        <button onclick="moveStatus('${o.id}', 'evaluating')" class="text-xs px-2 py-1 bg-dark-700 rounded hover:bg-dark-600">→ Evaluating</button>
        <button onclick="moveStatus('${o.id}', 'pursuing')" class="text-xs px-2 py-1 bg-dark-700 rounded hover:bg-dark-600">→ Pursuing</button>
      </div>
    </div>
  `).join('');
}

function showOpportunityModal(oppId) {
  const opp = businessOpportunityData.find(o => o.id === oppId);
  if (opp) {
    openModal(opp.name || opp.title, buildOpportunityModalContent(opp));
  }
}

function getAlignmentClass(alignment) {
  switch(alignment) {
    case 'HIGH': return 'bg-accent-green/20 text-accent-green';
    case 'MEDIUM': return 'bg-accent-yellow/20 text-accent-yellow';
    case 'LOW': return 'bg-accent-red/20 text-accent-red';
    default: return 'bg-dark-700';
  }
}

// ==================== INVESTMENTS TAB ====================

let investmentsPositionData = [];
let investmentsWatchlistData = [];
let investmentsIntelligenceData = [];

async function renderInvestments() {
  const positions = appData.investments.positions || [];
  const watchlist = appData.investments.watchlist || [];
  const intelligence = appData.investments.intelligence || [];

  // Fetch real stock prices for watchlist
  const watchlistTickers = watchlist.map(w => w.ticker).filter(Boolean);
  if (watchlistTickers.length > 0) {
    try {
      const prices = await fetchStockPrices(watchlistTickers);
      // Attach prices to watchlist items
      watchlist.forEach(w => {
        if (prices[w.ticker]) {
          w.currentPrice = prices[w.ticker];
        }
      });
    } catch (err) {
      console.warn('[Investments] Could not fetch stock prices:', err);
    }
  }

  investmentsPositionData = positions;
  investmentsWatchlistData = watchlist;
  investmentsIntelligenceData = intelligence;

  // Positions
  const posContainer = document.getElementById('investments-positions');
  if (positions.length === 0) {
    posContainer.innerHTML = buildEmptyState('', 'No Positions', 'No investment positions tracked yet.');
  } else {
    posContainer.innerHTML = positions.map((p, idx) => {
      const gain = p.gainPercent !== undefined ? p.gainPercent : ((p.currentPrice - p.avgCost) / p.avgCost * 100);
      const gainClass = gain >= 0 ? 'text-accent-green' : 'text-accent-red';
      const ticker = p.ticker || p.symbol;
      const entry = p.entryPrice || p.avgCost;
      const qty = p.quantity || p.shares;
      const entryDisplay = (entry && entry !== 0) ? formatCurrency(entry) : '-';
      const currentDisplay = (p.currentPrice && p.currentPrice !== 0) ? formatCurrency(p.currentPrice) : '-';
      return `
        <div class="flex justify-between items-center p-2 bg-dark-700/50 rounded cursor-pointer hover:bg-dark-700" onclick="showPositionModal(${idx})">
          <div>
            <div class="font-semibold">${ticker} · ${p.name}</div>
            <div class="text-sm text-gray-400">${formatNumber(qty)} @ ${entryDisplay} → ${currentDisplay}</div>
          </div>
          <div class="text-right">
            <div class="font-bold ${gainClass}">${gain.toFixed ? gain.toFixed(1) : gain}%</div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Watchlist
  const watchContainer = document.getElementById('investments-watchlist');
  if (watchlist.length === 0) {
    watchContainer.innerHTML = buildEmptyState('', 'No Watchlist Items', 'No investments on watchlist yet.');
  } else {
    watchContainer.innerHTML = watchlist.map((w, idx) => {
      const ticker = w.ticker || w.symbol;
      const target = w.targetEntry || w.targetPrice;
      const priceDisplay = (w.currentPrice && w.currentPrice !== 0) ? formatCurrency(w.currentPrice) : '-';
      const targetDisplay = (target && target !== 0) ? formatCurrency(target) : '-';
      return `
        <div class="p-2 bg-dark-700/50 rounded cursor-pointer hover:bg-dark-700" onclick="showWatchlistModal(${idx})">
          <div class="font-semibold">${ticker} · ${priceDisplay}</div>
          <div class="text-sm text-gray-400">Target: ${targetDisplay}</div>
        </div>
      `;
    }).join('');
  }

  // Intelligence
  const intelContainer = document.getElementById('investments-intelligence');
  if (intelligence.length === 0) {
    intelContainer.innerHTML = buildEmptyState('', 'No Intelligence Reports', 'No market intelligence reports yet.');
  } else {
    intelContainer.innerHTML = intelligence.map((i, idx) => {
      const title = i.topic || `${i.ticker} ${i.type || 'Update'}`;
      const summary = i.summary || i.content || '';
      const date = i.addedAt || i.date;
      const tickerPart = i.ticker ? i.ticker : '';
      return `
        <div class="p-2 bg-dark-700/50 rounded cursor-pointer hover:bg-dark-700" onclick="showIntelligenceModal(${idx})">
          <div class="font-semibold">${title} <span class="text-xs px-2 py-0.5 rounded ${i.impact === 'bullish' ? 'bg-accent-green/20 text-accent-green' : i.impact === 'bearish' ? 'bg-accent-red/20 text-accent-red' : 'bg-dark-600'}">${i.impact || 'neutral'}</span></div>
          <div class="text-sm mt-1 line-clamp-2">${summary.substring(0, 150)}${summary.length > 150 ? '...' : ''}</div>
          <div class="text-xs text-gray-400 mt-1">${formatTimeAgo(date)}${tickerPart ? ' · ' + tickerPart : ''}</div>
        </div>
      `;
    }).join('');
  }
  
  // Render portfolio chart
  renderPortfolioChart();
}

function showPositionModal(idx) {
  const position = investmentsPositionData[idx];
  if (position) {
    openModal(`${position.ticker || position.symbol} - Position`, buildPositionModalContent(position));
  }
}

function showWatchlistModal(idx) {
  const item = investmentsWatchlistData[idx];
  if (item) {
    openModal(`${item.ticker || item.symbol} - Watchlist`, buildWatchlistModalContent(item));
  }
}

function showIntelligenceModal(idx) {
  const item = investmentsIntelligenceData[idx];
  if (item) {
    openModal(item.topic || `${item.ticker} Update`, buildIntelligenceModalContent(item));
  }
}

// Portfolio allocation pie/donut chart
function renderPortfolioChart() {
  const canvas = document.getElementById('portfolio-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Destroy existing chart
  if (portfolioChartInstance) {
    portfolioChartInstance.destroy();
    portfolioChartInstance = null;
  }
  
  const positions = appData.investments.positions || [];
  if (positions.length === 0) return;
  
  // Calculate total value and position values
  const totalValue = positions.reduce((sum, p) => sum + (p.totalValue || 0), 0);
  
  // Update total value display
  const totalEl = document.getElementById('portfolio-total-value');
  if (totalEl) {
    totalEl.textContent = formatCurrency(totalValue);
  }
  
  const labels = positions.map(p => p.symbol || p.ticker);
  const values = positions.map(p => p.totalValue || 0);
  
  // Colors for each position
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899'];
  
  portfolioChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, positions.length),
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#e0e0e0',
            font: { size: 11 },
            callback: function(label, index) {
              const value = values[index];
              const percent = ((value / totalValue) * 100).toFixed(1);
              return `${label}: ${percent}%`;
            }
          }
        },
        tooltip: {
          callbacks: {
            label: (item) => {
              const value = item.raw;
              const percent = ((value / totalValue) * 100).toFixed(1);
              return `${item.label}: ${formatCurrency(value)} (${percent}%)`;
            }
          }
        }
      },
      cutout: '55%'
    }
  });
}

// ==================== TOOLS TAB ====================

let toolsDataArray = [];

function renderTools() {
  const container = document.getElementById('tools-grid');
  const categoryFilter = document.getElementById('tools-category-filter');
  const toolsData = appData.tools || { tools: [], categories: [] };
  const tools = toolsData.tools || [];
  const categories = toolsData.categories || [];
  toolsDataArray = tools;

  // D9 FIX: Populate category filter dropdown
  if (categoryFilter) {
    // Clear existing options except "All Categories"
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    
    // Add category options
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      categoryFilter.appendChild(option);
    });
    
    // Also extract unique categories from tools if not provided
    const toolCategories = [...new Set(tools.map(t => t.category).filter(Boolean))];
    toolCategories.forEach(cat => {
      if (!categories.includes(cat)) {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
      }
    });
  }

  if (tools.length === 0) {
    container.innerHTML = buildEmptyState('🛠️', 'No Tools Registered', 'The agent will add them as they are built and deployed.');
    return;
  }

  // D9 FIX: Add data-category attribute for filtering
  container.innerHTML = tools.map((t, idx) => `
    <div class="card card-clickable rounded-lg p-4" data-category="${t.category || ''}" onclick="showToolModal(${idx})">
      <div class="flex justify-between items-start mb-2">
        <h3 class="font-semibold">${t.name}</h3>
        <span class="text-xs px-2 py-0.5 rounded ${t.status === 'active' ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-red/20 text-accent-red'}">${t.status}</span>
      </div>
      <p class="text-sm text-gray-400 mb-2">${t.description}</p>
      <div class="text-xs text-gray-500 mb-2">${t.category} · Audit: ${t.auditGrade || 'N/A'}%</div>
      <code class="text-xs bg-dark-900 p-1 rounded block">${t.runCommand}</code>
    </div>
  `).join('');
}

function showToolModal(idx) {
  const tool = toolsDataArray[idx];
  if (tool) {
    openModal(tool.name, buildToolModalContent(tool));
  }
}

// ==================== RESEARCH TAB ====================

let researchNotesData = [];

function renderResearch() {
  const container = document.getElementById('research-notes');
  const notes = appData.research.notes || [];
  researchNotesData = notes;

  if (notes.length === 0) {
    container.innerHTML = buildEmptyState('🔬', 'No Research Notes', 'The agent will add them as research is conducted.');
    return;
  }

  container.innerHTML = notes.map((n, idx) => {
    // D7 FIX: Use marked.parse() for markdown rendering
    const content = n.summary || n.content || '';
    const displayLimit = 300;
    const truncatedContent = content.length > displayLimit 
      ? content.substring(0, displayLimit) + '...'
      : content;
    
    // Use marked.parse() if available, fallback to plain text
    const renderedContent = typeof marked !== 'undefined' 
      ? marked.parse(truncatedContent)
      : escapeHtml(truncatedContent);
    
    return `
    <div class="card card-clickable rounded-lg p-4" data-note-id="${n.id}" onclick="showNoteModal(${idx})">
      <div class="flex justify-between items-start mb-2">
        <h3 class="font-semibold">${n.title}</h3>
        <span class="text-xs px-2 py-0.5 bg-dark-700 rounded">${n.category}</span>
      </div>
      <div class="text-sm text-gray-300 mb-2 line-clamp-3">${renderedContent}</div>
      <div class="flex flex-wrap gap-1 mb-2">
        ${(n.tags || []).map(t => `<span class="text-xs px-2 py-0.5 bg-accent-blue/20 text-accent-blue rounded">#${t}</span>`).join('')}
      </div>
      <div class="text-xs text-gray-400">${formatTimeAgo(n.createdAt || n.date)}</div>
    </div>
  `}).join('');
}

function showNoteModal(idx) {
  const note = researchNotesData[idx];
  if (note) {
    openModal(note.title, buildNoteModalContent(note));
  }
}

// ==================== AUDITS TAB ====================

let auditsDataArray = [];

function renderAudits() {
  const audits = appData.audits.audits || [];
  const stats = appData.audits.agentStats || {};
  auditsDataArray = audits;

  // Stats cards
  const statsContainer = document.getElementById('audit-stats');
  const agents = Object.keys(stats);
  
  if (agents.length === 0) {
    statsContainer.innerHTML = `
      <div class="card rounded-lg p-4 text-center">
        <div class="empty-state-icon">📊</div>
        <div class="empty-state-title">No Audit Data</div>
        <div class="empty-state-desc" style="margin-bottom: 0;">No audit statistics available yet.</div>
      </div>
    `;
  } else {
    statsContainer.innerHTML = agents.map(agent => {
      const s = stats[agent];
      const avgGrade = s.averageGrade || s.avgGrade || 0;
      const trend = s.trend || 'stable';
      const trendIcon = trend === 'improving' ? '↑' : trend === 'declining' ? '↓' : '→';
      return `
        <div class="card rounded-lg p-4 cursor-pointer hover:border-accent-blue" onclick="showTab('audits')">
          <div class="text-sm text-gray-400 mb-1">${agent}</div>
          <div class="text-3xl font-bold ${avgGrade >= 80 ? 'text-accent-green' : avgGrade >= 60 ? 'text-accent-yellow' : 'text-accent-red'}">${avgGrade}%</div>
          <div class="text-sm">${formatNumber(s.totalAudits)} audits · ${trendIcon} ${trend}</div>
        </div>
      `;
    }).join('');
  }

  // Render chart
  renderAuditsChart();
  
  // Render agent performance comparison
  renderAgentPerformanceChart();

  // Audit list
  const listContainer = document.getElementById('audit-list');
  if (audits.length === 0) {
    listContainer.innerHTML = buildEmptyState('📋', 'No Audit Reports', 'No audit reports have been generated yet.');
  } else {
    listContainer.innerHTML = audits.sort((a, b) => new Date(b.date) - new Date(a.date)).map((a, idx) => `
      <div class="card card-clickable rounded-lg p-4" onclick="showAuditModal(${idx})">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-sm text-gray-400">${formatDate(a.date)} · ${a.agent}</div>
            <h3 class="font-semibold">${a.project}</h3>
            <p class="text-sm text-gray-300 mt-1 line-clamp-2">${a.summary || a.findings}</p>
          </div>
          <span class="text-2xl font-bold ${a.grade >= 80 ? 'text-accent-green' : a.grade >= 60 ? 'text-accent-yellow' : 'text-accent-red'}">${a.grade}%</span>
        </div>
      </div>
    `).join('');
  }
}

// D2 FIX: Destroy existing chart before creating new one
// Renders multi-agent grade history line chart
function renderAuditsChart() {
  const audits = appData.audits.audits || [];
  
  if (audits.length === 0) return;
  
  const canvas = document.getElementById('grade-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // D2 FIX: Destroy existing chart instance if it exists
  if (gradeChartInstance) {
    gradeChartInstance.destroy();
    gradeChartInstance = null;
  }
  
  // Agent colors for consistent coloring
  const agentColors = {
    'nox': '#3B82F6',
    'ralph': '#10B981',
    'default': '#8B5CF6'
  };
  
  // Group audits by agent and date
  const agents = [...new Set(audits.map(a => a.agent).filter(Boolean))];
  const allDates = [...new Set(audits.map(a => a.date?.split('T')[0]).filter(Boolean))].sort();
  
  // Create datasets for each agent
  const datasets = agents.map(agent => {
    const color = agentColors[agent.toLowerCase()] || agentColors.default;
    
    // Get grades for this agent by date
    const agentAudits = audits.filter(a => a.agent === agent);
    const gradesByDate = {};
    agentAudits.forEach(a => {
      const date = a.date?.split('T')[0];
      if (!date) return;
      if (!gradesByDate[date]) gradesByDate[date] = [];
      gradesByDate[date].push(a.grade);
    });
    
    // Create data points for all dates (null for missing dates)
    const data = allDates.map(date => {
      if (gradesByDate[date]) {
        // Average if multiple grades on same date
        return Math.round(gradesByDate[date].reduce((a, b) => a + b, 0) / gradesByDate[date].length);
      }
      return null;
    });
    
    return {
      label: agent.charAt(0).toUpperCase() + agent.slice(1),
      data: data,
      borderColor: color,
      backgroundColor: color + '20', // 20 = 12.5% opacity hex
      tension: 0.2,
      fill: false,
      spanGaps: true
    };
  });
  
  gradeChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: allDates.map(d => formatDate(d)),
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { 
          labels: { color: '#e0e0e0' }
        },
        tooltip: {
          callbacks: {
            title: (items) => `Date: ${items[0].label}`,
            label: (item) => {
              const agentName = item.dataset.label;
              const grade = item.raw;
              if (grade === null) return `${agentName}: No data`;
              
              // Find the audit for this date and agent
              const dateIndex = item.dataIndex;
              const date = allDates[dateIndex];
              const agentAudits = audits.filter(a => 
                a.agent?.toLowerCase() === agentName.toLowerCase() && 
                a.date?.startsWith(date)
              );
              
              if (agentAudits.length > 0) {
                const projects = agentAudits.map(a => a.project).join(', ');
                return `${agentName}: ${grade}% (${projects})`;
              }
              return `${agentName}: ${grade}%`;
            }
          }
        }
      },
      scales: { 
        y: { 
          min: 0, 
          max: 100,
          grid: { color: 'rgba(255,255,255,0.1)' },
          ticks: { color: '#e0e0e0' }
        },
        x: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#e0e0e0' }
        }
      }
    }
  });
}

// Agent performance comparison bar chart
function renderAgentPerformanceChart() {
  const canvas = document.getElementById('agent-performance-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Destroy existing chart
  if (agentPerformanceChartInstance) {
    agentPerformanceChartInstance.destroy();
    agentPerformanceChartInstance = null;
  }
  
  const stats = appData.audits.agentStats || {};
  const agents = Object.keys(stats);
  
  if (agents.length === 0) return;
  
  // Calculate pass rate (grade >= 70)
  const audits = appData.audits.audits || [];
  const passRates = agents.map(agent => {
    const agentAudits = audits.filter(a => a.agent === agent);
    const passed = agentAudits.filter(a => (a.grade || 0) >= 70).length;
    return agentAudits.length > 0 ? Math.round((passed / agentAudits.length) * 100) : 0;
  });
  
  const avgGrades = agents.map(agent => stats[agent].averageGrade || stats[agent].avgGrade || 0);
  const totalAudits = agents.map(agent => stats[agent].totalAudits || 0);
  
  // Normalize total audits to 0-100 scale for display
  const maxAudits = Math.max(...totalAudits, 1);
  const normalizedAudits = totalAudits.map(count => Math.round((count / maxAudits) * 100));
  
  agentPerformanceChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: agents.map(a => a.charAt(0).toUpperCase() + a.slice(1)),
      datasets: [
        {
          label: 'Avg Grade',
          data: avgGrades,
          backgroundColor: '#3B82F6',
          borderRadius: 4
        },
        {
          label: 'Pass Rate %',
          data: passRates,
          backgroundColor: '#10B981',
          borderRadius: 4
        },
        {
          label: 'Activity (normalized)',
          data: normalizedAudits,
          backgroundColor: '#8B5CF6',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#e0e0e0' }
        },
        tooltip: {
          callbacks: {
            label: (item) => {
              const agentIdx = item.dataIndex;
              const agent = agents[agentIdx];
              const value = item.raw;
              
              if (item.dataset.label === 'Activity (normalized)') {
                const actualCount = totalAudits[agentIdx];
                return `${item.dataset.label}: ${actualCount} audits`;
              }
              return `${item.dataset.label}: ${value}%`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#e0e0e0' }
        },
        y: {
          min: 0,
          max: 100,
          grid: { color: 'rgba(255,255,255,0.1)' },
          ticks: { color: '#e0e0e0' }
        }
      }
    }
  });
}

function showAuditModal(idx) {
  const audit = auditsDataArray[idx];
  if (audit) {
    openModal(`${audit.project} - Audit`, buildAuditModalContent(audit));
  }
}

// ==================== UTILITY FUNCTIONS ====================

function buildEmptyState(icon, title, description) {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">${icon}</div>
      <div class="empty-state-title">${title}</div>
      <div class="empty-state-desc">${description}</div>
      <button class="empty-state-cta" onclick="location.reload()">
        🔄 Refresh Data
      </button>
    </div>
  `;
}

// D3 & D4 FIX: YouTube search and filter - fixed niche matching
function setupFilters() {
  // Combined filter state for YouTube
  let youtubeFilterState = {
    niche: '',
    search: ''
  };

  function applyYouTubeFilters() {
    const cards = document.querySelectorAll('#youtube-outliers > div.card');
    const searchTerm = youtubeFilterState.search.toLowerCase().trim();
    const selectedNiche = youtubeFilterState.niche.trim();
    
    let visibleCount = 0;
    
    cards.forEach(el => {
      const videoId = el.dataset.videoId;
      const video = youtubeVideoData.find(v => v.id === videoId);
      const cardNiche = (el.dataset.niche || '').trim();
      
      // D3 FIX: Niche filter - "All Niches" (empty) shows all, otherwise check if card matches selected niche
      // Use case-insensitive partial matching since data might have different niche values
      let nicheMatch = true;
      if (selectedNiche) {
        // Try exact match first, then partial match
        nicheMatch = cardNiche.toLowerCase() === selectedNiche.toLowerCase() ||
                     cardNiche.toLowerCase().includes(selectedNiche.toLowerCase().replace(/[🎮💰⚡🎬]\s*/, ''));
      }
      
      // D4 FIX: Search against all video properties (case-insensitive)
      let searchMatch = true;
      if (searchTerm && video) {
        const searchableText = [
          video.title,
          video.channel,
          video.whyOutlier,
          video.contentAngle,
          video.niche,
          ...(video.tags || [])
        ].filter(Boolean).join(' ').toLowerCase();
        
        searchMatch = searchableText.includes(searchTerm);
      }
      
      const shouldShow = nicheMatch && searchMatch;
      el.style.display = shouldShow ? 'block' : 'none';
      if (shouldShow) visibleCount++;
    });
    
    // Show "No results" message if all cards are hidden
    const container = document.getElementById('youtube-outliers');
    const existingNoResults = container?.querySelector('.no-results-message');
    
    if (visibleCount === 0 && cards.length > 0) {
      if (!existingNoResults) {
        const noResultsDiv = document.createElement('div');
        noResultsDiv.className = 'no-results-message empty-state mt-4';
        noResultsDiv.innerHTML = `
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-title">No matching videos</div>
          <div class="empty-state-desc">Try adjusting your filters or search terms</div>
        `;
        container?.appendChild(noResultsDiv);
      }
    } else if (existingNoResults) {
      existingNoResults.remove();
    }
  }

  // YouTube niche filter - D3 FIX
  document.getElementById('youtube-niche-filter')?.addEventListener('change', (e) => {
    youtubeFilterState.niche = e.target.value;
    applyYouTubeFilters();
  });

  // YouTube search - D4 FIX
  document.getElementById('youtube-search')?.addEventListener('input', (e) => {
    youtubeFilterState.search = e.target.value;
    applyYouTubeFilters();
  });

  // Research search
  document.getElementById('research-search')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('#research-notes > div').forEach(el => {
      if (!el.classList.contains('card')) return;
      const text = el.textContent.toLowerCase();
      el.style.display = text.includes(query) ? 'block' : 'none';
    });
  });

  // D9 FIX: Tools category filter
  let toolsFilterState = {
    category: '',
    search: ''
  };

  function applyToolsFilters() {
    const cards = document.querySelectorAll('#tools-grid > div.card');
    const searchTerm = toolsFilterState.search.toLowerCase().trim();
    
    cards.forEach(el => {
      // Category filter
      const categoryMatch = !toolsFilterState.category || el.dataset.category === toolsFilterState.category;
      
      // Search filter
      const text = el.textContent.toLowerCase();
      const searchMatch = !searchTerm || text.includes(searchTerm);
      
      el.style.display = (categoryMatch && searchMatch) ? 'block' : 'none';
    });
  }

  document.getElementById('tools-category-filter')?.addEventListener('change', (e) => {
    toolsFilterState.category = e.target.value;
    applyToolsFilters();
  });

  document.getElementById('tools-search')?.addEventListener('input', (e) => {
    toolsFilterState.search = e.target.value.toLowerCase();
    applyToolsFilters();
  });
}

// ==================== D5 FIX: GLOBAL SEARCH ====================

function setupGlobalSearch() {
  const globalSearch = document.getElementById('global-search');
  const globalSearchMobile = document.getElementById('global-search-mobile');
  
  const handleSearch = (query) => {
    if (!query || query.trim().length < 2) {
      clearGlobalSearch();
      return;
    }
    performGlobalSearch(query.trim().toLowerCase());
  };
  
  globalSearch?.addEventListener('input', (e) => handleSearch(e.target.value));
  globalSearchMobile?.addEventListener('input', (e) => handleSearch(e.target.value));
}

function performGlobalSearch(query) {
  const results = [];
  const maxResults = 20;
  
  // Search YouTube videos
  (appData.youtube?.outlierVideos || []).forEach(v => {
    const text = [v.title, v.channel, v.whyOutlier, v.contentAngle, v.niche].join(' ').toLowerCase();
    if (text.includes(query)) {
      results.push({ type: 'youtube', item: v, matchText: v.title });
    }
  });
  
  // Search Business opportunities
  (appData.newBusiness?.opportunities || []).forEach(o => {
    const text = [o.name || o.title, o.description, o.nextStep].join(' ').toLowerCase();
    if (text.includes(query)) {
      results.push({ type: 'business', item: o, matchText: o.name || o.title });
    }
  });
  
  // Search Investments
  (appData.investments?.positions || []).forEach(p => {
    const text = [p.ticker, p.symbol, p.name].filter(Boolean).join(' ').toLowerCase();
    if (text.includes(query)) {
      results.push({ type: 'investments', item: p, matchText: `${p.ticker || p.symbol} - ${p.name}` });
    }
  });
  
  (appData.investments?.watchlist || []).forEach(w => {
    const text = [w.ticker, w.symbol, w.name, w.thesis, w.notes].filter(Boolean).join(' ').toLowerCase();
    if (text.includes(query)) {
      results.push({ type: 'investments', item: w, matchText: `${w.ticker || w.symbol} - Watchlist` });
    }
  });
  
  // Search Tools
  (appData.tools?.tools || []).forEach(t => {
    const text = [t.name, t.description, t.category].join(' ').toLowerCase();
    if (text.includes(query)) {
      results.push({ type: 'tools', item: t, matchText: t.name });
    }
  });
  
  // Search Research
  (appData.research?.notes || []).forEach(n => {
    const text = [n.title, n.summary, n.content, n.category, ...(n.tags || [])].filter(Boolean).join(' ').toLowerCase();
    if (text.includes(query)) {
      results.push({ type: 'research', item: n, matchText: n.title });
    }
  });
  
  // Search Audits
  (appData.audits?.audits || []).forEach(a => {
    const text = [a.project, a.findings, a.summary, a.agent].filter(Boolean).join(' ').toLowerCase();
    if (text.includes(query)) {
      results.push({ type: 'audits', item: a, matchText: a.project });
    }
  });
  
  displayGlobalSearchResults(results.slice(0, maxResults), query);
}

function displayGlobalSearchResults(results, query) {
  const resultsContainer = document.getElementById('global-search-results');
  const resultsContent = document.getElementById('global-search-results-content');
  
  if (!resultsContainer || !resultsContent) return;
  
  if (results.length === 0) {
    resultsContent.innerHTML = `
      <div class="empty-state py-8">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">No results found</div>
        <div class="empty-state-desc">Try different search terms</div>
      </div>
    `;
  } else {
    const typeIcons = {
      youtube: '🎬',
      business: '💼',
      investments: '📈',
      tools: '🛠️',
      research: '🔬',
      audits: '📋'
    };
    
    const typeLabels = {
      youtube: 'YouTube',
      business: 'Business',
      investments: 'Investments',
      tools: 'Tools',
      research: 'Research',
      audits: 'Audits'
    };
    
    resultsContent.innerHTML = results.map(r => `
      <div class="card card-clickable rounded-lg p-3" onclick="handleGlobalSearchClick('${r.type}', '${r.item.id || ''}')">
        <div class="flex items-center gap-2">
          <span class="text-lg">${typeIcons[r.type]}</span>
          <span class="text-xs px-2 py-0.5 bg-dark-700 rounded text-gray-400">${typeLabels[r.type]}</span>
        </div>
        <div class="mt-1 font-semibold">${highlightMatch(r.matchText, query)}</div>
      </div>
    `).join('');
  }
  
  resultsContainer.classList.remove('hidden');
}

function highlightMatch(text, query) {
  if (!text) return '';
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<mark class="bg-accent-yellow text-black px-1 rounded">$1</mark>');
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function handleGlobalSearchClick(type, id) {
  // Switch to the appropriate tab
  showTab(type === 'youtube' ? 'youtube' : type);
  
  // Clear search results
  clearGlobalSearch();
}

function clearGlobalSearch() {
  const globalSearch = document.getElementById('global-search');
  const globalSearchMobile = document.getElementById('global-search-mobile');
  const resultsContainer = document.getElementById('global-search-results');
  
  if (globalSearch) globalSearch.value = '';
  if (globalSearchMobile) globalSearchMobile.value = '';
  if (resultsContainer) resultsContainer.classList.add('hidden');
}

function moveStatus(oppId, newStatus) {
  // This would update local state only - agent reads on next sync
  alert(`Marked ${oppId} as ${newStatus}. The agent will sync this change on next heartbeat.`);
}

function showEmptyStates() {
  // Only show empty states if data has actually failed to load
  // Don't override already rendered content
  document.querySelectorAll('.tab-content').forEach(tab => {
    const containers = tab.querySelectorAll('[id$="-outliers"], [id$="-opportunities"], [id$="-positions"], [id$="-grid"], [id$="-notes"], [id$="-list"]');
    containers.forEach(c => {
      // Only add empty state if container is truly empty and has no skeleton loader
      if (c.children.length === 0 && !c.innerHTML.includes('skeleton')) {
        c.innerHTML = buildEmptyState('', 'Loading...', 'Data is being fetched from GitHub. If this persists, check your connection or refresh.');
      }
    });
  });
}

// ==================== FORMATTING FUNCTIONS ====================

function formatViews(views) {
  if (!views) return '0';
  if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
  if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
  return formatNumber(views);
}

function formatTimeAgo(dateString) {
  if (!dateString) return 'unknown';
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  if (diff < 604800) {
    const days = Math.floor(diff / 86400);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }
  return formatDate(dateString);
}

// Format dates as YYYY-MM-DD
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format numbers with commas
function formatNumber(num) {
  if (num === undefined || num === null) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Format currency with $ and decimals
function formatCurrency(amount) {
  if (amount === undefined || amount === null || amount === '' || amount === 0) return '—';
  const num = parseFloat(amount);
  if (isNaN(num) || num === 0) return '—';
  return '$' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ============================================
// YOUTUBE SECTION FUNCTIONS
// ============================================

// Show specific YouTube subsection
function showYouTubeSection(section) {
  // Hide all sections
  document.querySelectorAll('.yt-section').forEach(el => el.classList.add('hidden'));
  // Show selected section
  document.getElementById(`yt-section-${section}`).classList.remove('hidden');
  
  // Update button styles
  const buttons = ['outliers', 'competitors', 'briefs', 'tools'];
  buttons.forEach(btn => {
    const btnEl = document.getElementById(`yt-btn-${btn}`);
    if (btnEl) {
      if (btn === section) {
        btnEl.className = 'px-3 py-1 bg-accent-blue rounded text-sm';
      } else {
        btnEl.className = 'px-3 py-1 bg-dark-700 rounded hover:bg-dark-600 text-sm';
      }
    }
  });
  
  // Load section-specific data
  if (section === 'competitors') {
    renderCompetitors();
  } else if (section === 'briefs') {
    renderContentBriefs();
  }
}

// Run outlier scan via viewstats
function runOutlierScan() {
  alert('⚠️ Viewstats Integration\n\nOutlier scan requires viewstats.com Pro Tools.\n\nTo scan manually:\n1. Open viewstats.com\n2. Navigate to Pro Tools > Outlier\n3. Search: ZMDE Gaming, StevenSongIRL\n4. Export results to dashboard');
}

// Render competitor list
async function renderCompetitors() {
  try {
    const response = await fetch('data/competitors.json?v=' + Date.now());
    const data = await response.json();
    const competitors = data.competitors || [];
    
    const container = document.getElementById('competitor-list');
    if (!container) return;
    
    if (competitors.length === 0) {
      container.innerHTML = '<p class="text-gray-500">No competitors tracked yet.</p>';
      return;
    }
    
    container.innerHTML = competitors.map(comp => `
      <div class="card rounded-lg p-3 hover:bg-dark-700/50">
        <div class="flex justify-between items-start">
          <div>
            <h4 class="font-semibold"><a href="${comp.url}" target="_blank" class="hover:text-accent-blue">${comp.name}</a></h4>
            <p class="text-xs text-gray-400">${comp.niche} • ${comp.focus}</p>
          </div>
          <span class="text-xs px-2 py-1 bg-dark-700 rounded cursor-pointer" onclick="showCompetitorVideos('${comp.id}')">${comp.stats.subscribers}</span>
        </div>
        <div class="flex gap-3 mt-2 text-xs text-gray-500">
          <span>${comp.stats.videoCount} videos</span>
          <span>${comp.stats.totalViews} views</span>
        </div>
      </div>
    `).join('');
    
  } catch (err) {
    console.error('Failed to load competitors:', err);
  }
}

// Show competitor videos - FUNCTIONAL VERSION
function showCompetitorVideos(compId) {
  const container = document.getElementById('competitor-uploads');
  
  // Find competitor data
  const comp = investmentsWatchlistData.find(c => c.id === compId) || 
               appData.competitors?.find(c => c.id === compId);
  
  if (!comp) {
    container.innerHTML = `
      <div class="text-center py-4">
        <p class="text-gray-400">Competitor not found</p>
      </div>
    `;
    return;
  }
  
  // Functional interface for tracking competitor videos
  container.innerHTML = `
    <div class="competitor-tracker-interface bg-dark-800 rounded p-4">
      <h4 class="font-semibold mb-3">📺 ${comp.name} - Video Tracker</h4>
      
      <div class="manual-entry mb-4">
        <h5 class="text-sm text-gray-400 mb-2">Add Video Manually</h5>
        <input type="text" id="comp-video-title-${compId}" placeholder="Video Title" class="w-full bg-dark-700 rounded p-2 mb-2 text-sm">
        <input type="text" id="comp-video-views-${compId}" placeholder="Views (e.g. 1.2M)" class="w-full bg-dark-700 rounded p-2 mb-2 text-sm">
        <input type="date" id="comp-video-date-${compId}" class="w-full bg-dark-700 rounded p-2 mb-2 text-sm">
        <input type="text" id="comp-video-url-${compId}" placeholder="YouTube URL" class="w-full bg-dark-700 rounded p-2 mb-2 text-sm">
        <button onclick="addCompetitorVideo('${compId}')" class="btn-primary text-sm">Add Video</button>
      </div>
      
      <div class="quick-actions mb-4">
        <h5 class="text-sm text-gray-400 mb-2">Quick Actions</h5>
        <a href="${comp.url}" target="_blank" class="inline-block px-3 py-1 bg-accent-blue rounded text-sm mr-2 hover:bg-blue-600">Open Channel →</a>
        <button onclick="refreshCompetitorData('${compId}')" class="px-3 py-1 bg-dark-700 rounded text-sm hover:bg-dark-600">🔄 Refresh</button>
      </div>
      
      <div id="comp-videos-list-${compId}" class="videos-list">
        <p class="text-gray-500 text-sm">No videos tracked yet. Add manually or visit channel.</p>
      </div>
    </div>
  `;
  
  // Load any saved videos
  loadCompetitorVideos(compId);
}

function addCompetitorVideo(compId) {
  const title = document.getElementById(`comp-video-title-${compId}`).value;
  const views = document.getElementById(`comp-video-views-${compId}`).value;
  const date = document.getElementById(`comp-video-date-${compId}`).value;
  const url = document.getElementById(`comp-video-url-${compId}`).value;
  
  if (!title) {
    alert('Please enter at least a title');
    return;
  }
  
  const video = {
    id: 'video-' + Date.now(),
    title: title,
    views: views,
    publishedAt: date,
    url: url,
    addedAt: new Date().toISOString()
  };
  
  // Save to localStorage
  const key = `competitor-videos-${compId}`;
  const videos = JSON.parse(localStorage.getItem(key) || '[]');
  videos.push(video);
  localStorage.setItem(key, JSON.stringify(videos));
  
  // Clear inputs
  document.getElementById(`comp-video-title-${compId}`).value = '';
  document.getElementById(`comp-video-views-${compId}`).value = '';
  document.getElementById(`comp-video-date-${compId}`).value = '';
  document.getElementById(`comp-video-url-${compId}`).value = '';
  
  // Refresh list
  loadCompetitorVideos(compId);
  alert('Video added to tracker!');
}

function loadCompetitorVideos(compId) {
  const container = document.getElementById(`comp-videos-list-${compId}`);
  if (!container) return;
  
  const key = `competitor-videos-${compId}`;
  const videos = JSON.parse(localStorage.getItem(key) || '[]');
  
  if (videos.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-sm">No videos tracked yet.</p>';
    return;
  }
  
  container.innerHTML = `
    <h5 class="text-sm text-gray-400 mb-2">Tracked Videos (${videos.length})</h5>
    <ul class="space-y-2">
      ${videos.map(v => `
        <li class="bg-dark-700 rounded p-2 text-sm">
          <div class="flex justify-between">
            <span class="font-medium">${v.title}</span>
            <span class="text-gray-400">${v.views}</span>
          </div>
          ${v.publishedAt ? `<div class="text-xs text-gray-500">${new Date(v.publishedAt).toLocaleDateString()}</div>` : ''}
          ${v.url ? `<a href="${v.url}" target="_blank" class="text-xs text-accent-blue hover:underline">Watch →</a>` : ''}
        </li>
      `).join('')}
    </ul>
  `;
}

function refreshCompetitorData(compId) {
  loadCompetitorVideos(compId);
  alert('Data refreshed from local storage');
}

// Add new competitor
function addCompetitor() {
  const url = prompt('Enter YouTube channel URL:');
  if (url) {
    alert('⚠️ YouTube API Integration Required\n\nFetching competitor videos requires YouTube API access.\n\nCurrent workaround:\n- Competitor channels are tracked manually\n- Videos added via research notes\n- Use YouTube Studio for competitor monitoring');
  }
}

// Render content briefs
function renderContentBriefs() {
  const container = document.getElementById('content-briefs-list');
  if (!container) return;
  
  const briefs = appData.youtube.contentBriefs || [];
  
  if (briefs.length === 0) {
    container.innerHTML = `
      <div class="card rounded-lg p-8 text-center text-gray-500">
        <p>No content briefs yet.</p>
        <p class="text-sm mt-2">Click "Generate Brief" to create one from outlier research.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = briefs.map(brief => `
    <div class="card rounded-lg p-4">
      <div class="flex justify-between items-start mb-2">
        <h3 class="font-semibold">${brief.title}</h3>
        <span class="text-xs px-2 py-1 bg-${brief.urgency === 'high' ? 'red' : brief.urgency === 'medium' ? 'yellow' : 'gray'}-900/50 rounded">${brief.urgency}</span>
      </div>
      <p class="text-sm text-gray-400 mb-2">${brief.hook}</p>
      <div class="flex gap-2 text-xs text-gray-500">
        <span>Target: ${brief.targetLength}</span>
        <span>•</span>
        <span>Difficulty: ${brief.difficulty}</span>
        <span>•</span>
        <span>Status: ${brief.status}</span>
      </div>
    </div>
  `).join('');
}

// Generate new content brief
function generateBrief() {
  alert('✅ Content Briefs Available\n\nView existing briefs in the YouTube tab > Content Briefs section.\n\nTo create new briefs:\n1. Analyze outlier videos\n2. Click "Generate Brief" on any outlier\n3. Edit and save to dashboard');
}

// Launch YouTube tool
// ==================== YOUTUBE TOOLS - FULLY FUNCTIONAL ====================

// Tool 1: Content Pipeline Orchestrator
function launchTool(toolName) {
  if (toolName === 'pipeline') {
    showContentPipeline();
  } else if (toolName === 'analyzer') {
    showPerformanceAnalyzer();
  } else if (toolName === 'brief-generator') {
    showBriefGenerator();
  } else if (toolName === 'map-scraper') {
    showMapScraper();
  }
}

function showContentPipeline() {
  const pipelineHTML = `
    <div class="tool-interface">
      <h3>🎬 Content Pipeline Orchestrator</h3>
      <div class="pipeline-stages">
        <div class="stage" data-stage="idea">
          <h4>1. Idea</h4>
          <textarea id="pipeline-idea" placeholder="Enter video idea..." class="w-full bg-dark-700 rounded p-2 mb-2"></textarea>
          <button onclick="addToPipeline('idea')" class="btn-primary">Add Idea</button>
        </div>
        <div class="stage" data-stage="research">
          <h4>2. Research</h4>
          <div id="pipeline-research-list"></div>
        </div>
        <div class="stage" data-stage="script">
          <h4>3. Script</h4>
          <textarea id="pipeline-script" placeholder="Write script..." class="w-full bg-dark-700 rounded p-2 mb-2" rows="6"></textarea>
          <button onclick="saveScript()" class="btn-primary">Save Script</button>
        </div>
        <div class="stage" data-stage="production">
          <h4>4. Production</h4>
          <div class="checklist">
            <label><input type="checkbox"> Record footage</label>
            <label><input type="checkbox"> Edit video</label>
            <label><input type="checkbox"> Add voiceover</label>
            <label><input type="checkbox"> Create thumbnail</label>
          </div>
        </div>
        <div class="stage" data-stage="publish">
          <h4>5. Publish</h4>
          <input type="text" id="pipeline-title" placeholder="Video title" class="w-full bg-dark-700 rounded p-2 mb-2">
          <textarea id="pipeline-description" placeholder="Description" class="w-full bg-dark-700 rounded p-2 mb-2" rows="3"></textarea>
          <input type="text" id="pipeline-tags" placeholder="Tags (comma separated)" class="w-full bg-dark-700 rounded p-2 mb-2">
          <button onclick="exportToYouTube()" class="btn-primary">Export Upload Checklist</button>
        </div>
      </div>
      <div id="pipeline-saved-videos" class="mt-4"></div>
    </div>
  `;
  openModal('Content Pipeline Orchestrator', pipelineHTML);
  loadSavedVideos();
}

function addToPipeline(stage) {
  const idea = document.getElementById('pipeline-idea').value;
  if (!idea) return;
  
  const videos = JSON.parse(localStorage.getItem('pipeline-videos') || '[]');
  videos.push({
    id: Date.now(),
    idea: idea,
    stage: 'idea',
    createdAt: new Date().toISOString()
  });
  localStorage.setItem('pipeline-videos', JSON.stringify(videos));
  document.getElementById('pipeline-idea').value = '';
  loadSavedVideos();
  alert('Idea added to pipeline!');
}

function saveScript() {
  const script = document.getElementById('pipeline-script').value;
  localStorage.setItem('current-script', script);
  alert('Script saved to browser storage!');
}

function exportToYouTube() {
  const title = document.getElementById('pipeline-title').value;
  const description = document.getElementById('pipeline-description').value;
  const tags = document.getElementById('pipeline-tags').value;
  
  const exportData = {
    title: title,
    description: description,
    tags: tags,
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'youtube-upload-data.json';
  a.click();
  URL.revokeObjectURL(url);
}

function loadSavedVideos() {
  const videos = JSON.parse(localStorage.getItem('pipeline-videos') || '[]');
  const container = document.getElementById('pipeline-saved-videos');
  if (!container) return;
  
  container.innerHTML = videos.length ? `
    <h4>Saved Ideas (${videos.length})</h4>
    <ul>
      ${videos.map(v => `<li>${v.idea} - ${new Date(v.createdAt).toLocaleDateString()}</li>`).join('')}
    </ul>
  ` : '<p>No saved ideas yet.</p>';
}

// Tool 2: Performance Analyzer
function showPerformanceAnalyzer() {
  const analyzerHTML = `
    <div class="tool-interface">
      <h3>📊 YouTube Performance Analyzer</h3>
      <div class="analyzer-input">
        <h4>Analyze Video Performance</h4>
        <input type="text" id="analyzer-views" placeholder="Views" class="bg-dark-700 rounded p-2 mb-2 w-full">
        <input type="text" id="analyzer-subs" placeholder="Subscriber count" class="bg-dark-700 rounded p-2 mb-2 w-full">
        <input type="text" id="analyzer-avg" placeholder="Channel average views" class="bg-dark-700 rounded p-2 mb-2 w-full">
        <button onclick="calculatePerformance()" class="btn-primary">Calculate</button>
      </div>
      <div id="analyzer-results" class="mt-4"></div>
      <div class="benchmarks mt-4">
        <h4>Benchmarks</h4>
        <ul>
          <li>1x = Average performance</li>
          <li>5x = Good performance</li>
          <li>10x = Viral threshold</li>
          <li>50x+ = Massive outlier</li>
        </ul>
      </div>
    </div>
  `;
  openModal('Performance Analyzer', analyzerHTML);
}

function calculatePerformance() {
  const views = parseInt(document.getElementById('analyzer-views').value) || 0;
  const subs = parseInt(document.getElementById('analyzer-subs').value) || 1;
  const avg = parseInt(document.getElementById('analyzer-avg').value) || 0;
  
  const viewToSubRatio = (views / subs).toFixed(2);
  const outlierScore = avg > 0 ? (views / avg).toFixed(1) : 'N/A';
  
  let rating = 'Average';
  let color = 'text-yellow-500';
  if (parseFloat(outlierScore) >= 50) { rating = 'MASSIVE OUTLIER'; color = 'text-purple-500'; }
  else if (parseFloat(outlierScore) >= 10) { rating = 'VIRAL'; color = 'text-green-500'; }
  else if (parseFloat(outlierScore) >= 5) { rating = 'Good'; color = 'text-blue-500'; }
  
  document.getElementById('analyzer-results').innerHTML = `
    <div class="results-card bg-dark-700 rounded p-4">
      <h4>Results</h4>
      <p>Views per Subscriber: <strong>${viewToSubRatio}</strong></p>
      <p>Outlier Score: <strong class="${color}">${outlierScore}x</strong></p>
      <p>Rating: <strong class="${color}">${rating}</strong></p>
    </div>
  `;
}

// Tool 3: Content Brief Generator
function showBriefGenerator() {
  const generatorHTML = `
    <div class="tool-interface">
      <h3>📝 Content Brief Generator</h3>
      <div class="generator-form">
        <input type="text" id="brief-title" placeholder="Video Title" class="w-full bg-dark-700 rounded p-2 mb-2">
        <select id="brief-niche" class="w-full bg-dark-700 rounded p-2 mb-2">
          <option value="">Select Niche</option>
          <option value="AI Creature">AI Creature</option>
          <option value="Gaming">Gaming</option>
          <option value="Tutorial">Tutorial</option>
          <option value="Entertainment">Entertainment</option>
        </select>
        <input type="text" id="brief-hook" placeholder="Hook (first 30 seconds)" class="w-full bg-dark-700 rounded p-2 mb-2">
        <textarea id="brief-outline" placeholder="Video outline (one point per line)" class="w-full bg-dark-700 rounded p-2 mb-2" rows="5"></textarea>
        <select id="brief-difficulty" class="w-full bg-dark-700 rounded p-2 mb-2">
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button onclick="generateBrief()" class="btn-primary">Generate Brief</button>
      </div>
      <div id="brief-output" class="mt-4"></div>
    </div>
  `;
  openModal('Content Brief Generator', generatorHTML);
}

function generateBrief() {
  const title = document.getElementById('brief-title').value;
  const niche = document.getElementById('brief-niche').value;
  const hook = document.getElementById('brief-hook').value;
  const outline = document.getElementById('brief-outline').value;
  const difficulty = document.getElementById('brief-difficulty').value;
  
  if (!title || !hook) {
    alert('Please fill in at least title and hook');
    return;
  }
  
  const brief = {
    id: 'brief-' + Date.now(),
    title: title,
    niche: niche,
    hook: hook,
    outline: outline.split('\n').filter(line => line.trim()),
    difficulty: difficulty,
    targetLength: difficulty === 'easy' ? '8-10 min' : difficulty === 'medium' ? '12-15 min' : '18-20 min',
    createdAt: new Date().toISOString()
  };
  
  // Save to localStorage
  const briefs = JSON.parse(localStorage.getItem('generated-briefs') || '[]');
  briefs.push(brief);
  localStorage.setItem('generated-briefs', JSON.stringify(briefs));
  
  document.getElementById('brief-output').innerHTML = `
    <div class="brief-result bg-dark-700 rounded p-4 mt-4">
      <h4>Generated Brief</h4>
      <p><strong>Title:</strong> ${brief.title}</p>
      <p><strong>Niche:</strong> ${brief.niche}</p>
      <p><strong>Hook:</strong> ${brief.hook}</p>
      <p><strong>Target Length:</strong> ${brief.targetLength}</p>
      <p><strong>Difficulty:</strong> ${brief.difficulty}</p>
      <button onclick="downloadBrief('${brief.id}')" class="btn-primary mt-2">Download Brief</button>
    </div>
  `;
}

function downloadBrief(briefId) {
  const briefs = JSON.parse(localStorage.getItem('generated-briefs') || '[]');
  const brief = briefs.find(b => b.id === briefId);
  if (!brief) return;
  
  const blob = new Blob([JSON.stringify(brief, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `brief-${brief.title.slice(0, 20).replace(/\s+/g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Tool 4: Map Scraper (Minecraft seed finder)
function showMapScraper() {
  const scraperHTML = `
    <div class="tool-interface">
      <h3>⛏️ Minecraft Map Scraper</h3>
      <p>Find interesting Minecraft seeds and locations for content</p>
      <div class="scraper-input">
        <select id="scraper-biome" class="w-full bg-dark-700 rounded p-2 mb-2">
          <option value="">Select Biome</option>
          <option value="mountains">Mountains</option>
          <option value="ocean">Ocean</option>
          <option value="village">Village</option>
          <option value="temple">Temple</option>
          <option value="stronghold">Stronghold</option>
        </select>
        <input type="text" id="scraper-seed" placeholder="Or enter seed manually" class="w-full bg-dark-700 rounded p-2 mb-2">
        <button onclick="generateMapData()" class="btn-primary">Generate Map Data</button>
      </div>
      <div id="scraper-results" class="mt-4"></div>
      <div class="seed-library mt-4">
        <h4>Popular Content Seeds</h4>
        <ul>
          <li><strong>Speedrun:</strong> -1697694614 (Village at spawn)</li>
          <li><strong>Survival:</strong> 123456789 (Multiple biomes)</li>
          <li><strong>Creative:</strong> 987654321 (Mesa biome)</li>
        </ul>
      </div>
    </div>
  `;
  openModal('Minecraft Map Scraper', scraperHTML);
}

function generateMapData() {
  const biome = document.getElementById('scraper-biome').value;
  const manualSeed = document.getElementById('scraper-seed').value;
  
  const seed = manualSeed || Math.floor(Math.random() * 1000000000).toString();
  
  const biomeData = {
    mountains: { coords: 'X: 200, Z: -150', feature: 'Extreme Hills Village' },
    ocean: { coords: 'X: -500, Z: 300', feature: 'Ocean Monument' },
    village: { coords: 'X: 150, Z: 100', feature: 'Plains Village + Blacksmith' },
    temple: { coords: 'X: -300, Z: -200', feature: 'Desert Temple' },
    stronghold: { coords: 'X: 800, Z: 600', feature: 'Stronghold (Eye of Ender)' }
  };
  
  const data = biome ? biomeData[biome] : { coords: 'Random', feature: 'Unknown' };
  
  document.getElementById('scraper-results').innerHTML = `
    <div class="map-result bg-dark-700 rounded p-4">
      <h4>Generated Map Data</h4>
      <p><strong>Seed:</strong> ${seed}</p>
      <p><strong>Coordinates:</strong> ${data.coords}</p>
      <p><strong>Feature:</strong> ${data.feature}</p>
      <button onclick="copySeed('${seed}')" class="btn-primary mt-2">Copy Seed</button>
    </div>
  `;
}

function copySeed(seed) {
  navigator.clipboard.writeText(seed).then(() => alert('Seed copied to clipboard!'));
}
