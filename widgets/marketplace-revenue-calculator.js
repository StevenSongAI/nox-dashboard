/**
 * Marketplace Revenue Calculator Widget
 * Based on 2026 research: Marketplace earned $560M in past 12 months, creators $500M+
 * Q1 2025 was record quarter at $146M
 */

class MarketplaceRevenueCalculator {
  constructor() {
    // Microsoft takes ~30% cut, creators get ~70%
    this.revenueShare = 0.70;
    
    // Content type benchmarks from marketplace data
    this.contentTypes = {
      skin_pack: {
        name: 'Skin Pack',
        avgPrice: 2.99,
        downloadRange: [1000, 50000],
        competition: 'High',
        trend: 'stable',
        description: 'Character skins collection'
      },
      texture_pack: {
        name: 'Texture Pack',
        avgPrice: 4.99,
        downloadRange: [500, 25000],
        competition: 'Medium',
        trend: 'growing',
        description: 'Visual overhaul packs'
      },
      world_template: {
        name: 'World Template',
        avgPrice: 7.99,
        downloadRange: [200, 15000],
        competition: 'Medium',
        trend: 'growing',
        description: 'Pre-built worlds/spawns'
      },
      adventure_map: {
        name: 'Adventure Map',
        avgPrice: 9.99,
        downloadRange: [100, 10000],
        competition: 'Low',
        trend: 'rising',
        description: 'Story-driven experiences'
      },
      mini_game: {
        name: 'Mini Game',
        avgPrice: 5.99,
        downloadRange: [500, 30000],
        competition: 'High',
        trend: 'stable',
        description: 'Multiplayer game modes'
      },
      mashup: {
        name: 'Mash-up Pack',
        avgPrice: 14.99,
        downloadRange: [1000, 40000],
        competition: 'Low',
        trend: 'rising',
        description: 'Skins + textures + world'
      }
    };
    
    this.currentType = 'skin_pack';
    this.price = 2.99;
    this.downloads = 5000;
    this.productionCost = 0;
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="marketplace-calc-container">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Input Panel -->
          <div class="card rounded-lg p-4">
            <h3 class="text-lg font-semibold mb-4 text-accent-blue">⚙️ Calculator Settings</h3>
            
            <!-- Content Type Selector -->
            <div class="mb-4">
              <label class="block text-sm text-gray-400 mb-2">Content Type</label>
              <div class="grid grid-cols-2 gap-2" id="content-type-grid">
                ${Object.entries(this.contentTypes).map(([key, type]) => `
                  <button onclick="marketplaceCalc.selectType('${key}')" 
                          class="type-btn px-3 py-2 rounded text-sm text-left transition-all ${this.currentType === key ? 'bg-accent-blue text-white' : 'bg-dark-700 hover:bg-dark-600'}"
                          data-type="${key}">
                    <div class="font-medium">${type.name}</div>
                    <div class="text-xs opacity-70">$${type.avgPrice} avg</div>
                  </button>
                `).join('')}
              </div>
              <p class="text-xs text-gray-500 mt-2" id="type-desc">${this.contentTypes[this.currentType].description}</p>
            </div>

            <!-- Price Slider -->
            <div class="mb-4">
              <div class="flex justify-between mb-1">
                <label class="text-sm text-gray-400">Price (USD)</label>
                <span class="text-sm font-bold text-accent-green" id="price-display">$${this.price.toFixed(2)}</span>
              </div>
              <input type="range" id="price-slider" min="0.99" max="19.99" step="0.50" value="${this.price}"
                     class="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-accent-blue"
                     oninput="marketplaceCalc.updatePrice(this.value)">
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>$0.99</span>
                <span>$19.99</span>
              </div>
            </div>

            <!-- Downloads Slider -->
            <div class="mb-4">
              <div class="flex justify-between mb-1">
                <label class="text-sm text-gray-400">Estimated Downloads</label>
                <span class="text-sm font-bold text-accent-green" id="downloads-display">${this.formatNumber(this.downloads)}</span>
              </div>
              <input type="range" id="downloads-slider" min="100" max="100000" step="100" value="${this.downloads}"
                     class="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-accent-blue"
                     oninput="marketplaceCalc.updateDownloads(this.value)">
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>100</span>
                <span>100K</span>
              </div>
            </div>

            <!-- Production Cost -->
            <div class="mb-4">
              <div class="flex justify-between mb-1">
                <label class="text-sm text-gray-400">Production Cost (Optional)</label>
                <span class="text-sm font-bold text-yellow-400" id="cost-display">$${this.productionCost}</span>
              </div>
              <input type="range" id="cost-slider" min="0" max="5000" step="50" value="${this.productionCost}"
                     class="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                     oninput="marketplaceCalc.updateCost(this.value)">
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>$0</span>
                <span>$5K</span>
              </div>
            </div>

            <!-- Quick Presets -->
            <div class="flex gap-2 mt-4">
              <button onclick="marketplaceCalc.setPreset('conservative')" class="flex-1 px-2 py-1 bg-dark-700 rounded text-xs hover:bg-dark-600">Conservative</button>
              <button onclick="marketplaceCalc.setPreset('realistic')" class="flex-1 px-2 py-1 bg-accent-blue rounded text-xs">Realistic</button>
              <button onclick="marketplaceCalc.setPreset('optimistic')" class="flex-1 px-2 py-1 bg-dark-700 rounded text-xs hover:bg-dark-600">Optimistic</button>
            </div>
          </div>

          <!-- Results Panel -->
          <div class="card rounded-lg p-4">
            <h3 class="text-lg font-semibold mb-4 text-accent-green">📊 Revenue Projection</h3>
            
            <!-- Main Revenue Display -->
            <div class="bg-dark-800 rounded-lg p-4 mb-4 text-center">
              <div class="text-sm text-gray-400 mb-1">Your Estimated Earnings</div>
              <div class="text-4xl font-bold text-accent-green" id="total-revenue">$0</div>
              <div class="text-xs text-gray-500 mt-1">After 30% platform fee</div>
            </div>

            <!-- Breakdown -->
            <div class="space-y-2 mb-4">
              <div class="flex justify-between text-sm">
                <span class="text-gray-400">Gross Revenue</span>
                <span class="font-medium" id="gross-revenue">$0</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-400">Platform Fee (30%)</span>
                <span class="font-medium text-red-400" id="platform-fee">-$0</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-400">Production Cost</span>
                <span class="font-medium text-yellow-400" id="production-cost">-$0</span>
              </div>
              <div class="border-t border-dark-600 pt-2 flex justify-between text-sm">
                <span class="text-gray-400">Net Profit</span>
                <span class="font-bold text-accent-green" id="net-profit">$0</span>
              </div>
            </div>

            <!-- ROI Stats -->
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="bg-dark-800 rounded p-3 text-center">
                <div class="text-xl font-bold text-accent-blue" id="roi-percent">0%</div>
                <div class="text-xs text-gray-400">ROI</div>
              </div>
              <div class="bg-dark-800 rounded p-3 text-center">
                <div class="text-xl font-bold text-accent-purple" id="per-download">$0</div>
                <div class="text-xs text-gray-400">Per Download</div>
              </div>
            </div>

            <!-- Benchmark Comparison -->
            <div class="bg-dark-800 rounded-lg p-3 mb-4">
              <h4 class="text-sm font-semibold text-gray-400 mb-2">📈 Market Benchmark</h4>
              <div class="space-y-2">
                <div class="flex justify-between text-xs">
                  <span class="text-gray-500">Your projection vs avg</span>
                  <span id="benchmark-compare" class="text-accent-blue">--</span>
                </div>
                <div class="w-full bg-dark-700 rounded-full h-2">
                  <div id="benchmark-bar" class="bg-accent-blue h-2 rounded-full transition-all" style="width: 0%"></div>
                </div>
                <div class="flex justify-between text-xs text-gray-500">
                  <span>Below avg</span>
                  <span>Average</span>
                  <span>Above avg</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-2">
              <button onclick="marketplaceCalc.exportCalc()" class="flex-1 px-3 py-2 bg-accent-blue rounded text-sm hover:bg-blue-600">📋 Copy Results</button>
              <button onclick="marketplaceCalc.reset()" class="px-3 py-2 bg-dark-700 rounded text-sm hover:bg-dark-600">Reset</button>
            </div>
          </div>
        </div>

        <!-- Market Intelligence Section -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="card rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-2xl">💰</span>
              <h4 class="font-semibold">Market Size</h4>
            </div>
            <div class="text-2xl font-bold text-accent-green">$560M</div>
            <div class="text-xs text-gray-400">Marketplace revenue (12 months)</div>
            <div class="mt-2 text-xs text-gray-500">Record $146M in Q1 2025 alone</div>
          </div>
          
          <div class="card rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-2xl">👥</span>
              <h4 class="font-semibold">Creator Earnings</h4>
            </div>
            <div class="text-2xl font-bold text-accent-blue">$500M+</div>
            <div class="text-xs text-gray-400">Total paid to creators</div>
            <div class="mt-2 text-xs text-gray-500">70% revenue share rate</div>
          </div>
          
          <div class="card rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-2xl">📦</span>
              <h4 class="font-semibold">Content Volume</h4>
            </div>
            <div class="text-2xl font-bold text-accent-purple">1.7M+</div>
            <div class="text-xs text-gray-400">Pieces of content</div>
            <div class="mt-2 text-xs text-gray-500">Downloads since launch</div>
          </div>
        </div>

        <!-- Content Type Comparison -->
        <div class="mt-6 card rounded-lg p-4">
          <h3 class="text-lg font-semibold mb-4">📊 Content Type Comparison</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-gray-400 border-b border-dark-700">
                  <th class="pb-2">Type</th>
                  <th class="pb-2">Avg Price</th>
                  <th class="pb-2">Competition</th>
                  <th class="pb-2">Trend</th>
                  <th class="pb-2">Potential</th>
                </tr>
              </thead>
              <tbody id="comparison-table">
                ${this.renderComparisonTable()}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Strategy Tips -->
        <div class="mt-6 card rounded-lg p-4 border-l-4 border-yellow-500">
          <h4 class="text-sm font-semibold text-yellow-400 mb-2">💡 2026 Marketplace Strategy Tips</h4>
          <ul class="text-sm text-gray-300 space-y-1">
            <li>• Mash-up packs and adventure maps have lower competition and rising trends</li>
            <li>• Price at $4.99-$9.99 sweet spot for best conversion</li>
            <li>• Series content (skin packs with themes) outperforms one-offs</li>
            <li>• Cross-promote on YouTube to drive marketplace discovery</li>
          </ul>
        </div>
      </div>
    `;

    this.calculate();
  }

  renderComparisonTable() {
    return Object.entries(this.contentTypes).map(([key, type]) => {
      const trendIcon = type.trend === 'rising' ? '📈' : type.trend === 'stable' ? '➡️' : '📉';
      const potential = type.competition === 'Low' && type.trend === 'rising' ? 'High' : 
                       type.competition === 'High' ? 'Medium' : 'Good';
      const potentialColor = potential === 'High' ? 'text-green-400' : potential === 'Medium' ? 'text-yellow-400' : 'text-blue-400';
      
      return `
        <tr class="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors ${key === this.currentType ? 'bg-dark-700/50' : ''}">
          <td class="py-2 font-medium">${type.name}</td>
          <td class="py-2">$${type.avgPrice}</td>
          <td class="py-2">${type.competition}</td>
          <td class="py-2">${trendIcon} ${type.trend}</td>
          <td class="py-2 ${potentialColor}">${potential}</td>
        </tr>
      `;
    }).join('');
  }

  selectType(type) {
    this.currentType = type;
    const typeData = this.contentTypes[type];
    
    // Auto-set price to average for this type
    this.price = typeData.avgPrice;
    
    // Update UI
    document.querySelectorAll('.type-btn').forEach(btn => {
      const isActive = btn.dataset.type === type;
      btn.className = `type-btn px-3 py-2 rounded text-sm text-left transition-all ${isActive ? 'bg-accent-blue text-white' : 'bg-dark-700 hover:bg-dark-600'}`;
    });
    
    document.getElementById('type-desc').textContent = typeData.description;
    document.getElementById('price-slider').value = this.price;
    
    this.renderComparisonTable();
    this.calculate();
  }

  updatePrice(value) {
    this.price = parseFloat(value);
    document.getElementById('price-display').textContent = `$${this.price.toFixed(2)}`;
    this.calculate();
  }

  updateDownloads(value) {
    this.downloads = parseInt(value);
    document.getElementById('downloads-display').textContent = this.formatNumber(this.downloads);
    this.calculate();
  }

  updateCost(value) {
    this.productionCost = parseInt(value);
    document.getElementById('cost-display').textContent = `$${this.productionCost}`;
    this.calculate();
  }

  setPreset(preset) {
    const typeData = this.contentTypes[this.currentType];
    
    switch(preset) {
      case 'conservative':
        this.downloads = Math.floor(typeData.downloadRange[0] * 1.5);
        break;
      case 'realistic':
        this.downloads = Math.floor((typeData.downloadRange[0] + typeData.downloadRange[1]) / 2);
        break;
      case 'optimistic':
        this.downloads = Math.floor(typeData.downloadRange[1] * 0.8);
        break;
    }
    
    document.getElementById('downloads-slider').value = this.downloads;
    document.getElementById('downloads-display').textContent = this.formatNumber(this.downloads);
    this.calculate();
  }

  calculate() {
    const grossRevenue = this.price * this.downloads;
    const platformFee = grossRevenue * (1 - this.revenueShare);
    const creatorEarnings = grossRevenue * this.revenueShare;
    const netProfit = creatorEarnings - this.productionCost;
    const roi = this.productionCost > 0 ? ((netProfit / this.productionCost) * 100) : 0;
    const perDownload = creatorEarnings / this.downloads;

    // Update displays
    document.getElementById('total-revenue').textContent = this.formatCurrency(creatorEarnings);
    document.getElementById('gross-revenue').textContent = this.formatCurrency(grossRevenue);
    document.getElementById('platform-fee').textContent = `-${this.formatCurrency(platformFee)}`;
    document.getElementById('production-cost').textContent = `-${this.formatCurrency(this.productionCost)}`;
    document.getElementById('net-profit').textContent = this.formatCurrency(netProfit);
    document.getElementById('roi-percent').textContent = `${roi.toFixed(0)}%`;
    document.getElementById('per-download').textContent = this.formatCurrency(perDownload);

    // Update ROI color
    const roiEl = document.getElementById('roi-percent');
    roiEl.className = `text-xl font-bold ${roi >= 100 ? 'text-green-400' : roi >= 0 ? 'text-accent-blue' : 'text-red-400'}`;

    // Benchmark comparison
    const avgEarnings = 10000; // Benchmark: $10K average for successful content
    const comparePercent = (creatorEarnings / avgEarnings) * 100;
    document.getElementById('benchmark-compare').textContent = `${comparePercent.toFixed(0)}% of avg`;
    document.getElementById('benchmark-bar').style.width = `${Math.min(comparePercent, 100)}%`;
  }

  exportCalc() {
    const results = {
      contentType: this.contentTypes[this.currentType].name,
      price: this.price,
      downloads: this.downloads,
      productionCost: this.productionCost,
      grossRevenue: this.price * this.downloads,
      platformFee: (this.price * this.downloads) * 0.30,
      creatorEarnings: (this.price * this.downloads) * 0.70,
      netProfit: ((this.price * this.downloads) * 0.70) - this.productionCost,
      timestamp: new Date().toISOString()
    };
    
    navigator.clipboard.writeText(JSON.stringify(results, null, 2)).then(() => {
      alert('Calculation results copied to clipboard!');
    });
  }

  reset() {
    this.currentType = 'skin_pack';
    this.price = 2.99;
    this.downloads = 5000;
    this.productionCost = 0;
    
    document.getElementById('price-slider').value = this.price;
    document.getElementById('downloads-slider').value = this.downloads;
    document.getElementById('cost-slider').value = this.productionCost;
    
    this.selectType(this.currentType);
  }

  formatNumber(num) {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  formatCurrency(num) {
    return '$' + num.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
}

// Initialize global instance
window.MarketplaceRevenueCalculator = MarketplaceRevenueCalculator;
window.marketplaceCalc = new MarketplaceRevenueCalculator();

// Auto-load if container exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('marketplace-revenue-container')) {
    window.marketplaceCalc.render('marketplace-revenue-container');
  }
});
