/**
 * YouTube Shorts Strategy Optimizer
 * Interactive tool for optimizing Shorts based on 2026 algorithm
 */

class ShortsStrategyOptimizer {
    constructor() {
        this.strategies = [
            {
                id: 'retention',
                name: 'Retention Hook',
                icon: '🎯',
                priority: 'Critical',
                description: 'First 3 seconds must stop the scroll',
                tactics: [
                    'Start with visual curiosity gap',
                    'Show the payoff moment first',
                    'Use pattern interrupts',
                    'No slow intros or logos'
                ],
                impact: 'High'
            },
            {
                id: 'vertical-native',
                name: 'Vertical-Native Format',
                icon: '📱',
                priority: 'Critical',
                description: '9:16 ratio, full-screen immersion',
                tactics: [
                    'Fill the entire vertical frame',
                    'No black bars or letterboxing',
                    'Text within safe zones',
                    'Mobile-first composition'
                ],
                impact: 'High'
            },
            {
                id: 'duration',
                name: 'New 3-Minute Format',
                icon: '⏱️',
                priority: 'High',
                description: '2026: Extended from 60s to 3 minutes',
                tactics: [
                    'Sweet spot: 45-90 seconds',
                    'Use extra time for value, not filler',
                    'Mid-roll pattern interrupts',
                    'End with CTA at 2:50 mark'
                ],
                impact: 'Medium'
            },
            {
                id: 'looping',
                name: 'Loop Optimization',
                icon: '🔄',
                priority: 'High',
                description: 'Seamless loops boost retention metrics',
                tactics: [
                    'Match end frame to start',
                    'Audio should loop naturally',
                    'Create satisfying conclusion',
                    'Encourage re-watches'
                ],
                impact: 'High'
            },
            {
                id: 'keywords',
                name: 'Keyword Strategy',
                icon: '🔑',
                priority: 'Medium',
                description: 'Algorithm connects content to search intent',
                tactics: [
                    'Include keywords in first 3 seconds spoken',
                    'Text overlay with main keyword',
                    'Caption files for accessibility',
                    'Trending audio = keyword relevance'
                ],
                impact: 'Medium'
            }
        ];
        this.selectedStrategy = null;
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="shorts-optimizer">
                <div class="optimizer-header">
                    <div class="optimizer-title">
                        <span class="optimizer-icon">📱</span>
                        <h3>Shorts Strategy Optimizer</h3>
                    </div>
                    <span class="optimizer-badge">2026 Algorithm</span>
                </div>

                <div class="algorithm-insight">
                    <div class="insight-title">🧠 How the 2026 Algorithm Works</div>
                    <p>YouTube uses an <strong>"explore and exploit"</strong> system: it tests your Short with small audiences, 
                    then <strong>exploits</strong> (pushes widely) if retention is high. 
                    <strong>Viewer retention is the #1 metric.</strong></p>
                </div>

                <div class="strategies-grid" id="strategies-grid">
                    ${this.strategies.map(s => this.renderStrategyCard(s)).join('')}
                </div>

                <div class="strategy-detail hidden" id="strategy-detail">
                    <div class="detail-header">
                        <button onclick="shortsOptimizer.closeDetail()" class="back-btn">← Back</button>
                    </div>
                    <div id="strategy-detail-content"></div>
                </div>

                <div class="optimizer-footer">
                    <div class="quick-wins">
                        <h4>⚡ Quick Wins for Steven</h4>
                        <ul>
                            <li>Minecraft cinematics: Start with the most dramatic build moment</li>
                            <li>Baby mob videos: Hook with "cutest baby mob you\'ve never seen"</li>
                            <li>BBS showcases: Loop the cinematic shot seamlessly</li>
                            <li>Use new 3-minute format for detailed build tutorials</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        // Add click handlers
        this.strategies.forEach(s => {
            const card = document.getElementById(`strategy-${s.id}`);
            if (card) {
                card.onclick = () => this.showDetail(s);
            }
        });
    }

    renderStrategyCard(strategy) {
        return `
            <div class="strategy-card ${strategy.priority.toLowerCase()}" id="strategy-${strategy.id}">
                <div class="strategy-header">
                    <span class="strategy-icon">${strategy.icon}</span>
                    <span class="strategy-priority ${strategy.priority.toLowerCase()}">${strategy.priority}</span>
                </div>
                <h4 class="strategy-name">${strategy.name}</h4>
                <p class="strategy-desc">${strategy.description}</p>
                
                <div class="strategy-meta">
                    <span class="strategy-impact ${strategy.impact.toLowerCase()}">${strategy.impact} Impact</span>
                    <span class="strategy-view">View →</span>
                </div>
            </div>
        `;
    }

    showDetail(strategy) {
        this.selectedStrategy = strategy;
        const grid = document.getElementById('strategies-grid');
        const detail = document.getElementById('strategy-detail');
        const content = document.getElementById('strategy-detail-content');

        if (grid) grid.classList.add('hidden');
        if (detail) detail.classList.remove('hidden');

        if (content) {
            content.innerHTML = `
                <div class="detail-hero">
                    <span class="detail-icon">${strategy.icon}</span>
                    <h2>${strategy.name}</h2>
                    <span class="detail-priority ${strategy.priority.toLowerCase()}">${strategy.priority} Priority</span>
                    <p class="detail-desc">${strategy.description}</p>
                </div>

                <div class="tactics-section">
                    <h4>✅ Implementation Tactics</h4>
                    <ul class="tactics-list">
                        ${strategy.tactics.map(t => `<li>${t}</li>`).join('')}
                    </ul>
                </div>

                <div class="impact-box ${strategy.impact.toLowerCase()}">
                    <h4>📊 Expected Impact</h4>
                    <p>${strategy.impact === 'High' ? 'Significant boost to Shorts performance and algorithm favorability' : 
                           strategy.impact === 'Medium' ? 'Moderate improvement in reach and retention' : 
                           'Incremental gains, implement when higher priorities are complete'}</p>
                </div>
            `;
        }
    }

    closeDetail() {
        const grid = document.getElementById('strategies-grid');
        const detail = document.getElementById('strategy-detail');

        if (grid) grid.classList.remove('hidden');
        if (detail) detail.classList.add('hidden');
        this.selectedStrategy = null;
    }

    destroy() {
        this.selectedStrategy = null;
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('shorts-optimizer');
    if (container) {
        window.shortsOptimizer = new ShortsStrategyOptimizer();
        window.shortsOptimizer.render('shorts-optimizer');
    }
});

window.ShortsStrategyOptimizer = ShortsStrategyOptimizer;
