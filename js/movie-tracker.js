/**
 * Minecraft Movie Box Office Tracker
 * Tracks performance vs other video game adaptations
 */

class MinecraftMovieTracker {
    constructor() {
        this.data = {
            minecraft: {
                title: "A Minecraft Movie",
                domestic: 280.96,
                global: 550.0,
                rank: 2,
                status: "In Theaters",
                vsSonic: "+$59M vs Sonic 3",
                milestone: "Short of $1B"
            },
            rankings: [
                { rank: 1, title: "The Super Mario Bros. Movie", global: 1360.0, studio: "Universal" },
                { rank: 2, title: "A Minecraft Movie", global: 550.0, studio: "Warner Bros", highlight: true },
                { rank: 3, title: "Sonic the Hedgehog 3", global: 491.0, studio: "Paramount" },
                { rank: 4, title: "Sonic the Hedgehog 2", global: 405.0, studio: "Paramount" },
                { rank: 5, title: "Detective Pikachu", global: 449.0, studio: "Warner Bros" },
                { rank: 6, title: "Uncharted", global: 407.0, studio: "Sony" },
                { rank: 7, title: "Sonic the Hedgehog", global: 320.0, studio: "Paramount" },
                { rank: 8, title: "Warcraft", global: 439.0, studio: "Universal" }
            ]
        };
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const maxGross = Math.max(...this.data.rankings.map(r => r.global));

        container.innerHTML = `
            <div class="movie-tracker">
                <div class="movie-header">
                    <div class="movie-title">
                        <span class="movie-icon">🎬</span>
                        <h3>Minecraft Movie Tracker</h3>
                    </div>
                    <span class="movie-badge rank-2">#2 All-Time</span>
                </div>

                <div class="movie-stats-grid">
                    <div class="movie-stat-box">
                        <span class="stat-value">$${this.data.minecraft.domestic.toFixed(0)}M</span>
                        <span class="stat-label">Domestic</span>
                    </div>
                    <div class="movie-stat-box highlight">
                        <span class="stat-value">$${this.data.minecraft.global.toFixed(0)}M</span>
                        <span class="stat-label">Global</span>
                    </div>
                    <div class="movie-stat-box">
                        <span class="stat-value">#${this.data.minecraft.rank}</span>
                        <span class="stat-label">Video Game Films</span>
                    </div>
                </div>

                <div class="vs-sonic">
                    <span class="vs-icon">⚡</span>
                    <span class="vs-text">${this.data.minecraft.vsSonic}</span>
                </div>

                <div class="rankings-list">
                    <h4>🏆 Video Game Movie Rankings</h4>
                    ${this.data.rankings.map(r => this.renderRankingRow(r, maxGross)).join('')}
                </div>

                <div class="milestone-note">
                    <span class="note-icon">📊</span>
                    <span>${this.data.minecraft.milestone} — theatrical run ending</span>
                </div>

                <div class="content-angles">
                    <h4>🎥 Content Angles</h4>
                    <ul>
                        <li>"How Minecraft Became the #2 Video Game Movie Ever"</li>
                        <li>"Minecraft vs Sonic: The Battle for #2"</li>
                        <li>"Why Minecraft Movie Missed $1B (And Why It Doesn't Matter)"</li>
                        <li>"Recreating Minecraft Movie Scenes in BBS"</li>
                    </ul>
                </div>

                <div class="tracker-actions">
                    <button class="action-btn primary" onclick="window.open('https://www.boxofficemojo.com/release/rl746096129/', '_blank')">
                        Box Office Mojo →
                    </button>
                    <button class="action-btn" onclick="window.open('https://www.minecraft-movie.com/', '_blank')">
                        Official Site →
                    </button>
                </div>
            </div>
        `;
    }

    renderRankingRow(movie, maxGross) {
        const width = (movie.global / maxGross) * 100;
        const isMinecraft = movie.highlight;

        return `
            <div class="ranking-row ${isMinecraft ? 'highlight' : ''}">
                <div class="rank-num">${movie.rank}</div>
                <div class="rank-info">
                    <div class="rank-title">${movie.title}</div>
                    <div class="rank-bar-container">
                        <div class="rank-bar" style="width: ${width}%"></div>
                    </div>
                </div>
                <div class="rank-gross">$${movie.global.toFixed(0)}M</div>
            </div>
        `;
    }

    destroy() {
        // cleanup
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('movie-tracker');
    if (container) {
        window.movieTracker = new MinecraftMovieTracker();
        window.movieTracker.render('movie-tracker');
    }
});

window.MinecraftMovieTracker = MinecraftMovieTracker;
