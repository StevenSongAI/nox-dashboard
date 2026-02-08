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

// Initialize
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
  console.log('[Nox Dashboard] Initialization complete!');
  
  // Setup modal click-outside-to-close
  setupModalHandlers();
});

// Load all JSON data
async function loadAllData() {
  console.log('[Nox Dashboard] Starting data load...');
  try {
    const cacheBuster = '?v=' + Date.now();
    const dataFiles = [
      { name: 'youtube', path: 'data/youtube.json' + cacheBuster },
      { name: 'new-business', path: 'data/new-business.json' + cacheBuster },
      { name: 'investments', path: 'data/investments.json' + cacheBuster },
      { name: 'tools', path: 'data/tools.json' + cacheBuster },
      { name: 'research', path: 'data/research.json' + cacheBuster },
      { name: 'audits', path: 'data/audits.json' + cacheBuster },
      { name: 'meta', path: 'data/meta.json' + cacheBuster }
    ];

    const results = await Promise.allSettled(
      dataFiles.map(df => {
        console.log(`[Nox Dashboard] Fetching ${df.path}...`);
        return fetch(df.path);
      })
    );

    results.forEach((result, index) => {
      const fileName = dataFiles[index].name;
      const filePath = dataFiles[index].path;
      if (result.status === 'fulfilled') {
        console.log(`[Nox Dashboard] ${filePath}: ${result.value.ok ? 'OK' : 'FAILED'} (${result.value.status})`);
      } else {
        console.error(`[Nox Dashboard] ${filePath}: ERROR -`, result.reason);
      }
    });

    const [youtubeRes, businessRes, invRes, toolsRes, researchRes, auditsRes, metaRes] = results.map(r => r.status === 'fulfilled' ? r.value : null);

    if (youtubeRes?.ok) {
      appData.youtube = await youtubeRes.json();
      console.log('[Nox Dashboard] YouTube data loaded:', appData.youtube.outlierVideos?.length || 0, 'videos');
    }
    if (businessRes?.ok) {
      appData.newBusiness = await businessRes.json();
      console.log('[Nox Dashboard] Business data loaded:', appData.newBusiness.opportunities?.length || 0, 'opportunities');
    }
    if (invRes?.ok) {
      appData.investments = await invRes.json();
      console.log('[Nox Dashboard] Investments data loaded:', appData.investments.positions?.length || 0, 'positions');
    }
    if (toolsRes?.ok) {
      const toolsData = await toolsRes.json();
      appData.tools = Array.isArray(toolsData) ? { tools: toolsData, categories: [], lastUpdated: '' } : toolsData;
      console.log('[Nox Dashboard] Tools data loaded:', appData.tools.tools?.length || 0, 'tools');
    }
    if (researchRes?.ok) {
      appData.research = await researchRes.json();
      console.log('[Nox Dashboard] Research data loaded:', appData.research.notes?.length || 0, 'notes');
    }
    if (auditsRes?.ok) {
      appData.audits = await auditsRes.json();
      console.log('[Nox Dashboard] Audits data loaded:', appData.audits.audits?.length || 0, 'audits');
    }
    if (metaRes?.ok) {
      appData.meta = await metaRes.json();
      console.log('[Nox Dashboard] Meta data loaded');
    }

    console.log('[Nox Dashboard] All data loaded successfully');
    updateAgentStatus();
  } catch (err) {
    console.error('[Nox Dashboard] Failed to load data:', err);
    showEmptyStates();
  }
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
  const fields = [
    { label: 'Ticker', value: item.ticker || item.symbol },
    { label: 'Current Price', value: formatCurrency(item.currentPrice) },
    { label: 'Target Entry', value: formatCurrency(item.targetEntry || item.targetPrice) },
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
        <div class="empty-state-desc" style="margin-bottom: 0;">The agent will populate data on the next heartbeat.</div>
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
  if (contentBriefs.length > 0) {
    html += `
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3">📝 Content Briefs (${contentBriefs.length})</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${contentBriefs.map(brief => `
            <div class="card rounded-lg p-4">
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
    html += buildEmptyState('🎬', 'No Outlier Videos Yet', 'The agent will populate this on the next heartbeat with trending videos that match your content strategy.');
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

function renderInvestments() {
  const positions = appData.investments.positions || [];
  const watchlist = appData.investments.watchlist || [];
  const intelligence = appData.investments.intelligence || [];

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
      const tickerSuffix = i.ticker ? ` · ${i.ticker}` : '';
      return `
        <div class="p-2 bg-dark-700/50 rounded cursor-pointer hover:bg-dark-700" onclick="showIntelligenceModal(${idx})">
          <div class="font-semibold">${title} <span class="text-xs px-2 py-0.5 rounded ${i.impact === 'bullish' ? 'bg-accent-green/20 text-accent-green' : i.impact === 'bearish' ? 'bg-accent-red/20 text-accent-red' : 'bg-dark-600'}">${i.impact || 'neutral'}</span></div>
          <div class="text-sm mt-1 line-clamp-2">${summary.substring(0, 150)}${summary.length > 150 ? '...' : ''}</div>
          <div class="text-xs text-gray-400 mt-1">${formatTimeAgo(date)}${tickerSuffix}</div>
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

// D4 FIX: YouTube search - search against ALL video properties
function setupFilters() {
  // Combined filter state for YouTube
  let youtubeFilterState = {
    niche: '',
    search: ''
  };

  function applyYouTubeFilters() {
    const cards = document.querySelectorAll('#youtube-outliers > div.card');
    const searchTerm = youtubeFilterState.search.toLowerCase().trim();
    
    cards.forEach(el => {
      const videoId = el.dataset.videoId;
      const video = youtubeVideoData.find(v => v.id === videoId);
      
      // Niche filter
      const nicheMatch = !youtubeFilterState.niche || el.dataset.niche === youtubeFilterState.niche;
      
      // D4 FIX: Search against all video properties
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
      
      el.style.display = (nicheMatch && searchMatch) ? 'block' : 'none';
    });
  }

  // YouTube niche filter
  document.getElementById('youtube-niche-filter')?.addEventListener('change', (e) => {
    youtubeFilterState.niche = e.target.value;
    applyYouTubeFilters();
  });

  // YouTube search - D4 FIX: search all properties
  document.getElementById('youtube-search')?.addEventListener('input', (e) => {
    youtubeFilterState.search = e.target.value.toLowerCase();
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

function moveStatus(oppId, newStatus) {
  // This would update local state only - agent reads on next sync
  alert(`Marked ${oppId} as ${newStatus}. The agent will sync this change on next heartbeat.`);
}

function showEmptyStates() {
  document.querySelectorAll('.tab-content').forEach(tab => {
    const containers = tab.querySelectorAll('[id$="-outliers"], [id$="-opportunities"], [id$="-positions"], [id$="-grid"], [id$="-notes"], [id$="-list"]');
    containers.forEach(c => {
      if (c.children.length === 0 || c.textContent.includes('Loading')) {
        c.innerHTML = buildEmptyState('', 'No Data', 'The agent will populate this on the next heartbeat.');
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
    const mins = Math.floor(diff / 60);
    return `${mins} minute${mins === 1 ? '' : 's'} ago`;
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
  if (amount === undefined || amount === null) return '$0.00';
  const num = parseFloat(amount);
  if (isNaN(num)) return '$0.00';
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
  alert('Outlier scan initiated. This would open viewstats.com and scan for new outliers.\n\nIn the full implementation, this would:\n1. Open viewstats.com\n2. Navigate to Outlier tool\n3. Scan ZMDE Gaming and StevenSongIRL\n4. Auto-add relevant competitor channels\n5. Update dashboard data');
}

// Render competitor list
async function renderCompetitors() {
  try {
    const response = await fetch('data/competitors.json');
    const data = await response.json();
    const competitors = data.competitors || [];
    
    const container = document.getElementById('competitor-list');
    if (!container) return;
    
    if (competitors.length === 0) {
      container.innerHTML = '<p class="text-gray-500">No competitors tracked yet.</p>';
      return;
    }
    
    container.innerHTML = competitors.map(comp => `
      <div class="card rounded-lg p-3 cursor-pointer hover:bg-dark-700/50" onclick="showCompetitorVideos('${comp.id}')">
        <div class="flex justify-between items-start">
          <div>
            <h4 class="font-semibold">${comp.name}</h4>
            <p class="text-xs text-gray-400">${comp.niche} • ${comp.focus}</p>
          </div>
          <span class="text-xs px-2 py-1 bg-dark-700 rounded">${comp.stats.subscribers}</span>
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

// Show competitor videos
function showCompetitorVideos(compId) {
  const container = document.getElementById('competitor-uploads');
  container.innerHTML = `
    <div class="text-center py-4">
      <p class="text-gray-400">Loading videos for competitor ${compId}...</p>
      <p class="text-xs text-gray-500 mt-2">In full implementation, this would fetch latest uploads via YouTube API</p>
    </div>
  `;
}

// Add new competitor
function addCompetitor() {
  const url = prompt('Enter YouTube channel URL:');
  if (url) {
    alert(`Competitor ${url} would be added.\n\nIn full implementation, this would:\n1. Validate the channel\n2. Fetch channel stats\n3. Add to competitors.json\n4. Start tracking uploads`);
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
  alert('Content brief generator would open.\n\nIn full implementation, this would:\n1. Analyze top outliers\n2. Generate video concepts\n3. Create hooks and outlines\n4. Save to content briefs');
}

// Launch YouTube tool
function launchTool(toolName) {
  const toolPaths = {
    'pipeline': '~/Desktop/Nox Builds/YouTube/content-pipeline-orchestrator/',
    'analyzer': '~/Desktop/Nox Builds/YouTube/youtube-performance-analyzer/',
    'brief-generator': '~/Desktop/Nox Builds/YouTube/content-brief-generator/',
    'map-scraper': '~/Desktop/Nox Builds/YouTube/minecraft-map-scraper/'
  };
  
  alert(`Launching ${toolName}...\n\nTool location: ${toolPaths[toolName] || 'Unknown'}\n\nIn full implementation, this would open the tool interface or navigate to the tool location.`);
}
