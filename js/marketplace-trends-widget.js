/**
 * Minecraft Marketplace Content Trends
 * Visual breakdown of Marketplace content types and opportunities
 */

class MarketplaceTrendsWidget {
    constructor() {
        this.contentTypes = [
            {
                type: 'Skin Packs',
                icon: '👤',
                popularity: 'High',
                priceRange: '490-830 Minecoins',
                creatorShare: '~50%',
                opportunity: 'Niche skins (baby mobs, cinematic themes)',
                competition: 'High'
            },
            {
                type: 'Worlds/Maps',
                icon: '🗺️',
                popularity: 'Very High',
                priceRange: '830-1340 Minecoins',
                creatorShare: '~50%',
                opportunity: 'Adventure maps with BBS cinematics',
                competition: 'Medium'
            },
            {
                type: 'Texture Packs',
                icon: '🎨',
                popularity: 'Medium',
                priceRange: '660-990 Minecoins',
                creatorShare: '~50%',
                opportunity: 'Cinematic/photorealistic textures',
                competition: 'Low'
            },
            {
                type: 'Mini-Games',
                icon: '🎮',
                popularity: 'High',
                priceRange: '990-1480 Minecoins',
                creatorShare: '~50%',
                opportunity: 'Unique game modes',
                competition: 'Medium'
            },
            {
                type: 'Add-ons',
                icon: '➕',
                popularity: 'Growing',
                priceRange: 'Varies',
                creatorShare: '~50%',
                opportunity: 'Custom entities, BBS integration',
                competition: 'Low'
            }
        ];
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="marketplace-trends">
                <div class="trends-header">
                    <div class="trends-title">
                        <span class="trends-icon">🏪</span>
                        <h3>Marketplace Content Trends</h3>
                    </div>
                    <span class="trends-badge">2026</span>
                </div>

                <div class="marketplace-stats-row">
                    <div class="mp-stat">
                        <span class="mp-stat-num">173+</span>
                        <span class="mp-stat-label">Free Products</span>
                    </div>
                    <div class="mp-stat">
                        <span class="mp-stat-num">50%</span>
                        <span class="mp-stat-label">Creator Share</span>
                    </div>
                    <div class="mp-stat">
                        <span class="mp-stat-num">$146M</span>
                        <span class="mp-stat-label">Q1 Revenue</span>
                    </div>
                </div>

                <div class="content-types-grid">
                    ${this.contentTypes.map(c => this.renderContentCard(c)).join('')}
                </div>

                <div class="trends-insight">
                    <div class="insight-title">💡 Content Opportunity for Steven</div>
                    <p><strong>Cinematic Worlds:</strong> Create adventure maps with built-in BBS cinematic sequences. 
                    Players experience your storytelling while exploring. High value, medium competition.</p>
                    
                    <p><strong>Texture Packs:</strong> Low competition category. Photorealistic or cinematic textures 
                    for content creators to use in their videos.</p>
                </div>

                <div class="trends-footer">
                    <div class="pass-info">
                        <span class="pass-icon">🎫</span>
                        <span class="pass-text">
                            <strong>Marketplace Pass:</strong> Subscription service for popular community content. 
                            Getting featured here = massive exposure.
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    renderContentCard(content) {
        const popularityColor = {
            'Very High': '#ef4444',
            'High': '#f59e0b',
            'Medium': '#3b82f6',
            'Growing': '#10b981'
        }[content.popularity];

        const competitionColor = {
            'High': '#ef4444',
            'Medium': '#f59e0b',
            'Low': '#10b981'
        }[content.competition];

        return `
            <div class="content-type-card">
                <div class="card-header-row">
                    <span class="type-icon">${content.icon}</span>
                    <span class="type-name">${content.type}</span>
                </div>
                
                <div class="type-metrics">
                    <div class="metric">
                        <span class="metric-label">Popularity</span>
                        <span class="metric-value" style="color: ${popularityColor}">${content.popularity}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Price Range</span>
                        <span class="metric-value">${content.priceRange}</span>
                    </div>
                </div>
                
                <div class="opportunity-box">
                    <span class="opp-label">Opportunity:</span>
                    <span class="opp-text">${content.opportunity}</span>
                </div>
                
                <div class="competition-row">
                    <span class="comp-label">Competition:</span>
                    <span class="comp-value" style="color: ${competitionColor}">${content.competition}</span>
                </div>
            </div>
        `;
    }

    destroy() {
        // cleanup
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('marketplace-trends');
    if (container) {
        window.marketplaceTrends = new MarketplaceTrendsWidget();
        window.marketplaceTrends.render('marketplace-trends');
    }
});

window.MarketplaceTrendsWidget = MarketplaceTrendsWidget;
