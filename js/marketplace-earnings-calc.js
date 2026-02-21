/**
 * Minecraft Marketplace Earnings Calculator
 * Calculate potential earnings as a Minecraft Marketplace creator
 */

class MarketplaceEarningsCalculator {
    constructor() {
        this.defaults = {
            contentPrice: 490, // Minecoins (minimum)
            minecoinValue: 0.00625, // $ per minecoin (~$3.07 for 490)
            monthlySales: 1000,
            creatorShare: 0.50, // 50% after platform cuts
            contentType: 'skin_pack' // skin_pack, world, texture_pack, mashup
        };
        
        this.contentTypes = {
            skin_pack: { name: 'Skin Pack', avgPrice: 490, conversionRate: 0.08 },
            world: { name: 'World/Map', avgPrice: 830, conversionRate: 0.05 },
            texture_pack: { name: 'Texture Pack', avgPrice: 660, conversionRate: 0.06 },
            mashup: { name: 'Mash-up', avgPrice: 1340, conversionRate: 0.03 }
        };
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="marketplace-calc">
                <div class="calc-header">
                    <div class="calc-title">
                        <span class="calc-icon">💎</span>
                        <h3>Marketplace Earnings Calculator</h3>
                    </div>
                    <span class="calc-badge">Based on 2025 Data</span>
                </div>

                <div class="calc-inputs">
                    <div class="input-row">
                        <label>Content Type</label>
                        <select id="content-type" onchange="marketplaceCalc.update()">
                            ${Object.entries(this.contentTypes).map(([key, type]) => `
                                <option value="${key}" ${key === 'skin_pack' ? 'selected' : ''}>${type.name}</option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="input-row">
                        <label>Monthly Downloads</label>
                        <input type="range" id="monthly-sales" min="100" max="10000" step="100" 
                               value="${this.defaults.monthlySales}" oninput="marketplaceCalc.update()">
                        <span class="input-value" id="sales-value">${this.defaults.monthlySales.toLocaleString()}</span>
                    </div>

                    <div class="input-row">
                        <label>Price (Minecoins)</label>
                        <input type="range" id="content-price" min="490" max="2000" step="10"
                               value="${this.defaults.contentPrice}" oninput="marketplaceCalc.update()">
                        <span class="input-value" id="price-value">${this.defaults.contentPrice}</span>
                    </div>
                </div>

                <div class="calc-results" id="calc-results">
                </div>

                <div class="marketplace-stats">
                    <h4>📊 2025 Marketplace Stats</h4>
                    <div class="stats-grid">
                        <div class="stat-box">
                            <span class="stat-num">$146M</span>
                            <span class="stat-label">Q1 2025 Revenue</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-num">$500M+</span>
                            <span class="stat-label">Creator Payouts</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-num">1.7M+</span>
                            <span class="stat-label">Content Pieces</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-num">50%</span>
                            <span class="stat-label">Creator Share</span>
                        </div>
                    </div>
                </div>

                <div class="earnings-breakdown" id="earnings-breakdown">
                </div>
            </div>
        `;

        this.update();
    }

    update() {
        const contentType = document.getElementById('content-type').value;
        const monthlySales = parseInt(document.getElementById('monthly-sales').value);
        const contentPrice = parseInt(document.getElementById('content-price').value);
        
        // Update display values
        document.getElementById('sales-value').textContent = monthlySales.toLocaleString();
        document.getElementById('price-value').textContent = contentPrice;
        
        // Calculate earnings
        const minecoinValue = 0.00625; // ~$3.07 for 490 minecoins
        const grossRevenue = monthlySales * contentPrice * minecoinValue;
        const creatorShare = grossRevenue * 0.50; // 50% after platform cuts
        const annualEarnings = creatorShare * 12;
        
        // Determine tier
        let tier = 'Hobbyist';
        if (annualEarnings > 100000) tier = 'Top Creator';
        else if (annualEarnings > 25000) tier = 'Professional';
        else if (annualEarnings > 5000) tier = 'Part-time';
        
        // Content type data
        const typeData = this.contentTypes[contentType];
        
        const resultsEl = document.getElementById('calc-results');
        if (resultsEl) {
            resultsEl.innerHTML = `
                <div class="results-grid">
                    <div class="result-card primary">
                        <span class="result-label">Monthly Earnings</span>
                        <span class="result-value">$${creatorShare.toFixed(0)}</span>
                        <span class="result-detail">After 50% platform cut</span>
                    </div>
                    
                    <div class="result-card">
                        <span class="result-label">Annual Projection</span>
                        <span class="result-value">$${annualEarnings.toFixed(0)}</span>
                        <span class="result-detail">12 months</span>
                    </div>
                    
                    <div class="result-card">
                        <span class="result-label">Creator Tier</span>
                        <span class="result-value tier-${tier.toLowerCase().replace('-', '')}">${tier}</span>
                        <span class="result-detail">Based on annual</span>
                    </div>
                </div>
            `;
        }
        
        const breakdownEl = document.getElementById('earnings-breakdown');
        if (breakdownEl) {
            breakdownEl.innerHTML = `
                <h4>💡 Content Strategy Tip</h4>
                <p>${typeData.name}s typically convert at ${(typeData.conversionRate * 100).toFixed(0)}% view-to-purchase rate. 
                With ${monthlySales.toLocaleString()} monthly downloads at ${contentPrice} Minecoins, 
                you'd need approximately ${Math.round(monthlySales / typeData.conversionRate).toLocaleString()} 
                content views to achieve this sales volume.</p>
                
                <div class="comparison-insight">
                    <strong>Reality Check:</strong> Top creators make 6 figures annually. 
                    To reach $100k/year, you'd need ~${Math.round(100000 / 12 / (contentPrice * minecoinValue * 0.50)).toLocaleString()} 
                    monthly sales at this price point.
                </div>
            `;
        }
    }

    destroy() {
        // cleanup
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('marketplace-calc');
    if (container) {
        window.marketplaceCalc = new MarketplaceEarningsCalculator();
        window.marketplaceCalc.render('marketplace-calc');
    }
});

window.MarketplaceEarningsCalculator = MarketplaceEarningsCalculator;
