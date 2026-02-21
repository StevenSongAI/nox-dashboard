/**
 * AI Video Generator Comparison Tool
 * Based on 2026 research: Sora vs Runway vs Pika comparison
 * Research: Runway Gen-4 = best control, Pika 2.5 = best value + fastest, Sora = best fidelity
 */

class AIVideoComparisonTool {
  constructor() {
    this.tools = {
      sora: {
        name: 'Sora',
        company: 'OpenAI',
        icon: '🎬',
        bestFor: 'Visual fidelity & narrative',
        speed: 'Medium',
        price: '$$$',
        freeTier: false,
        strengths: [
          'Deep narrative intelligence',
          'Character emotion & dialogue',
          'Best visual fidelity',
          'Physics simulation',
          'Complex scene understanding'
        ],
        weaknesses: [
          'Limited control over output',
          'No fine-tuning options',
          'Expensive for high volume',
          'Waitlist access'
        ],
        useCases: ['Cinematic trailers', 'Story sequences', 'Concept visualization', 'VFX previs'],
        generationTime: '1-2 minutes',
        maxDuration: '60 seconds',
        quality: 95,
        control: 60,
        speed: 70,
        value: 65
      },
      runway: {
        name: 'Runway Gen-4',
        company: 'Runway',
        icon: '🎭',
        bestFor: 'Professional creative control',
        speed: 'Slower',
        price: '$$',
        freeTier: true,
        strengths: [
          'Most comprehensive toolkit',
          'Precise camera control',
          'Consistent characters across shots',
          'Motion brush for editing',
          'Commercial-ready output'
        ],
        weaknesses: [
          'Slower generation (1-3 min)',
          'Steeper learning curve',
          'Can be expensive at scale',
          'Requires more prompting skill'
        ],
        useCases: ['Commercial work', 'Music videos', 'Fashion content', 'Controlled sequences'],
        generationTime: '1-3 minutes',
        maxDuration: '16 seconds',
        quality: 90,
        control: 95,
        speed: 50,
        value: 80
      },
      pika: {
        name: 'Pika Labs 2.5',
        company: 'Pika',
        icon: '⚡',
        bestFor: 'Speed & value',
        speed: 'Fastest',
        price: '$',
        freeTier: true,
        strengths: [
          'Fastest generation (30-90s)',
          'Best value for money',
          'Accessible for beginners',
          'Lip sync capabilities',
          'Image-to-video quality'
        ],
        weaknesses: [
          'Less control than Runway',
          'Shorter clips (3-4s typical)',
          'Fewer advanced features',
          'Character consistency varies'
        ],
        useCases: ['Social media content', 'Quick prototypes', 'Meme videos', 'Short-form content'],
        generationTime: '30-90 seconds',
        maxDuration: '4 seconds',
        quality: 80,
        control: 70,
        speed: 95,
        value: 95
      },
      heygen: {
        name: 'HeyGen',
        company: 'HeyGen',
        icon: '👤',
        bestFor: 'AI avatars & translation',
        speed: 'Fast',
        price: '$$',
        freeTier: true,
        strengths: [
          'Best AI avatar generation',
          'Video translation (unbeatable)',
          'Lip-sync across languages',
          'Custom avatar creation',
          'Script-to-video workflow'
        ],
        weaknesses: [
          'Limited to avatar content',
          'Less creative flexibility',
          'Subscription model',
          'Not for general video gen'
        ],
        useCases: ['Training videos', 'Marketing content', 'Localization', 'Personalized outreach'],
        generationTime: '1-2 minutes',
        maxDuration: '5 minutes',
        quality: 85,
        control: 75,
        speed: 80,
        value: 85
      },
      kling: {
        name: 'Kling AI',
        company: 'Kuaishou',
        icon: '🎮',
        bestFor: 'Character animation',
        speed: 'Medium',
        price: '$',
        freeTier: true,
        strengths: [
          'Strong character animation',
          'Good motion understanding',
          'Competitive pricing',
          'Growing feature set',
          'Active development'
        ],
        weaknesses: [
          'Newer to market',
          'Smaller community',
          'Less documentation',
          'Inconsistent quality'
        ],
        useCases: ['Character content', 'Animation tests', 'Social media', 'Creative experiments'],
        generationTime: '1-2 minutes',
        maxDuration: '10 seconds',
        quality: 82,
        control: 72,
        speed: 75,
        value: 88
      }
    };
    
    this.currentTool = 'runway';
    this.compareMode = false;
    this.selectedTools = ['runway', 'pika'];
    this.useCaseFilter = 'all';
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="ai-video-tool-container">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
          <div>
            <h3 class="text-lg font-semibold text-accent-blue">🎥 AI Video Generator Comparison</h3>
            <p class="text-sm text-gray-400">Compare Sora, Runway, Pika & more — find the right tool for your needs</p>
          </div>
          <div class="flex gap-2">
            <button onclick="aiVideoTool.toggleMode()" id="mode-toggle" class="px-3 py-1 bg-accent-blue rounded text-sm hover:bg-blue-600">
              📊 Compare Mode
            </button>
          </div>
        </div>

        <!-- Tool Selector (Single Mode) -->
        <div id="single-selector" class="mb-4">
          <div class="grid grid-cols-3 md:grid-cols-5 gap-2">
            ${Object.entries(this.tools).map(([key, tool]) => `
              <button onclick="aiVideoTool.selectTool('${key}')" 
                      class="tool-btn p-3 rounded-lg text-left transition-all ${this.currentTool === key ? 'bg-accent-blue text-white ring-2 ring-accent-blue' : 'bg-dark-700 hover:bg-dark-600'}"
                      data-tool="${key}">
                <div class="text-2xl mb-1">${tool.icon}</div>
                <div class="font-medium text-sm">${tool.name}</div>
                <div class="text-xs opacity-70">${tool.bestFor}</div>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Compare Selector (Compare Mode) -->
        <div id="compare-selector" class="mb-4 hidden">
          <div class="bg-dark-800 rounded-lg p-3 mb-3">
            <div class="text-sm text-gray-400 mb-2">Select 2 tools to compare:</div>
            <div class="flex flex-wrap gap-2">
              ${Object.entries(this.tools).map(([key, tool]) => {
                const isSelected = this.selectedTools.includes(key);
                return `
                  <button onclick="aiVideoTool.toggleCompareTool('${key}')" 
                          class="compare-btn px-3 py-2 rounded text-sm transition-all ${isSelected ? 'bg-accent-green text-white' : 'bg-dark-700 hover:bg-dark-600'}"
                          data-tool="${key}">
                    ${tool.icon} ${tool.name}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Content Display -->
        <div id="tool-content">${this.compareMode ? this.renderCompareView() : this.renderSingleView()}</div>

        <!-- Use Case Filter -->
        <div class="mt-6 card rounded-lg p-4">
          <h4 class="text-sm font-semibold text-gray-400 mb-3">🎯 Find by Use Case</h4>
          <div class="flex flex-wrap gap-2">
            ${['all', 'Commercial work', 'Social media', 'Cinematic', 'Avatars', 'Quick prototypes'].map(uc => `
              <button onclick="aiVideoTool.filterUseCase('${uc}')" 
                      class="usecase-btn px-3 py-1 rounded text-xs ${this.useCaseFilter === uc ? 'bg-accent-purple text-white' : 'bg-dark-700 hover:bg-dark-600'}"
                      data-usecase="${uc}">
                ${uc}
              </button>
            `).join('')}
          </div>
          <div id="usecase-results" class="mt-3">${this.renderUseCaseResults()}</div>
        </div>

        <!-- 2026 Trends -->
        <div class="mt-6 card rounded-lg p-4 border-l-4 border-accent-blue">
          <h4 class="text-sm font-semibold text-accent-blue mb-2">🔮 2026 AI Video Trends</h4>
          <ul class="text-sm text-gray-300 space-y-1">
            <li>• Single prompts now generate cinematic full sequences (not just clips)</li>
            <li>• Character consistency across multiple shots is now possible</li>
            <li>• Lip-sync and dialogue generation reaching production quality</li>
            <li>• Speed vs quality trade-off becoming the key decision factor</li>
          </ul>
        </div>
      </div>
    `;
  }

  renderSingleView() {
    const tool = this.tools[this.currentTool];
    return `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Tool Details -->
        <div class="card rounded-lg p-4">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-4xl">${tool.icon}</span>
            <div>
              <h4 class="text-xl font-bold">${tool.name}</h4>
              <div class="text-sm text-gray-400">${tool.company} • ${tool.bestFor}</div>
            </div>
          </div>

          <!-- Key Stats -->
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="bg-dark-800 rounded p-3 text-center">
              <div class="text-lg font-bold text-accent-green">${tool.price}</div>
              <div class="text-xs text-gray-400">Pricing</div>
            </div>
            <div class="bg-dark-800 rounded p-3 text-center">
              <div class="text-lg font-bold text-accent-blue">${tool.generationTime}</div>
              <div class="text-xs text-gray-400">Generation Time</div>
            </div>
            <div class="bg-dark-800 rounded p-3 text-center">
              <div class="text-lg font-bold text-accent-purple">${tool.maxDuration}</div>
              <div class="text-xs text-gray-400">Max Duration</div>
            </div>
            <div class="bg-dark-800 rounded p-3 text-center">
              <div class="text-lg font-bold ${tool.freeTier ? 'text-green-400' : 'text-yellow-400'}">${tool.freeTier ? '✓' : '✗'}</div>
              <div class="text-xs text-gray-400">Free Tier</div>
            </div>
          </div>

          <!-- Radar Chart -->
          <div class="mb-4">
            <h5 class="text-sm font-semibold text-gray-400 mb-2">Performance Scores</h5>
            ${this.renderRadarChart(tool)}
          </div>
        </div>

        <!-- Strengths/Weaknesses -->
        <div class="space-y-4">
          <div class="card rounded-lg p-4">
            <h5 class="text-sm font-semibold text-green-400 mb-2">✅ Strengths</h5>
            <ul class="text-sm text-gray-300 space-y-1">
              ${tool.strengths.map(s => `<li>• ${s}</li>`).join('')}
            </ul>
          </div>

          <div class="card rounded-lg p-4">
            <h5 class="text-sm font-semibold text-red-400 mb-2">❌ Weaknesses</h5>
            <ul class="text-sm text-gray-300 space-y-1">
              ${tool.weaknesses.map(w => `<li>• ${w}</li>`).join('')}
            </ul>
          </div>

          <div class="card rounded-lg p-4">
            <h5 class="text-sm font-semibold text-accent-blue mb-2">🎯 Best For</h5>
            <div class="flex flex-wrap gap-2">
              ${tool.useCases.map(uc => `
                <span class="px-2 py-1 bg-dark-700 rounded text-xs">${uc}</span>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderCompareView() {
    if (this.selectedTools.length !== 2) {
      return `<div class="text-center py-8 text-gray-400">Please select exactly 2 tools to compare</div>
      `;
    }

    const [tool1Key, tool2Key] = this.selectedTools;
    const tool1 = this.tools[tool1Key];
    const tool2 = this.tools[tool2Key];

    return `
      <div class="card rounded-lg p-4">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-dark-700">
              <th class="pb-3 text-left">Feature</th>
              <th class="pb-3 text-center">${tool1.icon} ${tool1.name}</th>
              <th class="pb-3 text-center">${tool2.icon} ${tool2.name}</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-dark-700/50">
              <td class="py-2 text-gray-400">Best For</td>
              <td class="py-2 text-center">${tool1.bestFor}</td>
              <td class="py-2 text-center">${tool2.bestFor}</td>
            </tr>
            <tr class="border-b border-dark-700/50">
              <td class="py-2 text-gray-400">Generation Speed</td>
              <td class="py-2 text-center ${tool1.speed > tool2.speed ? 'text-green-400' : ''}">${tool1.generationTime}</td>
              <td class="py-2 text-center ${tool2.speed > tool1.speed ? 'text-green-400' : ''}">${tool2.generationTime}</td>
            </tr>
            <tr class="border-b border-dark-700/50">
              <td class="py-2 text-gray-400">Max Duration</td>
              <td class="py-2 text-center">${tool1.maxDuration}</td>
              <td class="py-2 text-center">${tool2.maxDuration}</td>
            </tr>
            <tr class="border-b border-dark-700/50">
              <td class="py-2 text-gray-400">Quality Score</td>
              <td class="py-2 text-center ${tool1.quality > tool2.quality ? 'text-green-400 font-bold' : ''}">${tool1.quality}/100</td>
              <td class="py-2 text-center ${tool2.quality > tool1.quality ? 'text-green-400 font-bold' : ''}">${tool2.quality}/100</td>
            </tr>
            <tr class="border-b border-dark-700/50">
              <td class="py-2 text-gray-400">Control Score</td>
              <td class="py-2 text-center ${tool1.control > tool2.control ? 'text-green-400 font-bold' : ''}">${tool1.control}/100</td>
              <td class="py-2 text-center ${tool2.control > tool1.control ? 'text-green-400 font-bold' : ''}">${tool2.control}/100</td>
            </tr>
            <tr class="border-b border-dark-700/50">
              <td class="py-2 text-gray-400">Speed Score</td>
              <td class="py-2 text-center ${tool1.speed > tool2.speed ? 'text-green-400 font-bold' : ''}">${tool1.speed}/100</td>
              <td class="py-2 text-center ${tool2.speed > tool1.speed ? 'text-green-400 font-bold' : ''}">${tool2.speed}/100</td>
            </tr>
            <tr class="border-b border-dark-700/50">
              <td class="py-2 text-gray-400">Value Score</td>
              <td class="py-2 text-center ${tool1.value > tool2.value ? 'text-green-400 font-bold' : ''}">${tool1.value}/100</td>
              <td class="py-2 text-center ${tool2.value > tool1.value ? 'text-green-400 font-bold' : ''}">${tool2.value}/100</td>
            </tr>
            <tr>
              <td class="py-2 text-gray-400">Free Tier</td>
              <td class="py-2 text-center">${tool1.freeTier ? '✅ Yes' : '❌ No'}</td>
              <td class="py-2 text-center">${tool2.freeTier ? '✅ Yes' : '❌ No'}</td>
            </tr>
          </tbody>
        </table>

        <div class="mt-4 grid grid-cols-2 gap-4">
          <div class="bg-dark-800 rounded p-3">
            <div class="text-sm font-semibold mb-1">${tool1.name} Wins On:</div>
            <div class="text-xs text-gray-400">${this.getWinningCategories(tool1, tool2).join(', ') || 'Check comparison'}</div>
          </div>
          <div class="bg-dark-800 rounded p-3">
            <div class="text-sm font-semibold mb-1">${tool2.name} Wins On:</div>
            <div class="text-xs text-gray-400">${this.getWinningCategories(tool2, tool1).join(', ') || 'Check comparison'}</div>
          </div>
        </div>
      </div>
    `;
  }

  renderRadarChart(tool) {
    const categories = ['Quality', 'Control', 'Speed', 'Value'];
    const values = [tool.quality, tool.control, tool.speed, tool.value];
    
    return `
      <div class="grid grid-cols-4 gap-2">
        ${categories.map((cat, i) => `
          <div class="text-center">
            <div class="text-xs text-gray-400 mb-1">${cat}</div>
            <div class="text-lg font-bold ${values[i] >= 85 ? 'text-green-400' : values[i] >= 70 ? 'text-accent-blue' : 'text-yellow-400'}">${values[i]}</div>
            <div class="w-full bg-dark-700 rounded-full h-1.5 mt-1">
              <div class="bg-accent-blue h-1.5 rounded-full" style="width: ${values[i]}%"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderUseCaseResults() {
    let filtered = Object.entries(this.tools);
    
    if (this.useCaseFilter !== 'all') {
      filtered = filtered.filter(([key, tool]) => 
        tool.useCases.some(uc => uc.toLowerCase().includes(this.useCaseFilter.toLowerCase())) ||
        tool.bestFor.toLowerCase().includes(this.useCaseFilter.toLowerCase())
      );
    }

    if (filtered.length === 0) {
      return '<div class="text-sm text-gray-400">No tools match this use case</div>';
    }

    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        ${filtered.map(([key, tool]) => `
          <div class="bg-dark-700 rounded p-2 flex items-center gap-2 cursor-pointer hover:bg-dark-600" onclick="aiVideoTool.selectTool('${key}')">
            <span class="text-xl">${tool.icon}</span>
            <div class="flex-1">
              <div class="font-medium text-sm">${tool.name}</div>
              <div class="text-xs text-gray-400">${tool.bestFor}</div>
            </div>
            <span class="text-xs px-2 py-0.5 rounded ${tool.value >= 85 ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}">${tool.value}/100</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  getWinningCategories(tool, other) {
    const wins = [];
    if (tool.quality > other.quality) wins.push('Quality');
    if (tool.control > other.control) wins.push('Control');
    if (tool.speed > other.speed) wins.push('Speed');
    if (tool.value > other.value) wins.push('Value');
    return wins;
  }

  selectTool(key) {
    this.currentTool = key;
    this.refreshUI();
  }

  toggleMode() {
    this.compareMode = !this.compareMode;
    document.getElementById('mode-toggle').textContent = this.compareMode ? '👁️ Single View' : '📊 Compare Mode';
    document.getElementById('single-selector').classList.toggle('hidden', this.compareMode);
    document.getElementById('compare-selector').classList.toggle('hidden', !this.compareMode);
    this.refreshContent();
  }

  toggleCompareTool(key) {
    if (this.selectedTools.includes(key)) {
      this.selectedTools = this.selectedTools.filter(t => t !== key);
    } else if (this.selectedTools.length < 2) {
      this.selectedTools.push(key);
    } else {
      // Replace oldest selection
      this.selectedTools.shift();
      this.selectedTools.push(key);
    }
    this.refreshCompareSelector();
    this.refreshContent();
  }

  filterUseCase(useCase) {
    this.useCaseFilter = useCase;
    document.querySelectorAll('.usecase-btn').forEach(btn => {
      btn.classList.toggle('bg-accent-purple', btn.dataset.usecase === useCase);
      btn.classList.toggle('text-white', btn.dataset.usecase === useCase);
      btn.classList.toggle('bg-dark-700', btn.dataset.usecase !== useCase);
    });
    document.getElementById('usecase-results').innerHTML = this.renderUseCaseResults();
  }

  refreshUI() {
    document.querySelectorAll('.tool-btn').forEach(btn => {
      const isActive = btn.dataset.tool === this.currentTool;
      btn.className = `tool-btn p-3 rounded-lg text-left transition-all ${isActive ? 'bg-accent-blue text-white ring-2 ring-accent-blue' : 'bg-dark-700 hover:bg-dark-600'}`;
    });
    this.refreshContent();
  }

  refreshCompareSelector() {
    document.querySelectorAll('.compare-btn').forEach(btn => {
      const isSelected = this.selectedTools.includes(btn.dataset.tool);
      btn.className = `compare-btn px-3 py-2 rounded text-sm transition-all ${isSelected ? 'bg-accent-green text-white' : 'bg-dark-700 hover:bg-dark-600'}`;
    });
  }

  refreshContent() {
    document.getElementById('tool-content').innerHTML = this.compareMode ? this.renderCompareView() : this.renderSingleView();
  }
}

// Initialize global instance
window.AIVideoComparisonTool = AIVideoComparisonTool;
window.aiVideoTool = new AIVideoComparisonTool();

// Auto-load if container exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('ai-video-comparison-container')) {
    window.aiVideoTool.render('ai-video-comparison-container');
  }
});
