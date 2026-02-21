/**
 * Thumbnail Preview Tool Widget
 * Helps create viral Minecraft thumbnails based on BBlocks-style patterns
 * Research: Packapop/Filmora viral format analysis (Feb 2026)
 */

class ThumbnailPreviewTool {
  constructor() {
    this.presets = [
      {
        id: 'bblocks',
        name: 'BBlocks Style',
        icon: '🏗️',
        description: 'Clean in-game visuals with bold text chips like "BEST", "15+", "2026"',
        textChips: ['BEST', '15+', '2026', 'NEW', 'OP'],
        colors: ['#FF4444', '#44AA44', '#4444FF', '#FFAA00', '#AA44AA'],
        layout: 'center-bottom'
      },
      {
        id: 'redstone',
        name: 'Redstone Tech',
        icon: '⚡',
        description: 'Sustainability, modular design, automation focus',
        textChips: ['AUTO', 'FAST', 'SMART', 'HUGE', 'EPIC'],
        colors: ['#FF6600', '#00AAFF', '#00FF66', '#FF00FF', '#FFFF00'],
        layout: 'side-overlay'
      },
      {
        id: 'build-hacks',
        name: 'Build Hacks',
        icon: '💡',
        description: 'Tutorial style with clear value proposition',
        textChips: ['EASY', 'QUICK', 'INSANE', 'PERFECT', 'SECRET'],
        colors: ['#00CC88', '#FF5555', '#55AAFF', '#FFAA22', '#AA55FF'],
        layout: 'top-banner'
      },
      {
        id: 'mod-showcase',
        name: 'Mod Showcase',
        icon: '🎮',
        description: 'Viral mod showcases and trending content',
        textChips: ['NEW', 'OP', 'BROKEN', 'MUST SEE', 'INSANE'],
        colors: ['#FF3366', '#3366FF', '#33FF66', '#FF6633', '#9933FF'],
        layout: 'full-overlay'
      },
      {
        id: 'civilization',
        name: 'Sim Civilization',
        icon: '🏛️',
        description: 'Minecraft simulated civilization viral format',
        textChips: ['100 DAYS', '1000 PLAYERS', 'WAR', 'EMPIRE', 'FALL'],
        colors: ['#CC3333', '#3333CC', '#33CC33', '#CC9933', '#9933CC'],
        layout: 'dramatic-center'
      }
    ];
    
    this.currentPreset = this.presets[0];
    this.thumbnailText = '';
    this.subText = '';
    this.selectedChips = [];
    this.bgColor = '#1a1a2e';
    this.showFace = true;
    this.faceEmoji = '😮';
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="thumbnail-tool-container">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Control Panel -->
          <div class="card rounded-lg p-4">
            <h3 class="text-lg font-semibold mb-4 text-accent-blue">🎨 Thumbnail Designer</h3>
            
            <!-- Preset Selector -->
            <div class="mb-4">
              <label class="block text-sm text-gray-400 mb-2">Style Preset</label>
              <div class="grid grid-cols-2 gap-2">
                ${this.presets.map(p => `
                  <button onclick="thumbnailTool.selectPreset('${p.id}')" 
                          class="preset-btn px-3 py-2 rounded text-sm text-left transition-all ${this.currentPreset.id === p.id ? 'bg-accent-blue text-white' : 'bg-dark-700 hover:bg-dark-600'}"
                          data-preset="${p.id}">
                    <span class="mr-1">${p.icon}</span>${p.name}
                  </button>
                `).join('')}
              </div>
              <p class="text-xs text-gray-500 mt-2" id="preset-desc">${this.currentPreset.description}</p>
            </div>

            <!-- Main Text Input -->
            <div class="form-group mb-4">
              <label class="block text-sm text-gray-400 mb-1">Main Title</label>
              <input type="text" id="thumb-title" 
                     class="w-full px-3 py-2 bg-dark-700 rounded border border-dark-600 text-sm"
                     placeholder="e.g., 15+ Fire Station Build Hacks"
                     maxlength="40"
                     oninput="thumbnailTool.updateText()">
              <div class="text-xs text-gray-500 mt-1 text-right">
                <span id="char-count">0</span>/40 chars
              </div>
            </div>

            <!-- Sub Text -->
            <div class="form-group mb-4">
              <label class="block text-sm text-gray-400 mb-1">Sub Text (Optional)</label>
              <input type="text" id="thumb-subtitle" 
                     class="w-full px-3 py-2 bg-dark-700 rounded border border-dark-600 text-sm"
                     placeholder="e.g., Minecraft 1.20+"
                     maxlength="20"
                     oninput="thumbnailTool.updateText()">
            </div>

            <!-- Text Chips -->
            <div class="mb-4">
              <label class="block text-sm text-gray-400 mb-2">Viral Text Chips (Click to toggle)</label>
              <div class="flex flex-wrap gap-2" id="text-chips">
                ${this.renderChips()}
              </div>
            </div>

            <!-- Face Toggle -->
            <div class="form-group mb-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" id="show-face" checked onchange="thumbnailTool.toggleFace()" class="rounded">
                <span class="text-sm text-gray-400">Show Reaction Face</span>
              </label>
              <div class="flex gap-2 mt-2" id="face-selector">
                ${['😮', '😱', '🤯', '🔥', '⭐', '💎'].map(f => `
                  <button onclick="thumbnailTool.selectFace('${f}')" 
                          class="face-btn text-xl px-2 py-1 rounded hover:bg-dark-700 ${this.faceEmoji === f ? 'bg-dark-700 ring-2 ring-accent-blue' : ''}"
                          data-face="${f}">${f}</button>
                `).join('')}
              </div>
            </div>

            <!-- Background Color -->
            <div class="form-group mb-4">
              <label class="block text-sm text-gray-400 mb-2">Background</label>
              <div class="flex gap-2 flex-wrap">
                ${['#1a1a2e', '#0f0f1a', '#2d1b4e', '#1b2d4e', '#4e1b1b', '#1b4e2d', '#4e4e1b'].map(c => `
                  <button onclick="thumbnailTool.setBg('${c}')" 
                          class="w-8 h-8 rounded border-2 ${this.bgColor === c ? 'border-white' : 'border-transparent'}"
                          style="background: ${c}"></button>
                `).join('')}
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <button onclick="thumbnailTool.randomize()" class="flex-1 px-3 py-2 bg-accent-purple rounded text-sm hover:bg-purple-600">
                🎲 Randomize
              </button>
              <button onclick="thumbnailTool.exportConfig()" class="flex-1 px-3 py-2 bg-dark-700 rounded text-sm hover:bg-dark-600">
                📋 Copy Config
              </button>
            </div>
          </div>

          <!-- Preview Panel -->
          <div class="card rounded-lg p-4">
            <h3 class="text-lg font-semibold mb-4 text-accent-green">👁️ Live Preview</h3>
            
            <!-- YouTube Thumbnail Preview -->
            <div class="space-y-4">
              <!-- Desktop Preview -->
              <div>
                <div class="text-xs text-gray-500 mb-2">Desktop Size (1280x720)</div>
                <div id="thumb-preview-desktop" class="thumbnail-preview relative overflow-hidden rounded-lg" 
                     style="width: 100%; aspect-ratio: 16/9; background: ${this.bgColor}; border: 2px solid #252540;">
                  ${this.renderThumbnailContent()}
                </div>
              </div>

              <!-- Mobile Preview -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <div class="text-xs text-gray-500 mb-2">Mobile Feed</div>
                  <div id="thumb-preview-mobile" class="thumbnail-preview relative overflow-hidden rounded"
                       style="width: 100%; aspect-ratio: 16/9; background: ${this.bgColor}; border: 1px solid #252540;">
                    ${this.renderThumbnailContent(true)}
                  </div>
                </div>
                
                <!-- Stats -->
                <div class="space-y-2">
                  <div class="text-xs text-gray-500 mb-2">Viral Score Estimate</div>
                  <div class="bg-dark-800 rounded p-3">
                    <div class="text-2xl font-bold text-accent-blue" id="viral-score">85</div>
                    <div class="text-xs text-gray-400">/100 based on format</div>
                    <div class="mt-2 space-y-1 text-xs">
                      <div class="flex justify-between">
                        <span class="text-gray-500">Text clarity</span>
                        <span class="text-green-400">+25</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-500">Viral keywords</span>
                        <span class="text-green-400" id="keyword-score">+20</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-500">Visual pop</span>
                        <span class="text-green-400">+20</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-500">Face/reaction</span>
                        <span class="text-green-400" id="face-score">+20</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tips -->
            <div class="mt-4 p-3 bg-dark-700/50 rounded border border-yellow-800/30">
              <h4 class="text-sm font-semibold text-yellow-400 mb-2">💡 Pro Tips</h4>
              <ul class="text-xs text-gray-400 space-y-1" id="thumb-tips">
                <li>• Use numbers: "15+" performs better than "Many"</li>
                <li>• Keep main title under 6 words for mobile</li>
                <li>• High contrast colors grab attention</li>
                <li>• Reaction faces increase CTR by ~15%</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add styles
    if (!document.getElementById('thumbnail-tool-styles')) {
      const style = document.createElement('style');
      style.id = 'thumbnail-tool-styles';
      style.textContent = `
        .thumbnail-preview {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          box-sizing: border-box;
        }
        .thumb-main-title {
          font-weight: 900;
          text-align: center;
          text-shadow: 3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
          line-height: 1.1;
          z-index: 2;
        }
        .thumb-sub-title {
          font-weight: 600;
          text-align: center;
          text-shadow: 2px 2px 0 #000;
          margin-top: 8px;
          z-index: 2;
        }
        .thumb-chips-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 6px;
          margin-top: 12px;
          z-index: 2;
        }
        .thumb-chip {
          padding: 4px 12px;
          border-radius: 4px;
          font-weight: 800;
          font-size: 14px;
          text-shadow: 1px 1px 0 rgba(0,0,0,0.5);
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          border: 2px solid rgba(255,255,255,0.3);
        }
        .thumb-face {
          position: absolute;
          font-size: 80px;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));
          z-index: 3;
        }
        .thumb-face.position-tr { top: 10px; right: 10px; }
        .thumb-face.position-tl { top: 10px; left: 10px; }
        .thumb-face.position-br { bottom: 10px; right: 10px; }
        .thumb-face.position-bl { bottom: 10px; left: 10px; }
        .preset-btn.active {
          box-shadow: 0 0 0 2px #3B82F6;
        }
        @media (max-width: 768px) {
          .thumb-main-title { font-size: 18px !important; }
          .thumb-sub-title { font-size: 12px !important; }
          .thumb-chip { font-size: 10px !important; padding: 2px 6px !important; }
          .thumb-face { font-size: 40px !important; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  renderChips() {
    return this.currentPreset.textChips.map((chip, i) => {
      const isSelected = this.selectedChips.includes(chip);
      const color = this.currentPreset.colors[i % this.currentPreset.colors.length];
      return `
        <button onclick="thumbnailTool.toggleChip('${chip}')" 
                class="thumb-chip-btn px-3 py-1 rounded text-xs font-bold transition-all ${isSelected ? 'ring-2 ring-white' : 'opacity-60 hover:opacity-100'}"
                style="background: ${color}; ${isSelected ? 'transform: scale(1.05);' : ''}"
                data-chip="${chip}">
          ${chip}
        </button>
      `;
    }).join('');
  }

  renderThumbnailContent(isMobile = false) {
    const scale = isMobile ? 0.5 : 1;
    const layout = this.currentPreset.layout;
    
    let faceClass = 'position-tr';
    if (layout === 'center-bottom') faceClass = 'position-tr';
    if (layout === 'side-overlay') faceClass = 'position-tl';
    if (layout === 'dramatic-center') faceClass = 'position-br';
    
    const titleSize = isMobile ? '24px' : '48px';
    const subSize = isMobile ? '12px' : '18px';
    
    return `
      ${this.showFace ? `<div class="thumb-face ${faceClass}" style="font-size: ${isMobile ? '40px' : '80px'}">${this.faceEmoji}</div>` : ''}
      <div class="thumb-content" style="z-index: 2; text-align: center;">
        <div class="thumb-main-title" style="font-size: ${titleSize}; color: white;">
          ${this.thumbnailText || 'Your Title Here'}
        </div>
        ${this.subText ? `<div class="thumb-sub-title" style="font-size: ${subSize}; color: #aaa;">${this.subText}</div>` : ''}
        ${this.selectedChips.length > 0 ? `
          <div class="thumb-chips-container">
            ${this.selectedChips.map((chip, i) => {
              const colorIdx = this.currentPreset.textChips.indexOf(chip);
              const color = this.currentPreset.colors[colorIdx % this.currentPreset.colors.length];
              return `<span class="thumb-chip" style="background: ${color}; color: white; font-size: ${isMobile ? '10px' : '14px'}">${chip}</span>`;
            }).join('')}
          </div>
        ` : ''}
      </div>
      <div style="position: absolute; inset: 0; background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.3) 100%); z-index: 1;"></div>
    `;
  }

  selectPreset(id) {
    this.currentPreset = this.presets.find(p => p.id === id);
    this.selectedChips = [];
    this.refreshUI();
  }

  updateText() {
    this.thumbnailText = document.getElementById('thumb-title')?.value || '';
    this.subText = document.getElementById('thumb-subtitle')?.value || '';
    const charCount = this.thumbnailText.length;
    const charEl = document.getElementById('char-count');
    if (charEl) charEl.textContent = charCount;
    this.refreshPreview();
    this.calculateViralScore();
  }

  toggleChip(chip) {
    if (this.selectedChips.includes(chip)) {
      this.selectedChips = this.selectedChips.filter(c => c !== chip);
    } else if (this.selectedChips.length < 3) {
      this.selectedChips.push(chip);
    }
    this.refreshChips();
    this.refreshPreview();
    this.calculateViralScore();
  }

  toggleFace() {
    this.showFace = document.getElementById('show-face')?.checked ?? true;
    this.refreshPreview();
    this.calculateViralScore();
  }

  selectFace(face) {
    this.faceEmoji = face;
    document.querySelectorAll('.face-btn').forEach(btn => {
      btn.classList.toggle('ring-2', btn.dataset.face === face);
      btn.classList.toggle('ring-accent-blue', btn.dataset.face === face);
    });
    this.refreshPreview();
  }

  setBg(color) {
    this.bgColor = color;
    this.refreshPreview();
  }

  randomize() {
    const presetIdx = Math.floor(Math.random() * this.presets.length);
    this.selectPreset(this.presets[presetIdx].id);
    
    const chipsToPick = Math.floor(Math.random() * 3) + 1;
    this.selectedChips = this.currentPreset.textChips.slice(0, chipsToPick);
    
    const faces = ['😮', '😱', '🤯', '🔥', '⭐', '💎'];
    this.faceEmoji = faces[Math.floor(Math.random() * faces.length)];
    
    const sampleTitles = [
      '15+ Secret Base Ideas',
      'The ULTIMATE Redstone Door',
      'I Built a Working Computer',
      '50 Building Hacks You Need',
      'Minecraft But It Rains TNT'
    ];
    const titleInput = document.getElementById('thumb-title');
    if (titleInput) {
      titleInput.value = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
    }
    
    this.updateText();
    this.refreshUI();
  }

  calculateViralScore() {
    let score = 40;
    
    // Text clarity (length based)
    const words = this.thumbnailText.split(' ').length;
    if (words >= 3 && words <= 6) score += 25;
    else if (words > 0) score += 15;
    
    // Keywords
    const keywordScore = Math.min(this.selectedChips.length * 7, 20);
    score += keywordScore;
    const keywordEl = document.getElementById('keyword-score');
    if (keywordEl) keywordEl.textContent = `+${keywordScore}`;
    
    // Visual elements
    score += 20;
    
    // Face
    const faceScore = this.showFace ? 20 : 0;
    score += faceScore;
    const faceEl = document.getElementById('face-score');
    if (faceEl) faceEl.textContent = `+${faceScore}`;
    
    const scoreEl = document.getElementById('viral-score');
    if (scoreEl) {
      scoreEl.textContent = Math.min(score, 100);
      scoreEl.className = `text-2xl font-bold ${score >= 80 ? 'text-green-400' : score >= 60 ? 'text-accent-blue' : 'text-yellow-400'}`;
    }
  }

  exportConfig() {
    const config = {
      preset: this.currentPreset.id,
      title: this.thumbnailText,
      subtitle: this.subText,
      chips: this.selectedChips,
      face: this.showFace ? this.faceEmoji : null,
      bgColor: this.bgColor,
      timestamp: new Date().toISOString()
    };
    
    navigator.clipboard.writeText(JSON.stringify(config, null, 2)).then(() => {
      alert('Thumbnail config copied to clipboard!');
    });
  }

  refreshUI() {
    // Update preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
      const isActive = btn.dataset.preset === this.currentPreset.id;
      btn.className = `preset-btn px-3 py-2 rounded text-sm text-left transition-all ${isActive ? 'bg-accent-blue text-white' : 'bg-dark-700 hover:bg-dark-600'}`;
    });
    
    // Update description
    const descEl = document.getElementById('preset-desc');
    if (descEl) descEl.textContent = this.currentPreset.description;
    
    this.refreshChips();
    this.refreshPreview();
    this.calculateViralScore();
  }

  refreshChips() {
    const container = document.getElementById('text-chips');
    if (container) container.innerHTML = this.renderChips();
  }

  refreshPreview() {
    const desktop = document.getElementById('thumb-preview-desktop');
    const mobile = document.getElementById('thumb-preview-mobile');
    
    if (desktop) {
      desktop.style.background = this.bgColor;
      desktop.innerHTML = this.renderThumbnailContent(false);
    }
    if (mobile) {
      mobile.style.background = this.bgColor;
      mobile.innerHTML = this.renderThumbnailContent(true);
    }
  }
}

// Initialize global instance
window.ThumbnailPreviewTool = ThumbnailPreviewTool;
window.thumbnailTool = new ThumbnailPreviewTool();

// Auto-load if container exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('thumbnail-preview-container')) {
    window.thumbnailTool.render('thumbnail-preview-container');
  }
});
