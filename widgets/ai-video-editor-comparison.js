class AIVideoEditorComparison {
  constructor() {
    this.editors = [
      {
        name: 'DaVinci Resolve',
        company: 'Blackmagic Design',
        bestFor: 'Professional color grading',
        pros: ['Industry-leading color correction', 'Free version available', 'Professional-grade tools'],
        cons: ['Steep learning curve', 'Hardware intensive'],
        aiFeatures: ['AI color correction', 'Face recognition', 'Smart reframing', 'Speech to text'],
        pricing: 'Free / $295 Studio',
        platforms: ['Windows', 'Mac', 'Linux'],
        rating: { ease: 6, power: 10, value: 9 }
      },
      {
        name: 'Descript',
        company: 'Descript',
        bestFor: 'Podcasts & talking heads',
        pros: ['Edit video by editing text', 'Overdub voice cloning', 'Automatic transcription'],
        cons: ['Limited advanced editing', 'Subscription model'],
        aiFeatures: ['Text-based editing', 'Overdub (voice clone)', 'Filler word removal', 'Studio Sound'],
        pricing: 'Free / $12+ monthly',
        platforms: ['Windows', 'Mac', 'Web'],
        rating: { ease: 10, power: 7, value: 8 }
      },
      {
        name: 'CapCut',
        company: 'ByteDance',
        bestFor: 'Social media content',
        pros: ['Free with premium features', 'Mobile + desktop', 'Viral templates'],
        cons: ['Limited advanced features', 'Watermark on some exports'],
        aiFeatures: ['Auto captions', 'AI background removal', 'Text to speech', 'Smart tracking'],
        pricing: 'Free / Pro subscription',
        platforms: ['Windows', 'Mac', 'Mobile'],
        rating: { ease: 9, power: 6, value: 10 }
      },
      {
        name: 'Premiere Pro',
        company: 'Adobe',
        bestFor: 'Professional workflows',
        pros: ['Industry standard', 'Deep integration', 'Extensive plugins'],
        cons: ['Expensive subscription', 'High learning curve'],
        aiFeatures: ['AI color match', 'Auto reframe', 'Speech to text', 'Scene edit detection'],
        pricing: '$22+ monthly',
        platforms: ['Windows', 'Mac'],
        rating: { ease: 5, power: 10, value: 7 }
      },
      {
        name: 'Filmora',
        company: 'Wondershare',
        bestFor: 'Beginners & YouTubers',
        pros: ['User-friendly interface', 'Affordable', 'Lots of presets'],
        cons: ['Less powerful than pro tools', 'Occasional stability issues'],
        aiFeatures: ['AI smart cutout', 'Auto beat sync', 'Motion tracking', 'Speed ramping'],
        pricing: '$49.99/year or perpetual',
        platforms: ['Windows', 'Mac', 'Mobile'],
        rating: { ease: 9, power: 7, value: 9 }
      }
    ];
    
    this.selectedEditors = [];
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
      <div class="space-y-4">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <!-- Editor List -->
          <div class="lg:col-span-1">
            <div class="card rounded-lg p-4">
              <h3 class="font-semibold mb-3">✂️ Video Editors</h3>
              <div class="space-y-2">
                ${this.editors.map((editor, idx) => `
                  <div class="bg-dark-700 rounded p-3 cursor-pointer hover:bg-dark-600 transition-colors ${this.selectedEditors.includes(idx) ? 'border-2 border-accent-blue' : ''}" 
                       onclick="window.aiVideoEditorComparison.selectEditor(${idx})">
                    <div class="flex items-center justify-between">
                      <span class="font-semibold">${editor.name}</span>
                      <span class="text-xs px-2 py-0.5 bg-dark-600 rounded">${editor.rating.power}/10</span>
                    </div>
                    <div class="text-xs text-gray-400 mt-1">${editor.company} • ${editor.pricing}</div>
                  </div>
                `).join('')}
              </div>
              
              <div class="mt-4">
                <button onclick="window.aiVideoEditorComparison.compareSelected()" 
                        class="w-full px-3 py-2 bg-accent-blue rounded text-sm hover:bg-blue-600 ${this.selectedEditors.length < 2 ? 'opacity-50 cursor-not-allowed' : ''}"
                        ${this.selectedEditors.length < 2 ? 'disabled' : ''}>
                  Compare Selected (${this.selectedEditors.length})
                </button>
                <button onclick="window.aiVideoEditorComparison.clearSelection()" 
                        class="w-full px-3 py-2 bg-dark-700 rounded text-sm hover:bg-dark-600 mt-2">Clear Selection</button>
              </div>
            </div>
          </div>
          
          <!-- Comparison Detail -->
          <div class="lg:col-span-2">
            <div id="ai-video-editor-detail" class="card rounded-lg p-4">
              ${this.renderDetail()}
            </div>
          </div>
        </div>
        
        <!-- Quick Recommendations -->
        <div class="card rounded-lg p-4">
          <h3 class="font-semibold mb-3">🎯 Quick Recommendations by Use Case</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div class="bg-dark-700 rounded p-3">
              <div class="text-sm font-semibold text-accent-green">For Beginners</div>
              <div class="text-lg font-bold">CapCut</div>
              <div class="text-xs text-gray-400">Free, mobile-friendly, viral templates</div>
            </div>
            <div class="bg-dark-700 rounded p-3">
              <div class="text-sm font-semibold text-accent-blue">For Podcasts</div>
              <div class="text-lg font-bold">Descript</div>
              <div class="text-xs text-gray-400">Text-based editing, overdub, auto-transcription</div>
            </div>
            <div class="bg-dark-700 rounded p-3">
              <div class="text-sm font-semibold text-accent-purple">For Color Grading</div>
              <div class="text-lg font-bold">DaVinci Resolve</div>
              <div class="text-xs text-gray-400">Industry-leading color tools, free version</div>
            </div>
            <div class="bg-dark-700 rounded p-3">
              <div class="text-sm font-semibold text-accent-yellow">For YouTubers</div>
              <div class="text-lg font-bold">Filmora</div>
              <div class="text-xs text-gray-400">Easy to learn, affordable, good presets</div>
            </div>
            <div class="bg-dark-700 rounded p-3">
              <div class="text-sm font-semibold text-accent-red">For Professionals</div>
              <div class="text-lg font-bold">Premiere Pro</div>
              <div class="text-xs text-gray-400">Industry standard, deep integration</div>
            </div>
            <div class="bg-dark-700 rounded p-3">
              <div class="text-sm font-semibold text-accent-green">Best Free Option</div>
              <div class="text-lg font-bold">DaVinci Resolve</div>
              <div class="text-xs text-gray-400">Professional features at no cost</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderDetail() {
    if (this.selectedEditors.length === 0) {
      return `
        <div class="text-center py-8 text-gray-500">
          <svg class="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-width="1.5"/>
          </svg>
          <p>Select an editor from the list to view details</p>
          <p class="text-sm mt-2">Or select 2+ editors to compare side-by-side</p>
        </div>
      `;
    }
    
    if (this.selectedEditors.length === 1) {
      const editor = this.editors[this.selectedEditors[0]];
      return `
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold">${editor.name}</h2>
              <div class="text-sm text-gray-400">${editor.company} • ${editor.pricing}</div>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-400">Power Rating</div>
              <div class="text-3xl font-bold text-accent-blue">${editor.rating.power}/10</div>
            </div>
          </div>
          
          <div class="bg-dark-700 rounded-lg p-3">
            <div class="text-sm text-accent-green font-semibold mb-1">✓ Best For</div>
            <div>${editor.bestFor}</div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-dark-700 rounded p-3">
              <div class="text-sm text-gray-400 mb-2">Pros</div>
              <ul class="text-sm space-y-1">
                ${editor.pros.map(pro => `<li class="text-accent-green">✓ ${pro}</li>`).join('')}
              </ul>
            </div>
            
            <div class="bg-dark-700 rounded p-3">
              <div class="text-sm text-gray-400 mb-2">Cons</div>
              <ul class="text-sm space-y-1">
                ${editor.cons.map(con => `<li class="text-accent-red">✗ ${con}</li>`).join('')}
              </ul>
            </div>
          </div>
          
          <div class="bg-dark-700 rounded p-3">
            <div class="text-sm text-gray-400 mb-2">🤖 AI Features</div>
            <div class="flex flex-wrap gap-2">
              ${editor.aiFeatures.map(feat => `<span class="text-xs px-2 py-1 bg-dark-600 rounded">${feat}</span>`).join('')}
            </div>
          </div>
          
          <div class="grid grid-cols-3 gap-3">
            <div class="bg-dark-700 rounded p-3 text-center">
              <div class="text-xs text-gray-400">Ease of Use</div>
              <div class="text-xl font-bold text-accent-yellow">${editor.rating.ease}/10</div>
            </div>
            <div class="bg-dark-700 rounded p-3 text-center">
              <div class="text-xs text-gray-400">Power</div>
              <div class="text-xl font-bold text-accent-blue">${editor.rating.power}/10</div>
            </div>
            <div class="bg-dark-700 rounded p-3 text-center">
              <div class="text-xs text-gray-400">Value</div>
              <div class="text-xl font-bold text-accent-green">${editor.rating.value}/10</div>
            </div>
          </div>
          
          <div class="bg-dark-700 rounded p-3">
            <div class="text-sm text-gray-400">Platforms</div>
            <div class="flex flex-wrap gap-2 mt-1">
              ${editor.platforms.map(plat => `<span class="text-xs px-2 py-1 bg-dark-600 rounded">${plat}</span>`).join('')}
            </div>
          </div>
        </div>
      `;
    }
    
    // Comparison view for 2+ editors
    const selected = this.selectedEditors.map(idx => this.editors[idx]);
    return `
      <div class="space-y-4">
        <h3 class="font-semibold text-center">Side-by-Side Comparison</h3>
        <div class="grid grid-cols-${selected.length} gap-3">
          ${selected.map(editor => `
            <div class="bg-dark-700 rounded p-3">
              <div class="font-bold text-lg mb-1">${editor.name}</div>
              <div class="text-xs text-gray-400 mb-3">${editor.pricing}</div>
              
              <div class="space-y-2">
                <div>
                  <div class="text-xs text-gray-400">Ease</div>
                  <div class="text-sm font-semibold ${editor.rating.ease >= 8 ? 'text-accent-green' : editor.rating.ease >= 6 ? 'text-accent-yellow' : 'text-accent-red'}">${editor.rating.ease}/10</div>
                </div>
                
                <div>
                  <div class="text-xs text-gray-400">Power</div>
                  <div class="text-sm font-semibold ${editor.rating.power >= 8 ? 'text-accent-blue' : 'text-gray-400'}">${editor.rating.power}/10</div>
                </div>
                
                <div>
                  <div class="text-xs text-gray-400">Value</div>
                  <div class="text-sm font-semibold ${editor.rating.value >= 8 ? 'text-accent-green' : 'text-gray-400'}">${editor.rating.value}/10</div>
                </div>
              </div>
              
              <div class="mt-3 pt-3 border-t border-dark-600">
                <div class="text-xs text-gray-400">Best For</div>
                <div class="text-xs">${editor.bestFor}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  selectEditor(index) {
    const idx = this.selectedEditors.indexOf(index);
    if (idx > -1) {
      this.selectedEditors.splice(idx, 1);
    } else {
      if (this.selectedEditors.length >= 3) {
        this.selectedEditors.shift(); // Remove first
      }
      this.selectedEditors.push(index);
    }
    this.render('ai-video-editor-comparison-container');
  }

  compareSelected() {
    if (this.selectedEditors.length >= 2) {
      this.render('ai-video-editor-comparison-container');
    }
  }

  clearSelection() {
    this.selectedEditors = [];
    this.render('ai-video-editor-comparison-container');
  }
}

// Export to global
window.AIVideoEditorComparison = AIVideoEditorComparison;
