/**
 * Shorts Strategy Calculator Widget
 * Interactive tool for estimating YouTube Shorts output, revenue, and posting cadence
 */

class ShortsCalculator {
    constructor() {
        this.defaults = {
            longsPerWeek: 1,
            clipsPerLong: 5,
            manualShortsPerWeek: 3,
            avgViewsPerShort: 5000,
            rpmShorts: 0.05, // $0.05 per 1000 views (Shorts RPM)
            rpmLongs: 3.00,  // $3.00 per 1000 views (Long-form RPM)
            subsPerMonth: 500,
            growthMultiplier: 1.15 // 15% monthly growth
        };
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="shorts-calc-widget">
                <div class="calc-header">
                    <h3>📊 Shorts Strategy Calculator</h3>
                    <span class="calc-badge">Interactive</span>
                </div>

                <div class="calc-inputs">
                    <div class="calc-row">
                        <label>Long-form videos per week</label>
                        <input type="range" id="calc-longs" min="0" max="7" value="${this.defaults.longsPerWeek}" oninput="shortsCalculator.update()">
                        <span class="calc-val" id="calc-longs-val">${this.defaults.longsPerWeek}</span>
                    </div>
                    <div class="calc-row">
                        <label>Shorts clips per long video</label>
                        <input type="range" id="calc-clips" min="0" max="15" value="${this.defaults.clipsPerLong}" oninput="shortsCalculator.update()">
                        <span class="calc-val" id="calc-clips-val">${this.defaults.clipsPerLong}</span>
                    </div>
                    <div class="calc-row">
                        <label>Manual Shorts per week</label>
                        <input type="range" id="calc-manual" min="0" max="14" value="${this.defaults.manualShortsPerWeek}" oninput="shortsCalculator.update()">
                        <span class="calc-val" id="calc-manual-val">${this.defaults.manualShortsPerWeek}</span>
                    </div>
                    <div class="calc-row">
                        <label>Avg views per Short</label>
                        <input type="range" id="calc-views" min="500" max="100000" step="500" value="${this.defaults.avgViewsPerShort}" oninput="shortsCalculator.update()">
                        <span class="calc-val" id="calc-views-val">${this.defaults.avgViewsPerShort.toLocaleString()}</span>
                    </div>
                </div>

                <div class="calc-results" id="calc-results">
                </div>

                <div class="calc-projection" id="calc-projection">
                </div>

                <div class="calc-tools">
                    <h4>🛠️ Recommended Tools</h4>
                    <div class="tool-chips">
                        <a href="https://www.opus.pro/" target="_blank" class="tool-chip">OpusClip</a>
                        <a href="https://invideo.io/" target="_blank" class="tool-chip">InVideo AI</a>
                        <a href="https://www.capcut.com/" target="_blank" class="tool-chip">CapCut</a>
                    </div>
                    <p class="calc-tip">💡 AI highlight detection can auto-clip gaming footage into Shorts-ready segments.</p>
                </div>
            </div>
        `;

        this.update();
    }

    update() {
        const longs = parseInt(document.getElementById('calc-longs').value);
        const clips = parseInt(document.getElementById('calc-clips').value);
        const manual = parseInt(document.getElementById('calc-manual').value);
        const views = parseInt(document.getElementById('calc-views').value);

        // Update display values
        document.getElementById('calc-longs-val').textContent = longs;
        document.getElementById('calc-clips-val').textContent = clips;
        document.getElementById('calc-manual-val').textContent = manual;
        document.getElementById('calc-views-val').textContent = views.toLocaleString();

        // Calculate
        const autoShortsPerWeek = longs * clips;
        const totalShortsPerWeek = autoShortsPerWeek + manual;
        const totalShortsPerMonth = totalShortsPerWeek * 4.33;
        const monthlyShortViews = totalShortsPerMonth * views;
        const monthlyShortRevenue = (monthlyShortViews / 1000) * this.defaults.rpmShorts;
        const monthlyLongRevenue = (longs * 4.33 * 50000 / 1000) * this.defaults.rpmLongs; // assume 50k views per long
        const totalMonthlyRevenue = monthlyShortRevenue + monthlyLongRevenue;

        // 6-month projection with growth
        const projections = [];
        let currentViews = views;
        for (let i = 1; i <= 6; i++) {
            currentViews = Math.round(currentViews * this.defaults.growthMultiplier);
            const monthViews = totalShortsPerMonth * currentViews;
            const monthRev = (monthViews / 1000) * this.defaults.rpmShorts;
            projections.push({ month: i, views: currentViews, totalViews: monthViews, revenue: monthRev });
        }

        const resultsEl = document.getElementById('calc-results');
        resultsEl.innerHTML = `
            <div class="result-grid">
                <div class="result-card">
                    <span class="result-number">${totalShortsPerWeek}</span>
                    <span class="result-label">Shorts/week</span>
                    <span class="result-detail">${autoShortsPerWeek} auto + ${manual} manual</span>
                </div>
                <div class="result-card">
                    <span class="result-number">${Math.round(totalShortsPerMonth)}</span>
                    <span class="result-label">Shorts/month</span>
                </div>
                <div class="result-card revenue">
                    <span class="result-number">$${monthlyShortRevenue.toFixed(0)}</span>
                    <span class="result-label">Shorts revenue/mo</span>
                    <span class="result-detail">at $0.05 RPM</span>
                </div>
                <div class="result-card revenue">
                    <span class="result-number">$${totalMonthlyRevenue.toFixed(0)}</span>
                    <span class="result-label">Total revenue/mo</span>
                    <span class="result-detail">Shorts + Longs</span>
                </div>
            </div>
        `;

        const projEl = document.getElementById('calc-projection');
        projEl.innerHTML = `
            <h4>📈 6-Month Projection (15% monthly growth)</h4>
            <div class="projection-bars">
                ${projections.map(p => `
                    <div class="proj-bar-wrap">
                        <div class="proj-bar" style="height: ${Math.min(100, (p.revenue / Math.max(...projections.map(x => x.revenue))) * 100)}%">
                            <span class="proj-rev">$${p.revenue.toFixed(0)}</span>
                        </div>
                        <span class="proj-month">M${p.month}</span>
                    </div>
                `).join('')}
            </div>
            <div class="proj-summary">
                Month 6: <strong>${projections[5].views.toLocaleString()}</strong> avg views/Short → 
                <strong>$${projections[5].revenue.toFixed(0)}/mo</strong> Shorts revenue
            </div>
        `;
    }

    destroy() {
        // cleanup if needed
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('shorts-calculator');
    if (container) {
        window.shortsCalculator = new ShortsCalculator();
        window.shortsCalculator.render('shorts-calculator');
    }
});

window.ShortsCalculator = ShortsCalculator;
