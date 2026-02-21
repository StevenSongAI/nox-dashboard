/**
 * Minecraft 26.1 Release Tracker
 * Countdown and feature tracker for First Drop 2026
 */

class MinecraftReleaseTracker {
    constructor() {
        this.releaseDate = new Date('2026-03-31T12:00:00-04:00'); // March 31, 2026 noon EST
        this.features = [
            {
                id: 'baby-mobs',
                name: 'Baby Mob Redesigns',
                icon: '👶',
                status: 'complete',
                description: 'Every baby mob gets unique textures and models',
                snapshots: ['26w05a', '26w06a', '26w07a', '26w08a'],
                completed: 4,
                total: 4
            },
            {
                id: 'golden-dandelion',
                name: 'Golden Dandelion',
                icon: '🌼',
                status: 'complete',
                description: 'Prevents baby animals from aging',
                snapshots: ['26w05a'],
                completed: 1,
                total: 1
            },
            {
                id: 'craftable-name-tags',
                name: 'Craftable Name Tags',
                icon: '🏷️',
                status: 'complete',
                description: 'Name tags now craftable with string and paper',
                snapshots: ['26w02a'],
                completed: 1,
                total: 1
            },
            {
                id: 'mob-sounds',
                name: 'Adult Sound Variants',
                icon: '🔊',
                status: 'complete',
                description: 'Unique sound variants for adult mobs',
                snapshots: ['26w07a'],
                completed: 1,
                total: 1
            },
            {
                id: 'stonecutter-recipes',
                name: 'Stonecutter Recipes',
                icon: '⚒️',
                status: 'complete',
                description: 'New stonecutting recipes added',
                snapshots: ['26w08a'],
                completed: 1,
                total: 1
            }
        ];
        this.updateInterval = null;
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="release-tracker">
                <div class="tracker-header">
                    <div class="tracker-title">
                        <span class="tracker-icon">📦</span>
                        <h3>Minecraft 26.1 Release Tracker</h3>
                    </div>
                    <span class="tracker-badge">First Drop 2026</span>
                </div>

                <div class="countdown-section" id="countdown-section">
                    <div class="countdown-label">⏰ Time Until Release</div>
                    <div class="countdown-display">
                        <div class="countdown-block">
                            <span class="countdown-value" id="countdown-days">--</span>
                            <span class="countdown-unit">Days</span>
                        </div>
                        <div class="countdown-separator">:</div>
                        <div class="countdown-block">
                            <span class="countdown-value" id="countdown-hours">--</span>
                            <span class="countdown-unit">Hours</span>
                        </div>
                        <div class="countdown-separator">:</div>
                        <div class="countdown-block">
                            <span class="countdown-value" id="countdown-minutes">--</span>
                            <span class="countdown-unit">Mins</span>
                        </div>
                    </div>
                    <div class="release-date">Expected: March 31, 2026</div>
                </div>

                <div class="features-progress">
                    <div class="progress-header">
                        <span class="progress-title">📋 Features Progress</span>
                        <span class="progress-count" id="progress-count">Calculating...</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" id="progress-bar"></div>
                    </div>
                </div>

                <div class="features-list">
                    ${this.features.map(f => this.renderFeatureCard(f)).join('')}
                </div>

                <div class="tracker-footer">
                    <div class="content-opportunity">
                        <span class="opportunity-icon">💡</span>
                        <span class="opportunity-text">Content opportunity: "Everything New in Minecraft 26.1" video ready to script</span>
                    </div>
                </div>
            </div>
        `;

        this.updateCountdown();
        this.updateProgress();
        this.startTimer();
    }

    renderFeatureCard(feature) {
        const progress = (feature.completed / feature.total) * 100;
        return `
            <div class="feature-card ${feature.status}">
                <div class="feature-icon">${feature.icon}</div>
                <div class="feature-info">
                    <div class="feature-header-row">
                        <span class="feature-name">${feature.name}</span>
                        <span class="feature-status ${feature.status}">${feature.status === 'complete' ? '✓ Complete' : 'In Progress'}</span>
                    </div>
                    <p class="feature-desc">${feature.description}</p>
                    
                    <div class="feature-meta">
                        <span class="feature-snapshots">Snapshots: ${feature.snapshots.join(', ')}</span>
                        <div class="feature-progress-mini">
                            <div class="mini-bar" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    updateCountdown() {
        const now = new Date();
        const diff = this.releaseDate - now;

        if (diff <= 0) {
            document.getElementById('countdown-section').innerHTML = '<div class="released-badge">🎉 RELEASED!</div>';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        const daysEl = document.getElementById('countdown-days');
        const hoursEl = document.getElementById('countdown-hours');
        const minutesEl = document.getElementById('countdown-minutes');

        if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
        if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
        if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
    }

    updateProgress() {
        const totalFeatures = this.features.length;
        const completedFeatures = this.features.filter(f => f.status === 'complete').length;
        const progress = (completedFeatures / totalFeatures) * 100;

        const countEl = document.getElementById('progress-count');
        const barEl = document.getElementById('progress-bar');

        if (countEl) countEl.textContent = `${completedFeatures}/${totalFeatures} Features Ready`;
        if (barEl) barEl.style.width = `${progress}%`;
    }

    startTimer() {
        this.updateInterval = setInterval(() => {
            this.updateCountdown();
        }, 60000); // Update every minute
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('minecraft-release-tracker');
    if (container) {
        window.minecraftTracker = new MinecraftReleaseTracker();
        window.minecraftTracker.render('minecraft-release-tracker');
    }
});

window.MinecraftReleaseTracker = MinecraftReleaseTracker;
