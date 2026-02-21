/**
 * Minecraft Live 2026 Countdown + Predictions
 */

class MinecraftLiveWidget {
    constructor() {
        this.eventDate = new Date('2026-03-15T19:00:00-04:00');
        this.predictions = [
            { text: 'Vibrant Visuals update reveal', confidence: 85, source: 'Sportskeeda' },
            { text: 'PS5 native Java Edition', confidence: 70, source: 'Community buzz' },
            { text: 'Baby mob redesigns (22 variants)', confidence: 95, source: 'Confirmed in snapshots' },
            { text: 'Game Drop 26.1 immediate release', confidence: 90, source: 'Mojang pattern' }
        ];
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const now = new Date();
        const diff = this.eventDate - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        container.innerHTML = `
            <div class="mc-live-widget">
                <div class="mc-header">
                    <span class="mc-icon">⛏️</span>
                    <h3>Minecraft Live 2026</h3>
                    <span class="mc-badge">March 15</span>
                </div>

                <div class="mc-countdown">
                    <div class="cd-block">
                        <span class="cd-num">${days}</span>
                        <span class="cd-label">Days</span>
                    </div>
                    <div class="cd-sep">:</div>
                    <div class="cd-block">
                        <span class="cd-num">${hours.toString().padStart(2,'0')}</span>
                        <span class="cd-label">Hours</span>
                    </div>
                </div>

                <div class="mc-predictions">
                    <h4>🔮 Predictions</h4>
                    ${this.predictions.map(p => `
                        <div class="prediction-row">
                            <span class="pred-text">${p.text}</span>
                            <div class="pred-bar-wrap">
                                <div class="pred-bar" style="width: ${p.confidence}%"></div>
                            </div>
                            <span class="pred-pct">${p.confidence}%</span>
                        </div>
                    `).join('')}
                </div>

                <div class="mc-cta">
                    <a href="https://www.minecraft.net/en-us/about-minecraft-live" target="_blank">Official Site →</a>
                </div>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const el = document.getElementById('minecraft-live-widget');
    if (el) new MinecraftLiveWidget().render('minecraft-live-widget');
});

window.MinecraftLiveWidget = MinecraftLiveWidget;
