/**
 * Minecraft Live 2026 Countdown Widget
 * Displays countdown to March 15, 2026 event
 */

class MinecraftLiveWidget {
    constructor() {
        this.eventDate = new Date('2026-03-15T19:00:00-04:00'); // 7 PM EDT March 15
        this.updateInterval = null;
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="earnings-widget minecraft-live">
                <div class="earnings-header">
                    <div class="earnings-ticker">
                        <span class="ticker-symbol" style="color: #5d8c38;">⛏️ MINECRAFT LIVE</span>
                        <span class="ticker-badge" style="background: #5d8c3820; color: #5d8c38;">2026</span>
                    </div>
                    <div class="earnings-urgency" id="mc-urgency"></div>
                </div>
                
                <div class="earnings-countdown" id="mc-countdown">
                    <div class="countdown-block">
                        <span class="countdown-value" id="mc-days">--</span>
                        <span class="countdown-label">Days</span>
                    </div>
                    <div class="countdown-separator">:</div>
                    <div class="countdown-block">
                        <span class="countdown-value" id="mc-hours">--</span>
                        <span class="countdown-label">Hours</span>
                    </div>
                    <div class="countdown-separator">:</div>
                    <div class="countdown-block">
                        <span class="countdown-value" id="mc-minutes">--</span>
                        <span class="countdown-label">Mins</span>
                    </div>
                </div>
                
                <div class="earnings-highlights">
                    <div class="highlight highlight-blackwell">
                        <span class="highlight-icon">🎮</span>
                        <span class="highlight-text">Game Drop 26.1 ships immediately</span>
                    </div>
                    <div class="highlight highlight-visibility">
                        <span class="highlight-icon">👶</span>
                        <span class="highlight-text">All baby mobs redesigned</span>
                    </div>
                    <div class="highlight" style="border-left-color: #f59e0b;">
                        <span class="highlight-icon">⚡</span>
                        <span class="highlight-text">New redstone contraption blocks</span>
                    </div>
                </div>
                
                <div class="earnings-footer">
                    <span class="earnings-date">March 15, 2026 at 7:00 PM EDT</span>
                    <a href="#youtube" class="earnings-link" onclick="switchTab('youtube')">View Brief →</a>
                </div>
            </div>
        `;

        this.startCountdown();
    }

    startCountdown() {
        this.updateCountdown();
        this.updateInterval = setInterval(() => this.updateCountdown(), 60000);
    }

    updateCountdown() {
        const now = new Date();
        const diff = this.eventDate - now;

        if (diff <= 0) {
            document.getElementById('mc-countdown').innerHTML = '<div class="earnings-live">🎉 LIVE NOW</div>';
            if (this.updateInterval) clearInterval(this.updateInterval);
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        const daysEl = document.getElementById('mc-days');
        const hoursEl = document.getElementById('mc-hours');
        const minutesEl = document.getElementById('mc-minutes');
        const urgencyEl = document.getElementById('mc-urgency');

        if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
        if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
        if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');

        if (urgencyEl) {
            if (days <= 1) {
                urgencyEl.innerHTML = '<span class="urgency-high">🔴 TOMORROW</span>';
            } else if (days <= 7) {
                urgencyEl.innerHTML = '<span class="urgency-medium">🟡 THIS WEEK</span>';
            } else {
                urgencyEl.innerHTML = '<span class="urgency-low">🟢 COMING UP</span>';
            }
        }
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

// Auto-initialize if container exists
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('minecraft-live-widget');
    if (container) {
        window.minecraftLiveWidget = new MinecraftLiveWidget();
        window.minecraftLiveWidget.render('minecraft-live-widget');
    }
});

window.MinecraftLiveWidget = MinecraftLiveWidget;
