/**
 * AI Coding Assistant Comparison Tool
 * Based on 2026 research: Cursor vs GitHub Copilot vs Claude Code
 * Research: Cursor = speed/simplicity, Copilot = mature/reliable, Claude = deep reasoning
 */

class AICodingAssistantComparison {
  constructor() {
    this.tools = {
      cursor: {
        name: 'Cursor',
        company: 'Anysphere',
        icon: '⚡',
        bestFor: 'Speed and simplicity',
        pricing: '$20/month',
        freeTier: true,
        strengths: [
          'Fastest idea-to-code workflow',
          'VS Code familiarity (fork)',
          'Prominent chat interface',
          'Natural conversation flow',
          'Fast tab completion',
          'Frequent feature updates'
        ],
        weaknesses: [
          'Newer, less mature ecosystem',
          'Smaller community than Copilot',
          'Can be overwhelming with features',
          'Some stability issues reported'
        ],
        useCases: ['Rapid prototyping', 'Daily shipping', 'Feature development', 'Startup MVPs'],
        speed: 95,
        reliability: 80,
        reasoning: 75,
        ecosystem: 70,
        value: 90
      },
      copilot: {
        name: 'GitHub Copilot',
        company: 'GitHub/Microsoft',
        icon: '🐙',
        bestFor: 'Professional development',
        pricing: '$19/month',
        freeTier: true,
        strengths: [
          'Most mature and reliable',
          'Broad language support',
          'Deep IDE integration',
          'GitHub ecosystem synergy',
          'Quick iterative coding',
          'Enterprise security features'
        ],
        weaknesses: [
          'Less cutting-edge than Cursor',
          'Chat interface less prominent',
          'Can be conservative with suggestions',
          'Requires GitHub account'
        ],
        useCases: ['Enterprise teams', 'Production code', 'Multiple languages', 'GitHub workflows'],
        speed: 85,
        reliability: 95,
        reasoning: 80,
        ecosystem: 95,
        value: 85
      },
      claude: {
        name: 'Claude Code',
        company: 'Anthropic',
        icon: '🧠',
        bestFor: 'Deep reasoning and complex tasks',
        pricing: '$20/month',
        freeTier: false,
        strengths: [
          'Best for complex debugging',
          'Deep reasoning capabilities',
          'Excellent at refactoring',
          'Handles gnarly race conditions',
          'Service layer expertise',
          'Context-aware suggestions'
        ],
        weaknesses: [
          'Terminal-based workflow',
          'Learning curve for new users',
          'Slower than alternatives',
          'No free tier'
        ],
        useCases: ['Complex debugging', 'Code refactoring', 'Architecture decisions', 'Technical debt'],
        speed: 70,
        reliability: 85,
        reasoning: 95,
        ecosystem: 75,
        value: 80
      },
      windsurf: {
        name: 'Windsurf',
        company: 'Codeium',
        icon: '🌊',
        bestFor: 'Free alternative with power',
        pricing: 'Free / $12 Pro',
        freeTier: true,
        strengths: [
          'Completely free tier',
          'Competitive with paid tools',
          'Good autocomplete',
          'Growing feature set',
          'Lightweight',
          'No credit card required'
        ],
        weaknesses: [
          'Newer to market',
          'Smaller user base',
          'Less documentation',
          'Fewer enterprise features'
        ],
        useCases: ['Budget-conscious devs', 'Students', 'Side projects', 'Trying AI coding'],
        speed: 80,
        reliability: 75,
        reasoning: 70,
        ecosystem: 65,
        value: 95
      }
    };
    
    this.currentTool = 'cursor';
    this.compareMode = false;
    this.selectedTools = ['cursor', 'copilot'];
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="ai-coding-comparison-container">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
          <div>
            <h3 class="text-lg font-semibold text-accent-blue">💻 AI Coding Assistant Comparison</h3>
            <p class="text-sm text-gray-400">Find the right AI pair programmer for your workflow</p>
          </div>
          <div class="flex gap-2">
            <button onclick="aiCodingComparison.toggleMode()" id="coding-mode-toggle" class="px-3 py-1 bg-accent-blue rounded text-sm hover:bg-blue-600">
              📊 Compare Mode
            </button>
          </div>
        </div>

        <!-- Tool Selector (Single Mode) -->
        <div id="coding-single-selector" class="mb-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            ${Object.entries(this.tools).map(([key, tool]) => `
              <button onclick="aiCodingComparison.selectTool('${key}')" 
                      class="coding-tool-btn p-3 rounded-lg text-left transition-all ${this.currentTool === key ? 'bg-accent-blue text-white ring-2 ring-accent-blue' : 'bg-dark-700 hover:bg-dark-600'}"
                      data-tool="${key}">
                <div class="text-2xl mb-1">${tool.icon}</div>
                <div class="font-medium text-sm">${tool.name}</div>
                <div class="text-xs opacity-70">${tool.bestFor}</div>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Compare Selector (Compare Mode) -->
        <div id="coding-compare-selector" class="mb-4 hidden">
          <div class="bg-dark-800 rounded-lg p-3 mb-3">
            <div class="text-sm text-gray-400 mb-2">Select 2 tools to compare:</div>
            <div class="flex flex-wrap gap-2">
              ${Object.entries(this.tools).map(([key, tool]) => {
                const isSelected = this.selectedTools.includes(key);
                return `
                  <button onclick="aiCodingComparison.toggleCompareTool('${key}')" 
                          class="coding-compare-btn px-3 py-2 rounded text-sm transition-all ${isSelected ? 'bg-accent-green text-white' : 'bg-dark-700 hover:bg-dark-600'}"
                          data-tool="${key}">
                    ${tool.icon} ${tool.name}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Content Display -->
        <div id="coding-tool-content">${this.compareMode ? this.renderCompareView() : this.renderSingleView()}</div>

        <!-- Quick Recommendations -->
        <div class="mt-6 card rounded-lg p-4">
          <h4 class="text-sm font-semibold text-gray-400 mb-3">🎯 Quick Recommendations</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="bg-dark-800 rounded p-3">
              <div class="font-medium text-green-400 mb-1">⚡ Speed & Simplicity → Cursor</div>
              <div class="text-xs text-gray-400">Best for shipping features daily, rapid prototyping, startup MVPs</div>
            </div>
            <div class="bg-dark-800 rounded p-3">
              <div class="font-medium text-blue-400 mb-1">🐙 Professional/Ecosystem → GitHub Copilot</div>
              <div class="text-xs text-gray-400">Best for enterprise teams, production code, broad language support</div>
            </div>
            <div class="bg-dark-800 rounded p-3">
              <div class="font-medium text-purple-400 mb-1">🧠 Complex Tasks → Claude Code</div>
              <div class="text-xs text-gray-400">Best for debugging, refactoring, architecture decisions</div>
            </div>
            <div class="bg-dark-800 rounded p-3">
              <div class="font-medium text-yellow-400 mb-1">🌊 Budget/Free → Windsurf</div>
              <div class="text-xs text-gray-400">Best for students, side projects, trying AI coding without cost</div>
            </div>
          </div>
        </div>

        <!-- 2026 Insights -->
        <div class="mt-6 card rounded-lg p-4 border-l-4 border-accent-blue">
          <h4 class="text-sm font-semibold text-accent-blue mb-2">🔮 2026 AI Coding Trends</h4>
          <ul class="text-sm text-gray-300 space-y-1">
            <li>• Cursor is shipping features faster than competitors</li>
            <li>• Claude Code leads on complex reasoning tasks</li>
            <li>• Copilot remains the safe enterprise choice</li>
            <li>• Free alternatives like Windsurf are catching up</li>
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
              <div class="text-lg font-bold text-accent-green">${tool.pricing}</div>
              <div class="text-xs text-gray-400">Pricing</div>
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
      return `<div class="text-center py-8 text-gray-400">Please select exactly 2 tools to compare</div>`;
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
              <td class="py-2 text-gray-400">Speed Score</td>
              <td class="py-2 text-center ${tool1.speed > tool2.speed ? 'text-green-400 font-bold' : ''}">${tool1.speed}/100</td>
              <td class="py-2 text-center ${tool2.speed > tool1.speed ? 'text-green-400 font-bold' : ''}">${tool2.speed}/100</td>
            </tr>
            <tr class="border-b border-dark-700/50">
              <td class="py-2 text-gray-400">Reliability</td>
              <td class="py-2 text-center ${tool1.reliability > tool2.reliability ? 'text-green-400 font-bold' : ''}">${tool1.reliability}/100</td>
              <td class="py-2 text-center ${tool2.reliability > tool1.reliability ? 'text-green-400 font-bold' : ''}">${tool2.reliability}/100</td>
            </tr>
            <tr class="border-b border-dark-700/50">
              <td class="py-2 text-gray-400">Reasoning</td>
              <td class="py-2 text-center ${tool1.reasoning > tool2.reasoning ? 'text-green-400 font-bold' : ''}">${tool1.reasoning}/100</td>
              <td class="py-2 text-center ${tool2.reasoning > tool1.reasoning ? 'text-green-400 font-bold' : ''}">${tool2.reasoning}/100</td>
            </tr>
            <tr class="border-b border-dark-700/50">
              <td class="py-2 text-gray-400">Ecosystem</td>
              <td class="py-2 text-center ${tool1.ecosystem > tool2.ecosystem ? 'text-green-400 font-bold' : ''}">${tool1.ecosystem}/100</td>
              <td class="py-2 text-center ${tool2.ecosystem > tool1.ecosystem ? 'text-green-400 font-bold' : ''}">${tool2.ecosystem}/100</td>
            </tr>
            <tr class="border-b border-dark-700/50">
              <td class="py-2 text-gray-400">Value</td>
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
      </div>
    `;
  }

  renderRadarChart(tool) {
    const categories = ['Speed', 'Reliability', 'Reasoning', 'Ecosystem', 'Value'];
    const values = [tool.speed, tool.reliability, tool.reasoning, tool.ecosystem, tool.value];
    
    return `
      <div class="grid grid-cols-5 gap-2">
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

  selectTool(key) {
    this.currentTool = key;
    this.refreshUI();
  }

  toggleMode() {
    this.compareMode = !this.compareMode;
    document.getElementById('coding-mode-toggle').textContent = this.compareMode ? '👁️ Single View' : '📊 Compare Mode';
    document.getElementById('coding-single-selector').classList.toggle('hidden', this.compareMode);
    document.getElementById('coding-compare-selector').classList.toggle('hidden', !this.compareMode);
    this.refreshContent();
  }

  toggleCompareTool(key) {
    if (this.selectedTools.includes(key)) {
      this.selectedTools = this.selectedTools.filter(t => t !== key);
    } else if (this.selectedTools.length < 2) {
      this.selectedTools.push(key);
    } else {
      this.selectedTools.shift();
      this.selectedTools.push(key);
    }
    this.refreshCompareSelector();
    this.refreshContent();
  }

  refreshUI() {
    document.querySelectorAll('.coding-tool-btn').forEach(btn => {
      const isActive = btn.dataset.tool === this.currentTool;
      btn.className = `coding-tool-btn p-3 rounded-lg text-left transition-all ${isActive ? 'bg-accent-blue text-white ring-2 ring-accent-blue' : 'bg-dark-700 hover:bg-dark-600'}`;
    });
    this.refreshContent();
  }

  refreshCompareSelector() {
    document.querySelectorAll('.coding-compare-btn').forEach(btn => {
      const isSelected = this.selectedTools.includes(btn.dataset.tool);
      btn.className = `coding-compare-btn px-3 py-2 rounded text-sm transition-all ${isSelected ? 'bg-accent-green text-white' : 'bg-dark-700 hover:bg-dark-600'}`;
    });
  }

  refreshContent() {
    document.getElementById('coding-tool-content').innerHTML = this.compareMode ? this.renderCompareView() : this.renderSingleView();
  }
}

// Initialize global instance
window.AICodingAssistantComparison = AICodingAssistantComparison;
window.aiCodingComparison = new AICodingAssistantComparison();

// Auto-load if container exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('ai-coding-comparison-container')) {
    window.aiCodingComparison.render('ai-coding-comparison-container');
  }
});
