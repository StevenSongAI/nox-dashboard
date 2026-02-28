const App = {
  briefs: [],
  filter: 'all',
  dataFile: window.location.pathname.includes('zmde') ? 'data/zmde-briefs.json?v=9' : 'data/content-briefs.json?v=9',
  isZMDE: window.location.pathname.includes('zmde'),
  
  init() {
    this.loadBriefs();
    this.setupEventListeners();
  },
  
  setupEventListeners() {
    document.getElementById('creature-filter')?.addEventListener('change', (e) => {
      this.filter = e.target.value;
      this.renderBriefs();
    });
    
    document.getElementById('brief-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'brief-modal') this.closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  },
  
  async loadBriefs() {
    try {
      const res = await fetch(this.dataFile);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      this.briefs = data.briefs || [];
      document.getElementById('brief-count').textContent = this.briefs.length + ' briefs';
      this.renderBriefs();
    } catch (err) {
      console.error('Failed to load briefs:', err);
      document.getElementById('briefs-list').innerHTML = '<div class="col-span-full p-8 text-center"><p class="text-gray-400 mb-2">Failed to load briefs</p><p class="text-sm text-gray-500">' + err.message + '</p></div>';
    }
  },
  
  renderBriefs() {
    const container = document.getElementById('briefs-list');
    let filtered = this.filter === 'all' ? this.briefs : this.briefs.filter(b => b.category && b.category.includes(this.filter));
    
    if (!filtered.length) {
      container.innerHTML = '<div class="col-span-full p-8 text-center text-gray-500">No briefs match filter.</div>';
      return;
    }
    
    container.innerHTML = filtered.map((brief, idx) => {
      const imgHtml = brief.creatureImage ? '<img src="' + brief.creatureImage + '" class="creature-img w-full">' : '<div class="creature-img bg-[#252540] flex items-center justify-center text-4xl">' + (brief.creatureIcon || '🐉') + '</div>';
      const badgeText = this.isZMDE ? 'Civilization' : '100 Days';
      return '<div class="brief-card bg-[#1a1a2e] border border-[#252540] rounded-lg overflow-hidden cursor-pointer" onclick="App.openBrief(' + idx + ')">' + imgHtml + '<div class="p-4"><div class="flex items-center justify-between mb-2"><h3 class="font-semibold text-white">' + brief.creatureName + '</h3><span class="day-badge text-xs text-white px-2 py-1 rounded-full">' + badgeText + '</span></div><p class="text-sm text-gray-400 mb-3 line-clamp-2">' + brief.hook + '</p><div class="flex items-center justify-between text-xs"><span class="text-gray-500">' + brief.sourceChannel + '</span><span class="text-purple-400">' + (brief.sourceViews || 'Unknown') + ' views</span></div></div></div>';
    }).join('');
  },
  
  openBrief(index) {
    const brief = this.briefs[index];
    if (!brief) return;
    
    document.getElementById('modal-creature-icon').textContent = brief.creatureIcon || '🐉';
    const modalTitle = this.isZMDE ? brief.creatureName : 'Raising a Pet ' + brief.creatureName + ' for 100 Days';
    document.getElementById('modal-title').textContent = modalTitle;
    document.getElementById('modal-source-link').href = brief.sourceUrl;
    
    let storyArcHtml = '<p class="text-sm text-gray-500">Story arc not yet generated.</p>';
    if (brief.storyArc && brief.storyArc.length) {
      storyArcHtml = brief.storyArc.map(phase => {
        const days = phase.days || (phase.phase ? phase.phase.split(':')[0].replace('Days ', '') : 'Unknown');
        const title = phase.title || (phase.phase ? phase.phase.split(':')[1] || phase.phase : 'Untitled');
        return '<div class="flex gap-3"><div class="flex-shrink-0 w-20 text-xs text-purple-400 font-medium">' + days + '</div><div><p class="text-sm font-medium text-white">' + title + '</p><p class="text-sm text-gray-400">' + phase.description + '</p></div></div>';
      }).join('');
    }
    
    let challengesHtml = '<li class="text-sm text-gray-500">Not yet defined.</li>';
    if (brief.challenges && brief.challenges.length) {
      challengesHtml = brief.challenges.map(c => '<li class="text-sm text-gray-400">• ' + c + '</li>').join('');
    }
    
    const imgSection = brief.creatureImage ? '<img src="' + brief.creatureImage + '" class="w-full rounded-lg border border-[#252540]">' : '';
    const storyArcTitle = this.isZMDE ? 'Story Arc' : '100-Day Story Arc';
    
    document.getElementById('modal-content').innerHTML = '<div class="space-y-6">' + imgSection + '<div><h4 class="text-sm font-medium text-gray-300 mb-2">Source Outlier</h4><a href="' + brief.sourceUrl + '" target="_blank" class="text-purple-400 hover:text-purple-300">' + brief.sourceTitle + '</a><p class="text-xs text-gray-500 mt-1">' + brief.sourceChannel + ' • ' + (brief.sourceViews || 'Unknown') + ' views</p></div><div><h4 class="text-sm font-medium text-gray-300 mb-2">The Hook</h4><p class="text-sm text-gray-400">' + brief.hook + '</p></div><div><h4 class="text-sm font-medium text-gray-300 mb-2">' + storyArcTitle + '</h4><div class="space-y-3">' + storyArcHtml + '</div></div><div><h4 class="text-sm font-medium text-gray-300 mb-2">Key Challenges</h4><ul class="space-y-1">' + challengesHtml + '</ul></div><div><h4 class="text-sm font-medium text-gray-300 mb-2">Climactic Ending</h4><p class="text-sm text-gray-400">' + (brief.climax || 'Not yet defined.') + '</p></div></div>';
    
    document.getElementById('brief-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },
  
  closeModal() {
    document.getElementById('brief-modal').classList.add('hidden');
    document.body.style.overflow = '';
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
