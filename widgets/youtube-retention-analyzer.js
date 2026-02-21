/**
 * YouTube Retention Analyzer Tool
 * Based on 2026 algorithm research: Shift from watch time to satisfaction,
 * Shorts as testing ground for long-form, 30+ min content gets 35-45% boost
 */

class YouTubeRetentionAnalyzer {
  constructor() {
    this.videoDuration = 600; // 10 minutes default
    this.retentionData = [];
    this.generateSampleData();
  }

  generateSampleData() {
    // Generate sample retention curve (typical drop-off pattern)
    const points = 10;
    this.retentionData = [];
    for (let i = 0; i <= points; i++) {
      const percent = (i / points) * 100;
      // Typical retention curve: sharp drop at start, gradual decline
      let retention;
      if (i === 0) retention = 100;
      else if (i === 1) retention = 70; // 30% drop in first 10%
      else if (i === 2) retention = 55;
      else if (i === 3) retention = 45;
      else retention = Math.max(20, 45 - ((i - 3) * 3));
      
      this.retentionData.push({
        point: i,
        timestamp: (this.videoDuration / points) * i,
        percent: percent,
        retention: retention
      });
    }
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="retention-analyzer-container">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
          <div>
            <h3 class="text-lg font-semibold text-accent-blue">📊 YouTube Retention Analyzer</h3>
            <p class="text-sm text-gray-400">Optimize for 2026 algorithm — satisfaction > watch time</p>
          </div>
          <div class="flex gap-2">
            <button onclick="retentionAnalyzer.loadPreset('viral')" class="px-3 py-1 bg-green-600 rounded text-sm hover:bg-green-500">🚀 Viral</button>
            <button onclick="retentionAnalyzer.loadPreset('average')" class="px-3 py-1 bg-yellow-600 rounded text-sm hover:bg-yellow-500">📊 Average</button>
            <button onclick="retentionAnalyzer.loadPreset('poor')" class="px-3 py-1 bg-red-600 rounded text-sm hover:bg-red-500">⚠️ Poor</button>
          </div>
        </div>

        <!-- 2026 Algorithm Alert -->
        <div class="mb-4 p-3 bg-accent-blue/10 border border-accent-blue/30 rounded-lg">
          <div class="flex items-start gap-2">
            <span class="text-xl">🎯</span>
            <div>
              <div class="font-medium text-accent-blue">2026 Algorithm Focus: Viewer Satisfaction</div>
              <div class="text-sm text-gray-300">YouTube now asks: "What will this person find most satisfying?" — not just "What keeps them watching longest?"</div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Input Panel -->
          <div class="card rounded-lg p-4">
            <h4 class="text-sm font-semibold text-gray-400 mb-4">⚙️ Video Settings</h4>
            
            <!-- Duration Slider -->
            <div class="mb-4">
              <div class="flex justify-between mb-1">
                <label class="text-sm text-gray-400">Video Duration</label>
                <span class="text-sm font-bold text-accent-green" id="duration-display">10:00</span>
              </div>
              <input type="range" id="duration-slider" min="60" max="3600" step="30" value="600"
                     class="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-accent-blue"
                     oninput="retentionAnalyzer.updateDuration(this.value)">
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 min</span>
                <span class="text-accent-purple font-medium">30+ min gets 35-45% boost 🚀</span>
                <span>60 min</span>
              </div>
            </div>

            <!-- Retention Points -->
            <div class="mb-4">
              <div class="text-sm text-gray-400 mb-2">Retention at Key Moments (% still watching)</div>
              <div class="space-y-2">
                ${[0, 1, 2, 3, 5, 7, 10].map(i => `
                  <div class="flex items-center gap-3">
                    <span class="text-xs text-gray-500 w-12">${i === 0 ? 'Start' : i + '0%'}</span>
                    <input type="range" id="retention-${i}" min="0" max="100" value="${this.retentionData[i]?.retention || 50}"
                           class="flex-1 h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-accent-green"
                           oninput="retentionAnalyzer.updateRetention(${i}, this.value)">
                    <span class="text-sm font-bold w-10 text-right" id="retention-display-${i}">${this.retentionData[i]?.retention || 50}%</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Video Type -->
            <div class="mb-4">
              <label class="text-sm text-gray-400 mb-2">Content Type</label>
              <select id="content-type" onchange="retentionAnalyzer.calculate()" 
                      class="w-full px-3 py-2 bg-dark-700 rounded border border-dark-600 text-sm">
                <option value="standard">Standard Video</option>
                <option value="short">Shorts (Testing ground for long-form)</option>
                <option value="long">30+ Minute (35-45% algorithm boost)</option>
                <option value="series">Series/Episodic</option>
              </select>
            </div>
          </div>

          <!-- Results Panel -->
          <div class="card rounded-lg p-4">
            <h4 class="text-sm font-semibold text-gray-400 mb-4">📈 Analysis Results</h4>
            
            <!-- AVD Score -->
            <div class="bg-dark-800 rounded-lg p-4 mb-4 text-center">
              <div class="text-sm text-gray-400 mb-1">Average View Duration (AVD)</div>
              <div class="text-3xl font-bold text-accent-blue" id="avd-result">0:00</div>
              <div class="text-xs text-gray-500 mt-1">of ${this.formatTime(this.videoDuration)} total</div>
            </div>

            <!-- Key Metrics -->
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="bg-dark-800 rounded p-3 text-center">
                <div class="text-xs text-gray-400">Retention Rate</div>
                <div class="text-xl font-bold" id="retention-rate">0%</div>
              </div>
              <div class="bg-dark-800 rounded p-3 text-center">
                <div class="text-xs text-gray-400">Algorithm Score</div>
                <div class="text-xl font-bold" id="algorithm-score">0/100</div>
              </div>
            </div>

            <!-- Satisfaction Estimate -->
            <div class="mb-4">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-400">Estimated Satisfaction</span>
                <span class="font-bold" id="satisfaction-text">Low</span>
              </div>
              <div class="w-full bg-dark-700 rounded-full h-3">
                <div id="satisfaction-bar" class="h-3 rounded-full transition-all" style="width: 0%; background: linear-gradient(90deg, #ef4444, #f59e0b, #10b981)"></div>
              </div>
            </div>

            <!-- 2026 Insights -->
            <div id="insights-panel" class="space-y-2">
              ${this.renderInsights()}
            </div>
          </div>
        </div>

        <!-- Retention Graph -->
        <div class="mt-6 card rounded-lg p-4">
          <h4 class="text-sm font-semibold text-gray-400 mb-4">📉 Retention Curve Visualization</h4>
          <div id="retention-graph" class="h-48 flex items-end gap-1">
            ${this.renderGraph()}
          </div>
          <div class="flex justify-between text-xs text-gray-500 mt-2">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        <!-- 2026 Algorithm Tips -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="card rounded-lg p-4 border-l-4 border-green-500">
            <div class="text-lg mb-2">✅ Do This</div>
            <ul class="text-sm text-gray-300 space-y-1">
              <li>• Focus on satisfaction, not just length</li>
              <li>• Hook viewers in first 30 seconds</li>
              <li>• Consider 30+ min for algorithm boost</li>
              <li>• Use Shorts to test long-form concepts</li>
            </ul>
          </div>
          
          <div class="card rounded-lg p-4 border-l-4 border-red-500">
            <div class="text-lg mb-2">❌ Avoid This</div>
            <ul class="text-sm text-gray-300 space-y-1">
              <li>• Clickbait that doesn't deliver</li>
              <li>• Padding content for length</li>
              <li>• Ignoring early retention drop-off</li>
              <li>• Expecting Shorts to drive long-form</li>
            </ul>
          </div>
          
          <div class="card rounded-lg p-4 border-l-4 border-blue-500">
            <div class="text-lg mb-2">📊 2026 Changes</div>
            <ul class="text-sm text-gray-300 space-y-1">
              <li>• Satisfaction > Watch time</li>
              <li>• 30+ min gets 35-45% boost</li>
              <li>• Shorts test long-form potential</li>
              <li>• Language/preference matching</li>
            </ul>
          </div>
        </div>
      </div>
    `;

    this.calculate();
  }

  renderGraph() {
    return this.retentionData.map((point, i) => {
      const height = point.retention;
      const color = height >= 60 ? 'bg-green-500' : height >= 40 ? 'bg-yellow-500' : 'bg-red-500';
      return `
        <div class="flex-1 flex flex-col justify-end">
          <div class="${color} rounded-t transition-all" style="height: ${height}%"></div>
        </div>
      `;
    }).join('');
  }

  renderInsights() {
    const avgRetention = this.retentionData.reduce((a, b) => a + b.retention, 0) / this.retentionData.length;
    const firstMin = this.retentionData[1]?.retention || 70;
    
    let insights = [];
    
    if (firstMin < 60) {
      insights.push({
        icon: '⚠️',
        color: 'text-yellow-400',
        text: 'First 10% drop-off is high — strengthen your hook'
      });
    }
    
    if (avgRetention < 40) {
      insights.push({
        icon: '📉',
        color: 'text-red-400',
        text: 'Overall retention below 40% — consider shorter format'
      });
    }
    
    if (this.videoDuration >= 1800) {
      insights.push({
        icon: '🚀',
        color: 'text-green-400',
        text: '30+ min content gets 35-45% algorithm boost in 2026'
      });
    }
    
    if (insights.length === 0) {
      insights.push({
        icon: '✅',
        color: 'text-green-400',
        text: 'Retention looks good — focus on maintaining satisfaction'
      });
    }
    
    return insights.map(i => `
      <div class="flex items-start gap-2 text-sm">
        <span>${i.icon}</span>
        <span class="${i.color}">${i.text}</span>
      </div>
    `).join('');
  }

  updateDuration(value) {
    this.videoDuration = parseInt(value);
    document.getElementById('duration-display').textContent = this.formatTime(this.videoDuration);
    this.generateSampleData();
    this.refreshUI();
  }

  updateRetention(point, value) {
    if (this.retentionData[point]) {
      this.retentionData[point].retention = parseInt(value);
      document.getElementById(`retention-display-${point}`).textContent = value + '%';
    }
    this.calculate();
  }

  loadPreset(preset) {
    switch(preset) {
      case 'viral':
        this.retentionData.forEach((p, i) => {
          if (i === 0) p.retention = 100;
          else if (i === 1) p.retention = 85;
          else if (i === 2) p.retention = 75;
          else if (i === 3) p.retention = 68;
          else p.retention = Math.max(55, 68 - (i - 3) * 2);
        });
        break;
      case 'average':
        this.retentionData.forEach((p, i) => {
          if (i === 0) p.retention = 100;
          else if (i === 1) p.retention = 70;
          else if (i === 2) p.retention = 55;
          else if (i === 3) p.retention = 45;
          else p.retention = Math.max(30, 45 - (i - 3) * 3);
        });
        break;
      case 'poor':
        this.retentionData.forEach((p, i) => {
          if (i === 0) p.retention = 100;
          else if (i === 1) p.retention = 50;
          else if (i === 2) p.retention = 35;
          else if (i === 3) p.retention = 25;
          else p.retention = Math.max(10, 25 - (i - 3) * 4);
        });
        break;
    }
    this.refreshUI();
  }

  calculate() {
    const avgRetention = this.retentionData.reduce((a, b) => a + b.retention, 0) / this.retentionData.length;
    const avd = (this.videoDuration * (avgRetention / 100));
    const contentType = document.getElementById('content-type')?.value || 'standard';
    
    // Algorithm score calculation (2026 factors)
    let algorithmScore = avgRetention;
    
    // 30+ minute boost (35-45% better promotion)
    if (this.videoDuration >= 1800) {
      algorithmScore *= 1.4;
    }
    
    // First 10% retention is critical
    const firstRetention = this.retentionData[1]?.retention || 70;
    if (firstRetention < 50) {
      algorithmScore *= 0.7;
    }
    
    // Shorts factor (harder to convert to long-form now)
    if (contentType === 'short') {
      algorithmScore *= 0.8;
    }
    
    algorithmScore = Math.min(100, Math.round(algorithmScore));
    
    // Satisfaction estimate
    let satisfaction = 'Low';
    let satisfactionWidth = 25;
    if (algorithmScore >= 70) {
      satisfaction = 'High';
      satisfactionWidth = 90;
    } else if (algorithmScore >= 50) {
      satisfaction = 'Medium';
      satisfactionWidth = 60;
    }
    
    // Update displays
    document.getElementById('avd-result').textContent = this.formatTime(Math.round(avd));
    document.getElementById('retention-rate').textContent = Math.round(avgRetention) + '%';
    document.getElementById('retention-rate').className = 'text-xl font-bold ' + (avgRetention >= 50 ? 'text-green-400' : avgRetention >= 35 ? 'text-yellow-400' : 'text-red-400');
    document.getElementById('algorithm-score').textContent = algorithmScore + '/100';
    document.getElementById('algorithm-score').className = 'text-xl font-bold ' + (algorithmScore >= 70 ? 'text-green-400' : algorithmScore >= 50 ? 'text-yellow-400' : 'text-red-400');
    document.getElementById('satisfaction-text').textContent = satisfaction;
    document.getElementById('satisfaction-text').className = 'font-bold ' + (algorithmScore >= 70 ? 'text-green-400' : algorithmScore >= 50 ? 'text-yellow-400' : 'text-red-400');
    document.getElementById('satisfaction-bar').style.width = satisfactionWidth + '%';
    
    document.getElementById('insights-panel').innerHTML = this.renderInsights();
  }

  refreshUI() {
    // Update retention sliders
    this.retentionData.forEach((p, i) => {
      const slider = document.getElementById(`retention-${i}`);
      const display = document.getElementById(`retention-display-${i}`);
      if (slider) slider.value = p.retention;
      if (display) display.textContent = p.retention + '%';
    });
    
    // Update graph
    document.getElementById('retention-graph').innerHTML = this.renderGraph();
    
    this.calculate();
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

// Initialize global instance
window.YouTubeRetentionAnalyzer = YouTubeRetentionAnalyzer;
window.retentionAnalyzer = new YouTubeRetentionAnalyzer();

// Auto-load if container exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('retention-analyzer-container')) {
    window.retentionAnalyzer.render('retention-analyzer-container');
  }
});
