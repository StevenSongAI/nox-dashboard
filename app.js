// Nox Dashboard v3 - Main App
const App = {
  currentTab: 'bottlenecks',
  data: {},
  outliersLimit: 20,
  outliersFilter: 'all',
  outliersSort: 'views',
  modalInitialized: false,

  init() {
    this.setupTabs();
    this.setupEventListeners();
    this.setupModalHandlers();
    this.loadAllData();
  },

  setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });
    this.switchTab('bottlenecks');
  },

  switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => {
      const isActive = btn.dataset.tab === tab;
      btn.classList.toggle('text-white', isActive);
      btn.classList.toggle('border-purple-500', isActive);
      btn.classList.toggle('text-gray-400', !isActive);
    });
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('hidden', panel.id !== 'panel-' + tab);
    });
  },

  setupEventListeners() {
    document.getElementById('outlier-filter')?.addEventListener('change', (e) => {
      this.outliersFilter = e.target.value;
      this.renderOutliers();
    });
    document.getElementById('outlier-sort')?.addEventListener('change', (e) => {
      this.outliersSort = e.target.value;
      this.renderOutliers();
    });
    document.getElementById('load-more-outliers')?.addEventListener('click', () => {
      this.outliersLimit += 20;
      this.renderOutliers();
    });
  },

  setupModalHandlers() {
    if (this.modalInitialized) return;
    
    document.getElementById('close-artists-modal')?.addEventListener('click', () => this.closeArtistsModal());
    document.getElementById('artists-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'artists-modal') this.closeArtistsModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeArtistsModal();
        this.closeBriefModal && this.closeBriefModal();
      }
    });
    
    this.modalInitialized = true;
  },

  async loadAllData() {
    await Promise.all([
      this.fetchData('bottlenecks'),
      this.fetchData('youtube'),
      this.fetchData('competitors'),
      this.fetchData('projects'),
      this.fetchData('ideas'),
      this.fetchData('meta')
    ]);
    this.renderAll();
  },

  async fetchData(type) {
    try {
      const res = await fetch('data/' + type + '.json?v=4');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      this.data[type] = await res.json();
    } catch (err) {
      console.error('Failed to load ' + type + ':', err);
      this.data[type] = null;
    }
  },

  renderAll() {
    this.renderLastUpdate();
    this.renderBottlenecks();
    this.renderOutliers();
    this.renderCompetitors();
    this.renderProjects();
    this.renderIdeas();
  },

  renderLastUpdate() {
    const lastUpdate = this.data.meta?.lastUpdated || this.data.youtube?.lastUpdated || 'Unknown';
    document.getElementById('last-update').textContent = this.formatDate(lastUpdate);
  },

  renderBottlenecks() {
    const container = document.getElementById('bottlenecks-list');
    if (!this.data.bottlenecks?.bottlenecks?.length) {
      container.innerHTML = this.renderError('No bottlenecks found');
      return;
    }
    container.innerHTML = this.data.bottlenecks.bottlenecks.map(b => {
      const isClickable = b.id === 'minecraft-artists';
      const titleClass = isClickable ? 'font-medium text-white cursor-pointer hover:text-purple-400 transition-colors' : 'font-medium text-white';
      const clickAttr = isClickable ? 'onclick="App.openArtistsModal()" title="Click to view artists"' : '';
      const icon = isClickable ? '🔍 ' : '';
      
      let researchHtml = '';
      if (b.research?.length) {
        researchHtml = '<div class="border-t border-[#252540] pt-3"><p class="text-xs text-gray-500 mb-2">Research Findings:</p><ul class="space-y-2">' + 
          b.research.map(r => '<li class="text-sm text-gray-300"><span class="text-gray-500">[' + r.date + '] ' + r.source + ':</span> ' + this.escapeHtml(r.finding) + '</li>').join('') + 
          '</ul></div>';
      }
      
      return '<div class="card"><div class="flex items-start justify-between mb-2"><h3 class="' + titleClass + '" ' + clickAttr + '>' + icon + this.escapeHtml(b.title) + '</h3><div class="flex gap-2">' + this.renderBadge(b.priority, 'priority') + this.renderBadge(b.status, 'status') + '</div></div><p class="text-sm text-gray-400 mb-3">' + this.escapeHtml(b.description) + '</p>' + researchHtml + '</div>';
    }).join('');
  },

  renderOutliers() {
    const tbody = document.getElementById('outliers-table');
    const outliers = this.data.youtube?.outlierVideos || [];
    
    if (!outliers.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="py-4 text-gray-500">No outlier data available</td></tr>';
      return;
    }

    let filtered = outliers;
    if (this.outliersFilter === 'zmde') {
      filtered = outliers.filter(v => v.category?.includes('minecraft'));
    } else if (this.outliersFilter === 'stevensongirl') {
      filtered = outliers.filter(v => v.category?.includes('pet'));
    }

    filtered = [...filtered].sort((a, b) => {
      if (this.outliersSort === 'views') return (b.views || 0) - (a.views || 0);
      if (this.outliersSort === 'viral') return (b.viralScore || 0) - (a.viralScore || 0);
      if (this.outliersSort === 'date') return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
      return 0;
    });

    const display = filtered.slice(0, this.outliersLimit);
    
    tbody.innerHTML = display.map(v => '<tr class="hover:bg-[#1a1a2e] transition-colors"><td class="py-3 px-2"><a href="' + v.url + '" target="_blank" class="text-purple-400 hover:text-purple-300 line-clamp-1">' + this.escapeHtml(v.title) + '</a></td><td class="py-3 px-2 text-gray-300">' + this.escapeHtml(v.channel || 'Unknown') + '</td><td class="py-3 px-2 text-right text-gray-300">' + this.formatViews(v.views) + '</td><td class="py-3 px-2">' + this.renderCategoryBadge(v.category) + '</td><td class="py-3 px-2 text-gray-400 text-xs">' + this.formatDate(v.publishedAt) + '</td></tr>').join('');

    const loadMoreBtn = document.getElementById('load-more-outliers');
    if (loadMoreBtn) {
      loadMoreBtn.style.display = filtered.length > this.outliersLimit ? 'inline-block' : 'none';
    }
  },

  renderCompetitors() {
    const container = document.getElementById('competitors-list');
    const competitors = this.data.competitors?.competitors || [];
    
    if (!competitors.length) {
      container.innerHTML = this.renderError('No competitor data');
      return;
    }

    const top15 = competitors.slice(0, 15);
    container.innerHTML = top15.map(c => '<div class="card p-3"><div class="flex items-start justify-between"><a href="' + c.url + '" target="_blank" class="font-medium text-white hover:text-purple-400 truncate">' + this.escapeHtml(c.name) + '</a><span class="text-xs text-gray-500">' + (c.niche || 'Unknown') + '</span></div><div class="mt-2 flex items-center gap-3 text-xs"><span class="text-green-400">' + (c.stats?.subscribers || '0') + ' subs</span><span class="text-gray-500">' + (c.stats?.videoCount || 0) + ' videos</span></div>' + (c.latestVideos?.[0] ? '<p class="mt-2 text-xs text-gray-400 line-clamp-1">Latest: ' + this.escapeHtml(c.latestVideos[0].title) + '</p>' : '') + '</div>').join('');
  },

  renderProjects() {
    const container = document.getElementById('projects-list');
    if (!this.data.projects?.projects?.length) {
      container.innerHTML = this.renderError('No projects found');
      return;
    }

    container.innerHTML = this.data.projects.projects.map(p => {
      let versionsHtml = '';
      if (p.versions?.length) {
        versionsHtml = '<button class="version-toggle w-full text-left" data-project="' + p.id + '"><div class="flex items-center justify-between text-xs text-gray-500 border-t border-[#252540] pt-2"><span>Version History (' + p.versions.length + ')</span><span class="toggle-icon">▼</span></div></button><ul class="version-list hidden mt-2 space-y-1" id="versions-' + p.id + '">' + p.versions.map(v => '<li class="text-xs text-gray-400"><span class="text-purple-400">v' + v.version + '</span> <span class="text-gray-500">(' + v.date + '):</span> ' + this.escapeHtml(v.changes) + '</li>').join('') + '</ul>';
      }
      
      let cardClick = '';
      if (p.id === '100-days-creatures') {
        cardClick = 'onclick="window.open(\'content-briefs.html\', \'_blank\')" style="cursor:pointer" title="Click to view content briefs"';
      }
      
      return '<div class="card" ' + cardClick + '><div class="flex items-start justify-between mb-2"><h3 class="font-medium text-white">' + this.escapeHtml(p.name) + '</h3>' + this.renderBadge(p.status, 'project') + '</div><p class="text-xs text-purple-400 mb-2">v' + p.currentVersion + '</p><p class="text-sm text-gray-400 mb-3">' + this.escapeHtml(p.description) + '</p>' + versionsHtml + '</div>';
    }).join('');

    container.querySelectorAll('.version-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const list = document.getElementById('versions-' + btn.dataset.project);
        const icon = btn.querySelector('.toggle-icon');
        list.classList.toggle('hidden');
        icon.textContent = list.classList.contains('hidden') ? '▼' : '▲';
      });
    });
  },

  renderBadge(value, type) {
    const colors = {
      priority: { high: 'bg-red-500/20 text-red-400', medium: 'bg-yellow-500/20 text-yellow-400', low: 'bg-blue-500/20 text-blue-400' },
      status: { researching: 'bg-yellow-500/20 text-yellow-400', 'solution found': 'bg-green-500/20 text-green-400', blocked: 'bg-red-500/20 text-red-400', resolved: 'bg-gray-500/20 text-gray-400' },
      project: { active: 'bg-green-500/20 text-green-400', paused: 'bg-yellow-500/20 text-yellow-400', completed: 'bg-blue-500/20 text-blue-400' }
    };
    const color = colors[type]?.[value?.toLowerCase()] || 'bg-gray-500/20 text-gray-400';
    return '<span class="badge ' + color + '">' + this.escapeHtml(value || 'unknown') + '</span>';
  },

  renderCategoryBadge(category) {
    const cat = (category || '').toLowerCase();
    let label = '📹 Other';
    if (cat.includes('minecraft') || cat.includes('gaming')) label = '🎮 Gaming';
    else if (cat.includes('pet')) label = '🐾 Pets';
    return '<span class="text-xs text-gray-400">' + label + '</span>';
  },

  renderError(msg) {
    return '<div class="col-span-full p-4 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">' + msg + '</div>';
  },

  formatViews(n) {
    if (!n) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  },

  formatDate(d) {
    if (!d) return 'Unknown';
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return d;
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[<>&"']/g, m => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[m]));
  },

  openArtistsModal() {
    const modal = document.getElementById('artists-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    this.loadArtists();
  },

  closeArtistsModal() {
    const modal = document.getElementById('artists-modal');
    if (modal) modal.classList.add('hidden');
  },

  async loadArtists() {
    const container = document.getElementById('artists-list');
    if (!container) return;
    
    try {
      const res = await fetch('data/artists-latest.json?v=4');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      this.renderArtists(data);
    } catch (err) {
      container.innerHTML = '<div class="text-center py-8"><p class="text-gray-400 mb-2">No artist data available yet.</p><p class="text-sm text-gray-500">The Fiverr scraper will populate this data.</p></div>';
    }
  },

  renderArtists(data) {
    const container = document.getElementById('artists-list');
    const artists = data?.artists || [];
    
    if (!artists.length) {
      container.innerHTML = '<div class="text-center py-8 text-gray-500">No artists found yet.</div>';
      return;
    }

    container.innerHTML = '<div class="mb-4 text-sm text-gray-400">Found ' + artists.length + ' artists <span class="text-gray-600">• Last updated: ' + this.formatDate(data.lastUpdated) + '</span></div><div class="grid gap-3">' + artists.map(a => '<div class="bg-[#0f0f1a] border border-[#252540] rounded p-3 hover:border-purple-500/50 transition-colors"><div class="flex items-start justify-between"><div><a href="' + a.url + '" target="_blank" class="font-medium text-purple-400 hover:text-purple-300">' + this.escapeHtml(a.name) + '</a><span class="ml-2 text-xs text-gray-500">' + this.escapeHtml(a.platform || 'Fiverr') + '</span></div><span class="text-xs text-green-400">' + this.escapeHtml(a.priceRange || 'Price N/A') + '</span></div><p class="text-sm text-gray-400 mt-2">' + this.escapeHtml(a.description || a.skills?.join(', ') || 'No description') + '</p><div class="flex flex-wrap gap-2 mt-3">' + (a.skills || []).map(s => '<span class="text-xs bg-[#252540] text-gray-400 px-2 py-1 rounded">' + this.escapeHtml(s) + '</span>').join('') + '</div>' + (a.portfolioUrl ? '<a href="' + a.portfolioUrl + '" target="_blank" class="inline-flex items-center gap-1 mt-3 text-xs text-blue-400 hover:text-blue-300"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>View Portfolio</a>' : '') + '</div>').join('') + '</div>';
  },

  renderIdeas() {
    const container = document.getElementById('ideas-list');
    if (!this.data.ideas?.ideas?.length) {
      container.innerHTML = '<div class="col-span-full p-4 text-gray-500">No ideas yet.</div>';
      return;
    }
    container.innerHTML = this.data.ideas.ideas.map(idea => '<div class="card"><div class="flex items-start justify-between mb-2"><h3 class="font-medium text-white">' + this.escapeHtml(idea.title) + '</h3><div class="flex gap-2">' + this.renderBadge(idea.priority, 'priority') + '<span class="badge bg-purple-500/20 text-purple-400">' + this.escapeHtml(idea.category) + '</span></div></div><p class="text-sm text-gray-400 mb-3">' + this.escapeHtml(idea.description) + '</p>' + (idea.tags?.length ? '<div class="flex flex-wrap gap-2 mb-3">' + idea.tags.map(tag => '<span class="text-xs bg-[#252540] text-gray-500 px-2 py-1 rounded">' + this.escapeHtml(tag) + '</span>').join('') + '</div>' : '') + '<div class="flex items-center justify-between text-xs text-gray-500"><span>Added: ' + this.formatDate(idea.dateAdded) + '</span><span class="capitalize">' + idea.status + '</span></div>' + (idea.notes ? '<p class="text-xs text-gray-500 mt-2 italic">' + this.escapeHtml(idea.notes) + '</p>' : '') + '</div>').join('');
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());

// Expenses functionality
App.loadExpenses = async function() {
  try {
    const res = await fetch("data/expenses.csv?v=1");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const text = await res.text();
    const lines = text.trim().split("
");
    const expenses = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",");
      if (cols.length >= 5) {
        expenses.push({
          date: cols[0],
          description: cols[1],
          cad: parseFloat(cols[2]) || 0,
          usd: parseFloat(cols[3]) || 0,
          category: cols[4],
          notes: cols[5] || ""
        });
      }
    }
    this.renderExpenses(expenses);
  } catch (err) {
    console.error("Failed to load expenses:", err);
  }
};

App.renderExpenses = function(expenses) {
  let totalCAD = 0, totalUSD = 0;
  expenses.forEach(function(e) {
    totalCAD += e.cad;
    totalUSD += e.usd;
  });
  document.getElementById("expenses-summary").innerHTML = "<div class='card'><p class='text-sm text-gray-400'>Total CAD</p><p class='text-2xl font-bold text-white'>$" + totalCAD.toFixed(2) + "</p></div><div class='card'><p class='text-sm text-gray-400'>Total USD</p><p class='text-2xl font-bold text-white'>$" + totalUSD.toFixed(2) + "</p></div><div class='card'><p class='text-sm text-gray-400'>Entries</p><p class='text-2xl font-bold text-white'>" + expenses.length + "</p></div>";
  document.getElementById("expenses-table").innerHTML = expenses.map(function(e) { return "<tr class='hover:bg-[#1a1a2e]'><td class='py-3 px-2 text-gray-300'>" + e.date + "</td><td class='py-3 px-2 text-gray-300'>" + e.description + "</td><td class='py-3 px-2 text-right text-gray-300'>" + (e.cad > 0 ? "$" + e.cad.toFixed(2) : "-") + "</td><td class='py-3 px-2 text-right text-gray-300'>" + (e.usd > 0 ? "$" + e.usd.toFixed(2) : "-") + "</td><td class='py-3 px-2'><span class='badge bg-purple-500/20 text-purple-400'>" + e.category + "</span></td></tr>"; }).join("");
};
