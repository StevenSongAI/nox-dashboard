/**
 * NVDA Earnings Countdown Widget
 * Displays countdown to NVDA earnings with key metrics
 */

class NVDAEarningsWidget {
    constructor() {
        this.earningsDate = new Date('2026-02-26T16:00:00-05:00'); // 4 PM EST Feb 26
        this.updateInterval = null;
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="earnings-widget nvda-earnings">
                <div class="earnings-header">
                    <div class="earnings-ticker">
                        <span class="ticker-symbol">NVDA</span>
                        <span class="ticker-badge">Q4 FY2026</span>
                    </div>
                    <div class="earnings-urgency" id="nvda-urgency"></div>
                </div>
                
                <div class="earnings-countdown" id="nvda-countdown">
                    <div class="countdown-block">
                        <span class="countdown-value" id="nvda-days">--</span>
                        <span class="countdown-label">Days</span>
                    </div>
                    <div class="countdown-separator">:</div>
                    <div class="countdown-block">
                        <span class="countdown-value" id="nvda-hours">--</span>
                        <span class="countdown-label">Hours</span>
                    </div>
                    <div class="countdown-separator">:</div>
                    <div class="countdown-block">
                        <span class="countdown-value" id="nvda-minutes">--</span>
                        <span class="countdown-label">Mins</span>
                    </div>
                </div>
                
                <div class="earnings-metrics">
                    <div class="metric-row">
                        <div class="metric">
                            <span class="metric-label">Revenue Est</span>
                            <span class="metric-value">$65.6B</span>
                            <span class="metric-change">+67% YoY</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">EPS Est</span>
                            <span class="metric-value">$1.51</span>
                            <span class="metric-change">+77% YoY</span>
                        </div>
                    </div>
                    <div class="metric-row">
                        <div class="metric">
                            <span class="metric-label">Analyst Target</span>
                            <span class="metric-value">$264</span>
                            <span class="metric-upside">+42% upside</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Beat Rate</span>
                            <span class="metric-value">90.9%</span>
                            <span class="metric-streak">20 of 22 Qs</span>
                        </div>
                    </div>
                </div>
                
                <div class="earnings-highlights">
                    <div class="highlight highlight-blackwell">
                        <span class="highlight-icon">🔥</span>
                        <span class="highlight-text">Blackwell demand "off the charts"</span>
                    </div>
                    <div class="highlight highlight-visibility">
                        <span class="highlight-icon">💰</span>
                        <span class="highlight-text">$500B visibility through CY2026</span>
                    </div>
                </div>
                
                <div class="earnings-footer">
                    <span class="earnings-date">Feb 26, 2026 After Market Close</span>
                    <a href="#investments" class="earnings-link" onclick="switchTab('investments')">View Intelligence →</a>
                </div>
            </div>
        `;

        this.startCountdown();
    }

    startCountdown() {
        this.updateCountdown();
        this.updateInterval = setInterval(() => this.updateCountdown(), 60000); // Update every minute
    }

    updateCountdown() {
        const now = new Date();
        const diff = this.earningsDate - now;

        if (diff <= 0) {
            document.getElementById('nvda-countdown').innerHTML = '<div class="earnings-live">🚨 LIVE NOW</div>';
            if (this.updateInterval) clearInterval(this.updateInterval);
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        const daysEl = document.getElementById('nvda-days');
        const hoursEl = document.getElementById('nvda-hours');
        const minutesEl = document.getElementById('nvda-minutes');
        const urgencyEl = document.getElementById('nvda-urgency');

        if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
        if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
        if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');

        // Update urgency indicator
        if (urgencyEl) {
            if (days <= 1) {
                urgencyEl.innerHTML = '<span class="urgency-high">🔥 IMMINENT</span>';
            } else if (days <= 3) {
                urgencyEl.innerHTML = '<span class="urgency-medium">⚡ SOON</span>';
            } else {
                urgencyEl.innerHTML = '<span class="urgency-low">⏰ UPCOMING</span>';
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
    const container = document.getElementById('nvda-earnings-widget');
    if (container) {
        window.nvdaEarningsWidget = new NVDAEarningsWidget();
        window.nvdaEarningsWidget.render('nvda-earnings-widget');
    }
});

window.NVDAEarningsWidget = NVDAEarningsWidget;
