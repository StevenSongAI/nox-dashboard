/**
 * Minecraft Marketplace Revenue Widget
 * Dashboard component showing creator earnings and opportunities
 */

class MarketplaceRevenueWidget {
    constructor() {
        this.data = {
            totalCreatorPayouts: "$500M+",
            q1_2025: "$146M (record quarter)",
            recentTwoMonths: "$1M (record 2-month period)",
            creatorRevenueShare: "50%+",
            priceRange: "$3-10 (490-1480 Minecoins)",
            topCategories: ["Skin packs", "Worlds", "Texture packs", "Mash-ups"],
            lastUpdated: "2026-02-20"
        };
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="marketplace-widget">
                <div class="mp-header">
                    <h3>💰 Minecraft Marketplace Revenue</h3>
                    <span class="mp-updated">Updated: ${this.data.lastUpdated}</span>
                </div>
                
                <div class="mp-stats-grid">
                    <div class="mp-stat-card highlight">
                        <div class="mp-stat-value">${this.data.totalCreatorPayouts}</div>
                        <div class="mp-stat-label">Total Creator Payouts</div>
                    </div>
                    <div class="mp-stat-card">
                        <div class="mp-stat-value">${this.data.q1_2025}</div>
                        <div class="mp-stat-label">Q1 2025 Earnings (Record)</div>
                    </div>
                    <div class="mp-stat-card">
                        <div class="mp-stat-value">${this.data.creatorRevenueShare}</div>
                        <div class="mp-stat-label">Creator Revenue Share</div>
                    </div>
                    <div class="mp-stat-card">
                        <div class="mp-stat-value">${this.data.priceRange}</div>
                        <div class="mp-stat-label">Typical Price Range</div>
                    </div>
                </div>
                
                <div class="mp-categories">
                    <h4>Top Earning Categories</h4>
                    <div class="mp-category-list">
                        ${this.data.topCategories.map(cat => `
                            <span class="mp-category-tag">${cat}</span>
                        `).join('')}
                    </div>
                </div>
                
                <div class="mp-insights">
                    <h4>💡 Content Opportunities</h4>
                    <ul>
                        <li><strong>Skin Packs:</strong> Low effort, high volume potential</li>
                        <li><strong>Custom Worlds:</strong> Premium pricing ($5-10), longer dev time</li>
                        <li><strong>Texture Packs:>/strong> Trending in 2026 (RPG, Realism, Modern styles)</li>
                        <li><strong>Mash-ups:</strong> Bundle strategy for higher per-sale revenue</li>
                    </ul>
                </div>
                
                <div class="mp-sources">
                    <small>Sources: Business of Apps (2026), Eneba (2025), Oasis AI Minecraft (2025), Notta AI (2025)</small>
                </div>
            </div>
        `;
    }
}

window.MarketplaceRevenueWidget = MarketplaceRevenueWidget;
