// Nox Dashboard - App Logic
// Loads data from JSON files and renders all tabs

let appData = {
  youtube: { outlierVideos: [], contentBriefs: [], trendAnalysis: [] },
  newBusiness: { opportunities: [], pipeline: {} },
  investments: { positions: [], watchlist: [], intelligence: [] },
  tools: [],
  research: { notes: [] },
  audits: { audits: [], agentStats: {} },
  meta: { lastUpdated: {}, agentStatus: {} }
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadAllData();
  renderDashboard();
  renderYouTube();
  renderBusiness();
  renderInvestments();
  renderTools();
  renderResearch();
  renderAudits();
  setupFilters();
});

// Load all JSON data
async function loadAllData() {
  try {
    const [youtubeRes, businessRes, invRes, toolsRes, researchRes, auditsRes, metaRes] = await Promise.all([
      fetch('data/youtube.json'),
      fetch('data/new-business.json'),
      fetch('data/investments.json'),
      fetch('data/tools.json'),
      fetch('data/research.json'),
      fetch('data/audits.json'),
      fetch('data/meta.json')
    ]);

    if (youtubeRes.ok) appData.youtube = await youtubeRes.json();
    if (businessRes.ok) appData.newBusiness = await businessRes.json();
    if (invRes.ok) appData.investments = await invRes.json();
    if (toolsRes.ok) appData.tools = await toolsRes.json();
    if (researchRes.ok) appData.research = await researchRes.json();
    if (auditsRes.ok) appData.audits = await auditsRes.json();
    if (metaRes.ok) appData.meta = await metaRes.json();

    updateAgentStatus();
  } catch (err) {
    console.error('Failed to load data:', err);
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
}

// Dashboard tab
function renderDashboard() {
  const youtube = appData.youtube;
  const business = appData.newBusiness;
  const investments = appData.investments;
  const audits = appData.audits;

  document.getElementById('stat-youtube-count').textContent = youtube.outlierVideos.length;
  document.getElementById('stat-youtube-briefs').textContent = `${youtube.contentBriefs.length} briefs ready`;

  document.getElementById('stat-business-count').textContent = business.opportunities.length;
  const highPriority = business.opportunities.filter(o => o.alignment === 'HIGH').length;
  document.getElementById('stat-business-high').textContent = `${highPriority} high priority`;

  document.getElementById('stat-investments-count').textContent = investments.positions.length;
  document.getElementById('stat-investments-watchlist').textContent = `${investments.watchlist.length} watching`;

  const avgGrade = calculateAvgGrade(audits.audits);
  document.getElementById('stat-avg-grade').textContent = avgGrade ? `${avgGrade}%` : 'N/A';

  renderMorningBrief();
}

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
      text: `${highOpps.length} high-priority business opportunities awaiting review`,
      link: () => showTab('business'),
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
      text: `${recentOutliers.length} new YouTube outlier videos in the last 24 hours`,
      link: () => showTab('youtube'),
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
      text: `${recentAudits.length} work items audited today (avg grade: ${avg}%)`,
      link: () => showTab('audits'),
      color: avg >= 80 ? 'text-accent-green' : avg >= 60 ? 'text-accent-yellow' : 'text-accent-red'
    });
  }
  
  // Check for pending investments
  const watchlist = appData.investments.watchlist || [];
  if (watchlist.length > 0) {
    items.push({
      icon: '📈',
      text: `${watchlist.length} investments on watchlist`,
      link: () => showTab('investments'),
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
      text: `${recentResearch.length} new research notes added`,
      link: () => showTab('research'),
      color: 'text-gray-300'
    });
  }

  if (items.length === 0) {
    briefContainer.innerHTML = `
      <div class="text-gray-500 text-sm italic">
        No new updates since last check. The agent will populate data on the next heartbeat.
      </div>
    `;
  } else {
    briefContainer.innerHTML = items.map(item => `
      <div class="flex items-start gap-3 p-2 bg-dark-700/30 rounded cursor-pointer hover:bg-dark-700/50 transition" onclick="(${item.link})()">
        <span class="text-lg">${item.icon}</span>
        <span class="text-sm ${item.color}">${item.text}</span>
      </div>
    `).join('');
  }
}
  if (!audits || audits.length === 0) return null;
  const sum = audits.reduce((a, b) => a + (b.grade || 0), 0);
  return Math.round(sum / audits.length);
}

// YouTube tab
function renderYouTube() {
  const container = document.getElementById('youtube-outliers');
  const videos = appData.youtube.outlierVideos || [];

  if (videos.length === 0) {
    container.innerHTML = `<div class="card rounded-lg p-8 text-center text-gray-500">
      No outlier videos yet. The agent will populate this on the next heartbeat.
    </div>`;
    return;
  }

  container.innerHTML = videos.map(v => `
    <div class="card rounded-lg p-4" data-niche="${v.niche || ''}">
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
        <a href="${v.url}" target="_blank" class="px-3 py-1 bg-accent-blue rounded text-white text-sm whitespace-nowrap">Watch →</a>
      </div>
    </div>
  `).join('');
}

// Business tab
function renderBusiness() {
  const pipeline = appData.newBusiness.pipeline || {};
  document.getElementById('pipe-new').textContent = pipeline.new || 0;
  document.getElementById('pipe-evaluating').textContent = pipeline.evaluating || 0;
  document.getElementById('pipe-pursuing').textContent = pipeline.pursuing || 0;
  document.getElementById('pipe-passed').textContent = pipeline.passed || 0;
  document.getElementById('pipe-won').textContent = pipeline.won || 0;

  const container = document.getElementById('business-opportunities');
  const opps = appData.newBusiness.opportunities || [];

  if (opps.length === 0) {
    container.innerHTML = `<div class="card rounded-lg p-8 text-center text-gray-500">
      No opportunities yet. The agent will add them on the next heartbeat.
    </div>`;
    return;
  }

  container.innerHTML = opps.map(o => `
    <div class="card rounded-lg p-4" data-status="${o.status}">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 text-xs rounded ${getAlignmentClass(o.alignment)}">${o.alignment}</span>
          <span class="px-2 py-0.5 bg-dark-700 text-xs rounded">${o.type}</span>
          <span class="text-lg font-bold">${o.score}%</span>
        </div>
        <span class="text-sm text-gray-400">${formatTimeAgo(o.addedAt)}</span>
      </div>
      <h3 class="font-semibold mb-1">${o.title}</h3>
      <p class="text-sm text-gray-300 mb-2">${o.description}</p>
      <p class="text-sm"><strong>Next step:</strong> ${o.nextStep}</p>
      <div class="mt-2 flex gap-2">
        <button onclick="moveStatus('${o.id}', 'evaluating')" class="text-xs px-2 py-1 bg-dark-700 rounded hover:bg-dark-600">→ Evaluating</button>
        <button onclick="moveStatus('${o.id}', 'pursuing')" class="text-xs px-2 py-1 bg-dark-700 rounded hover:bg-dark-600">→ Pursuing</button>
      </div>
    </div>
  `).join('');
}

function getAlignmentClass(alignment) {
  switch(alignment) {
    case 'HIGH': return 'bg-accent-green/20 text-accent-green';
    case 'MEDIUM': return 'bg-accent-yellow/20 text-accent-yellow';
    case 'LOW': return 'bg-accent-red/20 text-accent-red';
    default: return 'bg-dark-700';
  }
}

// Investments tab
function renderInvestments() {
  const positions = appData.investments.positions || [];
  const watchlist = appData.investments.watchlist || [];
  const intelligence = appData.investments.intelligence || [];

  // Positions
  const posContainer = document.getElementById('investments-positions');
  if (positions.length === 0) {
    posContainer.innerHTML = `<div class="text-gray-500 text-center py-4">No positions tracked yet.</div>`;
  } else {
    posContainer.innerHTML = positions.map(p => {
      const gain = ((p.currentPrice - p.entryPrice) / p.entryPrice * 100).toFixed(1);
      const gainClass = gain >= 0 ? 'text-accent-green' : 'text-accent-red';
      return `
        <div class="flex justify-between items-center p-2 bg-dark-700/50 rounded">
          <div>
            <div class="font-semibold">${p.ticker} · ${p.name}</div>
            <div class="text-sm text-gray-400">${p.quantity} @ $${p.entryPrice} → $${p.currentPrice}</div>
          </div>
          <div class="text-right">
            <div class="font-bold ${gainClass}">${gain}%</div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Watchlist
  const watchContainer = document.getElementById('investments-watchlist');
  if (watchlist.length === 0) {
    watchContainer.innerHTML = `<div class="text-gray-500 text-center py-4">No watchlist items.</div>`;
  } else {
    watchContainer.innerHTML = watchlist.map(w => `
      <div class="p-2 bg-dark-700/50 rounded">
        <div class="font-semibold">${w.ticker} · $${w.currentPrice}</div>
        <div class="text-sm text-gray-400">Target: $${w.targetEntry}</div>
        <div class="text-sm mt-1">${w.thesis}</div>
      </div>
    `).join('');
  }

  // Intelligence
  const intelContainer = document.getElementById('investments-intelligence');
  if (intelligence.length === 0) {
    intelContainer.innerHTML = `<div class="text-gray-500 text-center py-4">No intelligence reports yet.</div>`;
  } else {
    intelContainer.innerHTML = intelligence.map(i => `
      <div class="p-2 bg-dark-700/50 rounded">
        <div class="font-semibold">${i.topic} <span class="text-xs px-2 py-0.5 rounded ${i.impact === 'bullish' ? 'bg-accent-green/20 text-accent-green' : i.impact === 'bearish' ? 'bg-accent-red/20 text-accent-red' : 'bg-dark-600'}">${i.impact}</span></div>
        <div class="text-sm mt-1">${i.summary}</div>
        <div class="text-xs text-gray-400 mt-1">${formatTimeAgo(i.addedAt)}</div>
      </div>
    `).join('');
  }
}

// Tools tab
function renderTools() {
  const container = document.getElementById('tools-grid');
  const tools = appData.tools || [];

  if (tools.length === 0) {
    container.innerHTML = `<div class="card rounded-lg p-8 text-center text-gray-500">
      No tools registered yet. The agent will add them as they are built.
    </div>`;
    return;
  }

  container.innerHTML = tools.map(t => `
    <div class="card rounded-lg p-4">
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

// Research tab
function renderResearch() {
  const container = document.getElementById('research-notes');
  const notes = appData.research.notes || [];

  if (notes.length === 0) {
    container.innerHTML = `<div class="card rounded-lg p-8 text-center text-gray-500">
      No research notes yet. The agent will add them as research is conducted.
    </div>`;
    return;
  }

  container.innerHTML = notes.map(n => `
    <div class="card rounded-lg p-4">
      <div class="flex justify-between items-start mb-2">
        <h3 class="font-semibold">${n.title}</h3>
        <span class="text-xs px-2 py-0.5 bg-dark-700 rounded">${n.category}</span>
      </div>
      <p class="text-sm text-gray-300 mb-2">${n.summary}</p>
      <div class="flex flex-wrap gap-1 mb-2">
        ${(n.tags || []).map(t => `<span class="text-xs px-2 py-0.5 bg-accent-blue/20 text-accent-blue rounded">#${t}</span>`).join('')}
      </div>
      <div class="text-xs text-gray-400">${formatTimeAgo(n.createdAt)}</div>
    </div>
  `).join('');
}

// Audits tab
function renderAudits() {
  const audits = appData.audits.audits || [];
  const stats = appData.audits.agentStats || {};

  // Stats cards
  const statsContainer = document.getElementById('audit-stats');
  const agents = Object.keys(stats);
  
  if (agents.length === 0) {
    statsContainer.innerHTML = `<div class="card rounded-lg p-4 text-center"><div class="text-gray-500">No audit data yet</div></div>`;
  } else {
    statsContainer.innerHTML = agents.map(agent => {
      const s = stats[agent];
      return `
        <div class="card rounded-lg p-4">
          <div class="text-sm text-gray-400 mb-1">${agent}</div>
          <div class="text-3xl font-bold ${s.averageGrade >= 80 ? 'text-accent-green' : s.averageGrade >= 60 ? 'text-accent-yellow' : 'text-accent-red'}">${s.averageGrade}%</div>
          <div class="text-sm">${s.totalAudits} audits · ${s.trend === 'improving' ? '↑' : s.trend === 'declining' ? '↓' : '→'} ${s.trend}</div>
        </div>
      `;
    }).join('');
  }

  // Grade chart
  if (audits.length > 0) {
    const ctx = document.getElementById('grade-chart').getContext('2d');
    const gradesByDate = {};
    audits.forEach(a => {
      const date = a.date;
      if (!gradesByDate[date]) gradesByDate[date] = [];
      gradesByDate[date].push(a.grade);
    });

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: Object.keys(gradesByDate).sort(),
        datasets: [{
          label: 'Average Grade',
          data: Object.keys(gradesByDate).sort().map(d => {
            const g = gradesByDate[d];
            return g.reduce((a, b) => a + b, 0) / g.length;
          }),
          borderColor: '#3B82F6',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { min: 0, max: 100 } }
      }
    });
  }

  // Audit list
  const listContainer = document.getElementById('audit-list');
  if (audits.length === 0) {
    listContainer.innerHTML = `<div class="card rounded-lg p-4 text-center text-gray-500">No audit reports yet</div>`;
  } else {
    listContainer.innerHTML = audits.sort((a, b) => new Date(b.date) - new Date(a.date)).map(a => `
      <div class="card rounded-lg p-4">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-sm text-gray-400">${a.date} · ${a.agent}</div>
            <h3 class="font-semibold">${a.project}</h3>
            <p class="text-sm text-gray-300 mt-1">${a.summary}</p>
          </div>
          <span class="text-2xl font-bold ${a.grade >= 80 ? 'text-accent-green' : a.grade >= 60 ? 'text-accent-yellow' : 'text-accent-red'}">${a.grade}%</span>
        </div>
      </div>
    `).join('');
  }
}

// Utilities
function formatViews(views) {
  if (!views) return '0';
  if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
  if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
  return views.toString();
}

function formatTimeAgo(dateString) {
  if (!dateString) return 'unknown';
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + ' min ago';
  if (diff < 86400) return Math.floor(diff / 3600) + ' hours ago';
  if (diff < 604800) return Math.floor(diff / 86400) + ' days ago';
  return date.toLocaleDateString();
}

function setupFilters() {
  // YouTube niche filter
  document.getElementById('youtube-niche-filter')?.addEventListener('change', (e) => {
    const niche = e.target.value;
    document.querySelectorAll('#youtube-outliers > div').forEach(el => {
      if (!niche || el.dataset.niche === niche) {
        el.style.display = 'block';
      } else {
        el.style.display = 'none';
      }
    });
  });

  // Research search
  document.getElementById('research-search')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('#research-notes > div').forEach(el => {
      const text = el.textContent.toLowerCase();
      el.style.display = text.includes(query) ? 'block' : 'none';
    });
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
        c.innerHTML = `<div class="card rounded-lg p-8 text-center text-gray-500">
          No data yet. The agent will populate this on the next heartbeat.
        </div>`;
      }
    });
  });
}
