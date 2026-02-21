/**
 * Local LLM Comparison Tool
 * Based on 2026 research: Ollama 0.6, DeepSeek-R1, LM Studio, llama.cpp, GPT4All
 * Research: Ollama = multimodal + 128K context, DeepSeek-R1 = open weights + reasoning
 * LM Studio = best GUI, llama.cpp = performance, GPT4All = easiest setup
 */

class LocalLLMComparison {
  constructor() {
    this.tools = {
      ollama: {
        name: 'Ollama',
        version: '0.6.0',
        icon: '🦙',
        bestFor: 'Mac users, multimodal workflows',
        pricing: 'Free',
        license: 'MIT',
        platforms: ['macOS', 'Linux', 'Windows'],
        features: [
          'Multimodal vision support (images)',
          '128K context windows',
          'One-command model pull',
          'REST API built-in',
          'Docker support',
          'Model library (Llama, Mistral, etc.)'
        ],
        strengths: [
          'Easiest setup on macOS',
          'Great multimodal capabilities',
          'Active development',
          'Strong community'
        ],
        weaknesses: [
          'Mac-first development',
          'Smaller model selection than some',
          'No built-in GUI'
        ],
        vramRequired: { min: 8, recommended: 16 },
        easeOfUse: 95,
        performance: 85,
        flexibility: 80,
        ecosystem: 90
      },
      deepseek: {
        name: 'DeepSeek-R1',
        version: '671B',
        icon: '🧠',
        bestFor: 'Reasoning tasks, open weights',
        pricing: 'Free (open weights)',
        license: 'MIT',
        platforms: ['Cross-platform'],
        features: [
          '671B parameter model',
          'Chain-of-thought reasoning',
          'Fully open weights',
          'Competitive with GPT-4',
          'Math and coding excellence',
          'Self-hosted capable'
        ],
        strengths: [
          'State-of-the-art reasoning',
          'Completely open',
          'No API costs',
          'Customizable'
        ],
        weaknesses: [
          'Requires significant VRAM (80GB+)',
          'Quantized versions lose quality',
          'Complex setup for full model'
        ],
        vramRequired: { min: 80, recommended: 128 },
        easeOfUse: 60,
        performance: 95,
        flexibility: 90,
        ecosystem: 75
      },
      lmstudio: {
        name: 'LM Studio',
        version: '0.3.x',
        icon: '🖥️',
        bestFor: 'GUI lovers, model management',
        pricing: 'Free (personal)',
        license: 'Freemium',
        platforms: ['macOS', 'Linux', 'Windows'],
        features: [
          'Beautiful native GUI',
          'One-click model downloads',
          'Chat interface built-in',
          'Local API server',
          'Model management dashboard',
          'GGUF model support'
        ],
        strengths: [
          'Best user interface',
          'Easy model discovery',
          'Good for beginners',
          'Regular updates'
        ],
        weaknesses: [
          'Freemium model (business use paid)',
          'Less flexible than CLI tools',
          'GUI overhead'
        ],
        vramRequired: { min: 8, recommended: 16 },
        easeOfUse: 98,
        performance: 80,
        flexibility: 70,
        ecosystem: 85
      },
      llamacpp: {
        name: 'llama.cpp',
        version: 'b4000+',
        icon: '⚡',
        bestFor: 'Performance, customization',
        pricing: 'Free',
        license: 'MIT',
        platforms: ['All platforms'],
        features: [
          'Vulkan GPU acceleration',
          'Metal Performance Shaders',
          'CUDA support',
          'Quantization (Q4, Q5, Q8)',
          'Multiple backend support',
          'Low-level control'
        ],
        strengths: [
          'Fastest inference',
          'Maximum flexibility',
          'Broad hardware support',
          'Industry standard'
        ],
        weaknesses: [
          'Command-line only',
          'Steep learning curve',
          'Manual configuration required'
        ],
        vramRequired: { min: 4, recommended: 12 },
        easeOfUse: 50,
        performance: 98,
        flexibility: 95,
        ecosystem: 95
      },
      gpt4all: {
        name: 'GPT4All',
        version: '3.x',
        icon: '🤖',
        bestFor: 'Cross-platform, beginners',
        pricing: 'Free',
        license: 'MIT',
        platforms: ['macOS', 'Linux', 'Windows'],
        features: [
          'Desktop chat application',
          'Local document chat (RAG)',
          'Nomic models included',
          'Easy installer',
          'Privacy focused',
          'No cloud required'
        ],
        strengths: [
          'Easiest cross-platform setup',
          'Built-in chat UI',
          'Document Q&A',
          'Privacy first'
        ],
        weaknesses: [
          'Smaller model selection',
          'Less customization',
          'Newer ecosystem'
        ],
        vramRequired: { min: 8, recommended: 16 },
        easeOfUse: 92,
        performance: 80,
        flexibility: 65,
        ecosystem: 70
      }
    };
    
    this.currentTool = 'ollama';
    this.compareMode = false;
    this.selectedTools = ['ollama', 'lmstudio'];
    this.vramGB = 16;
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="local-llm-comparison-container">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
          <div>
            <h3 class="text-lg font-semibold text-accent-blue">🖥️ Local LLM Comparison</h3>
            <p class="text-sm text-gray-400">Find the best on-device AI solution for your needs</p>
          </div>
          <div class="flex gap-2">
            <button onclick="localLLMComparison.toggleMode()" id="llm-mode-toggle" class="px-3 py-1 bg-accent-blue rounded text-sm hover:bg-blue-600">
              📊 Compare Mode
            </button>
          </div>
        </div>

        <!-- VRAM Calculator -->
        <div class="mb-4 card rounded-lg p-4 border-l-4 border-green-500">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-green-400">💾 VRAM Calculator</div>
              <div class="text-sm text-gray-400">Your GPU: <span id="vram-display">${this.vramGB}GB</span></div>
            </div>
            <input type="range" min="4" max="128" value="${this.vramGB}" 
                   oninput="localLLMComparison.updateVRAM(this.value)"
                   class="w-32 h-2 bg-dark-700 rounded-lg accent-green-500">
          </div>
          <div id="vram-recommendations" class="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
            ${this.renderVRAMRecommendations()}
          </div>
        </div>

        <!-- Tool Selector -->
        <div class="mb-4">
          <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
            ${Object.entries(this.tools).map(([key, tool]) => `
              <button onclick="localLLMComparison.selectTool('${key}')" 
                      class="llm-tool-btn p-3 rounded-lg text-left transition-all ${this.currentTool === key ? 'bg-accent-blue text-white ring-2 ring-accent-blue' : 'bg-dark-700 hover:bg-dark-600'}"
                      data-tool="${key}">
                <div class="text-2xl mb-1">${tool.icon}</div>
                <div class="font-medium text-sm">${tool.name}</div>
                <div class="text-xs opacity-70">${tool.bestFor}</div>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Content -->
        <div id="llm-content">${this.renderSingleView()}</div>

        <!-- 2026 Trends -->
        <div class="mt-6 card rounded-lg p-4 border-l-4 border-accent-blue">
          <h4 class="text-sm font-semibold text-accent-blue mb-2">🔮 2026 Local AI Trends</h4>
          <ul class="text-sm text-gray-300 space-y-1">
            <li>• On-device AI becoming standard for privacy-conscious users</li>
            <li>• Context windows expanding (128K+ becoming common)</li>
            <li>• Multimodal capabilities (vision + text) in local models</li>
            <li>• Open weights catching up to commercial APIs</li>
            <li>• Consumer GPUs (16-24GB) now viable for quality inference</li>
          </ul>
        </div>
      </div>
    `;
  }

  renderVRAMRecommendations() {
    return Object.entries(this.tools).map(([key, tool]) => {
      const canRun = this.vramGB >= tool.vramRequired.min;
      const runsWell = this.vramGB >= tool.vramRequired.recommended;
      const status = runsWell ? '✅' : canRun ? '⚠️' : '❌';
      const color = runsWell ? 'text-green-400' : canRun ? 'text-yellow-400' : 'text-red-400';
      
      return `
        <div class="bg-dark-800 rounded p-2 text-center ${canRun ? '' : 'opacity-50'}">
          <div class="text-lg">${status}</div>
          <div class="text-xs font-medium">${tool.name}</div>
          <div class="text-xs ${color}">${tool.vramRequired.min}GB min</div>
        </div>
      `;
    }).join('');
  }

  renderSingleView() {
    const tool = this.tools[this.currentTool];
    return `
      <div class="card rounded-lg p-4">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-4xl">${tool.icon}</span>
          <div>
            <h4 class="text-xl font-bold">${tool.name} ${tool.version}</h4>
            <div class="text-sm text-gray-400">${tool.bestFor}</div>
          </div>
          <span class="ml-auto px-3 py-1 bg-accent-blue/20 text-accent-blue rounded text-sm">${tool.pricing}</span>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div class="bg-dark-800 rounded p-3 text-center">
            <div class="text-lg font-bold text-accent-green">${tool.vramRequired.min}GB</div>
            <div class="text-xs text-gray-400">Min VRAM</div>
          </div>
          <div class="bg-dark-800 rounded p-3 text-center">
            <div class="text-lg font-bold text-accent-blue">${tool.easeOfUse}/100</div>
            <div class="text-xs text-gray-400">Ease of Use</div>
          </div>
          <div class="bg-dark-800 rounded p-3 text-center">
            <div class="text-lg font-bold text-accent-purple">${tool.performance}/100</div>
            <div class="text-xs text-gray-400">Performance</div>
          </div>
          <div class="bg-dark-800 rounded p-3 text-center">
            <div class="text-lg font-bold text-yellow-400">${tool.platforms.length}</div>
            <div class="text-xs text-gray-400">Platforms</div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 class="text-sm font-semibold text-green-400 mb-2">✅ Features</h5>
            <ul class="text-sm text-gray-300 space-y-1">
              ${tool.features.map(f => `<li>• ${f}</li>`).join('')}
            </ul>
          </div>
          <div>
            <h5 class="text-sm font-semibold text-accent-blue mb-2">💡 Best For</h5>
            <ul class="text-sm text-gray-300 space-y-1">
              ${tool.strengths.map(s => `<li>• ${s}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  selectTool(key) {
    this.currentTool = key;
    this.refreshUI();
  }

  updateVRAM(value) {
    this.vramGB = parseInt(value);
    document.getElementById('vram-display').textContent = value + 'GB';
    document.getElementById('vram-recommendations').innerHTML = this.renderVRAMRecommendations();
  }

  toggleMode() {
    this.compareMode = !this.compareMode;
    document.getElementById('llm-mode-toggle').textContent = this.compareMode ? '👁️ Single View' : '📊 Compare Mode';
    document.getElementById('llm-content').innerHTML = this.compareMode ? this.renderCompareView() : this.renderSingleView();
  }

  renderCompareView() {
    const [tool1Key, tool2Key] = this.selectedTools;
    const tool1 = this.tools[tool1Key];
    const tool2 = this.tools[tool2Key];
    
    return `
      <div class="card rounded-lg p-4">
        <div class="flex justify-between mb-4">
          ${[tool1, tool2].map(tool => `
            <div class="text-center flex-1">
              <div class="text-2xl">${tool.icon}</div>
              <div class="font-bold">${tool.name}</div>
            </div>
          `).join('')}
        </div>
        
        <table class="w-full text-sm">
          <tbody>
            <tr class="border-b border-dark-700"><td class="py-2 text-gray-400">Pricing</td><td>${tool1.pricing}</td><td>${tool2.pricing}</td></tr>
            <tr class="border-b border-dark-700"><td class="py-2 text-gray-400">Min VRAM</td><td class="${tool1.vramRequired.min <= this.vramGB ? 'text-green-400' : 'text-red-400'}">${tool1.vramRequired.min}GB</td><td class="${tool2.vramRequired.min <= this.vramGB ? 'text-green-400' : 'text-red-400'}">${tool2.vramRequired.min}GB</td></tr>
            <tr class="border-b border-dark-700"><td class="py-2 text-gray-400">Ease of Use</td><td class="${tool1.easeOfUse > tool2.easeOfUse ? 'text-green-400 font-bold' : ''}">${tool1.easeOfUse}/100</td><td class="${tool2.easeOfUse > tool1.easeOfUse ? 'text-green-400 font-bold' : ''}">${tool2.easeOfUse}/100</td></tr>
            <tr class="border-b border-dark-700"><td class="py-2 text-gray-400">Performance</td><td class="${tool1.performance > tool2.performance ? 'text-green-400 font-bold' : ''}">${tool1.performance}/100</td><td class="${tool2.performance > tool1.performance ? 'text-green-400 font-bold' : ''}">${tool2.performance}/100</td></tr>
          </tbody>
        </table>
      </div>
    `;
  }

  refreshUI() {
    document.querySelectorAll('.llm-tool-btn').forEach(btn => {
      const isActive = btn.dataset.tool === this.currentTool;
      btn.className = `llm-tool-btn p-3 rounded-lg text-left transition-all ${isActive ? 'bg-accent-blue text-white ring-2 ring-accent-blue' : 'bg-dark-700 hover:bg-dark-600'}`;
    });
    if (!this.compareMode) {
      document.getElementById('llm-content').innerHTML = this.renderSingleView();
    }
  }
}

// Initialize global instance
window.LocalLLMComparison = LocalLLMComparison;
window.localLLMComparison = new LocalLLMComparison();

// Auto-load if container exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('local-llm-comparison-container')) {
    window.localLLMComparison.render('local-llm-comparison-container');
  }
});
