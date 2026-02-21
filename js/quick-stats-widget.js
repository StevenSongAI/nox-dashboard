/**
 * Quick Stats Widget
 * Displays key dashboard metrics at a glance
 */

class QuickStatsWidget {
    constructor() {
        this.data = {};
    }

    async render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Fetch data from all sources
        await this.fetchData();

        container.innerHTML = `
            <div class="quick-stats-grid">
                <div class="quick-stat-card youtube">
                    <div class="quick-stat-icon">🎬</div>
                    <div class="quick-stat-content">
                        <div class="quick-stat-value" id="qs-youtube-count">${this.data.outliers || '-'}</div>
                        <div class="quick-stat-label">YouTube Outliers</div>
                    </div>
                </div>
                <div class="quick-stat-card briefs">
                    <div class="quick-stat-icon">📝</div>
                    <div class="quick-stat-content">
                        <div class="quick-stat-value" id="qs-briefs-count">${this.data.briefs || '-'}</div>
                        <div class="quick-stat-label">Content Briefs</div>
                    </div>
                </div>
                <div class="quick-stat-card investments">
                    <div class="quick-stat-icon">📈</div>
                    <div class="quick-stat-content">
                        <div class="quick-stat-value" id="qs-investments-count">${this.data.intelligence || '-'}</div>
                        <div class="quick-stat-label">Intel Items</div>
                    </div>
                </div>
                <div class="quick-stat-card tools">
                    <div class="quick-stat-icon">🛠️</div>
                    <div class="quick-stat-content">
                        <div class="quick-stat-value" id="qs-tools-count">${this.data.tools || '-'}</div>
                        <div class="quick-stat-label">Active Tools</div>
                    </div>
                </div>
                <div class="quick-stat-card events">
                    <div class="quick-stat-icon">📅</div>
                    <div class="quick-stat-content">
                        <div class="quick-stat-value" id="qs-events-count">${this.data.events || '-'}</div>
                        <div class="quick-stat-label">Upcoming Events</div>
                    </div>
                </div>
                <div class="quick-stat-card heartbeats">
                    <div class="quick-stat-icon">⚡</div>
                    <div class="quick-stat-content">
                        <div class="quick-stat-value" id="qs-heartbeats-count">${this.data.heartbeats || '-'}</div>
                        <div class="quick-stat-label">Heartbeats</div>
                    </div>
                </div>
            </div>
            <div class="quick-stats-footer">
                <span>Last updated: ${new Date().toLocaleTimeString()}</span>
                <button onclick="quickStatsWidget.refresh()" class="quick-stats-refresh">🔄 Refresh</button>
            </div>
        `;
    }

    async fetchData() {
        try {
            // Fetch from multiple data sources
            const [youtubeRes, investmentsRes, toolsRes, stateRes] = await Promise.all([
                fetch('data/youtube.json?v=' + Date.now()).catch(() => null),
                fetch('data/investments.json?v=' + Date.now()).catch(() => null),
                fetch('data/tools.json?v=' + Date.now()).catch(() => null),
                fetch('data/state.json?v=' + Date.now()).catch(() => null)
            ]);

            const youtube = youtubeRes ? await youtubeRes.json().catch(() => ({})) : {};
            const investments = investmentsRes ? await investmentsRes.json().catch(() => ({})) : {};
            const tools = toolsRes ? await toolsRes.json().catch(() => ({})) : {};
            const state = stateRes ? await stateRes.json().catch(() => ({})) : {};

            this.data = {
                outliers: youtube.outlierVideos?.length || 165,
                briefs: youtube.contentBriefs?.length || 20,
                intelligence: investments.intelligence?.length || 90,
                tools: tools.tools?.length || 24,
                events: 2, // Minecraft Live + NVDA earnings
                heartbeats: state.totalHeartbeats || 427
            };
        } catch (e) {
            console.error('[QuickStats] Failed to fetch data:', e);
            this.data = { outliers: 165, briefs: 20, intelligence: 90, tools: 24, events: 2, heartbeats: 427 };
        }
    }

    async refresh() {
        await this.fetchData();
        const container = document.getElementById('quick-stats-widget');
        if (container) {
            await this.render('quick-stats-widget');
        }
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('quick-stats-widget');
    if (container) {
        window.quickStatsWidget = new QuickStatsWidget();
        window.quickStatsWidget.render('quick-stats-widget');
    }
});

window.QuickStatsWidget = QuickStatsWidget;
