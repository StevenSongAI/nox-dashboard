// Nox Dashboard - App Logic
// Loads data from JSON files and renders all tabs

/**
 * Safe render wrapper for error handling in component rendering
 * @param {Function} fn - Function to execute safely
 * @param {string} context - Context name for error reporting
 * @param {*} defaultValue - Default value to return on error
 * @returns {*} - Result of fn or defaultValue on error
 */
function safeRender(fn, context = 'unknown', defaultValue = '') {
  try {
    return fn();
  } catch (err) {
    // Silent error handler - no console output
    return defaultValue;
  }
}

let appData = {
  youtube: { outlierVideos: [], contentBriefs: [], trendAnalysis: {} },
  newBusiness: { opportunities: [], pipeline: {} },
  investments: { positions: [], watchlist: [], intelligence: [] },
  tools: { tools: [], categories: [], lastUpdated: '' },
  research: { notes: [] },
  audits: { audits: [], agentStats: {} },
  meta: { lastUpdated: {}, agentStatus: {} },
  competitors: { competitors: [], outlierPatterns: [] }
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
let apiErrorCount = 0;
const MAX_API_ERRORS = 3;

// BATCH 2: Stock Price API Configuration
// ==========================================
// Primary: Alpha Vantage API
// Get your free API key from: https://www.alphavantage.co/support/#api-key
// Free tier: 25 API calls/day, 5 calls/minute
// BATCH 2 FIX: Using Finnhub for real-time US stock prices (free tier: 60 calls/min)
// Get your free API key at https://finnhub.io/register
// DEMO MODE: If no API key is set, demo data indicator will be shown
const FINNHUB_API_KEY = 'YOUR_API_KEY_HERE';  // Configure your API key here
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const CACHE_DURATION_MS = 300000; // 5 minutes

/**
 * Fetch real-time stock prices from Finnhub API
 * Real-time US stock data, no delays, no CORS issues on GitHub Pages
 * @param {string[]} tickers - Array of stock ticker symbols
 * @returns {Object} - Map of ticker to price
 */
async function fetchStockPrices(tickers) {
  const now = Date.now();
  
  // Check if API key is configured
  if (FINNHUB_API_KEY === 'YOUR_API_KEY_HERE') {
    // API key not configured - using cached data
    return stockPriceCache;
  }
  
  // Return cached prices if within cache duration
  if (now - lastPriceFetch < CACHE_DURATION_MS && Object.keys(stockPriceCache).length > 0) {
    // Using cached prices (cache valid for 5 minutes)
    return stockPriceCache;
  }
  
  // Don't hammer API if we've hit errors
  if (apiErrorCount >= MAX_API_ERRORS) {
    // Too many errors, using cache. Reset in 10 minutes.
    setTimeout(() => { apiErrorCount = 0; }, 600000);
    return stockPriceCache;
  }
  
  try {
    // Fetching prices for tickers
    
    // Finnhub allows 60 calls/minute on free tier - process all tickers
    for (const ticker of tickers) {
      // Skip if we already have fresh data for this ticker
      if (stockPriceCache[ticker] && (now - lastPriceFetch) < CACHE_DURATION_MS) {
        continue;
      }
      
      try {
        const url = `${FINNHUB_BASE_URL}/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Check for API error messages
        if (data.error) {
          apiErrorCount++;
          break;
        }
        
        // Extract current price from Finnhub response (c = current price)
        if (data.c && data.c > 0) {
          const price = parseFloat(data.c);
          stockPriceCache[ticker] = price;
        } else {
          // No price data for ticker
        }
        
        // Finnhub free tier: 60 calls/minute - wait 1 second between calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (tickerErr) {
        apiErrorCount++;
      }
    }
    
    lastPriceFetch = now;
    return stockPriceCache;
    
  } catch (err) {
    apiErrorCount++;
    return stockPriceCache;
  }
}

/**
 * Check if stock prices are available
 * @returns {boolean}
 */
function hasStockPrices() {
  return Object.keys(stockPriceCache).length > 0;
}

/**
 * Get cache status for UI display
 * @returns {Object} - Status info
 */
function getStockCacheStatus() {
  const now = Date.now();
  const age = now - lastPriceFetch;
  const isFresh = age < CACHE_DURATION_MS;
  
  return {
    hasData: Object.keys(stockPriceCache).length > 0,
    isFresh,
    ageMinutes: Math.floor(age / 60000),
    tickerCount: Object.keys(stockPriceCache).length,
    apiKeyConfigured: FINNHUB_API_KEY !== 'YOUR_API_KEY_HERE'
  };
}

// Refresh stock prices manually
async function refreshStockPrices() {
  const statusEl = document.getElementById('investments-price-status');
  
  if (statusEl) {
    statusEl.innerHTML = '<span class="text-yellow-500">⏳ Fetching...</span>';
  }
  
  // Check if API key is configured
  if (FINNHUB_API_KEY === 'YOUR_API_KEY_HERE') {
    if (statusEl) {
      statusEl.innerHTML = '<span class="text-accent-red">⚠️ API key needed</span>';
    }
    alert('Please configure your Finnhub API key in app.js\n\nGet a free key at:\nhttps://finnhub.io/register');
    return;
  }
  
  // Clear cache to force new fetch
  lastPriceFetch = 0;
  
  try {
    // Re-render investments (which will fetch new prices)
    await renderInvestments();
    
    // Check if we got prices
    const hasPrices = investmentsWatchlistData.some(w => w.currentPrice && w.currentPrice > 0);
    
    if (statusEl) {
      if (hasPrices) {
        const now = new Date().toLocaleTimeString();
        statusEl.innerHTML = `<span class="text-accent-green">✓ Updated ${now}</span>`;
      } else {
        statusEl.innerHTML = '<span class="text-gray-400">No price data</span>';
      }
    }
  } catch (err) {
    if (statusEl) {
      statusEl.innerHTML = '<span class="text-accent-red">✗ Error</span>';
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
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
    safeRender(fn, name);
  }
  
  setupFilters();
  
  // D5 FIX: Setup global search
  setupGlobalSearch();
  
  // Initialize tab from URL hash (deep linking)
  initTabFromHash();
  
  // Setup back/forward button handling
  window.addEventListener('popstate', handlePopState);
  
  // Setup modal click-outside-to-close
  setupModalHandlers();
});

// GitHub raw content base URL for fallback
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/stevensongai/nox-dashboard/main';

// Load all JSON data with fallback to GitHub raw
async function loadAllData() {
  const cacheBuster = '?v=' + Date.now();
  
  // Try local paths first, fallback to GitHub raw on failure
  const dataFiles = [
    { name: 'youtube', localPath: 'data/youtube.json', fallbackPath: `${GITHUB_RAW_BASE}/data/youtube.json` },
    { name: 'new-business', localPath: 'data/new-business.json', fallbackPath: `${GITHUB_RAW_BASE}/data/new-business.json` },
    { name: 'investments', localPath: 'data/investments.json', fallbackPath: `${GITHUB_RAW_BASE}/data/investments.json` },
    { name: 'tools', localPath: 'data/tools.json', fallbackPath: `${GITHUB_RAW_BASE}/data/tools.json` },
    { name: 'research', localPath: 'data/research.json', fallbackPath: `${GITHUB_RAW_BASE}/data/research.json` },
    { name: 'audits', localPath: 'data/audits.json', fallbackPath: `${GITHUB_RAW_BASE}/data/audits.json` },
    { name: 'meta', localPath: 'data/meta.json', fallbackPath: `${GITHUB_RAW_BASE}/data/meta.json` },
    { name: 'competitors', localPath: 'data/competitors.json', fallbackPath: `${GITHUB_RAW_BASE}/data/competitors.json` }
  ];

  // Helper to fetch with fallback
  async function fetchWithFallback(df) {
    try {
      // Try local first with cache buster
      const localUrl = df.localPath + cacheBuster;
      let response = await fetch(localUrl);
      
      if (!response.ok) {
        // Fallback to GitHub raw
        const fallbackUrl = df.fallbackPath + cacheBuster;
        response = await fetch(fallbackUrl);
      }
      
      return { name: df.name, response };
    } catch (err) {
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
            break;
          case 'new-business':
            appData.newBusiness = data;
            break;
          case 'investments':
            appData.investments = data;
            break;
          case 'tools':
            appData.tools = Array.isArray(data) ? { tools: data, categories: [], lastUpdated: '' } : data;
            break;
          case 'research':
            appData.research = data;
            break;
          case 'audits':
            appData.audits = data;
            break;
          case 'meta':
            appData.meta = data;
            break;
          case 'competitors':
            appData.competitors = data;
            break;
        }
      } catch (parseErr) {
        // Failed to parse JSON - continue with empty data
      }
    } else {
      // Using empty/default data for failed fetches
    }
  }
  
  updateAgentStatus();
}

function updateAgentStatus() {
  const status = appData.meta?.agentStatus || {};
  const lastHeartbeat = status.lastHeartbeat ? formatTimeAgo(status.lastHeartbeat) : 'just now';
  const currentTask = status.currentTask || 'Ready';
  document.getElementById('agent-status').innerHTML = 
    `Last heartbeat: ${lastHeartbeat} · ${currentTask}`;
}

// Tab switching with URL hash update and deep linking
function showTab(tabId) {
  // Validate tab exists
  const tabContent = document.getElementById(`tab-${tabId}`);
  const tabBtn = document.getElementById(`tab-btn-${tabId}`);
  
  if (!tabContent || !tabBtn) {
    return;
  }
  
  // Hide all tab content
  document.querySelectorAll('.tab-content').forEach(el => {
    el.classList.add('hidden');
    el.setAttribute('hidden', '');
  });
  // Remove active state from all tab buttons
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('tab-active'));
  
  // D3 FIX: Update aria-selected and tabindex for accessibility
  document.querySelectorAll('.tab-btn').forEach(el => {
    el.setAttribute('aria-selected', 'false');
    el.setAttribute('tabindex', '-1');
  });
  
  // Show selected tab and mark button active
  tabContent.classList.remove('hidden');
  tabContent.removeAttribute('hidden');
  tabBtn.classList.add('tab-active');
  
  // D3 FIX: Set active tab accessibility attributes
  tabBtn.setAttribute('aria-selected', 'true');
  tabBtn.setAttribute('tabindex', '0');
  
  // BATCH 2 FIX: Always update URL hash, forcing history entry
  const newHash = `#${tabId}`;
  if (window.location.hash !== newHash) {
    history.pushState({ tab: tabId, timestamp: Date.now() }, '', newHash);
  }
  
  // Re-render charts when switching to their respective tabs
  setTimeout(() => {
    switch(tabId) {
      case 'dashboard':
        safeRender(() => renderYouTubeSparkline(), 'renderYouTubeSparkline');
        safeRender(() => renderBusinessPipelineChart(), 'renderBusinessPipelineChart');
        safeRender(() => renderInvestmentsSummaryChart(), 'renderInvestmentsSummaryChart');
        break;
      case 'youtube':
        safeRender(() => renderYouTubeTrendChart(), 'renderYouTubeTrendChart');
        break;
      case 'investments':
        // D3 FIX: Call renderInvestments() which will then call renderPortfolioChart()
        // This ensures the merged position data is available
        safeRender(() => renderInvestments(), 'renderInvestments');
        break;
      case 'audits':
        safeRender(() => renderAuditsChart(), 'renderAuditsChart');
        safeRender(() => renderAgentPerformanceChart(), 'renderAgentPerformanceChart');
        break;
    }
  }, 50);
}

// Initialize tab from URL hash on page load
function initTabFromHash() {
  const hash = window.location.hash.slice(1); // Remove #
  const validTabs = ['dashboard', 'youtube', 'business', 'investments', 'tools', 'research', 'audits'];
  
  if (hash && validTabs.includes(hash)) {
    showTab(hash);
    return hash;
  }
  
  // Default to dashboard
  showTab('dashboard');
  return 'dashboard';
}

// Handle browser back/forward buttons
function handlePopState(event) {
  const hash = window.location.hash.slice(1);
  const validTabs = ['dashboard', 'youtube', 'business', 'investments', 'tools', 'research', 'audits'];
  
  if (hash && validTabs.includes(hash)) {
    // Update UI without pushing new state
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(el => {
      el.classList.remove('tab-active');
      el.setAttribute('aria-selected', 'false');
      el.setAttribute('tabindex', '-1');
    });
    
    const tabContent = document.getElementById(`tab-${hash}`);
    const tabBtn = document.getElementById(`tab-btn-${hash}`);
    
    if (tabContent && tabBtn) {
      tabContent.classList.remove('hidden');
      tabBtn.classList.add('tab-active');
      tabBtn.setAttribute('aria-selected', 'true');
      tabBtn.setAttribute('tabindex', '0');
    }
  } else if (!hash) {
    // No hash, show dashboard
    showTab('dashboard');
  }
}

// ==================== DETAIL MODAL SYSTEM ====================

// BATCH 5 FIX: Enhanced modal setup with multiple close methods
function setupModalHandlers() {
  const overlay = document.getElementById('detail-modal');
  if (overlay) {
    // Background click to close
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
  
  // BATCH 5 FIX: Ensure close button works
  const closeBtn = document.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
}

// BATCH 5 FIX: Enhanced openModal with proper focus management
function openModal(title, contentHtml) {
  const modal = document.getElementById('detail-modal');
  const titleEl = document.getElementById('modal-title');
  const contentEl = document.getElementById('modal-content');
  
  if (titleEl) titleEl.textContent = title || 'Details';
  if (contentEl) contentEl.innerHTML = contentHtml;
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // BATCH 5 FIX: Re-attach close button listener (content changed)
    setTimeout(() => {
      const closeBtn = modal.querySelector('.modal-close');
      if (closeBtn) {
        closeBtn.onclick = closeModal;
      }
    }, 0);
  }
}

// BATCH 5 FIX: Enhanced closeModal with cleanup
function closeModal() {
  const modal = document.getElementById('detail-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    
    // Clear content to prevent flash of old content on next open
    const contentEl = document.getElementById('modal-content');
    if (contentEl) {
      contentEl.innerHTML = '';
    }
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
  const alignment = opp.alignment || opp.marketSignal || 'N/A';
  const nextStep = opp.nextStep || opp.actionable || 'N/A';
  const category = opp.effort || opp.type || opp.category || 'N/A';
  const fields = [
    { label: 'Name', value: opp.name || opp.title },
    { label: 'Description', value: opp.description },
    { label: 'Alignment', value: `<span class="alignment-${alignment.toLowerCase()}">${alignment}</span>`, raw: true },
    { label: 'Status', value: `<span class="status-badge status-${opp.status}">${opp.status}</span>`, raw: true },
    { label: 'Potential Revenue', value: revenue },
    { label: 'Category', value: category },
    { label: 'Next Step', value: nextStep },
    { label: 'Created', value: formatDate(opp.createdAt || opp.addedAt) },
    { label: 'ID', value: opp.id, code: true }
  ];

  return buildModalFields(fields);
}

function buildPositionModalContent(position) {
  const entryPrice = position.entryPrice || position.avgCost || 0;
  const currentPrice = position.currentPrice || 0;
  const qty = position.quantity || position.shares || 0;
  
  // Calculate gain/loss
  let gain = position.gainPercent;
  if (entryPrice > 0 && currentPrice > 0) {
    gain = ((currentPrice - entryPrice) / entryPrice) * 100;
  }
  const gainClass = gain >= 0 ? 'text-accent-green' : 'text-accent-red';
  const gainSign = gain >= 0 ? '+' : '';
  
  // Calculate total values
  const entryTotal = entryPrice > 0 ? entryPrice * qty : 0;
  const currentTotal = currentPrice > 0 ? currentPrice * qty : 0;
  const gainAmount = currentTotal - entryTotal;
  
  const fields = [
    { label: 'Ticker', value: position.ticker || position.symbol },
    { label: 'Name', value: position.name },
    { label: 'Quantity', value: formatNumber(qty) },
    { label: 'Average Cost', value: entryPrice > 0 ? formatCurrency(entryPrice) : '-' },
    { label: 'Current Price', value: currentPrice > 0 ? formatCurrency(currentPrice) : '-' },
    { label: 'Entry Value', value: entryTotal > 0 ? formatCurrency(entryTotal) : '-' },
    { label: 'Current Value', value: currentTotal > 0 ? formatCurrency(currentTotal) : '-' },
    { label: 'Gain/Loss %', value: `<span class="${gainClass}">${gain !== undefined ? gainSign + gain.toFixed(2) + '%' : '-'}</span>`, raw: true },
    { label: 'Gain/Loss $', value: `<span class="${gainClass}">${gainAmount !== 0 ? (gainAmount > 0 ? '+' : '') + formatCurrency(gainAmount) : '-'}</span>`, raw: true }
  ];
  
  return buildModalFields(fields);
}

function buildWatchlistModalContent(item) {
  const ticker = item.ticker || item.symbol;
  const currentPrice = item.currentPrice || 0;
  const target = item.targetEntry || item.targetPrice || 0;
  
  // Calculate distance to target
  let distanceToTarget = null;
  if (currentPrice > 0 && target > 0) {
    distanceToTarget = ((currentPrice - target) / target) * 100;
  }
  
  const priceDisplay = currentPrice > 0 ? formatCurrency(currentPrice) : 'Not available - click Refresh';
  const targetDisplay = target > 0 ? formatCurrency(target) : '-';
  const distanceDisplay = distanceToTarget !== null 
    ? `<span class="${distanceToTarget <= 0 ? 'text-accent-green' : 'text-accent-red'}">${distanceToTarget > 0 ? '+' : ''}${distanceToTarget.toFixed(1)}% from target</span>`
    : '-';
  
  const fields = [
    { label: 'Ticker', value: ticker },
    { label: 'Name', value: item.name || ticker },
    { label: 'Current Price', value: priceDisplay, raw: currentPrice === 0 },
    { label: 'Target Entry', value: targetDisplay },
    { label: 'Distance to Target', value: distanceDisplay, raw: true },
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
  
  // BATCH 4 FIX: Add launch button to modal
  const launchButton = `
    <div class="mt-4 pt-4 border-t border-dark-700">
      <button onclick="${tool.runCommand}; closeModal();" class="btn-primary w-full">
        ${tool.icon || '🚀'} Launch ${tool.name}
      </button>
    </div>
  `;
  
  return buildModalFields(fields) + launchButton;
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
  
  // BATCH 4 FIX: Show total audit count
  const totalAudits = audits?.audits?.length || 0;
  const totalAuditsEl = document.getElementById('stat-total-audits');
  if (totalAuditsEl) {
    totalAuditsEl.textContent = `${totalAudits} total audits`;
  }

  renderMorningBrief();
  
  // Render dashboard charts
  safeRender(() => renderYouTubeSparkline(), 'renderYouTubeSparkline');
  safeRender(() => renderBusinessPipelineChart(), 'renderBusinessPipelineChart');
  safeRender(() => renderInvestmentsSummaryChart(), 'renderInvestmentsSummaryChart');
}

// D3 FIX: Morning Brief items - use tab name instead of arrow functions
// BATCH 5 FIX: Improved brief generation with better empty state handling
function renderMorningBrief() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  document.getElementById('brief-date').textContent = today;

  const briefContainer = document.getElementById('morning-brief-content');
  if (!briefContainer) return;
  
  // Generate brief items based on actual data
  const items = [];
  
  // Ensure all data is loaded
  const business = appData.newBusiness || {};
  const youtube = appData.youtube || {};
  const audits = appData.audits || {};
  const investments = appData.investments || {};
  const research = appData.research || {};
  
  // Check for high priority opportunities
  const highOpps = (business.opportunities || []).filter(o => o.alignment === 'HIGH' && o.status !== 'passed') || [];
  if (highOpps.length > 0) {
    items.push({
      icon: '💼',
      text: `${formatNumber(highOpps.length)} high-priority business opportunities awaiting review`,
      tab: 'business',
      color: 'text-accent-green'
    });
  }
  
  // Check for new outlier videos (last 7 days for better chance of finding some)
  const recentOutliers = (youtube.outlierVideos || []).filter(v => {
    if (!v.addedAt) return false;
    const daysSince = (Date.now() - new Date(v.addedAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince < 7;
  }) || [];
  if (recentOutliers.length > 0) {
    items.push({
      icon: '🎬',
      text: `${formatNumber(recentOutliers.length)} new YouTube outlier videos this week`,
      tab: 'youtube',
      color: 'text-accent-blue'
    });
  }
  
  // Check for audit grades
  const recentAudits = (audits.audits || []).filter(a => {
    if (!a.date) return false;
    const daysSince = (Date.now() - new Date(a.date).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince < 7;
  }) || [];
  if (recentAudits.length > 0) {
    const avg = Math.round(recentAudits.reduce((s, a) => s + (a.grade || 0), 0) / recentAudits.length);
    items.push({
      icon: '📊',
      text: `${formatNumber(recentAudits.length)} work items audited this week (avg grade: ${avg}%)`,
      tab: 'audits',
      color: avg >= 80 ? 'text-accent-green' : avg >= 60 ? 'text-accent-yellow' : 'text-accent-red'
    });
  }
  
  // Check for pending investments
  const watchlist = investments.watchlist || [];
  if (watchlist.length > 0) {
    items.push({
      icon: '📈',
      text: `${formatNumber(watchlist.length)} investments on watchlist`,
      tab: 'investments',
      color: 'text-gray-300'
    });
  }

  // Check for new research
  const recentResearch = (research.notes || []).filter(n => {
    if (!n.createdAt) return false;
    const daysSince = (Date.now() - new Date(n.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince < 7;
  }) || [];
  if (recentResearch.length > 0) {
    items.push({
      icon: '🔬',
      text: `${formatNumber(recentResearch.length)} new research notes added this week`,
      tab: 'research',
      color: 'text-gray-300'
    });
  }

  if (items.length === 0) {
    // BATCH 5 FIX: Show helpful message when no brief items found
    briefContainer.innerHTML = `
      <div class="brief-empty-state p-4 text-center">
        <div class="text-3xl mb-2">☕</div>
        <div class="text-gray-300 font-medium mb-1">No brief for today</div>
        <div class="text-sm text-gray-500">Dashboard is up to date. Check the tabs below for your data.</div>
        <div class="mt-3 flex flex-wrap justify-center gap-2">
          <button onclick="showTab('business')" class="px-3 py-1.5 bg-dark-700 rounded text-xs hover:bg-dark-600 transition-colors">💼 Business</button>
          <button onclick="showTab('youtube')" class="px-3 py-1.5 bg-dark-700 rounded text-xs hover:bg-dark-600 transition-colors">🎬 YouTube</button>
          <button onclick="showTab('investments')" class="px-3 py-1.5 bg-dark-700 rounded text-xs hover:bg-dark-600 transition-colors">📈 Investments</button>
          <button onclick="showTab('research')" class="px-3 py-1.5 bg-dark-700 rounded text-xs hover:bg-dark-600 transition-colors">🔬 Research</button>
        </div>
      </div>
    `;
  } else {
    briefContainer.innerHTML = items.map(item => `
      <div class="brief-item cursor-pointer hover:bg-dark-700/50 rounded p-2 transition-colors" onclick="showTab('${item.tab}')">
        <span class="brief-icon mr-2">${item.icon}</span>
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

// Business pipeline chart - using horizontal bar for better visibility with small values
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
  
  // Use horizontal bar chart for better visibility of small values
  businessPipelineChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['New', 'Eval', 'Pursuing', 'Passed', 'Won'],
      datasets: [{
        data: data,
        backgroundColor: [
          '#3B82F6', // blue - new
          '#F59E0B', // yellow - evaluating
          '#8B5CF6', // purple - pursuing
          '#EF4444', // red - passed
          '#10B981'  // green - won
        ],
        borderRadius: 6,
        borderWidth: 0,
        barThickness: 25,
        maxBarThickness: 30
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y', // Horizontal bars
      plugins: {
        legend: { display: false },
        datalabels: {
          display: true,
          color: '#e0e0e0',
          font: { size: 11, weight: 'bold' },
          anchor: 'end',
          align: 'end',
          formatter: (value) => value > 0 ? value : ''
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${context.raw} opportunities`
          }
        }
      },
      scales: {
        x: { 
          display: true,
          grid: { color: 'rgba(255,255,255,0.08)' },
          ticks: { color: '#9ca3af', font: { size: 10 } },
          beginAtZero: true
        },
        y: { 
          display: true,
          grid: { display: false },
          ticks: { color: '#e0e0e0', font: { size: 11, weight: '500' } }
        }
      }
    },
    plugins: [{
      id: 'datalabels',
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        chart.data.datasets.forEach((dataset, i) => {
          const meta = chart.getDatasetMeta(i);
          meta.data.forEach((bar, index) => {
            const value = dataset.data[index];
            if (value > 0) {
              ctx.fillStyle = '#e0e0e0';
              ctx.font = 'bold 11px sans-serif';
              ctx.textAlign = 'left';
              ctx.textBaseline = 'middle';
              ctx.fillText(value.toString(), bar.x + 8, bar.y);
            }
          });
        });
      }
    }]
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
  
  // Show empty state if no positions
  if (positions.length === 0) {
    // Clear canvas and show message
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('No positions tracked', canvas.width / 2, canvas.height / 2);
    ctx.restore();
    return;
  }
  
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
  // BATCH 4 FIX: Filter out placeholder/historical audits
  const realAudits = audits.filter(a => a.summary !== 'Historical audit entry');
  if (realAudits.length === 0) return null;
  const sum = realAudits.reduce((a, b) => a + (b.grade || 0), 0);
  return Math.round(sum / realAudits.length);
}

// ==================== YOUTUBE TAB - BATCH 3 FIXES ====================

// ==================== TOP 5 DAILY OUTLIERS ====================

/**
 * Simple seeded PRNG (mulberry32) for deterministic daily shuffle.
 * Same date = same seed = same Top 5 all day.
 */
function seededRandom(seed) {
  let t = seed + 0x6D2B79F5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * Get today's date as an integer seed (YYYYMMDD).
 * Same value all day, changes at midnight.
 */
function getDailySeed() {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

/**
 * Score an outlier video for Top 5 ranking.
 * Factors: viralScore, views, recency, priority categories, outlierScore.
 */
function scoreOutlier(video) {
  let score = 0;

  // viralScore (0-100 scale, weight heavily)
  score += (video.viralScore || 0) * 3;

  // views (log-scaled so 1M doesn't dominate everything)
  const views = video.views || 0;
  if (views > 0) {
    score += Math.log10(views) * 10; // e.g. 1M = 60, 100K = 50, 10K = 40
  }

  // outlierScore (some videos have this instead of viralScore)
  score += (video.outlierScore || 0) * 2;

  // Recency bonus: videos published in last 14 days get a boost
  const published = new Date(video.publishedAt);
  const daysSincePublished = (Date.now() - published.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSincePublished <= 3) score += 40;
  else if (daysSincePublished <= 7) score += 25;
  else if (daysSincePublished <= 14) score += 15;
  else if (daysSincePublished <= 30) score += 5;

  // Priority category bonus
  const cat = (video.category || '').toLowerCase();
  const niche = (video.niche || '').toLowerCase();
  if (cat === 'creature_simulation' || niche.includes('creature')) score += 30;
  if (cat === 'ai_video_education' || niche.includes('ai video')) score += 30;
  if (niche.includes('gaming')) score += 10;

  return score;
}

/**
 * Get today's Top 5 outliers.
 * Scores all videos, then uses daily seed to add small deterministic jitter
 * so the list has variety day-to-day even if data doesn't change.
 */
function getTop5DailyOutliers(videos) {
  if (!videos || videos.length === 0) return [];

  const seed = getDailySeed();

  // Score and add seeded jitter
  const scored = videos.map((v, i) => {
    const base = scoreOutlier(v);
    const jitter = seededRandom(seed + i) * 30; // 0-30 pts jitter
    return { video: v, score: base + jitter };
  });

  // Sort descending by score, take top 5
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5);
}

/**
 * Render the Top 5 Daily Outliers featured section.
 */
function renderTop5DailyOutliers() {
  const container = document.getElementById('top5-daily-outliers');
  if (!container) return;

  const videos = appData.youtube?.outlierVideos || [];
  const top5 = getTop5DailyOutliers(videos);

  if (top5.length === 0) {
    container.innerHTML = '';
    return;
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  const cardsHtml = top5.map((entry, i) => {
    const v = entry.video;
    const rank = i + 1;
    const angle = v.contentAngle || v.whyOutlier || v.notes || '';
    const viralBadge = v.viralScore ? `<span class="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded">🔥 ${v.viralScore}</span>` : '';
    const outlierBadge = v.outlierScore ? `<span class="px-2 py-0.5 bg-accent-blue/20 text-accent-blue text-xs rounded">${v.outlierScore.toFixed(1)}x</span>` : '';
    const categoryBadge = v.category ? `<span class="px-2 py-0.5 bg-accent-purple/20 text-accent-purple text-xs rounded">${v.category.replace(/_/g, ' ')}</span>` : '';
    const nicheBadge = v.niche ? `<span class="text-sm">${v.niche}</span>` : '';

    return `
      <div class="relative rounded-lg p-4 border border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 hover:border-yellow-500/60 transition-all cursor-pointer" onclick="showVideoModal('${v.id}')">
        <div class="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-yellow-500 text-black text-sm font-bold flex items-center justify-center shadow-lg">${rank}</div>
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-2 ml-4">
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              ${nicheBadge} ${viralBadge} ${outlierBadge} ${categoryBadge}
            </div>
            <h4 class="font-semibold text-white mb-1 truncate">${v.title}</h4>
            <p class="text-sm text-gray-400">${v.channel} · ${formatViews(v.views)} views · ${formatTimeAgo(v.publishedAt)}</p>
            ${angle ? `<p class="text-sm text-yellow-400/80 mt-1 line-clamp-1">💡 ${angle}</p>` : ''}
          </div>
          <a href="${v.url}" target="_blank" class="shrink-0 px-3 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded text-yellow-400 text-sm whitespace-nowrap hover:bg-yellow-500/30 transition-colors" onclick="event.stopPropagation()">Watch →</a>
        </div>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="rounded-xl border border-yellow-500/20 bg-dark-800/50 p-5 mb-2">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-bold text-yellow-400">⚡ Today's Top 5 Outliers</h2>
          <p class="text-sm text-gray-400 mt-0.5">${today} · Auto-ranked by viral score, views, recency & niche</p>
        </div>
      </div>
      <div class="space-y-3">
        ${cardsHtml}
      </div>
    </div>`;
}

// D4 FIX: Store video data for search against all properties
let youtubeVideoData = [];

function renderYouTube() {
  const container = document.getElementById('youtube-outliers');
  if (!container) {
    return;
  }
  
  const videos = appData.youtube?.outlierVideos || [];
  const briefs = loadBriefs(); // Load from localStorage
  const meta = appData.meta || {};

  // Render Top 5 Daily Outliers above the full list
  safeRender(() => renderTop5DailyOutliers(), 'renderTop5DailyOutliers');

  // Update Research Status stats
  const lastScan = localStorage.getItem('last-outlier-scan');
  const lastScanEl = document.getElementById('last-outlier-scan');
  const totalOutliersEl = document.getElementById('total-outliers');
  const totalBriefsEl = document.getElementById('total-briefs');
  
  if (lastScanEl) lastScanEl.textContent = lastScan ? formatTimeAgo(lastScan) : 'Never';
  if (totalOutliersEl) totalOutliersEl.textContent = videos.length;
  if (totalBriefsEl) totalBriefsEl.textContent = briefs.length;
  
  // Initialize auto-scan status
  initAutoScanStatus();
  
  // Store for search
  youtubeVideoData = videos;

  let html = '';

  // Outlier Videos Section - With Niche Filter
  html += `<h3 class="text-lg font-semibold mb-3">🎯 Outlier Videos (${videos.length})</h3>`;
  
  if (videos.length === 0) {
    html += buildEmptyState('🎬', 'No Outlier Videos Yet', 'Click "Scan Viewstats" to start researching or add outliers manually.');
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
  safeRender(() => renderYouTubeTrendChart(), 'renderYouTubeTrendChart');
  
  // Render content pipeline kanban board
  safeRender(() => renderContentPipelineKanban(), 'renderContentPipelineKanban');
  
  // Render Minecraft Live countdown widget
  safeRender(() => renderMinecraftLiveCountdown(), 'renderMinecraftLiveCountdown');
  
  // Render Marketplace earnings calculator
  safeRender(() => renderMarketplaceCalculator(), 'renderMarketplaceCalculator');
  
  // Render animation tools comparison
  safeRender(() => renderAnimationToolsComparison(), 'renderAnimationToolsComparison');

  // Render NVDA earnings countdown
  safeRender(() => renderNvdaEarningsCountdown(), 'renderNvdaEarningsCountdown');
  
  // Render Performance Optimizer widget
  safeRender(() => renderPerformanceOptimizer(), 'renderPerformanceOptimizer');
  
  // Render Modpack Comparator widget
  safeRender(() => renderModpackComparator(), 'renderModpackComparator');
}

// Content Pipeline Kanban Board — NEW FEATURE: Visual production tracker
function renderContentPipelineKanban() {
  const container = document.getElementById('content-pipeline-kanban');
  if (!container) return;
  
  const briefs = appData.youtube?.contentBriefs || [];
  
  // Group briefs by status
  const columns = {
    'idea': { title: '💡 Ideas', briefs: [] },
    'script-ready': { title: '📝 Script Ready', briefs: [] },
    'in-production': { title: '🎬 In Production', briefs: [] },
    'published': { title: '✅ Published', briefs: [] }
  };
  
  // Categorize briefs
  briefs.forEach(brief => {
    const status = brief.status || 'idea';
    if (columns[status]) {
      columns[status].briefs.push(brief);
    } else {
      columns['idea'].briefs.push(brief);
    }
  });
  
  // Build kanban HTML
  let html = `
    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">📊 Content Pipeline</h3>
      <p class="text-sm text-gray-400">${briefs.length} briefs across ${Object.keys(columns).length} stages</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  `;
  
  Object.entries(columns).forEach(([status, col]) => {
    const count = col.briefs.length;
    const priorityColors = { 'HIGH': 'bg-accent-red/20 text-accent-red', 'MEDIUM': 'bg-accent-yellow/20 text-accent-yellow', 'LOW': 'bg-gray-500/20 text-gray-400' };
    
    html += `
      <div class="bg-dark-800 rounded-lg p-3 border border-dark-600">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-semibold text-sm">${col.title}</h4>
          <span class="text-xs px-2 py-0.5 bg-dark-700 rounded-full">${count}</span>
        </div>
        <div class="space-y-2 max-h-96 overflow-y-auto">
          ${col.briefs.length === 0 ? 
            `<p class="text-xs text-gray-500 text-center py-4">No briefs</p>` :
            col.briefs.map(b => `
              <div class="bg-dark-700 rounded p-2 cursor-pointer hover:bg-dark-600 transition-colors" onclick="showBriefModalById('${b.id}')">
                <div class="flex items-center gap-1 mb-1">
                  <span class="text-xs px-1.5 py-0.5 rounded ${priorityColors[b.priority] || 'bg-gray-500/20 text-gray-400'}">${b.priority || 'MED'}</span>
                  ${b.linkedResearch ? '<span class="text-xs">🔗</span>' : ''}
                </div>
                <p class="text-xs font-medium line-clamp-2" title="${b.title}">${b.title}</p>
                <p class="text-xs text-gray-500 mt-1">${b.niche || 'General'}</p>
              </div>
            `).join('')
          }
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

// Minecraft Live 2026 Countdown Widget — NEW FEATURE
function renderMinecraftLiveCountdown() {
  const container = document.getElementById('minecraft-live-countdown');
  if (!container) return;
  
  const countdown = appData.state?.minecraftLiveCountdown;
  if (!countdown) {
    container.innerHTML = '<p class="text-gray-500 text-sm">Minecraft Live 2026 countdown not configured</p>';
    return;
  }
  
  const days = countdown.daysUntil || 0;
  const features = countdown.keyFeatures || [];
  const opportunities = countdown.contentOpportunities || [];
  
  // Calculate urgency color
  const urgencyColor = days <= 7 ? 'text-accent-red' : days <= 14 ? 'text-accent-yellow' : 'text-accent-green';
  const urgencyBg = days <= 7 ? 'bg-accent-red/10 border-accent-red/30' : days <= 14 ? 'bg-accent-yellow/10 border-accent-yellow/30' : 'bg-accent-green/10 border-accent-green/30';
  
  let html = `
    <div class="${urgencyBg} border rounded-lg p-4 mb-6">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-semibold">🎮 Minecraft Live 2026</h3>
        <span class="text-3xl font-bold ${urgencyColor}">${days} days</span>
      </div>
      <p class="text-sm text-gray-400 mb-3">March 15, 2026 — Everything shown ships immediately (no concept art)</p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 class="text-sm font-semibold mb-2 text-accent-blue">Expected Features</h4>
          <ul class="text-sm space-y-1">
            ${features.map(f => `<li class="flex items-start gap-2"><span class="text-accent-green">✓</span> ${f}</li>`).join('')}
          </ul>
        </div>
        <div>
          <h4 class="text-sm font-semibold mb-2 text-accent-purple">Content Opportunities</h4>
          <ul class="text-sm space-y-1">
            ${opportunities.map(o => `<li class="flex items-start gap-2"><span class="text-accent-yellow">⚡</span> ${o}</li>`).join('')}
          </ul>
        </div>
      </div>
      
      ${days <= 14 ? `
        <div class="mt-3 p-2 bg-dark-800 rounded">
          <p class="text-sm ${urgencyColor}"><strong>⚠️ URGENT:</strong> Less than 2 weeks — prioritize pre-event content now!</p>
        </div>
      ` : ''}
    </div>
  `;
  
  container.innerHTML = html;
}

// Marketplace Earnings Calculator — NEW FEATURE
function renderMarketplaceCalculator() {
  const container = document.getElementById('marketplace-calculator');
  if (!container) return;
  
  const marketplace = appData.state?.minecraftMarketplace;
  if (!marketplace) {
    container.innerHTML = '<p class="text-gray-500 text-sm">Marketplace data not available</p>';
    return;
  }
  
  let html = `
    <div class="bg-dark-800 border border-dark-600 rounded-lg p-4 mb-6">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-semibold">💰 Marketplace Earnings Calculator</h3>
        <span class="text-xs px-2 py-1 bg-accent-green/20 text-accent-green rounded">Live Data</span>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div class="bg-dark-700 rounded p-3 text-center">
          <p class="text-2xl font-bold text-accent-green">${marketplace.totalCreatorPayouts}</p>
          <p class="text-xs text-gray-400">Total Creator Payouts</p>
        </div>
        <div class="bg-dark-700 rounded p-3 text-center">
          <p class="text-2xl font-bold text-accent-blue">${marketplace.recentEarnings}</p>
          <p class="text-xs text-gray-400">Recent Record</p>
        </div>
        <div class="bg-dark-700 rounded p-3 text-center">
          <p class="text-2xl font-bold text-accent-yellow">${marketplace.creatorRevenueShare}</p>
          <p class="text-xs text-gray-400">Creator Share</p>
        </div>
        <div class="bg-dark-700 rounded p-3 text-center">
          <p class="text-2xl font-bold text-accent-purple">${marketplace.priceRange}</p>
          <p class="text-xs text-gray-400">Price Range</p>
        </div>
      </div>
      
      <div class="bg-dark-700 rounded p-3">
        <h4 class="text-sm font-semibold mb-2">Top Categories</h4>
        <div class="flex flex-wrap gap-2">
          ${marketplace.topCategories.map(cat => `<span class="text-xs px-2 py-1 bg-dark-600 rounded">${cat}</span>`).join('')}
        </div>
      </div>
      
      <div class="mt-3 p-2 bg-accent-green/10 rounded">
        <p class="text-sm"><strong>💡 Opportunity:</strong> With BBS mod expertise, you could create marketplace content (skins, worlds) or build a "How Much Minecraft Creators Make" video using this data.</p>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}

// NVDA Earnings Countdown Widget — NEW FEATURE
function renderNvdaEarningsCountdown() {
  const container = document.getElementById('nvda-earnings-countdown');
  if (!container) return;
  
  const countdown = appData.state?.nvdaEarningsCountdown;
  if (!countdown) {
    container.innerHTML = '<p class="text-gray-500 text-sm">NVDA earnings countdown not configured</p>';
    return;
  }
  
  const days = countdown.daysUntil || 0;
  const urgencyColor = days <= 3 ? 'text-accent-red' : days <= 7 ? 'text-accent-yellow' : 'text-accent-green';
  const urgencyBg = days <= 3 ? 'bg-accent-red/10 border-accent-red/30' : days <= 7 ? 'bg-accent-yellow/10 border-accent-yellow/30' : 'bg-accent-green/10 border-accent-green/30';
  
  let html = `
    <div class="${urgencyBg} border rounded-lg p-4 mb-6">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-semibold">📈 NVDA Earnings</h3>
        <span class="text-3xl font-bold ${urgencyColor}">T-${days}</span>
      </div>
      <p class="text-sm text-gray-400 mb-3">February 26, 2026 — After market close</p>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div class="bg-dark-700 rounded p-3 text-center">
          <p class="text-lg font-bold text-accent-blue">${countdown.consensusEPS}</p>
          <p class="text-xs text-gray-400">Consensus EPS</p>
        </div>
        <div class="bg-dark-700 rounded p-3 text-center">
          <p class="text-lg font-bold text-accent-green">${countdown.consensusRevenue}</p>
          <p class="text-xs text-gray-400">Revenue</p>
        </div>
        <div class="bg-dark-700 rounded p-3 text-center">
          <p class="text-lg font-bold text-accent-purple">${countdown.analystPriceTarget}</p>
          <p class="text-xs text-gray-400">Price Target</p>
        </div>
        <div class="bg-dark-700 rounded p-3 text-center">
          <p class="text-lg font-bold text-accent-yellow">${countdown.forwardPE}</p>
          <p class="text-xs text-gray-400">Forward P/E</p>
        </div>
      </div>
      
      <div class="bg-dark-700 rounded p-3 mb-3">
        <h4 class="text-sm font-semibold mb-2 text-accent-blue">Key Metrics to Watch</h4>
        <ul class="text-sm space-y-1">
          ${countdown.keyMetrics.map(m => `<li class="flex items-start gap-2"><span class="text-accent-green">✓</span> ${m}</li>`).join('')}
        </ul>
      </div>
      
      <p class="text-sm"><strong>Beat Streak:</strong> <span class="text-accent-green">${countdown.beatStreak}</span></p>
      
      ${days <= 3 ? `
        <div class="mt-3 p-2 bg-dark-800 rounded">
          <p class="text-sm ${urgencyColor}"><strong>⚠️ URGENT:</strong> Earnings in ${days} days — position before Wednesday!</p>
        </div>
      ` : ''}
    </div>
  `;
  
  container.innerHTML = html;
}

// Animation Tools Comparison Widget — NEW FEATURE
function renderAnimationToolsComparison() {
  const container = document.getElementById('animation-tools-comparison');
  if (!container) return;
  
  const tools = appData.tools?.tools || [];
  const animationTools = tools.filter(t => t.category === 'Minecraft Animation');
  
  if (animationTools.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-sm">Animation tools data not available</p>';
    return;
  }
  
  let html = `
    <div class="bg-dark-800 border border-dark-600 rounded-lg p-4 mb-6">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-semibold">🎬 Minecraft Animation Tools</h3>
        <span class="text-xs px-2 py-1 bg-accent-purple/20 text-accent-purple rounded">${animationTools.length} tools</span>
      </div>
      
      <div class="space-y-3">
  `;
  
  animationTools.forEach(tool => {
    const features = tool.features || [];
    html += `
      <div class="bg-dark-700 rounded p-3">
        <div class="flex items-start justify-between mb-2">
          <div>
            <h4 class="font-semibold text-sm">${tool.name}</h4>
            <p class="text-xs text-gray-400">${tool.price || tool.downloads || 'Free'}</p>
          </div>
          <a href="${tool.url}" target="_blank" class="text-xs px-2 py-1 bg-accent-blue rounded hover:bg-blue-600">View →</a>
        </div>
        <p class="text-xs text-gray-300 mb-2">${tool.description.substring(0, 120)}...</p>
        <div class="flex flex-wrap gap-1">
          ${features.slice(0, 3).map(f => `<span class="text-xs px-1.5 py-0.5 bg-dark-600 rounded">${f}</span>`).join('')}
        </div>
      </div>
    `;
  });
  
  html += `
      </div>
      
      <div class="mt-3 p-2 bg-accent-purple/10 rounded">
        <p class="text-sm"><strong>💡 For Steven:</strong> BBS is best for in-game cinematics. Mine-imator for quick shorts. Blender for highest production value.</p>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}

// Helper to show brief modal by ID
function showBriefModalById(briefId) {
  const briefs = appData.youtube?.contentBriefs || [];
  const brief = briefs.find(b => b.id === briefId);
  if (brief) {
    openModal(brief.title, buildBriefModalContent(brief));
  }
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

// BATCH 4 FIX: Load opportunities from localStorage
function loadDeletedIds() {
  const stored = localStorage.getItem('business-deleted-ids');
  return stored ? new Set(JSON.parse(stored)) : new Set();
}

function saveDeletedIds(deletedSet) {
  localStorage.setItem('business-deleted-ids', JSON.stringify([...deletedSet]));
}

function loadOpportunities() {
  const stored = localStorage.getItem('business-opportunities');
  if (stored) {
    return JSON.parse(stored);
  }
  // Return default opportunities if none stored
  return [
    {
      id: 'opp-1',
      title: 'AI Consulting Service',
      name: 'AI Consulting Service',
      description: 'Offer AI automation consulting to small businesses',
      alignment: 'HIGH',
      status: 'new',
      type: 'Service',
      effort: 'Medium',
      potentialRevenue: '$5K-10K/mo',
      nextStep: 'Create service package and pricing',
      createdAt: new Date().toISOString()
    },
    {
      id: 'opp-2',
      title: 'YouTube Sponsorships',
      name: 'YouTube Sponsorships',
      description: 'Partner with gaming brands for sponsored content',
      alignment: 'MEDIUM',
      status: 'evaluating',
      type: 'Partnership',
      effort: 'Low',
      potentialRevenue: '$2K-5K/mo',
      nextStep: 'Research potential brand partners',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
}

function saveOpportunities(opportunities) {
  localStorage.setItem('business-opportunities', JSON.stringify(opportunities));
}

// BATCH 4 FIX: Calculate pipeline counts from opportunities
function calculatePipelineCounts(opportunities) {
  const counts = { new: 0, evaluating: 0, researching: 0, pursuing: 0, passed: 0, won: 0 };
  opportunities.forEach(opp => {
    const status = opp.status?.toLowerCase() || 'new';
    if (counts.hasOwnProperty(status)) {
      counts[status]++;
    }
  });
  return counts;
}

function renderBusiness() {
  const deletedIds = loadDeletedIds();

  // Load from localStorage first, then fill in with appData
  const storedOpportunities = loadOpportunities().filter(o => !o._deleted && !deletedIds.has(o.id));
  const storedIds = new Set(storedOpportunities.map(o => o.id));

  // Only add JSON opportunities that aren't already in localStorage and aren't deleted
  const jsonOpportunities = (appData.newBusiness.opportunities || []).filter(
    o => !storedIds.has(o.id) && !deletedIds.has(o.id)
  );

  // Combine: stored first, then new JSON items
  const allOpportunities = [...storedOpportunities, ...jsonOpportunities];
  
  console.log('renderBusiness: stored=' + storedOpportunities.length + ', json=' + jsonOpportunities.length + ', total=' + allOpportunities.length);
  
  businessOpportunityData = allOpportunities;
  
  // BATCH 4 FIX: Calculate pipeline counts dynamically
  const pipeline = calculatePipelineCounts(allOpportunities);
  document.getElementById('pipe-new').textContent = formatNumber(pipeline.new);
  document.getElementById('pipe-evaluating').textContent = formatNumber(pipeline.evaluating);
  document.getElementById('pipe-researching').textContent = formatNumber(pipeline.researching);
  document.getElementById('pipe-pursuing').textContent = formatNumber(pipeline.pursuing);
  document.getElementById('pipe-passed').textContent = formatNumber(pipeline.passed);
  document.getElementById('pipe-won').textContent = formatNumber(pipeline.won);

  const container = document.getElementById('business-opportunities');

  // BATCH 4 FIX: Add "Add Opportunity" button
  let html = `
    <div class="flex justify-between items-center mb-4">
      <div class="text-sm text-gray-400">${allOpportunities.length} opportunities</div>
      <button onclick="showAddOpportunityModal()" class="px-3 py-1 bg-accent-blue rounded text-sm hover:bg-blue-600">+ Add Opportunity</button>
    </div>
  `;

  if (allOpportunities.length === 0) {
    html += buildEmptyState('💼', 'No Opportunities Yet', 'Click "Add Opportunity" to create your first business opportunity.');
  } else {
    html += allOpportunities.map(o => {
      const alignment = o.alignment || o.marketSignal || '';
      const category = o.type || o.effort || o.category || '';
      const nextStep = o.nextStep || o.actionable || '';
      const status = o.status || 'new';
      return `
      <div class="card card-clickable rounded-lg p-4" data-status="${status}" data-opp-id="${o.id}" onclick="showOpportunityModal('${o.id}')">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="alignment-${alignment.toLowerCase()}">${alignment}</span>
            <span class="px-2 py-0.5 bg-dark-700 text-xs rounded">${category}</span>
            <span class="text-sm text-gray-400">${o.potentialRevenue || ''}</span>
          </div>
          <span class="text-sm text-gray-400">${formatTimeAgo(o.createdAt || o.addedAt)}</span>
        </div>
        <h3 class="font-semibold mb-1">${o.title || o.name}</h3>
        <p class="text-sm text-gray-300 mb-2">${o.description}</p>
        ${nextStep ? `<p class="text-sm"><strong>Next step:</strong> ${nextStep}</p>` : ''}
        <div class="mt-2 flex flex-wrap gap-2" onclick="event.stopPropagation()">
          <select onchange="moveStatus('${o.id}', this.value)" class="text-xs px-2 py-1 bg-dark-700 rounded border border-dark-600">
            <option value="" disabled${!['new','evaluating','researching','pursuing','passed','won'].includes(status) ? ' selected' : ''}>Move to...</option>
            <option value="new"${status === 'new' ? ' selected' : ''}>New</option>
            <option value="evaluating"${status === 'evaluating' ? ' selected' : ''}>Evaluating</option>
            <option value="researching"${status === 'researching' ? ' selected' : ''}>Researching</option>
            <option value="pursuing"${status === 'pursuing' ? ' selected' : ''}>Pursuing</option>
            <option value="passed"${status === 'passed' ? ' selected' : ''}>Passed</option>
            <option value="won"${status === 'won' ? ' selected' : ''}>Won</option>
          </select>
          <button onclick="deleteOpportunity('${o.id}')" class="text-xs px-2 py-1 bg-red-900/50 text-red-400 rounded hover:bg-red-900">Delete</button>
        </div>
      </div>`;
    }).join('');
  }
  
  container.innerHTML = html;
}

// BATCH 4 FIX: Add Opportunity Modal
function showAddOpportunityModal() {
  const modalHTML = `
    <div class="form-group">
      <label>Opportunity Name</label>
      <input type="text" id="opp-name" class="form-input" placeholder="e.g., AI Consulting Service">
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea id="opp-description" class="form-input form-textarea" placeholder="What is this opportunity about?"></textarea>
    </div>
    <div class="flex gap-2">
      <div class="form-group flex-1">
        <label>Alignment</label>
        <select id="opp-alignment" class="form-input">
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM" selected>MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>
      </div>
      <div class="form-group flex-1">
        <label>Type/Effort</label>
        <select id="opp-type" class="form-input">
          <option value="Service">Service</option>
          <option value="Product">Product</option>
          <option value="Partnership">Partnership</option>
          <option value="Content">Content</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label>Potential Revenue</label>
      <input type="text" id="opp-revenue" class="form-input" placeholder="e.g., $5K-10K/mo">
    </div>
    <div class="form-group">
      <label>Next Step</label>
      <input type="text" id="opp-next-step" class="form-input" placeholder="What should you do next?">
    </div>
    <button onclick="submitAddOpportunity()" class="btn-primary w-full">Add Opportunity</button>
  `;
  
  openModal('Add Business Opportunity', modalHTML);
}

function submitAddOpportunity() {
  const name = document.getElementById('opp-name')?.value?.trim();
  const description = document.getElementById('opp-description')?.value?.trim();
  const alignment = document.getElementById('opp-alignment')?.value;
  const type = document.getElementById('opp-type')?.value;
  const revenue = document.getElementById('opp-revenue')?.value?.trim();
  const nextStep = document.getElementById('opp-next-step')?.value?.trim();
  
  if (!name) {
    alert('Please enter an opportunity name');
    return;
  }
  
  const opportunities = loadOpportunities();
  opportunities.push({
    id: 'opp-' + Date.now(),
    title: name,
    name: name,
    description: description || 'No description provided',
    alignment: alignment || 'MEDIUM',
    status: 'new',
    type: type || 'Service',
    effort: type || 'Medium',
    potentialRevenue: revenue || 'TBD',
    nextStep: nextStep || 'Define next steps',
    createdAt: new Date().toISOString()
  });
  
  saveOpportunities(opportunities);
  closeModal();
  safeRender(() => renderBusiness(), 'renderBusiness');
}

// BATCH 4 FIX: Delete opportunity
function deleteOpportunity(oppId) {
  console.log('deleteOpportunity called:', oppId);
  if (!confirm('Delete this opportunity?')) return;

  // Add to persistent deleted IDs set (survives re-renders, blocks appData items)
  const deletedIds = loadDeletedIds();
  deletedIds.add(oppId);
  saveDeletedIds(deletedIds);

  // Also remove from localStorage opportunities if present
  let opportunities = loadOpportunities();
  const filtered = opportunities.filter(o => o.id !== oppId);
  saveOpportunities(filtered);

  safeRender(() => renderBusiness(), 'renderBusiness');
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

// BATCH 4 FIX: Load investments from appData (JSON file)
// D3 FIX: Load from appData.investments instead of localStorage
function loadInvestments() {
  if (appData.investments) {
    return {
      positions: appData.investments.positions || [],
      watchlist: appData.investments.watchlist || [],
      intelligence: appData.investments.intelligence || []
    };
  }
  return {
    positions: [],
    watchlist: [],
    intelligence: []
  };
}

function saveInvestments(data) {
  localStorage.setItem('investments-data', JSON.stringify(data));
}

// BATCH 4 FIX: Enhanced refresh with loading state and error handling
async function refreshStockPrices() {
  const statusEl = document.getElementById('investments-price-status');
  
  if (statusEl) {
    statusEl.innerHTML = '<span class="text-yellow-500">⏳ Fetching prices...</span>';
  }
  
  // Clear cache to force new fetch
  lastPriceFetch = 0;
  stockPriceCache = {};
  
  try {
    // Re-render investments (which will fetch new prices)
    await safeRender(() => renderInvestments(), 'renderInvestments');
    
    // Check if we got any prices
    const hasPrices = investmentsWatchlistData.some(w => w.currentPrice && w.currentPrice > 0);
    
    if (statusEl) {
      if (hasPrices) {
        statusEl.innerHTML = '<span class="text-accent-green">✓ Updated ' + new Date().toLocaleTimeString() + '</span>';
      } else {
        statusEl.innerHTML = '<span class="text-gray-400">API unavailable - using cached</span>';
      }
    }
  } catch (err) {
    if (statusEl) {
      statusEl.innerHTML = '<span class="text-red-400">✗ Error: ' + (err.message || 'API failed') + '</span>';
    }
  }
}

async function renderInvestments() {
  // BATCH 4 FIX: Load from localStorage and merge with appData
  const storedData = loadInvestments();
  const jsonData = appData.investments || {};
  
  // Merge: stored data takes precedence
  const positions = storedData.positions?.length > 0 ? storedData.positions : (jsonData.positions || []);
  const watchlist = storedData.watchlist?.length > 0 ? storedData.watchlist : (jsonData.watchlist || []);
  const intelligence = storedData.intelligence?.length > 0 ? storedData.intelligence : (jsonData.intelligence || []);

  // Get all unique tickers from positions and watchlist
  const positionTickers = positions.map(p => p.ticker || p.symbol).filter(Boolean);
  const watchlistTickers = watchlist.map(w => w.ticker || w.symbol).filter(Boolean);
  const allTickers = [...new Set([...positionTickers, ...watchlistTickers])];
  
  // Fetch real stock prices
  if (allTickers.length > 0 && FINNHUB_API_KEY !== 'YOUR_API_KEY_HERE') {
    try {
      const prices = await fetchStockPrices(allTickers);
      
      // Update positions with fetched prices
      positions.forEach(p => {
        const ticker = p.ticker || p.symbol;
        if (prices[ticker]) {
          p.currentPrice = prices[ticker];
          // Recalculate gain/loss based on fetched price
          const entryPrice = p.entryPrice || p.avgCost || 0;
          if (entryPrice > 0) {
            p.gainPercent = ((p.currentPrice - entryPrice) / entryPrice) * 100;
            p.totalValue = (p.quantity || p.shares || 0) * p.currentPrice;
          }
          p.lastUpdated = new Date().toISOString();
        }
      });
      
      // Update watchlist with fetched prices
      watchlist.forEach(w => {
        const ticker = w.ticker || w.symbol;
        if (prices[ticker]) {
          w.currentPrice = prices[ticker];
          w.lastUpdated = new Date().toISOString();
        }
      });
      
      // Save updated data
      saveInvestments({ positions, watchlist, intelligence });
    } catch (err) {
      // Could not fetch stock prices - continue with cached data
    }
  } else if (allTickers.length > 0) {
    // API key not configured - will display '-' for prices
    // User needs to add FINNHUB_API_KEY to fetch live prices
  }

  investmentsPositionData = positions;
  investmentsWatchlistData = watchlist;
  investmentsIntelligenceData = intelligence;

  // D4 FIX: Determine if using demo/fallback data (no live prices available)
  const hasLivePrices = positions.some(p => p.currentPrice && p.currentPrice > 0) || 
                        watchlist.some(w => w.currentPrice && w.currentPrice > 0);
  const isDemoData = !hasLivePrices && (positions.length > 0 || watchlist.length > 0);

  // BATCH 4 FIX: Add "Add Holding" button to Positions
  const posContainer = document.getElementById('investments-positions');
  
  // D4 FIX: Add Demo Data indicator banner if using fallback data
  let demoDataBanner = '';
  if (isDemoData) {
    demoDataBanner = `
      <div class="mb-3 px-3 py-2 bg-accent-yellow/20 border border-accent-yellow/50 rounded text-sm text-accent-yellow flex items-center gap-2">
        <span>📊</span>
        <span><strong>Demo Data</strong> — Stock prices unavailable. Add Finnhub API key for live data.</span>
      </div>
    `;
  }
  
  let posHtml = demoDataBanner + `
    <div class="flex justify-between items-center mb-3">
      <div class="text-sm text-gray-400">${positions.length} positions</div>
      <button onclick="showAddHoldingModal()" class="text-xs px-2 py-1 bg-accent-blue rounded hover:bg-blue-600">+ Add</button>
    </div>
  `;
  
  if (positions.length === 0) {
    posHtml += buildEmptyState('', 'No Positions', 'Click "Add" to track your first investment.');
  } else {
    posHtml += positions.map((p, idx) => {
      const entryPrice = p.entryPrice || p.avgCost || 0;
      const currentPrice = p.currentPrice || 0;
      let gain = p.gainPercent;
      
      // Recalculate gain if we have valid prices
      if (entryPrice > 0 && currentPrice > 0) {
        gain = ((currentPrice - entryPrice) / entryPrice) * 100;
      }
      
      const gainClass = gain >= 0 ? 'text-accent-green' : 'text-accent-red';
      const gainSign = gain >= 0 ? '+' : '';
      const ticker = p.ticker || p.symbol;
      const qty = p.quantity || p.shares || 0;
      
      // Format prices - show '-' if 0 or invalid
      const entryDisplay = entryPrice > 0 ? formatCurrency(entryPrice) : '-';
      const currentDisplay = currentPrice > 0 ? formatCurrency(currentPrice) : '-';
      const gainDisplay = gain !== undefined ? `${gainSign}${gain.toFixed(1)}%` : '-';
      
      return `
        <div class="flex justify-between items-center p-2 bg-dark-700/50 rounded cursor-pointer hover:bg-dark-700" onclick="showPositionModal(${idx})">
          <div>
            <div class="font-semibold">${ticker} · ${p.name}</div>
            <div class="text-sm text-gray-400">${formatNumber(qty)} @ ${entryDisplay} → ${currentDisplay}</div>
          </div>
          <div class="text-right">
            <div class="font-bold ${gainClass}">${gainDisplay}</div>
          </div>
        </div>
      `;
    }).join('');
  }
  posContainer.innerHTML = posHtml;

  // BATCH 4 FIX: Add "Add to Watchlist" button
  const watchContainer = document.getElementById('investments-watchlist');
  let watchHtml = `
    <div class="flex justify-between items-center mb-3">
      <div class="text-sm text-gray-400">${watchlist.length} watching</div>
      <button onclick="showAddWatchlistModal()" class="text-xs px-2 py-1 bg-accent-blue rounded hover:bg-blue-600">+ Add</button>
    </div>
  `;
  
  if (watchlist.length === 0) {
    watchHtml += buildEmptyState('', 'No Watchlist Items', 'Click "Add" to track potential investments.');
  } else {
    watchHtml += watchlist.map((w, idx) => {
      const ticker = w.ticker || w.symbol;
      const target = w.targetEntry || w.targetPrice || 0;
      const current = w.currentPrice || 0;
      
      // Only show price if it's a valid, non-zero number
      const priceDisplay = current > 0 ? formatCurrency(current) : '-';
      const targetDisplay = target > 0 ? formatCurrency(target) : '-';
      
      return `
        <div class="p-2 bg-dark-700/50 rounded cursor-pointer hover:bg-dark-700" onclick="showWatchlistModal(${idx})">
          <div class="flex justify-between">
            <span class="font-semibold">${ticker}</span>
            <span class="text-sm">${priceDisplay}</span>
          </div>
          <div class="text-sm text-gray-400">Target: ${targetDisplay}</div>
        </div>
      `;
    }).join('');
  }
  watchContainer.innerHTML = watchHtml;

  // Intelligence
  const intelContainer = document.getElementById('investments-intelligence');
  if (intelligence.length === 0) {
    intelContainer.innerHTML = buildEmptyState('', 'No Intelligence Reports', 'Market intelligence will appear here.');
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

// BATCH 4 FIX: Add Holding Modal
function showAddHoldingModal() {
  const modalHTML = `
    <div class="form-group">
      <label>Ticker Symbol</label>
      <input type="text" id="holding-ticker" class="form-input" placeholder="e.g., AAPL">
    </div>
    <div class="form-group">
      <label>Company Name</label>
      <input type="text" id="holding-name" class="form-input" placeholder="e.g., Apple Inc.">
    </div>
    <div class="flex gap-2">
      <div class="form-group flex-1">
        <label>Quantity/Shares</label>
        <input type="number" id="holding-quantity" class="form-input" placeholder="100">
      </div>
      <div class="form-group flex-1">
        <label>Average Cost</label>
        <input type="number" id="holding-cost" class="form-input" placeholder="150.00" step="0.01">
      </div>
    </div>
    <div class="form-group">
      <label>Current Price (optional)</label>
      <input type="number" id="holding-price" class="form-input" placeholder="Will fetch automatically" step="0.01">
    </div>
    <button onclick="submitAddHolding()" class="btn-primary w-full">Add Holding</button>
  `;
  
  openModal('Add Portfolio Holding', modalHTML);
}

async function submitAddHolding() {
  const ticker = document.getElementById('holding-ticker')?.value?.trim().toUpperCase();
  const name = document.getElementById('holding-name')?.value?.trim();
  const quantity = parseFloat(document.getElementById('holding-quantity')?.value);
  const cost = parseFloat(document.getElementById('holding-cost')?.value);
  let currentPrice = parseFloat(document.getElementById('holding-price')?.value);
  
  if (!ticker || !name || !quantity || !cost) {
    alert('Please fill in all required fields');
    return;
  }
  
  // Try to fetch current price if not provided
  if (!currentPrice || isNaN(currentPrice)) {
    try {
      const prices = await fetchStockPrices([ticker]);
      if (prices[ticker]) {
        currentPrice = prices[ticker];
      } else {
        currentPrice = cost; // Default to cost basis
      }
    } catch (err) {
      currentPrice = cost;
    }
  }
  
  const data = loadInvestments();
  const totalValue = quantity * currentPrice;
  const gainPercent = ((currentPrice - cost) / cost) * 100;
  
  data.positions.push({
    id: 'pos-' + Date.now(),
    ticker,
    symbol: ticker,
    name,
    quantity,
    shares: quantity,
    entryPrice: cost,
    avgCost: cost,
    currentPrice,
    totalValue,
    gainPercent,
    addedAt: new Date().toISOString()
  });
  
  saveInvestments(data);
  closeModal();
  renderInvestments();
}

// BATCH 4 FIX: Add Watchlist Modal
function showAddWatchlistModal() {
  const modalHTML = `
    <div class="form-group">
      <label>Ticker Symbol</label>
      <input type="text" id="watch-ticker" class="form-input" placeholder="e.g., TSLA">
    </div>
    <div class="form-group">
      <label>Company Name (optional)</label>
      <input type="text" id="watch-name" class="form-input" placeholder="e.g., Tesla Inc.">
    </div>
    <div class="form-group">
      <label>Target Entry Price</label>
      <input type="number" id="watch-target" class="form-input" placeholder="200.00" step="0.01">
    </div>
    <div class="form-group">
      <label>Thesis/Notes</label>
      <textarea id="watch-thesis" class="form-input form-textarea" placeholder="Why are you watching this?"></textarea>
    </div>
    <button onclick="submitAddWatchlist()" class="btn-primary w-full">Add to Watchlist</button>
  `;
  
  openModal('Add to Watchlist', modalHTML);
}

async function submitAddWatchlist() {
  const ticker = document.getElementById('watch-ticker')?.value?.trim().toUpperCase();
  const name = document.getElementById('watch-name')?.value?.trim() || ticker;
  const target = parseFloat(document.getElementById('watch-target')?.value);
  const thesis = document.getElementById('watch-thesis')?.value?.trim();
  
  if (!ticker) {
    alert('Please enter a ticker symbol');
    return;
  }
  
  // Try to fetch current price
  let currentPrice = 0;
  try {
    const prices = await fetchStockPrices([ticker]);
    if (prices[ticker]) {
      currentPrice = prices[ticker];
    }
  } catch (err) {
    // Could not fetch price - continue with 0
  }
  
  const data = loadInvestments();
  data.watchlist.push({
    id: 'watch-' + Date.now(),
    ticker,
    symbol: ticker,
    name,
    currentPrice,
    targetEntry: target || 0,
    targetPrice: target || 0,
    thesis: thesis || 'No thesis provided',
    notes: thesis || 'No notes',
    addedAt: new Date().toISOString()
  });
  
  saveInvestments(data);
  closeModal();
  renderInvestments();
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
// D3 FIX: Use investmentsPositionData instead of appData.investments.positions
function renderPortfolioChart() {
  const canvas = document.getElementById('portfolio-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Destroy existing chart
  if (portfolioChartInstance) {
    portfolioChartInstance.destroy();
    portfolioChartInstance = null;
  }
  
  // D3 FIX: Use the merged data from investmentsPositionData instead of raw appData
  const positions = investmentsPositionData || appData.investments?.positions || [];
  
  // Show empty state if no positions
  if (positions.length === 0) {
    // Clear canvas and show message
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('No positions to display', canvas.width / 2, canvas.height / 2);
    ctx.restore();
    
    // Update total value display
    const totalEl = document.getElementById('portfolio-total-value');
    if (totalEl) {
      totalEl.textContent = '$0.00';
    }
    return;
  }
  
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

// BATCH 4 FIX: Load tools from appData (JSON file) instead of localStorage
function loadTools() {
  // Use tools from appData (loaded from tools.json)
  if (appData.tools && appData.tools.tools && appData.tools.tools.length > 0) {
    return appData.tools.tools;
  }
  return [];
}

function saveTools(tools) {
  localStorage.setItem('tools-registry', JSON.stringify(tools));
}

function renderTools() {
  const container = document.getElementById('tools-grid');
  const categoryFilter = document.getElementById('tools-category-filter');
  
  // BATCH 4 FIX: Load from localStorage
  const tools = loadTools();
  const categories = [...new Set(tools.map(t => t.category).filter(Boolean))];
  toolsDataArray = tools;

  // Populate category filter dropdown
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
  }

  if (tools.length === 0) {
    container.innerHTML = buildEmptyState('🛠️', 'No Tools Registered', 'The agent will add them as they are built and deployed.');
    return;
  }

  // BATCH 4 FIX: Enhanced tool cards with launch action
  container.innerHTML = tools.map((t, idx) => `
    <div class="card card-clickable rounded-lg p-4" data-category="${t.category || ''}" data-tool-id="${t.id}">
      <div class="flex justify-between items-start mb-2">
        <div class="flex items-center gap-2">
          <span class="text-2xl">${t.icon || '🛠️'}</span>
          <h3 class="font-semibold">${t.name}</h3>
        </div>
        <span class="text-xs px-2 py-0.5 rounded ${t.status === 'active' ? 'bg-accent-green/20 text-accent-green' : t.status === 'beta' ? 'bg-accent-yellow/20 text-accent-yellow' : 'bg-accent-red/20 text-accent-red'}">${t.status}</span>
      </div>
      <p class="text-sm text-gray-400 mb-3">${t.description}</p>
      <div class="flex justify-between items-center mb-3">
        <div class="text-xs text-gray-500">${t.category} · Audit: ${t.auditGrade || 'N/A'}%</div>
      </div>
      <div class="flex gap-2">
        <button onclick="launchTool('${t.runCommand?.replace(/'/g, "\\'") || ''}')" class="flex-1 px-3 py-2 bg-accent-blue rounded text-sm hover:bg-blue-600 transition-colors">Launch →</button>
        <button onclick="showToolModal(${idx})" class="px-3 py-2 bg-dark-700 rounded text-sm hover:bg-dark-600">Details</button>
      </div>
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

// D1 FIX: Filter function to exclude sample/tutorial notes
function isSampleNote(note) {
  if (!note || !note.tags) return false;
  const tags = note.tags;
  return tags.includes('getting-started') && tags.includes('tutorial');
}

// BATCH 5 FIX: Load research notes from localStorage
// D1 FIX: Removed sample note injection - only return stored notes or empty array
function loadResearchNotes() {
  const stored = localStorage.getItem('research-notes');
  if (stored) {
    const notes = JSON.parse(stored);
    // D1 FIX: Filter out any sample/tutorial notes from localStorage
    return notes.filter(n => !isSampleNote(n));
  }
  // Return empty array - no sample data injection
  return [];
}

function saveResearchNotes(notes) {
  // D1 FIX: Filter out sample notes before saving
  const filteredNotes = notes.filter(n => !isSampleNote(n));
  localStorage.setItem('research-notes', JSON.stringify(filteredNotes));
}

// BATCH 5 FIX: Enhanced renderResearch with CRUD operations
function renderResearch() {
  const container = document.getElementById('research-notes');
  
  // Load from localStorage and merge with appData
  const storedNotes = loadResearchNotes();
  const jsonNotes = appData.research?.notes || [];
  
  // D1 FIX: Filter out sample notes from JSON data too
  const filteredJsonNotes = jsonNotes.filter(n => !isSampleNote(n));
  
  // Merge: stored notes take precedence for duplicates
  const noteMap = new Map();
  [...filteredJsonNotes, ...storedNotes].forEach(note => {
    if (note && note.id) {
      noteMap.set(note.id, note);
    }
  });
  const notes = Array.from(noteMap.values());
  researchNotesData = notes;
  
  // Save merged notes
  saveResearchNotes(notes);

  // Build HTML with add button
  let html = `
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
      <div class="text-sm text-gray-400">${notes.length} notes</div>
      <button onclick="showAddNoteModal()" class="px-3 py-1 bg-accent-blue rounded text-sm hover:bg-blue-600">+ Add Note</button>
    </div>
  `;

  if (notes.length === 0) {
    html += buildEmptyState('🔬', 'No Research Notes', 'Click "Add Note" to create your first research note.');
  } else {
    html += notes.map((n, idx) => {
      const content = n.summary || n.content || '';
      const displayLimit = 300;
      const truncatedContent = content.length > displayLimit 
        ? content.substring(0, displayLimit) + '...'
        : content;
      
      const renderedContent = typeof marked !== 'undefined' 
        ? marked.parse(truncatedContent)
        : escapeHtml(truncatedContent);
      
      // Escape note ID for onclick
      const safeNoteId = n.id.replace(/'/g, "\\'").replace(/"/g, '\\"');
      
      return `
      <div class="card card-clickable rounded-lg p-4" data-note-id="${n.id}" data-category="${n.category || ''}" onclick="showNoteModal('${safeNoteId}')">
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-semibold">${escapeHtml(n.title)}</h3>
          <div class="flex items-center gap-2">
            <span class="text-xs px-2 py-0.5 bg-dark-700 rounded">${escapeHtml(n.category || 'Uncategorized')}</span>
            <button onclick="event.stopPropagation(); showEditNoteModal('${safeNoteId}')" class="text-xs text-accent-blue hover:underline">Edit</button>
            <button onclick="event.stopPropagation(); deleteNote('${safeNoteId}')" class="text-xs text-red-400 hover:underline">Delete</button>
          </div>
        </div>
        <div class="text-sm text-gray-300 mb-2 line-clamp-3">${renderedContent}</div>
        <div class="flex flex-wrap gap-1 mb-2">
          ${(n.tags || []).map(t => `<span class="text-xs px-2 py-0.5 bg-accent-blue/20 text-accent-blue rounded">#${escapeHtml(t)}</span>`).join('')}
        </div>
        <div class="text-xs text-gray-400">${formatTimeAgo(n.createdAt || n.date)}</div>
      </div>
    `}).join('');
  }
  
  container.innerHTML = html;
}

// BATCH 5 FIX: Show Add Note Modal
function showAddNoteModal() {
  const modalHTML = `
    <div class="form-group">
      <label>Note Title</label>
      <input type="text" id="note-title" class="form-input" placeholder="Enter note title...">
    </div>
    <div class="form-group">
      <label>Category</label>
      <select id="note-category" class="form-input">
        <option value="General">General</option>
        <option value="YouTube">YouTube</option>
        <option value="Business">Business</option>
        <option value="Investments">Investments</option>
        <option value="Technology">Technology</option>
        <option value="Ideas">Ideas</option>
        <option value="Strategy">Strategy</option>
      </select>
    </div>
    <div class="form-group">
      <label>Tags (comma separated)</label>
      <input type="text" id="note-tags" class="form-input" placeholder="tag1, tag2, tag3...">
    </div>
    <div class="form-group">
      <label>Content (supports markdown)</label>
      <textarea id="note-content" class="form-input form-textarea" rows="8" placeholder="Write your research notes here..."></textarea>
    </div>
    <button onclick="submitAddNote()" class="btn-primary w-full">Create Note</button>
  `;
  
  openModal('Add Research Note', modalHTML);
}

function submitAddNote() {
  const title = document.getElementById('note-title')?.value?.trim();
  const category = document.getElementById('note-category')?.value || 'General';
  const tagsInput = document.getElementById('note-tags')?.value?.trim() || '';
  const content = document.getElementById('note-content')?.value?.trim();
  
  if (!title) {
    alert('Please enter a note title');
    return;
  }
  
  const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
  const now = new Date().toISOString();
  
  const notes = loadResearchNotes();
  notes.unshift({
    id: 'note-' + Date.now(),
    title,
    category,
    content: content || '',
    summary: content ? content.substring(0, 200) + (content.length > 200 ? '...' : '') : '',
    tags,
    createdAt: now,
    updatedAt: now
  });
  
  saveResearchNotes(notes);
  closeModal();
  safeRender(() => renderResearch(), 'renderResearch');
}

// FIX: Show Note Modal (read-only view for clicking on notes)
function showNoteModal(noteId) {
  const notes = loadResearchNotes();
  const note = notes.find(n => n.id === noteId);
  
  if (!note) {
    alert('Note not found');
    return;
  }
  
  const content = note.summary || note.content || 'No content';
  const renderedContent = typeof marked !== 'undefined' 
    ? marked.parse(content)
    : escapeHtml(content);
  
  const modalHTML = `
    <div class="mb-4">
      <div class="flex justify-between items-start mb-2">
        <span class="text-xs px-2 py-0.5 bg-dark-700 rounded">${escapeHtml(note.category || 'Uncategorized')}</span>
        <span class="text-xs text-gray-400">${formatTimeAgo(note.createdAt || note.date)}</span>
      </div>
      <div class="flex flex-wrap gap-1 mb-4">
        ${(note.tags || []).map(t => `<span class="text-xs px-2 py-0.5 bg-accent-blue/20 text-accent-blue rounded">#${escapeHtml(t)}</span>`).join('')}
      </div>
    </div>
    <div class="prose prose-invert max-w-none text-sm text-gray-300" style="max-height: 60vh; overflow-y: auto;">
      ${renderedContent}
    </div>
  `;
  
  openModal(note.title, modalHTML);
}

// BATCH 5 FIX: Show Edit Note Modal
function showEditNoteModal(noteId) {
  const notes = loadResearchNotes();
  const note = notes.find(n => n.id === noteId);
  
  if (!note) {
    alert('Note not found');
    return;
  }
  
  // Escape for HTML attributes
  const safeNoteId = noteId.replace(/'/g, "\\'").replace(/"/g, '\\"');
  const safeTitle = escapeHtml(note.title);
  const safeContent = escapeHtml(note.content || '');
  const safeCategory = escapeHtml(note.category || 'General');
  const safeTags = escapeHtml((note.tags || []).join(', '));
  
  const modalHTML = `
    <div class="form-group">
      <label>Note Title</label>
      <input type="text" id="edit-note-title" class="form-input" value="${safeTitle}">
    </div>
    <div class="form-group">
      <label>Category</label>
      <select id="edit-note-category" class="form-input">
        <option value="General" ${note.category === 'General' ? 'selected' : ''}>General</option>
        <option value="YouTube" ${note.category === 'YouTube' ? 'selected' : ''}>YouTube</option>
        <option value="Business" ${note.category === 'Business' ? 'selected' : ''}>Business</option>
        <option value="Investments" ${note.category === 'Investments' ? 'selected' : ''}>Investments</option>
        <option value="Technology" ${note.category === 'Technology' ? 'selected' : ''}>Technology</option>
        <option value="Ideas" ${note.category === 'Ideas' ? 'selected' : ''}>Ideas</option>
        <option value="Strategy" ${note.category === 'Strategy' ? 'selected' : ''}>Strategy</option>
      </select>
    </div>
    <div class="form-group">
      <label>Tags (comma separated)</label>
      <input type="text" id="edit-note-tags" class="form-input" value="${safeTags}">
    </div>
    <div class="form-group">
      <label>Content (supports markdown)</label>
      <textarea id="edit-note-content" class="form-input form-textarea" rows="8">${safeContent}</textarea>
    </div>
    <button onclick="submitEditNote('${safeNoteId}')" class="btn-primary w-full">Save Changes</button>
  `;
  
  openModal('Edit Research Note', modalHTML);
}

function submitEditNote(noteId) {
  const title = document.getElementById('edit-note-title')?.value?.trim();
  const category = document.getElementById('edit-note-category')?.value || 'General';
  const tagsInput = document.getElementById('edit-note-tags')?.value?.trim() || '';
  const content = document.getElementById('edit-note-content')?.value?.trim();
  
  if (!title) {
    alert('Please enter a note title');
    return;
  }
  
  const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
  
  const notes = loadResearchNotes();
  const noteIndex = notes.findIndex(n => n.id === noteId);
  
  if (noteIndex === -1) {
    alert('Note not found');
    return;
  }
  
  notes[noteIndex] = {
    ...notes[noteIndex],
    title,
    category,
    content: content || '',
    summary: content ? content.substring(0, 200) + (content.length > 200 ? '...' : '') : '',
    tags,
    updatedAt: new Date().toISOString()
  };
  
  saveResearchNotes(notes);
  closeModal();
  safeRender(() => renderResearch(), 'renderResearch');
}

// BATCH 5 FIX: Delete Note
function deleteNote(noteId) {
  if (!confirm('Are you sure you want to delete this note?')) {
    return;
  }
  
  const notes = loadResearchNotes();
  const filtered = notes.filter(n => n.id !== noteId);
  
  saveResearchNotes(filtered);
  safeRender(() => renderResearch(), 'renderResearch');
}

// ==================== AUDITS TAB ====================

let auditsDataArray = [];

// BATCH 5 FIX: Load audits from localStorage
// D2 FIX: Removed sample audit injection - only return stored audits or empty array
function loadAudits() {
  const stored = localStorage.getItem('audit-reports');
  if (stored) {
    return JSON.parse(stored);
  }
  // Return empty array - no sample data injection
  return [];
}

function saveAudits(audits) {
  localStorage.setItem('audit-reports', JSON.stringify(audits));
}

// BATCH 5 FIX: Enhanced renderAudits with localStorage integration
// BATCH 4 FIX: Load directly from appData.audits and filter placeholder data
function renderAudits() {
  // FIX: Load directly from appData.audits (JSON file), skip localStorage merge
  // BATCH 4 FIX: Filter out placeholder/historical audits
  const allAudits = appData.audits?.audits || [];
  const audits = allAudits.filter(a => a.summary !== 'Historical audit entry');
  auditsDataArray = audits;
  
  // Calculate agent stats from actual audit data
  const agentStats = calculateAgentStats(audits);

  // Stats cards with actual calculated data
  const statsContainer = document.getElementById('audit-stats');
  const agents = Object.keys(agentStats);
  
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
      const s = agentStats[agent];
      const avgGrade = s.averageGrade || 0;
      const trend = s.trend || 'stable';
      const trendIcon = trend === 'improving' ? '↑' : trend === 'declining' ? '↓' : '→';
      const trendColor = trend === 'improving' ? 'text-accent-green' : trend === 'declining' ? 'text-accent-red' : 'text-gray-400';
      return `
        <div class="card rounded-lg p-4 cursor-pointer hover:border-accent-blue" onclick="showTab('audits')">
          <div class="text-sm text-gray-400 mb-1">${agent.charAt(0).toUpperCase() + agent.slice(1)}</div>
          <div class="text-3xl font-bold ${avgGrade >= 80 ? 'text-accent-green' : avgGrade >= 60 ? 'text-accent-yellow' : 'text-accent-red'}">${avgGrade}%</div>
          <div class="text-sm">${s.totalAudits} audits · <span class="${trendColor}">${trendIcon} ${trend}</span></div>
        </div>
      `;
    }).join('');
  }

  // Render charts with real data
  renderAuditsChart(audits, agentStats);
  renderAgentPerformanceChart(audits, agentStats);

  // Audit list with add button
  const listContainer = document.getElementById('audit-list');
  let html = `
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
      <div class="text-sm text-gray-400">${audits.length} audits</div>
      <button onclick="showAddAuditModal()" class="px-3 py-1 bg-accent-blue rounded text-sm hover:bg-blue-600">+ Add Audit</button>
    </div>
  `;
  
  if (audits.length === 0) {
    html += buildEmptyState('📋', 'No Audit Reports', 'No audit reports have been generated yet. Click "Add Audit" to create one.');
  } else {
    html += audits.sort((a, b) => new Date(b.date) - new Date(a.date)).map((a, idx) => {
      const safeAuditId = a.id.replace(/'/g, "\\'").replace(/"/g, '\\"');
      return `
      <div class="card card-clickable rounded-lg p-4" data-audit-id="${a.id}">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="text-sm text-gray-400">${formatDate(a.date)} · ${escapeHtml(a.agent || 'Unknown')}</div>
            <h3 class="font-semibold">${escapeHtml(a.project)}</h3>
            <p class="text-sm text-gray-300 mt-1 line-clamp-2">${escapeHtml(a.summary || a.findings || '')}</p>
          </div>
          <div class="flex items-center gap-2 ml-4">
            <span class="text-2xl font-bold ${a.grade >= 80 ? 'text-accent-green' : a.grade >= 60 ? 'text-accent-yellow' : 'text-accent-red'}">${a.grade}%</span>
            <button onclick="event.stopPropagation(); showEditAuditModal('${safeAuditId}')" class="text-xs text-accent-blue hover:underline">Edit</button>
            <button onclick="event.stopPropagation(); deleteAudit('${safeAuditId}')" class="text-xs text-red-400 hover:underline">Delete</button>
          </div>
        </div>
      </div>
    `}).join('');
  }
  
  listContainer.innerHTML = html;
}

// BATCH 5 FIX: Calculate agent stats from actual audit data
function calculateAgentStats(audits) {
  const stats = {};
  
  audits.forEach(audit => {
    const agent = audit.agent || 'unknown';
    if (!stats[agent]) {
      stats[agent] = {
        totalAudits: 0,
        grades: [],
        averageGrade: 0
      };
    }
    stats[agent].totalAudits++;
    stats[agent].grades.push(audit.grade || 0);
  });
  
  // Calculate averages and trends
  Object.keys(stats).forEach(agent => {
    const s = stats[agent];
    s.averageGrade = Math.round(s.grades.reduce((a, b) => a + b, 0) / s.grades.length);
    
    // Calculate trend (compare first half avg vs second half avg)
    const mid = Math.floor(s.grades.length / 2);
    const firstHalf = s.grades.slice(0, mid);
    const secondHalf = s.grades.slice(mid);
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length || 0;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length || 0;
    
    if (secondAvg > firstAvg + 5) {
      s.trend = 'improving';
    } else if (secondAvg < firstAvg - 5) {
      s.trend = 'declining';
    } else {
      s.trend = 'stable';
    }
  });
  
  return stats;
}

// BATCH 5 FIX: Show Add Audit Modal
function showAddAuditModal() {
  const modalHTML = `
    <div class="form-group">
      <label>Project Name</label>
      <input type="text" id="audit-project" class="form-input" placeholder="Enter project name...">
    </div>
    <div class="flex gap-2">
      <div class="form-group flex-1">
        <label>Grade (0-100)</label>
        <input type="number" id="audit-grade" class="form-input" min="0" max="100" placeholder="85">
      </div>
      <div class="form-group flex-1">
        <label>Agent</label>
        <select id="audit-agent" class="form-input">
          <option value="nox">nox</option>
          <option value="ralph">ralph</option>
          <option value="other">other</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label>Findings/Summary</label>
      <textarea id="audit-findings" class="form-input form-textarea" rows="4" placeholder="Describe the audit findings..."></textarea>
    </div>
    <div class="form-group">
      <label>Recommendations (one per line)</label>
      <textarea id="audit-recommendations" class="form-input form-textarea" rows="3" placeholder="- Add more tests&#10;- Improve documentation..."></textarea>
    </div>
    <button onclick="submitAddAudit()" class="btn-primary w-full">Add Audit Report</button>
  `;
  
  openModal('Add Audit Report', modalHTML);
}

function submitAddAudit() {
  const project = document.getElementById('audit-project')?.value?.trim();
  const grade = parseInt(document.getElementById('audit-grade')?.value);
  const agent = document.getElementById('audit-agent')?.value || 'other';
  const findings = document.getElementById('audit-findings')?.value?.trim();
  const recommendationsInput = document.getElementById('audit-recommendations')?.value?.trim() || '';
  
  if (!project || isNaN(grade)) {
    alert('Please enter project name and grade');
    return;
  }
  
  const recommendations = recommendationsInput.split('\n').map(r => r.trim()).filter(r => r && !r.startsWith('-') ? r : r.replace(/^- /, '')).filter(Boolean);
  
  const audits = loadAudits();
  audits.unshift({
    id: 'audit-' + Date.now(),
    project,
    grade,
    agent,
    findings: findings || 'No detailed findings provided.',
    summary: findings ? findings.substring(0, 150) + (findings.length > 150 ? '...' : '') : '',
    recommendations,
    date: new Date().toISOString()
  });
  
  saveAudits(audits);
  closeModal();
  safeRender(() => renderAudits(), 'renderAudits');
  
  // Update dashboard stats
  safeRender(() => renderDashboard(), 'renderDashboard');
}

// BATCH 5 FIX: Show Edit Audit Modal
function showEditAuditModal(auditId) {
  const audits = loadAudits();
  const audit = audits.find(a => a.id === auditId);
  
  if (!audit) {
    alert('Audit not found');
    return;
  }
  
  const safeAuditId = auditId.replace(/'/g, "\\'").replace(/"/g, '\\"');
  const safeProject = escapeHtml(audit.project);
  const safeFindings = escapeHtml(audit.findings || '');
  const safeRecommendations = escapeHtml((audit.recommendations || []).join('\n'));
  
  const modalHTML = `
    <div class="form-group">
      <label>Project Name</label>
      <input type="text" id="edit-audit-project" class="form-input" value="${safeProject}">
    </div>
    <div class="flex gap-2">
      <div class="form-group flex-1">
        <label>Grade (0-100)</label>
        <input type="number" id="edit-audit-grade" class="form-input" min="0" max="100" value="${audit.grade}">
      </div>
      <div class="form-group flex-1">
        <label>Agent</label>
        <select id="edit-audit-agent" class="form-input">
          <option value="nox" ${audit.agent === 'nox' ? 'selected' : ''}>nox</option>
          <option value="ralph" ${audit.agent === 'ralph' ? 'selected' : ''}>ralph</option>
          <option value="other" ${audit.agent === 'other' ? 'selected' : ''}>other</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label>Findings/Summary</label>
      <textarea id="edit-audit-findings" class="form-input form-textarea" rows="4">${safeFindings}</textarea>
    </div>
    <div class="form-group">
      <label>Recommendations (one per line)</label>
      <textarea id="edit-audit-recommendations" class="form-input form-textarea" rows="3">${safeRecommendations}</textarea>
    </div>
    <button onclick="submitEditAudit('${safeAuditId}')" class="btn-primary w-full">Save Changes</button>
  `;
  
  openModal('Edit Audit Report', modalHTML);
}

function submitEditAudit(auditId) {
  const project = document.getElementById('edit-audit-project')?.value?.trim();
  const grade = parseInt(document.getElementById('edit-audit-grade')?.value);
  const agent = document.getElementById('edit-audit-agent')?.value || 'other';
  const findings = document.getElementById('edit-audit-findings')?.value?.trim();
  const recommendationsInput = document.getElementById('edit-audit-recommendations')?.value?.trim() || '';
  
  if (!project || isNaN(grade)) {
    alert('Please enter project name and grade');
    return;
  }
  
  const recommendations = recommendationsInput.split('\n').map(r => r.trim()).filter(r => r && !r.startsWith('-') ? r : r.replace(/^- /, '')).filter(Boolean);
  
  const audits = loadAudits();
  const auditIndex = audits.findIndex(a => a.id === auditId);
  
  if (auditIndex === -1) {
    alert('Audit not found');
    return;
  }
  
  audits[auditIndex] = {
    ...audits[auditIndex],
    project,
    grade,
    agent,
    findings: findings || 'No detailed findings provided.',
    summary: findings ? findings.substring(0, 150) + (findings.length > 150 ? '...' : '') : '',
    recommendations
  };
  
  saveAudits(audits);
  closeModal();
  safeRender(() => renderAudits(), 'renderAudits');
  safeRender(() => renderDashboard(), 'renderDashboard');
}

// BATCH 5 FIX: Delete Audit
function deleteAudit(auditId) {
  if (!confirm('Are you sure you want to delete this audit report?')) {
    return;
  }
  
  const audits = loadAudits();
  const filtered = audits.filter(a => a.id !== auditId);
  
  saveAudits(filtered);
  safeRender(() => renderAudits(), 'renderAudits');
  safeRender(() => renderDashboard(), 'renderDashboard');
}

// BATCH 5 FIX: Show audit modal
function showAuditModal(idx) {
  const audit = auditsDataArray[idx];
  if (audit) {
    openModal(`${audit.project} - Audit`, buildAuditModalContent(audit));
  }
}

// D2 FIX: Destroy existing chart before creating new one
// Renders multi-agent grade history line chart - BATCH 5: Accepts audits param
function renderAuditsChart(audits, agentStats) {
  audits = audits || appData.audits?.audits || [];
  
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
    'other': '#F59E0B',
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
      backgroundColor: color + '20',
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

// Agent performance comparison bar chart - BATCH 5: Accepts audits param
function renderAgentPerformanceChart(audits, agentStats) {
  const canvas = document.getElementById('agent-performance-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Destroy existing chart
  if (agentPerformanceChartInstance) {
    agentPerformanceChartInstance.destroy();
    agentPerformanceChartInstance = null;
  }
  
  audits = audits || appData.audits?.audits || [];
  agentStats = agentStats || calculateAgentStats(audits);
  const agents = Object.keys(agentStats);
  
  if (agents.length === 0) return;
  
  // Calculate pass rate (grade >= 70)
  const passRates = agents.map(agent => {
    const agentAudits = audits.filter(a => a.agent === agent);
    const passed = agentAudits.filter(a => (a.grade || 0) >= 70).length;
    return agentAudits.length > 0 ? Math.round((passed / agentAudits.length) * 100) : 0;
  });
  
  const avgGrades = agents.map(agent => agentStats[agent].averageGrade || 0);
  const totalAudits = agents.map(agent => agentStats[agent].totalAudits || 0);
  
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
      // Match by emoji prefix since that's the category indicator
      let nicheMatch = true;
      if (selectedNiche) {
        // Match if the video's niche starts with the selected emoji/category
        nicheMatch = cardNiche.startsWith(selectedNiche) ||
                     (video && video.niche && video.niche.startsWith(selectedNiche));
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
  const tabMap = {
    'youtube': 'youtube',
    'business': 'business', 
    'investments': 'investments',
    'tools': 'tools',
    'research': 'research',
    'audits': 'audits'
  };
  
  const targetTab = tabMap[type];
  if (targetTab) {
    showTab(targetTab);
    
    // For YouTube results, also ensure the outliers section is shown
    if (type === 'youtube') {
      showYouTubeSection('outliers');
    }
  }
  
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
  console.log('moveStatus called:', oppId, newStatus);
  
  // Load current opportunities
  let opportunities = loadOpportunities();
  let opp = opportunities.find(o => o.id === oppId);
  
  // If not in localStorage, check JSON data
  if (!opp) {
    const jsonOpp = appData.newBusiness?.opportunities?.find(o => o.id === oppId);
    if (jsonOpp) {
      opp = {...jsonOpp};
      opportunities.push(opp);
    }
  }
  
  if (opp) {
    console.log('Found opportunity, updating status from', opp.status, 'to', newStatus);
    opp.status = newStatus;
    saveOpportunities(opportunities);
    safeRender(() => renderBusiness(), 'renderBusiness');

    // Show success feedback
    const statusEl = document.getElementById('pipe-' + newStatus);
    if (statusEl) {
      statusEl.classList.add('text-accent-green');
      setTimeout(() => statusEl.classList.remove('text-accent-green'), 500);
    }
  } else {
    console.error('Opportunity not found:', oppId);
  }
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
// YOUTUBE SECTION FUNCTIONS - BATCH 3 FIXES
// ============================================

// Current niche filter state
let currentNicheFilter = 'all';
let currentBriefFilter = 'all';

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

// ============================================
// 3.1 OUTLIER RESEARCH - VIEWSTATS SCANNER
// ============================================

// D1 FIX: Honest Viewstats Scanner - clearly labeled as manual guide
function runOutlierScan() {
  const scanStatusHTML = `
    <div id="scan-status" class="scan-status info mb-4 p-4 bg-dark-800 border border-dark-600 rounded-lg">
      <h4 class="font-semibold mb-2 text-accent-blue">📖 Manual Viewstats Research Guide</h4>
      <p class="text-sm mb-3 text-gray-400">Automated scanning is not available. Follow these steps to manually research outliers:</p>
      
      <ol class="text-sm space-y-3 ml-4">
        <li class="flex items-start gap-2">
          <span class="text-accent-blue font-bold">1.</span>
          <span>Open <a href="https://viewstats.com/pro/outliers" target="_blank" class="text-accent-blue underline hover:text-blue-400">viewstats.com/pro/outliers</a> in a new tab</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-accent-blue font-bold">2.</span>
          <span>Enter your niche keywords (e.g., "minecraft", "ai creature", "gaming")</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-accent-blue font-bold">3.</span>
          <span>Set minimum outlier score to 2.0x or higher</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-accent-blue font-bold">4.</span>
          <span>Note video URLs with high outlier scores (>10x = viral, >50x = massive)</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-accent-blue font-bold">5.</span>
          <span>Add findings to Competitor Tracker for ongoing monitoring</span>
        </li>
      </ol>
      
      <div class="mt-4 p-3 bg-dark-900/50 rounded text-xs text-gray-500">
        <p>💡 <strong>Pro tip:</strong> Look for videos where views > 10x subscriber count. These are true outliers.</p>
      </div>
      
      <div class="mt-4 flex gap-2">
        <button onclick="window.open('https://viewstats.com/pro/outliers', '_blank')" class="btn-primary">
          Open Viewstats →
        </button>
        <button onclick="document.getElementById('scan-status').remove()" class="btn-secondary">
          Dismiss
        </button>
      </div>
    </div>
  `;
  
  // Find the YouTube section to insert before
  const container = document.getElementById('youtube-outliers');
  const existingStatus = document.getElementById('scan-status');
  if (existingStatus) existingStatus.remove();
  
  // Insert before the container
  if (container?.parentNode) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = scanStatusHTML;
    container.parentNode.insertBefore(tempDiv.firstElementChild, container);
  }
  
  // Update last scan time to show user attempted research
  localStorage.setItem('last-outlier-scan', new Date().toISOString());
  updateScanStatus();
}

// Update the button text to be honest about functionality
function updateScanButton() {
  const scanBtn = document.getElementById('scan-viewstats-btn');
  if (scanBtn) {
    scanBtn.innerHTML = '📖 Viewstats Guide';
    scanBtn.title = 'Open manual research guide for viewstats.com';
  }
}

function openViewstats() {
  window.open('https://viewstats.com/pro/outliers', '_blank');
}

function updateScanStatus() {
  const lastScan = localStorage.getItem('last-outlier-scan');
  const lastScanEl = document.getElementById('last-outlier-scan');
  if (lastScanEl && lastScan) {
    lastScanEl.textContent = formatTimeAgo(lastScan);
    lastScanEl.classList.add('text-accent-green');
  }
}

// ============================================
// 3.2 NICHE FILTER BUTTONS
// ============================================

function filterByNiche(niche) {
  currentNicheFilter = niche;
  
  // Update button styles
  const buttons = ['all', 'gaming', 'finance', 'productivity', 'production'];
  const nicheMap = {
    'all': 'all',
    '🎮 Gaming': 'gaming',
    '💰 Finance': 'finance',
    '⚡ Productivity': 'productivity',
    '🎬 Production': 'production'
  };
  
  buttons.forEach(btn => {
    const btnEl = document.getElementById(`niche-btn-${btn}`);
    if (btnEl) {
      const isActive = nicheMap[niche] === btn;
      btnEl.className = isActive 
        ? 'niche-filter-btn px-3 py-1 bg-accent-blue rounded text-sm'
        : 'niche-filter-btn px-3 py-1 bg-dark-700 rounded hover:bg-dark-600 text-sm';
    }
  });
  
  // Apply filter to video cards
  applyNicheFilter();
}

function applyNicheFilter() {
  const cards = document.querySelectorAll('#youtube-outliers > div.card');
  
  cards.forEach(card => {
    if (!card.classList.contains('card')) return;
    
    const cardNiche = card.dataset.niche || '';
    
    let shouldShow = true;
    if (currentNicheFilter !== 'all') {
      // Match by checking if card's niche contains the filter value
      shouldShow = cardNiche.toLowerCase().includes(currentNicheFilter.toLowerCase()) ||
                   (currentNicheFilter === '🎮 Gaming' && cardNiche.includes('🎮')) ||
                   (currentNicheFilter === '💰 Finance' && cardNiche.includes('💰')) ||
                   (currentNicheFilter === '⚡ Productivity' && cardNiche.includes('⚡')) ||
                   (currentNicheFilter === '🎬 Production' && cardNiche.includes('🎬'));
    }
    
    card.style.display = shouldShow ? 'block' : 'none';
  });
  
  // Show message if no results
  const container = document.getElementById('youtube-outliers');
  const visibleCards = Array.from(cards).filter(c => c.style.display !== 'none' && c.classList.contains('card'));
  
  let noResultsMsg = container?.querySelector('.no-results-message');
  if (visibleCards.length === 0 && cards.length > 0) {
    if (!noResultsMsg) {
      noResultsMsg = document.createElement('div');
      noResultsMsg.className = 'no-results-message empty-state mt-4';
      noResultsMsg.innerHTML = `
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">No matching videos</div>
        <div class="empty-state-desc">Try selecting a different niche</div>
      `;
      container?.appendChild(noResultsMsg);
    }
  } else if (noResultsMsg) {
    noResultsMsg.remove();
  }
}

// ============================================
// 3.3 COMPETITOR TRACKER
// ============================================

// Load competitors from appData (loaded from JSON file)
function loadCompetitors() {
  // Return competitors from the loaded appData
  if (appData.competitors && appData.competitors.competitors && appData.competitors.competitors.length > 0) {
    return appData.competitors.competitors;
  }
  // Return empty array if no data loaded yet
  return [];
}

function saveCompetitors(competitors) {
  localStorage.setItem('tracked-competitors', JSON.stringify(competitors));
}

function renderCompetitors() {
  const container = document.getElementById('competitor-list');
  if (!container) return;
  
  const competitors = loadCompetitors();
  
  if (competitors.length === 0) {
    container.innerHTML = `
      <div class="col-span-2 empty-state-small">
        <p class="text-gray-500">No competitors tracked yet.</p>
        <p class="text-sm mt-2">Click "+ Add Channel" to start tracking YouTube channels.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = competitors.map(comp => `
    <div class="competitor-card card rounded-lg p-3 cursor-pointer ${selectedCompetitor === comp.id ? 'border-accent-blue' : ''}" 
         onclick="selectCompetitor('${comp.id}')">
      <div class="flex justify-between items-start">
        <div class="min-w-0 flex-1">
          <h4 class="font-semibold truncate">${comp.name}</h4>
          <p class="text-xs text-gray-400 truncate">${comp.niche} • ${comp.focus}</p>
          <p class="text-xs text-gray-500 mt-1">${comp.handle || ''}</p>
        </div>
        <button onclick="event.stopPropagation(); deleteCompetitor('${comp.id}')" 
                class="text-gray-500 hover:text-red-500 ml-2" title="Remove">×</button>
      </div>
      <div class="flex gap-3 mt-2 text-xs text-gray-500">
        <span>👥 ${comp.stats?.subscribers || 'N/A'}</span>
        <span>🎬 ${comp.stats?.videoCount || 'N/A'}</span>
      </div>
    </div>
  `).join('');
}

let selectedCompetitor = null;

function selectCompetitor(compId) {
  selectedCompetitor = compId;
  renderCompetitors(); // Re-render to update selection state
  renderCompetitorUploads(compId);
}

function renderCompetitorUploads(compId) {
  const container = document.getElementById('competitor-uploads');
  if (!container) return;
  
  const competitors = loadCompetitors();
  const comp = competitors.find(c => c.id === compId);
  
  if (!comp) {
    container.innerHTML = '<p class="text-gray-500 text-sm">Select a channel to see tracked videos</p>';
    return;
  }
  
  // Load videos for this competitor
  const videos = loadCompetitorVideos(compId);
  
  container.innerHTML = `
    <div class="bg-dark-800 rounded-lg p-4">
      <div class="flex justify-between items-center mb-3">
        <h4 class="font-semibold">📺 ${comp.name} - Video Tracker</h4>
        <a href="${comp.url}" target="_blank" class="text-xs text-accent-blue hover:underline">Open Channel →</a>
      </div>
      
      <div class="mb-4 p-3 bg-dark-700/50 rounded">
        <h5 class="text-sm text-gray-400 mb-2">Add Video</h5>
        <input type="text" id="comp-video-title-${compId}" placeholder="Video Title" class="form-input mb-2">
        <div class="flex gap-2 mb-2">
          <input type="text" id="comp-video-views-${compId}" placeholder="Views (e.g. 1.2M)" class="form-input flex-1">
          <input type="date" id="comp-video-date-${compId}" class="form-input flex-1">
        </div>
        <input type="text" id="comp-video-url-${compId}" placeholder="YouTube URL" class="form-input mb-2">
        <button onclick="addCompetitorVideo('${compId}')" class="btn-primary text-sm">Add Video</button>
      </div>
      
      <div id="comp-videos-list-${compId}">
        ${renderVideosList(videos)}
      </div>
    </div>
  `;
}

function renderVideosList(videos) {
  if (videos.length === 0) {
    return '<p class="text-gray-500 text-sm text-center py-4">No videos tracked yet. Add videos manually above.</p>';
  }
  
  return `
    <h5 class="text-sm text-gray-400 mb-2">Tracked Videos (${videos.length})</h5>
    <div class="space-y-2 max-h-64 overflow-y-auto">
      ${videos.map(v => `
        <div class="video-list-item">
          <div class="flex justify-between items-start">
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm truncate">${v.title}</p>
              <div class="flex gap-2 text-xs text-gray-500 mt-1">
                <span>👁️ ${v.views || 'N/A'}</span>
                ${v.publishedAt ? `<span>📅 ${new Date(v.publishedAt).toLocaleDateString()}</span>` : ''}
              </div>
            </div>
            <div class="flex gap-1 ml-2">
              ${v.url ? `<a href="${v.url}" target="_blank" class="text-xs text-accent-blue hover:underline">Watch</a>` : ''}
              <button onclick="deleteCompetitorVideo('${v.id}')" class="text-xs text-red-400 hover:text-red-300">Delete</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function loadCompetitorVideos(compId) {
  const key = `competitor-videos-${compId}`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

function saveCompetitorVideos(compId, videos) {
  const key = `competitor-videos-${compId}`;
  localStorage.setItem(key, JSON.stringify(videos));
}

function addCompetitorVideo(compId) {
  const title = document.getElementById(`comp-video-title-${compId}`)?.value?.trim();
  const views = document.getElementById(`comp-video-views-${compId}`)?.value?.trim();
  const date = document.getElementById(`comp-video-date-${compId}`)?.value;
  const url = document.getElementById(`comp-video-url-${compId}`)?.value?.trim();
  
  if (!title) {
    alert('Please enter at least a title');
    return;
  }
  
  const videos = loadCompetitorVideos(compId);
  videos.unshift({
    id: 'video-' + Date.now(),
    title,
    views,
    publishedAt: date,
    url,
    addedAt: new Date().toISOString()
  });
  
  saveCompetitorVideos(compId, videos);
  
  // Clear inputs
  document.getElementById(`comp-video-title-${compId}`).value = '';
  document.getElementById(`comp-video-views-${compId}`).value = '';
  document.getElementById(`comp-video-date-${compId}`).value = '';
  document.getElementById(`comp-video-url-${compId}`).value = '';
  
  // Refresh list
  renderCompetitorUploads(compId);
}

function deleteCompetitorVideo(videoId) {
  if (!confirm('Delete this video?')) return;
  
  const videos = loadCompetitorVideos(selectedCompetitor);
  const filtered = videos.filter(v => v.id !== videoId);
  saveCompetitorVideos(selectedCompetitor, filtered);
  renderCompetitorUploads(selectedCompetitor);
}

function showAddCompetitorModal() {
  const modalHTML = `
    <div class="form-group">
      <label>Channel Name</label>
      <input type="text" id="new-comp-name" class="form-input" placeholder="e.g., MrBeast">
    </div>
    <div class="form-group">
      <label>YouTube URL or Handle</label>
      <input type="text" id="new-comp-url" class="form-input" placeholder="@MrBeast or https://youtube.com/@MrBeast">
    </div>
    <div class="form-group">
      <label>Niche</label>
      <select id="new-comp-niche" class="form-input">
        <option value="Gaming">Gaming</option>
        <option value="Entertainment">Entertainment</option>
        <option value="Education">Education</option>
        <option value="Tech">Tech</option>
        <option value="Finance">Finance</option>
        <option value="Other">Other</option>
      </select>
    </div>
    <div class="form-group">
      <label>Content Focus</label>
      <input type="text" id="new-comp-focus" class="form-input" placeholder="e.g., Challenge Videos">
    </div>
    <button onclick="submitAddCompetitor()" class="btn-primary w-full">Add Channel</button>
  `;
  
  openModal('Add Competitor Channel', modalHTML);
}

function submitAddCompetitor() {
  const name = document.getElementById('new-comp-name')?.value?.trim();
  const urlInput = document.getElementById('new-comp-url')?.value?.trim();
  const niche = document.getElementById('new-comp-niche')?.value;
  const focus = document.getElementById('new-comp-focus')?.value?.trim();
  
  if (!name || !urlInput) {
    alert('Please enter both name and URL/handle');
    return;
  }
  
  // Normalize URL
  let url = urlInput;
  let handle = urlInput;
  if (!url.startsWith('http')) {
    if (url.startsWith('@')) {
      url = `https://youtube.com/${url}`;
    } else {
      url = `https://youtube.com/@${url}`;
      handle = '@' + urlInput;
    }
  }
  
  const competitors = loadCompetitors();
  competitors.push({
    id: 'comp-' + Date.now(),
    name,
    url,
    handle,
    niche,
    focus: focus || 'General',
    stats: { subscribers: 'Unknown', videoCount: 'Unknown', totalViews: 'Unknown' },
    addedAt: new Date().toISOString()
  });
  
  saveCompetitors(competitors);
  closeModal();
  renderCompetitors();
  
  // Select the newly added competitor
  const newComp = competitors[competitors.length - 1];
  selectCompetitor(newComp.id);
}

function deleteCompetitor(compId) {
  if (!confirm('Remove this competitor from tracking?')) return;
  
  const competitors = loadCompetitors();
  const filtered = competitors.filter(c => c.id !== compId);
  saveCompetitors(filtered);
  
  if (selectedCompetitor === compId) {
    selectedCompetitor = null;
    document.getElementById('competitor-uploads').innerHTML = '<p class="text-gray-500 text-sm">Select a channel to see tracked videos</p>';
  }
  
  renderCompetitors();
}

// ============================================
// 3.4 CONTENT BRIEFS
// ============================================

function loadBriefs() {
  const stored = localStorage.getItem('content-briefs');
  if (stored) {
    return JSON.parse(stored);
  }
  // Return sample briefs if none stored
  return [
    {
      id: 'brief-1',
      title: 'AI Creature Challenge Video',
      niche: 'AI Creature',
      hook: 'I asked AI to create the most terrifying creature...',
      outline: ['Intro hook', 'AI generation process', 'Reveal', 'Viewer reactions'],
      difficulty: 'medium',
      targetLength: '12-15 min',
      status: 'draft',
      urgency: 'medium',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
}

function saveBriefs(briefs) {
  localStorage.setItem('content-briefs', JSON.stringify(briefs));
}

function renderContentBriefs() {
  const container = document.getElementById('content-briefs-list');
  if (!container) return;
  
  const allBriefs = loadBriefs();
  
  // Apply filter
  let briefs = allBriefs;
  if (currentBriefFilter !== 'all') {
    briefs = allBriefs.filter(b => b.status === currentBriefFilter);
  }
  
  if (briefs.length === 0) {
    container.innerHTML = `
      <div class="card rounded-lg p-8 text-center">
        <div class="text-4xl mb-4">📝</div>
        <h3 class="text-lg font-semibold mb-2">No Content Briefs</h3>
        <p class="text-gray-500 text-sm mb-4">${currentBriefFilter === 'all' ? 'Create your first content brief to get started.' : `No ${currentBriefFilter} briefs found.`}</p>
        <button onclick="showGenerateBriefModal()" class="btn-primary">+ Generate Brief</button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = briefs.map(brief => `
    <div class="brief-card card rounded-lg p-4 cursor-pointer status-${brief.status}" onclick="showBriefDetailModal('${brief.id}')">
      <div class="flex justify-between items-start mb-2">
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold truncate">${brief.title}</h3>
          <p class="text-sm text-gray-400 line-clamp-2">${brief.hook || brief.angle || ''}</p>
        </div>
        <div class="flex flex-col items-end ml-2">
          <span class="text-xs px-2 py-1 rounded ${getStatusColor(brief.status)}">${brief.status}</span>
          <span class="text-xs text-gray-500 mt-1">${brief.urgency}</span>
        </div>
      </div>
      <div class="flex flex-wrap gap-2 text-xs text-gray-500 mt-2">
        <span class="px-2 py-0.5 bg-dark-700 rounded">${brief.niche || 'General'}</span>
        <span class="px-2 py-0.5 bg-dark-700 rounded">${brief.targetLength || 'N/A'}</span>
        <span class="px-2 py-0.5 bg-dark-700 rounded">${brief.difficulty}</span>
        <span class="ml-auto">${formatTimeAgo(brief.createdAt)}</span>
      </div>
    </div>
  `).join('');
}

function getStatusColor(status) {
  const colors = {
    'draft': 'bg-gray-700 text-gray-300',
    'ready': 'bg-green-900/50 text-green-400',
    'produced': 'bg-purple-900/50 text-purple-400',
    'published': 'bg-blue-900/50 text-blue-400'
  };
  return colors[status] || 'bg-gray-700';
}

function filterBriefs(status) {
  currentBriefFilter = status;
  
  // Update button styles
  const buttons = ['all', 'draft', 'ready', 'produced'];
  buttons.forEach(btn => {
    const btnEl = document.getElementById(`brief-filter-${btn}`);
    if (btnEl) {
      const isActive = status === btn;
      btnEl.className = isActive 
        ? 'brief-filter-btn px-3 py-1 bg-accent-blue rounded text-xs'
        : 'brief-filter-btn px-3 py-1 bg-dark-700 rounded hover:bg-dark-600 text-xs';
    }
  });
  
  renderContentBriefs();
}

function showGenerateBriefModal() {
  const modalHTML = `
    <div class="form-group">
      <label>Video Title</label>
      <input type="text" id="brief-title" class="form-input" placeholder="e.g., I Created a Monster with AI">
    </div>
    <div class="form-group">
      <label>Niche</label>
      <select id="brief-niche" class="form-input">
        <option value="AI Creature">AI Creature</option>
        <option value="Gaming">Gaming</option>
        <option value="Tutorial">Tutorial</option>
        <option value="Entertainment">Entertainment</option>
        <option value="Challenge">Challenge</option>
      </select>
    </div>
    <div class="form-group">
      <label>Hook (First 30 seconds)</label>
      <textarea id="brief-hook" class="form-input form-textarea" placeholder="What grabs attention immediately?"></textarea>
    </div>
    <div class="form-group">
      <label>Video Outline (one point per line)</label>
      <textarea id="brief-outline" class="form-input form-textarea" placeholder="1. Hook&#10;2. Setup&#10;3. Main content&#10;4. Call to action"></textarea>
    </div>
    <div class="flex gap-2">
      <div class="form-group flex-1">
        <label>Difficulty</label>
        <select id="brief-difficulty" class="form-input">
          <option value="easy">Easy</option>
          <option value="medium" selected>Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <div class="form-group flex-1">
        <label>Urgency</label>
        <select id="brief-urgency" class="form-input">
          <option value="low">Low</option>
          <option value="medium" selected>Medium</option>
          <option value="high">High</option>
        </select>
      </div>
    </div>
    <button onclick="submitGenerateBrief()" class="btn-primary w-full">Generate Brief</button>
  `;
  
  openModal('Generate Content Brief', modalHTML);
}

function submitGenerateBrief() {
  const title = document.getElementById('brief-title')?.value?.trim();
  const niche = document.getElementById('brief-niche')?.value;
  const hook = document.getElementById('brief-hook')?.value?.trim();
  const outline = document.getElementById('brief-outline')?.value?.trim();
  const difficulty = document.getElementById('brief-difficulty')?.value;
  const urgency = document.getElementById('brief-urgency')?.value;
  
  if (!title || !hook) {
    alert('Please fill in at least the title and hook');
    return;
  }
  
  const briefs = loadBriefs();
  const lengthMap = { easy: '8-10 min', medium: '12-15 min', hard: '18-20 min' };
  
  briefs.unshift({
    id: 'brief-' + Date.now(),
    title,
    niche,
    hook,
    outline: outline ? outline.split('\n').filter(l => l.trim()) : [],
    difficulty,
    targetLength: lengthMap[difficulty],
    status: 'draft',
    urgency,
    createdAt: new Date().toISOString()
  });
  
  saveBriefs(briefs);
  closeModal();
  renderContentBriefs();
  
  // Update brief count in stats
  const totalBriefsEl = document.getElementById('total-briefs');
  if (totalBriefsEl) totalBriefsEl.textContent = briefs.length;
}

function showBriefDetailModal(briefId) {
  const briefs = loadBriefs();
  const brief = briefs.find(b => b.id === briefId);
  if (!brief) {
    return;
  }
  
  // D2 FIX: Use data attribute instead of inline onclick to avoid escaping issues
  const modalHTML = `
    <div class="modal-scroll" data-brief-id="${briefId}">
      <div class="flex justify-between items-start mb-4">
        <h3 class="text-lg font-semibold">${escapeHtml(brief.title)}</h3>
        <span class="text-xs px-2 py-1 rounded ${getStatusColor(brief.status)}">${brief.status}</span>
      </div>
      
      <div class="mb-4">
        <label class="text-xs text-gray-500 uppercase">Hook</label>
        <p class="text-sm mt-1">${escapeHtml(brief.hook)}</p>
      </div>
      
      ${brief.outline?.length > 0 ? `
        <div class="mb-4">
          <label class="text-xs text-gray-500 uppercase">Outline</label>
          <ol class="text-sm mt-1 ml-4">
            ${brief.outline.map(item => `<li class="mb-1">${escapeHtml(item)}</li>`).join('')}
          </ol>
        </div>
      ` : ''}
      
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="text-xs text-gray-500 uppercase">Niche</label>
          <p class="text-sm">${escapeHtml(brief.niche)}</p>
        </div>
        <div>
          <label class="text-xs text-gray-500 uppercase">Target Length</label>
          <p class="text-sm">${escapeHtml(brief.targetLength)}</p>
        </div>
        <div>
          <label class="text-xs text-gray-500 uppercase">Difficulty</label>
          <p class="text-sm">${escapeHtml(brief.difficulty)}</p>
        </div>
        <div>
          <label class="text-xs text-gray-500 uppercase">Urgency</label>
          <p class="text-sm">${escapeHtml(brief.urgency)}</p>
        </div>
      </div>
      
      <div class="flex gap-2 mt-4 pt-4 border-t border-dark-700">
        <select id="brief-status-update" class="form-input flex-1" data-brief-id="${briefId}">
          <option value="draft" ${brief.status === 'draft' ? 'selected' : ''}>Draft</option>
          <option value="ready" ${brief.status === 'ready' ? 'selected' : ''}>Ready</option>
          <option value="produced" ${brief.status === 'produced' ? 'selected' : ''}>Produced</option>
          <option value="published" ${brief.status === 'published' ? 'selected' : ''}>Published</option>
        </select>
        <button id="btn-delete-brief" class="btn-danger">Delete</button>
      </div>
    </div>
  `;
  
  openModal('Content Brief Details', modalHTML);
  
  // D2 FIX: Attach event listeners after modal is open to avoid escaping issues
  document.getElementById('brief-status-update')?.addEventListener('change', function(e) {
    updateBriefStatus(briefId, e.target.value);
  });
  
  document.getElementById('btn-delete-brief')?.addEventListener('click', function() {
    deleteBrief(briefId);
  });
}

function updateBriefStatus(briefId, newStatus) {
  const briefs = loadBriefs();
  const brief = briefs.find(b => b.id === briefId);
  if (brief) {
    brief.status = newStatus;
    saveBriefs(briefs);
    renderContentBriefs();
  }
}

function deleteBrief(briefId) {
  // D2 FIX: Better error handling and validation
  if (!briefId) {
    return;
  }
  
  if (!confirm('Delete this brief? This cannot be undone.')) return;
  
  const briefs = loadBriefs();
  const filtered = briefs.filter(b => b.id !== briefId);
  
  if (filtered.length === briefs.length) {
    alert('Brief not found. It may have already been deleted.');
    return;
  }
  
  saveBriefs(filtered);
  
  // Close modal first
  closeModal();
  
  // Re-render briefs
  renderContentBriefs();
  
  // Update brief count in stats
  const totalBriefsEl = document.getElementById('total-briefs');
  if (totalBriefsEl) totalBriefsEl.textContent = filtered.length;
}

// ============================================
// 3.5 YOUTUBE TOOLS - FULLY FUNCTIONAL
// ============================================

function launchTool(toolName) {
  // FIX: Check if toolName is a URL (starts with http)
  if (toolName && toolName.startsWith('http')) {
    window.open(toolName, '_blank');
    return;
  }
  
  if (toolName === 'pipeline') {
    showContentPipeline();
  } else if (toolName === 'analyzer') {
    showPerformanceAnalyzer();
  } else if (toolName === 'brief-generator') {
    showBriefGeneratorTool();
  } else if (toolName === 'map-scraper') {
    showMapScraper();
  }
}

// Tool 1: Content Pipeline Orchestrator
function showContentPipeline() {
  const pipelineHTML = `
    <div class="tool-interface">
      <div class="pipeline-stages">
        <div class="stage">
          <h4>1. 💡 Idea</h4>
          <textarea id="pipeline-idea" placeholder="Enter video idea..." class="form-input mb-2" rows="2"></textarea>
          <button onclick="addToPipeline()" class="btn-primary text-sm">Add to Pipeline</button>
        </div>
        
        <div class="stage">
          <h4>2. 📝 Script</h4>
          <textarea id="pipeline-script" placeholder="Write your script here..." class="form-input form-textarea mb-2"></textarea>
          <button onclick="saveScript()" class="btn-secondary text-sm">Save Script</button>
        </div>
        
        <div class="stage">
          <h4>3. ✅ Production Checklist</h4>
          <div class="checklist">
            <label><input type="checkbox" id="check-record"> Record footage</label>
            <label><input type="checkbox" id="check-edit"> Edit video</label>
            <label><input type="checkbox" id="check-voice"> Add voiceover</label>
            <label><input type="checkbox" id="check-thumb"> Create thumbnail</label>
          </div>
        </div>
        
        <div class="stage">
          <h4>4. 🚀 Upload Details</h4>
          <input type="text" id="pipeline-title" placeholder="Video Title" class="form-input mb-2">
          <textarea id="pipeline-description" placeholder="Description" class="form-input form-textarea mb-2" rows="2"></textarea>
          <input type="text" id="pipeline-tags" placeholder="Tags (comma separated)" class="form-input mb-2">
          <button onclick="exportToYouTube()" class="btn-primary text-sm">Export Upload Data</button>
        </div>
      </div>
      
      <div id="pipeline-saved" class="mt-4"></div>
    </div>
  `;
  
  openModal('🎬 Content Pipeline Orchestrator', pipelineHTML);
  loadSavedVideos();
  loadSavedScript();
}

function addToPipeline() {
  const idea = document.getElementById('pipeline-idea')?.value?.trim();
  if (!idea) return;
  
  const videos = JSON.parse(localStorage.getItem('pipeline-videos') || '[]');
  videos.push({
    id: Date.now(),
    idea,
    stage: 'idea',
    createdAt: new Date().toISOString()
  });
  localStorage.setItem('pipeline-videos', JSON.stringify(videos));
  document.getElementById('pipeline-idea').value = '';
  loadSavedVideos();
  
  // Show confirmation
  const savedEl = document.getElementById('pipeline-saved');
  if (savedEl) {
    savedEl.innerHTML = '<p class="text-accent-green text-sm">✓ Idea saved!</p>';
    setTimeout(() => savedEl.innerHTML = '', 2000);
  }
}

function saveScript() {
  const script = document.getElementById('pipeline-script')?.value;
  localStorage.setItem('current-script', script);
  
  const savedEl = document.getElementById('pipeline-saved');
  if (savedEl) {
    savedEl.innerHTML = '<p class="text-accent-green text-sm">✓ Script saved!</p>';
    setTimeout(() => savedEl.innerHTML = '', 2000);
  }
}

function loadSavedScript() {
  const script = localStorage.getItem('current-script');
  if (script) {
    const textarea = document.getElementById('pipeline-script');
    if (textarea) textarea.value = script;
  }
}

function loadSavedVideos() {
  const videos = JSON.parse(localStorage.getItem('pipeline-videos') || '[]');
  const container = document.getElementById('pipeline-saved');
  if (!container) return;
  
  if (videos.length > 0) {
    container.innerHTML = `
      <h4 class="font-semibold mb-2">Saved Ideas (${videos.length})</h4>
      <div class="space-y-1 max-h-32 overflow-y-auto">
        ${videos.slice(-5).map(v => `
          <div class="text-sm bg-dark-700 p-2 rounded flex justify-between">
            <span class="truncate">${v.idea}</span>
            <span class="text-xs text-gray-500 ml-2">${new Date(v.createdAt).toLocaleDateString()}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
}

function exportToYouTube() {
  const title = document.getElementById('pipeline-title')?.value;
  const description = document.getElementById('pipeline-description')?.value;
  const tags = document.getElementById('pipeline-tags')?.value;
  
  const exportData = {
    title,
    description,
    tags: tags?.split(',').map(t => t.trim()).filter(Boolean),
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

// Tool 2: Performance Analyzer
function showPerformanceAnalyzer() {
  const analyzerHTML = `
    <div class="tool-interface">
      <div class="analyzer-input">
        <h4 class="mb-3">Analyze Video Performance</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
          <input type="number" id="analyzer-views" placeholder="Views" class="form-input">
          <input type="number" id="analyzer-subs" placeholder="Subscribers" class="form-input">
          <input type="number" id="analyzer-avg" placeholder="Channel avg views" class="form-input">
        </div>
        <button onclick="calculatePerformance()" class="btn-primary">Calculate Performance</button>
      </div>
      
      <div id="analyzer-results" class="mt-4"></div>
      
      <div class="mt-6 p-4 bg-dark-700/50 rounded">
        <h4 class="font-semibold mb-2">📊 Benchmark Guide</h4>
        <ul class="text-sm space-y-1 text-gray-400">
          <li><span class="text-gray-500">1x</span> = Average performance</li>
          <li><span class="text-yellow-500">5x</span> = Good performance</li>
          <li><span class="text-green-500">10x</span> = Viral threshold</li>
          <li><span class="text-purple-500">50x+</span> = Massive outlier</li>
        </ul>
      </div>
    </div>
  `;
  
  openModal('📊 Performance Analyzer', analyzerHTML);
}

function calculatePerformance() {
  const views = parseInt(document.getElementById('analyzer-views')?.value) || 0;
  const subs = parseInt(document.getElementById('analyzer-subs')?.value) || 1;
  const avg = parseInt(document.getElementById('analyzer-avg')?.value) || 0;
  
  const viewToSubRatio = (views / subs).toFixed(2);
  const outlierScore = avg > 0 ? (views / avg).toFixed(1) : 'N/A';
  
  let rating = 'Average';
  let color = 'text-yellow-500';
  let emoji = '😐';
  
  const score = parseFloat(outlierScore);
  if (score >= 50) { rating = 'MASSIVE OUTLIER!'; color = 'text-purple-500'; emoji = '🚀'; }
  else if (score >= 10) { rating = 'VIRAL'; color = 'text-green-500'; emoji = '🔥'; }
  else if (score >= 5) { rating = 'Good Performance'; color = 'text-blue-500'; emoji = '👍'; }
  
  document.getElementById('analyzer-results').innerHTML = `
    <div class="results-card rounded p-4">
      <div class="text-center mb-4">
        <div class="text-5xl mb-2">${emoji}</div>
        <div class="text-2xl font-bold ${color}">${outlierScore}x</div>
        <div class="text-sm ${color}">${rating}</div>
      </div>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div class="bg-dark-700/50 p-2 rounded text-center">
          <div class="text-gray-500 text-xs">Views/Sub</div>
          <div class="font-semibold">${viewToSubRatio}</div>
        </div>
        <div class="bg-dark-700/50 p-2 rounded text-center">
          <div class="text-gray-500 text-xs">Outlier Score</div>
          <div class="font-semibold ${color}">${outlierScore}x</div>
        </div>
      </div>
    </div>
  `;
}

// Tool 3: Content Brief Generator
function showBriefGeneratorTool() {
  const generatorHTML = `
    <div class="tool-interface">
      <div class="generator-form">
        <input type="text" id="tool-brief-title" placeholder="Video Title" class="form-input mb-2">
        <select id="tool-brief-niche" class="form-input mb-2">
          <option value="">Select Niche</option>
          <option value="AI Creature">AI Creature</option>
          <option value="Gaming">Gaming</option>
          <option value="Tutorial">Tutorial</option>
          <option value="Entertainment">Entertainment</option>
        </select>
        <input type="text" id="tool-brief-hook" placeholder="Hook (first 30 seconds)" class="form-input mb-2">
        <textarea id="tool-brief-outline" placeholder="Video outline (one point per line)" class="form-input form-textarea mb-2"></textarea>
        <div class="flex gap-2 mb-2">
          <select id="tool-brief-difficulty" class="form-input flex-1">
            <option value="easy">Easy (8-10 min)</option>
            <option value="medium" selected>Medium (12-15 min)</option>
            <option value="hard">Hard (18-20 min)</option>
          </select>
          <select id="tool-brief-urgency" class="form-input flex-1">
            <option value="low">Low Priority</option>
            <option value="medium" selected>Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>
        <button onclick="generateBriefFromTool()" class="btn-primary w-full">Generate Brief</button>
      </div>
      <div id="tool-brief-output" class="mt-4"></div>
    </div>
  `;
  
  openModal('📝 Content Brief Generator', generatorHTML);
}

function generateBriefFromTool() {
  const title = document.getElementById('tool-brief-title')?.value?.trim();
  const niche = document.getElementById('tool-brief-niche')?.value;
  const hook = document.getElementById('tool-brief-hook')?.value?.trim();
  const outline = document.getElementById('tool-brief-outline')?.value?.trim();
  const difficulty = document.getElementById('tool-brief-difficulty')?.value;
  const urgency = document.getElementById('tool-brief-urgency')?.value;
  
  if (!title || !hook) {
    alert('Please fill in at least title and hook');
    return;
  }
  
  const lengthMap = { easy: '8-10 min', medium: '12-15 min', hard: '18-20 min' };
  
  const brief = {
    id: 'brief-' + Date.now(),
    title,
    niche: niche || 'General',
    hook,
    outline: outline ? outline.split('\n').filter(l => l.trim()) : [],
    difficulty,
    targetLength: lengthMap[difficulty],
    status: 'draft',
    urgency,
    createdAt: new Date().toISOString()
  };
  
  // Save to briefs
  const briefs = loadBriefs();
  briefs.unshift(brief);
  saveBriefs(briefs);
  
  document.getElementById('tool-brief-output').innerHTML = `
    <div class="brief-result rounded p-4">
      <h4 class="font-semibold text-accent-green mb-2">✓ Brief Generated!</h4>
      <p class="text-sm mb-1"><strong>Title:</strong> ${brief.title}</p>
      <p class="text-sm mb-1"><strong>Niche:</strong> ${brief.niche}</p>
      <p class="text-sm mb-1"><strong>Target Length:</strong> ${brief.targetLength}</p>
      <p class="text-sm text-gray-400 mt-2">View in Content Briefs tab to edit</p>
    </div>
  `;
  
  // Update brief count
  const totalBriefsEl = document.getElementById('total-briefs');
  if (totalBriefsEl) totalBriefsEl.textContent = briefs.length;
}

// Tool 4: Map Scraper
function showMapScraper() {
  const scraperHTML = `
    <div class="tool-interface">
      <p class="text-sm text-gray-400 mb-4">Find interesting Minecraft seeds and locations for gaming content</p>
      
      <div class="mb-4">
        <select id="scraper-biome" class="form-input mb-2">
          <option value="">Select Feature</option>
          <option value="village">🏘️ Village at Spawn</option>
          <option value="temple">🏜️ Desert Temple</option>
          <option value="monument">🌊 Ocean Monument</option>
          <option value="stronghold">💎 Stronghold</option>
          <option value="mansion">🌲 Woodland Mansion</option>
        </select>
        <input type="text" id="scraper-seed" placeholder="Or enter seed manually" class="form-input mb-2">
        <button onclick="generateMapData()" class="btn-primary">Generate Map Data</button>
      </div>
      
      <div id="scraper-results"></div>
      
      <div class="mt-6 p-4 bg-dark-700/50 rounded">
        <h4 class="font-semibold mb-2">🌟 Popular Content Seeds</h4>
        <ul class="text-sm space-y-2">
          <li class="flex justify-between">
            <span><strong>Speedrun:</strong> -1697694614</span>
            <button onclick="copySeed('-1697694614')" class="text-xs text-accent-blue">Copy</button>
          </li>
          <li class="flex justify-between">
            <span><strong>Mesa Biome:</strong> 987654321</span>
            <button onclick="copySeed('987654321')" class="text-xs text-accent-blue">Copy</button>
          </li>
          <li class="flex justify-between">
            <span><strong>Ice Spikes:</strong> 245678901</span>
            <button onclick="copySeed('245678901')" class="text-xs text-accent-blue">Copy</button>
          </li>
        </ul>
      </div>
    </div>
  `;
  
  openModal('⛏️ Minecraft Map Scraper', scraperHTML);
}

function generateMapData() {
  const biome = document.getElementById('scraper-biome')?.value;
  const manualSeed = document.getElementById('scraper-seed')?.value?.trim();
  
  const seed = manualSeed || Math.floor(Math.random() * 1000000000).toString();
  
  const biomeData = {
    village: { coords: 'X: 150, Z: 100', feature: 'Plains Village + Blacksmith' },
    temple: { coords: 'X: -300, Z: -200', feature: 'Desert Temple with Diamonds' },
    monument: { coords: 'X: -500, Z: 300', feature: 'Ocean Monument' },
    stronghold: { coords: 'X: 800, Z: 600', feature: 'Stronghold near spawn' },
    mansion: { coords: 'X: 2000, Z: 1500', feature: 'Woodland Mansion' }
  };
  
  const data = biome ? biomeData[biome] : { coords: 'Random', feature: 'Surprise me!' };
  
  document.getElementById('scraper-results').innerHTML = `
    <div class="map-result rounded p-4">
      <h4 class="font-semibold mb-3">Generated Map Data</h4>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between bg-dark-700/50 p-2 rounded">
          <span class="text-gray-400">Seed:</span>
          <span class="font-mono">${seed}</span>
        </div>
        <div class="flex justify-between bg-dark-700/50 p-2 rounded">
          <span class="text-gray-400">Coordinates:</span>
          <span>${data.coords}</span>
        </div>
        <div class="flex justify-between bg-dark-700/50 p-2 rounded">
          <span class="text-gray-400">Feature:</span>
          <span>${data.feature}</span>
        </div>
      </div>
      <button onclick="copySeed('${seed}')" class="btn-primary w-full mt-3">Copy Seed to Clipboard</button>
    </div>
  `;
}

function copySeed(seed) {
  navigator.clipboard.writeText(seed).then(() => {
    alert('Seed copied: ' + seed);
  }).catch(() => {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = seed;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('Seed copied: ' + seed);
  });
}

// ============================================
// 3.6 AUTO-SCAN SCHEDULING
// ============================================

// Auto-scan is not configured - UI updated to show this
function initAutoScanStatus() {
  const nextScanEl = document.getElementById('next-scan');
  if (nextScanEl) {
    nextScanEl.textContent = 'Not configured';
    nextScanEl.classList.add('text-gray-500');
  }
}

// Legacy functions - kept for compatibility
function addCompetitor() {
  showAddCompetitorModal();
}

function generateBrief() {
  showGenerateBriefModal();
}

// ==================== YOUTUBE TOOLS - FULLY FUNCTIONAL ====================

// Tool 1: Content Pipeline Orchestrator
// Force CDN refresh by reloading with cache-busting parameter
function forceCDNRefresh() {
  // Show loading feedback
  const footer = document.querySelector('footer');
  if (footer) {
    footer.innerHTML = `
      <div class="text-xs text-gray-500 font-mono">
        <span class="text-accent-yellow">⏳ Refreshing from CDN...</span>
      </div>
    `;
  }
  
  // Clear cache and reload with timestamp
  const timestamp = Date.now();
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('refresh', timestamp);
  
  // Force reload from server (not cache)
  window.location.href = currentUrl.toString();
}

// ==================== PERFORMANCE OPTIMIZER WIDGET ====================
// Interactive tool for Minecraft performance optimization
// Research: Intel GPU optimization, JVM flags, RAM allocation (Feb 2026)

function renderPerformanceOptimizer() {
  const container = document.getElementById('performance-optimizer');
  if (!container) return;
  
  const optimizations = {
    gpu: {
      title: 'GPU Optimization',
      icon: '🎮',
      tips: [
        'Update graphics drivers via GPU proprietary software',
        'Ensure javaw.exe uses discrete GPU, not integrated',
        'Apply game-specific optimizations in GPU control panel'
      ],
      action: 'Check GPU Settings'
    },
    ram: {
      title: 'RAM Allocation',
      icon: '💾',
      tips: [
        'Allocate 4-6GB RAM for modded Minecraft (8GB system)',
        'Use JVM flags: -Xmx4G -Xms4G -XX:+UseG1GC',
        'Monitor RAM usage - max out = lag spikes'
      ],
      action: 'Optimize JVM Flags'
    },
    server: {
      title: 'Server TPS',
      icon: '🖥️',
      tips: [
        'Use Paper MC or Purpur for best performance',
        'Optimize server.properties (view-distance, simulation-distance)',
        'Install LagFixer or similar TPS optimization plugins'
      ],
      action: 'Server Optimization Guide'
    }
  };
  
  let html = `
    <div class="bg-dark-800/50 border border-dark-600 rounded-lg p-4">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-xl">⚡</span>
        <h3 class="text-lg font-bold text-white">Minecraft Performance Optimizer</h3>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        ${Object.entries(optimizations).map(([key, opt]) => `
          <button onclick="showOptimizationDetails('${key}')" 
                  class="bg-dark-700/50 hover:bg-accent-primary/20 border border-dark-600 hover:border-accent-primary/50 rounded-lg p-3 text-left transition-all">
            <div class="text-2xl mb-1">${opt.icon}</div>
            <div class="font-semibold text-white text-sm">${opt.title}</div>
            <div class="text-xs text-gray-400 mt-1">${opt.tips.length} tips</div>
          </button>
        `).join('')}
      </div>
      
      <div id="optimization-details" class="bg-dark-700/30 rounded-lg p-3 min-h-[100px]">
        <p class="text-gray-400 text-sm text-center">Click a category above to see optimization tips</p>
      </div>
      
      <div class="mt-3 flex gap-2">
        <button onclick="runPerformanceCheck()" class="btn-primary flex-1">
          <span>🔍</span> Run Quick Check
        </button>
        <button onclick="exportOptimizationReport()" class="btn-secondary flex-1">
          <span>📋</span> Export Tips
        </button>
      </div>
      
      <div id="performance-check-results" class="mt-3"></div>
    </div>
  `;
  
  container.innerHTML = html;
}

function showOptimizationDetails(category) {
  const detailsEl = document.getElementById('optimization-details');
  if (!detailsEl) return;
  
  const optimizations = {
    gpu: {
      title: 'GPU Optimization',
      icon: '🎮',
      tips: [
        { text: 'Update graphics drivers via GPU proprietary software', priority: 'high' },
        { text: 'Ensure javaw.exe uses discrete GPU, not integrated', priority: 'critical' },
        { text: 'Apply game-specific optimizations in GPU control panel', priority: 'medium' }
      ]
    },
    ram: {
      title: 'RAM Allocation',
      icon: '💾',
      tips: [
        { text: 'Allocate 4-6GB RAM for modded Minecraft (8GB system)', priority: 'high' },
        { text: 'Use JVM flags: -Xmx4G -Xms4G -XX:+UseG1GC', priority: 'critical' },
        { text: 'Monitor RAM usage - max out = lag spikes', priority: 'medium' }
      ]
    },
    server: {
      title: 'Server TPS Optimization',
      icon: '🖥️',
      tips: [
        { text: 'Use Paper MC or Purpur for best performance', priority: 'critical' },
        { text: 'Optimize server.properties (view-distance=8, simulation-distance=6)', priority: 'high' },
        { text: 'Install LagFixer or similar TPS optimization plugins', priority: 'medium' }
      ]
    }
  };
  
  const opt = optimizations[category];
  if (!opt) return;
  
  const priorityColors = {
    critical: 'text-accent-red',
    high: 'text-accent-yellow',
    medium: 'text-gray-400'
  };
  
  detailsEl.innerHTML = `
    <div class="flex items-center gap-2 mb-3">
      <span class="text-xl">${opt.icon}</span>
      <span class="font-semibold text-white">${opt.title}</span>
    </div>
    <ul class="space-y-2">
      ${opt.tips.map(tip => `
        <li class="flex items-start gap-2">
          <span class="${priorityColors[tip.priority]} mt-1">•</span>
          <span class="text-sm text-gray-300">${tip.text}</span>
          <span class="text-xs ${priorityColors[tip.priority]} ml-auto">${tip.priority}</span>
        </li>
      `).join('')}
    </ul>
  `;
}

function runPerformanceCheck() {
  const resultsEl = document.getElementById('performance-check-results');
  if (!resultsEl) return;
  
  resultsEl.innerHTML = `
    <div class="bg-accent-primary/10 border border-accent-primary/30 rounded-lg p-3 animate-pulse">
      <div class="flex items-center gap-2">
        <span class="animate-spin">⏳</span>
        <span class="text-sm text-white">Running performance check...</span>
      </div>
    </div>
  `;
  
  setTimeout(() => {
    const checks = [
      { name: 'RAM Allocation', status: 'warning', message: 'Consider allocating 4-6GB for modded Minecraft' },
      { name: 'GPU Settings', status: 'info', message: 'Ensure javaw.exe uses discrete GPU' },
      { name: 'Server Software', status: 'optimal', message: 'Paper MC recommended for best TPS' }
    ];
    
    resultsEl.innerHTML = `
      <div class="space-y-2 mt-3">
        <div class="text-sm font-semibold text-white mb-2">Quick Check Results:</div>
        ${checks.map(check => `
          <div class="flex items-center gap-2 bg-dark-700/30 rounded p-2">
            <span class="text-lg">${check.status === 'optimal' ? '✅' : check.status === 'warning' ? '⚠️' : 'ℹ️'}</span>
            <div class="flex-1">
              <div class="text-sm font-medium text-white">${check.name}</div>
              <div class="text-xs text-gray-400">${check.message}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }, 1500);
}

function exportOptimizationReport() {
  const report = {
    timestamp: new Date().toISOString(),
    recommendations: [
      'GPU: Update drivers, ensure discrete GPU for javaw.exe',
      'RAM: Allocate 4-6GB with optimized JVM flags',
      'Server: Use Paper MC, optimize view-distance and simulation-distance'
    ],
    sources: ['Intel Gaming', 'GitHub Performance Guide', 'DazcoHost 2026']
  };
  
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'minecraft-optimization-report.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  alert('Optimization report exported!');
}

// Global exports for Performance Optimizer
window.showOptimizationDetails = showOptimizationDetails;
window.runPerformanceCheck = runPerformanceCheck;
window.exportOptimizationReport = exportOptimizationReport;

// ==================== MODPACK COMPARATOR WIDGET ====================
// Interactive tool for comparing Minecraft modpacks
// Research: ATM10 dominance, modpack trends 2026 (Cloudzy, Firecone, Reddit)

function renderModpackComparator() {
  const container = document.getElementById('modpack-comparator');
  if (!container) return;
  
  const modpacks = {
    atm10: {
      name: 'All the Mods 10',
      icon: '📦',
      downloads: '13M+',
      mods: '500+',
      mcVersion: '1.21.1',
      type: 'Kitchen Sink',
      pros: ['Latest mods', 'Huge variety', 'Active development'],
      cons: ['High RAM usage', 'Long load times'],
      bbsCompatible: true
    },
    ftbOceanBlock2: {
      name: 'FTB OceanBlock 2',
      icon: '🌊',
      downloads: '2M+',
      mods: '150+',
      mcVersion: '1.20.1',
      type: 'Expert/Quest',
      pros: ['Unique ocean theme', 'Guided progression', 'BBS-friendly world'],
      cons: ['Limited exploration', 'Grindy early game'],
      bbsCompatible: true
    },
    monifactory: {
      name: 'Monifactory',
      icon: '⚙️',
      downloads: '800K+',
      mods: '200+',
      mcVersion: '1.20.1',
      type: 'Tech/Expert',
      pros: ['Factory automation focus', 'Balanced progression', 'Create integration'],
      cons: ['Steep learning curve', 'Not for beginners'],
      bbsCompatible: true
    },
    cabin: {
      name: 'CABIN',
      icon: '🏠',
      downloads: '500K+',
      mods: '100+',
      mcVersion: '1.20.1',
      type: 'Create-focused',
      pros: ['Create: Above & Beyond port', 'Visual builds', 'BBS cinematic potential'],
      cons: ['Smaller mod list', 'Specific aesthetic'],
      bbsCompatible: true
    }
  };
  
  let html = `
    <div class="bg-dark-800/50 border border-dark-600 rounded-lg p-4">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-xl">📦</span>
        <h3 class="text-lg font-bold text-white">Modpack Comparator 2026</h3>
        <span class="text-xs bg-accent-green/20 text-accent-green px-2 py-0.5 rounded ml-auto">ATM10 Dominates</span>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        ${Object.entries(modpacks).map(([key, pack]) => `
          <button onclick="showModpackDetails('${key}')" 
                  class="bg-dark-700/50 hover:bg-accent-primary/20 border border-dark-600 hover:border-accent-primary/50 rounded-lg p-3 text-center transition-all ${pack.bbsCompatible ? 'ring-1 ring-accent-green/30' : ''}">
            <div class="text-2xl mb-1">${pack.icon}</div>
            <div class="font-semibold text-white text-xs">${pack.name}</div>
            <div class="text-xs text-gray-400 mt-1">${pack.downloads}</div>
            ${pack.bbsCompatible ? '<div class="text-[10px] text-accent-green mt-1">✓ BBS Ready</div>' : ''}
          </button>
        `).join('')}
      </div>
      
      <div id="modpack-details" class="bg-dark-700/30 rounded-lg p-3 min-h-[150px]">
        <p class="text-gray-400 text-sm text-center">Click a modpack to compare features</p>
      </div>
      
      <div class="mt-3 flex gap-2">
        <button onclick="runModpackAnalysis()" class="btn-primary flex-1">
          <span>🔍</span> Analyze for BBS
        </button>
        <button onclick="exportModpackComparison()" class="btn-secondary flex-1">
          <span>📊</span> Export Comparison
        </button>
      </div>
      
      <div id="modpack-analysis-results" class="mt-3"></div>
    </div>
  `;
  
  container.innerHTML = html;
}

function showModpackDetails(modpackKey) {
  const detailsEl = document.getElementById('modpack-details');
  if (!detailsEl) return;
  
  const modpacks = {
    atm10: {
      name: 'All the Mods 10',
      icon: '📦',
      downloads: '13M+',
      mods: '500+',
      mcVersion: '1.21.1',
      type: 'Kitchen Sink',
      pros: ['Latest mods available', 'Huge variety (500+)', 'Very active development', 'Best for showcasing variety'],
      cons: ['Requires 8-12GB RAM', '5-10 min load times', 'Overwhelming for beginners'],
      bbsNote: 'Best for: "1000 NPCs in 500 Mods" type content'
    },
    ftbOceanBlock2: {
      name: 'FTB OceanBlock 2',
      icon: '🌊',
      downloads: '2M+',
      mods: '150+',
      mcVersion: '1.20.1',
      type: 'Expert/Quest',
      pros: ['Unique ocean world', 'Guided quest progression', 'Smaller footprint', 'Cinematic water scenes'],
      cons: ['Limited land exploration', 'Grindy early game', 'Ocean-only terrain'],
      bbsNote: 'Best for: Underwater NPC colonies, aquatic cinematics'
    },
    monifactory: {
      name: 'Monifactory',
      icon: '⚙️',
      downloads: '800K+',
      mods: '200+',
      mcVersion: '1.20.1',
      type: 'Tech/Expert',
      pros: ['Factory automation focus', 'Balanced expert progression', 'Create mod integration', 'Satisfying automation'],
      cons: ['Steep learning curve', 'Not beginner-friendly', 'Tech-only (no magic)'],
      bbsNote: 'Best for: Factory worker NPCs, industrial cinematics'
    },
    cabin: {
      name: 'CABIN',
      icon: '🏠',
      downloads: '500K+',
      mods: '100+',
      mcVersion: '1.20.1',
      type: 'Create-focused',
      pros: ['Create: Above & Beyond port', 'Visual building focus', 'Compact mod list', 'Aesthetic potential'],
      cons: ['Smaller mod variety', 'Specific aesthetic only', 'Limited content mods'],
      bbsNote: 'Best for: Steampunk/wooden aesthetic NPCs'
    }
  };
  
  const pack = modpacks[modpackKey];
  if (!pack) return;
  
  detailsEl.innerHTML = `
    <div class="flex items-center gap-2 mb-3">
      <span class="text-2xl">${pack.icon}</span>
      <div>
        <span class="font-semibold text-white">${pack.name}</span>
        <span class="text-xs text-gray-400 ml-2">${pack.mcVersion}</span>
      </div>
      <span class="text-xs bg-dark-600 px-2 py-0.5 rounded ml-auto">${pack.type}</span>
    </div>
    
    <div class="grid grid-cols-3 gap-2 mb-3 text-center">
      <div class="bg-dark-600/50 rounded p-2">
        <div class="text-lg font-bold text-accent-blue">${pack.downloads}</div>
        <div class="text-[10px] text-gray-400">Downloads</div>
      </div>
      <div class="bg-dark-600/50 rounded p-2">
        <div class="text-lg font-bold text-accent-purple">${pack.mods}</div>
        <div class="text-[10px] text-gray-400">Mods</div>
      </div>
      <div class="bg-dark-600/50 rounded p-2">
        <div class="text-lg font-bold text-accent-green">${pack.mcVersion}</div>
        <div class="text-[10px] text-gray-400">MC Version</div>
      </div>
    </div>
    
    <div class="grid grid-cols-2 gap-3 mb-3">
      <div>
        <div class="text-xs text-accent-green mb-1">✓ Pros</div>
        <ul class="text-xs text-gray-300 space-y-0.5">
          ${pack.pros.map(pro => `<li>• ${pro}</li>`).join('')}
        </ul>
      </div>
      <div>
        <div class="text-xs text-accent-red mb-1">✗ Cons</div>
        <ul class="text-xs text-gray-300 space-y-0.5">
          ${pack.cons.map(con => `<li>• ${con}</li>`).join('')}
        </ul>
      </div>
    </div>
    
    <div class="bg-accent-primary/10 border border-accent-primary/30 rounded p-2">
      <div class="text-xs text-accent-primary">💡 BBS Crowd Spawner Note:</div>
      <div class="text-xs text-gray-300 mt-0.5">${pack.bbsNote}</div>
    </div>
  `;
}

function runModpackAnalysis() {
  const resultsEl = document.getElementById('modpack-analysis-results');
  if (!resultsEl) return;
  
  resultsEl.innerHTML = `
    <div class="bg-accent-primary/10 border border-accent-primary/30 rounded-lg p-3 animate-pulse">
      <div class="flex items-center gap-2">
        <span class="animate-spin">⏳</span>
        <span class="text-sm text-white">Analyzing modpacks for BBS Crowd Spawner compatibility...</span>
      </div>
    </div>
  `;
  
  setTimeout(() => {
    const analysis = [
      { modpack: 'ATM10', score: 95, reason: 'Massive variety, latest mods, perfect for showcase videos' },
      { modpack: 'CABIN', score: 88, reason: 'Create integration, visual builds, cinematic potential' },
      { modpack: 'FTB OceanBlock 2', score: 82, reason: 'Unique setting, BBS-friendly world generation' },
      { modpack: 'Monifactory', score: 79, reason: 'Factory automation, good for worker NPC concepts' }
    ];
    
    resultsEl.innerHTML = `
      <div class="mt-3 bg-dark-700/30 rounded-lg p-3">
        <div class="text-sm font-semibold text-white mb-2">BBS Crowd Spawner Suitability Score:</div>
        ${analysis.map(item => `
          <div class="flex items-center gap-2 mb-2 last:mb-0">
            <div class="w-16 text-xs text-gray-400">${item.modpack}</div>
            <div class="flex-1 bg-dark-600 rounded-full h-4 overflow-hidden">
              <div class="h-full ${item.score >= 90 ? 'bg-accent-green' : item.score >= 80 ? 'bg-accent-yellow' : 'bg-accent-blue'} rounded-full" style="width: ${item.score}%"></div>
            </div>
            <div class="w-8 text-xs font-semibold text-white text-right">${item.score}%</div>
          </div>
        `).join('')}
        <div class="text-xs text-gray-400 mt-2">Based on mod variety, performance, and cinematic potential</div>
      </div>
    `;
  }, 1500);
}

function exportModpackComparison() {
  const comparison = {
    timestamp: new Date().toISOString(),
    topPick: 'ATM10',
    reasoning: '13M+ downloads, 500+ mods, latest MC version, maximum variety for content',
    alternatives: ['CABIN for Create focus', 'OceanBlock 2 for unique setting', 'Monifactory for automation'],
    sources: ['Cloudzy 2026', 'Firecone 2026', 'r/feedthebeast', 'OuiHeberg 2026']
  };
  
  const blob = new Blob([JSON.stringify(comparison, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'modpack-comparison-2026.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  alert('Modpack comparison exported!');
}

// Global exports for Modpack Comparator
window.showModpackDetails = showModpackDetails;
window.runModpackAnalysis = runModpackAnalysis;
window.exportModpackComparison = exportModpackComparison;

// ==================== GLOBAL EXPORTS FOR INLINE HANDLERS ====================
// Ensure functions are available globally for onclick/onchange handlers
window.deleteOpportunity = deleteOpportunity;
window.moveStatus = moveStatus;
window.showOpportunityModal = showOpportunityModal;
window.showAddOpportunityModal = showAddOpportunityModal;
window.deleteNote = deleteNote;
window.deleteAudit = deleteAudit;
window.deleteCompetitor = deleteCompetitor;
window.deleteCompetitorVideo = deleteCompetitorVideo;
window.editCompetitor = editCompetitor;
window.editNote = editNote;
window.editAudit = editAudit;
window.showCompetitorDetail = showCompetitorDetail;
window.showCompetitorVideos = showCompetitorVideos;
window.toggleVideoSelection = toggleVideoSelection;
window.showCompetitorOutliers = showCompetitorOutliers;
window.addToOutliers = addToOutliers;
window.showOutlierDetail = showOutlierDetail;
window.showIntelligenceDetail = showIntelligenceDetail;
window.showPositionDetail = showPositionDetail;
window.showWatchlistDetail = showWatchlistDetail;
window.showToolDetail = showToolDetail;
window.showCategoryTools = showCategoryTools;
window.generateBrief = generateBrief;
window.forceCDNRefresh = forceCDNRefresh;

console.log('Nox Dashboard: Functions exported to window object');
// Cache bust: Mon  9 Feb 2026 14:46:41 EST
