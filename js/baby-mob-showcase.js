/**
 * Minecraft 26.1 Baby Mob Showcase
 * Interactive gallery of all baby mob redesigns in Snapshot 8
 */

class BabyMobShowcase {
    constructor() {
        this.babyMobs = [
            {
                id: 'hoglin',
                name: 'Baby Hoglin',
                icon: '🐗',
                type: 'Hostile',
                snapshot: '26.1-snapshot-8',
                releaseDate: 'Feb 17, 2026',
                description: 'Tiny tusks, fuzzy mane, aggressive but adorable',
                behavior: 'Attacks on sight despite size',
                contentAngle: 'Baby Hoglin vs Adult: Behavior comparison'
            },
            {
                id: 'panda',
                name: 'Baby Panda',
                icon: '🐼',
                type: 'Passive',
                snapshot: '26.1-snapshot-8',
                releaseDate: 'Feb 17, 2026',
                description: 'Round belly, playful animation, sneezing included',
                behavior: 'Playful, rolls around, sneezes',
                contentAngle: 'Baby Panda personality traits showcase'
            },
            {
                id: 'sniffer',
                name: 'Baby Sniffer',
                icon: '🦕',
                type: 'Passive',
                snapshot: '26.1-snapshot-8',
                releaseDate: 'Feb 17, 2026',
                description: 'Tiny torchflower sniffer, oversized nose, waddles',
                behavior: 'Sniffs for seeds, very slow',
                contentAngle: 'First look: Baby Sniffer torchflower hunting'
            },
            {
                id: 'strider',
                name: 'Baby Strider',
                icon: '🦀',
                type: 'Passive',
                snapshot: '26.1-snapshot-8',
                releaseDate: 'Feb 17, 2026',
                description: 'Shaky legs, shivers without lava, tiny body',
                behavior: 'Shivers constantly, vulnerable',
                contentAngle: 'Baby Strider lava survival challenge'
            },
            {
                id: 'zoglin',
                name: 'Baby Zoglin',
                icon: '🧟',
                type: 'Hostile',
                snapshot: '26.1-snapshot-8',
                releaseDate: 'Feb 17, 2026',
                description: 'Undead baby hoglin, decayed texture, hostile',
                behavior: 'Attacks everything, no fear',
                contentAngle: 'Zoglin vs Hoglin baby comparison'
            }
        ];
        this.selectedMob = null;
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="baby-mob-showcase">
                <div class="showcase-header">
                    <div class="showcase-title">
                        <span class="showcase-icon">👶</span>
                        <h3>Baby Mob Showcase</h3>
                    </div>
                    <span class="showcase-badge">26.1-snapshot-8</span>
                </div>

                <div class="showcase-stats">
                    <div class="stat-item">
                        <span class="stat-num">${this.babyMobs.length}</span>
                        <span class="stat-label">New Baby Mobs</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-num">${this.babyMobs.filter(m => m.type === 'Hostile').length}</span>
                        <span class="stat-label">Hostile</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-num">${this.babyMobs.filter(m => m.type === 'Passive').length}</span>
                        <span class="stat-label">Passive</span>
                    </div>
                </div>

                <div class="mob-gallery" id="mob-gallery">
                    ${this.babyMobs.map(m => this.renderMobCard(m)).join('')}
                </div>

                <div class="mob-detail-view hidden" id="mob-detail-view">
                    <div class="detail-header">
                        <button onclick="babyMobShowcase.closeDetail()" class="detail-back-btn">← Back to Gallery</button>
                    </div>
                    <div id="mob-detail-content"></div>
                </div>

                <div class="showcase-footer">
                    <div class="content-tip">
                        <span class="tip-icon">💡</span>
                        <span class="tip-text">Content idea: "All 5 New Baby Mobs in Minecraft 26.1" comparison video</span>
                    </div>
                    <div class="snapshot-info">
                        Released: February 17, 2026 | 
                        <a href="https://minecraft.wiki/w/Java_Edition_26.1_Snapshot_8" target="_blank" class="wiki-link">View Wiki →</a>
                    </div>
                </div>
            </div>
        `;

        // Add click handlers
        this.babyMobs.forEach(m => {
            const card = document.getElementById(`baby-mob-${m.id}`);
            if (card) {
                card.onclick = () => this.showDetail(m);
            }
        });
    }

    renderMobCard(mob) {
        return `
            <div class="baby-mob-card ${mob.type.toLowerCase()}" id="baby-mob-${mob.id}">
                <div class="mob-card-header">
                    <span class="mob-emoji">${mob.icon}</span>
                    <span class="mob-type-badge ${mob.type.toLowerCase()}">${mob.type}</span>
                </div>
                <h4 class="mob-card-name">${mob.name}</h4>
                <p class="mob-card-desc">${mob.description}</p>
                
                <div class="mob-card-footer">
                    <span class="mob-snapshot">${mob.snapshot}</span>
                    <span class="mob-view">View →</span>
                </div>
            </div>
        `;
    }

    showDetail(mob) {
        this.selectedMob = mob;
        const gallery = document.getElementById('mob-gallery');
        const detail = document.getElementById('mob-detail-view');
        const content = document.getElementById('mob-detail-content');

        if (gallery) gallery.classList.add('hidden');
        if (detail) detail.classList.remove('hidden');

        if (content) {
            content.innerHTML = `
                <div class="detail-hero-section">
                    <span class="detail-mob-emoji">${mob.icon}</span>
                    <h2>${mob.name}</h2>
                    <span class="detail-type-badge ${mob.type.toLowerCase()}">${mob.type}</span>
                    <p class="detail-description">${mob.description}</p>
                </div>

                <div class="detail-info-grid">
                    <div class="info-item">
                        <span class="info-label">Snapshot</span>
                        <span class="info-value">${mob.snapshot}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Release Date</span>
                        <span class="info-value">${mob.releaseDate}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Behavior</span>
                        <span class="info-value">${mob.behavior}</span>
                    </div>
                </div>

                <div class="content-angle-box">
                    <h4>🎬 Content Angle</h4>
                    <p>${mob.contentAngle}</p>
                </div>

                <div class="detail-actions-row">
                    <button class="action-btn-primary" onclick="window.open('https://minecraft.wiki/w/Java_Edition_26.1_Snapshot_8', '_blank')">
                        Open Wiki →
                    </button>
                    <button class="action-btn" onclick="window.open('https://www.minecraft.net/en-us/article/minecraft-26-1-snapshot-8', '_blank')">
                        Official Post →
                    </button>
                </div>
            `;
        }
    }

    closeDetail() {
        const gallery = document.getElementById('mob-gallery');
        const detail = document.getElementById('mob-detail-view');

        if (gallery) gallery.classList.remove('hidden');
        if (detail) detail.classList.add('hidden');
        this.selectedMob = null;
    }

    destroy() {
        this.selectedMob = null;
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('baby-mob-showcase');
    if (container) {
        window.babyMobShowcase = new BabyMobShowcase();
        window.babyMobShowcase.render('baby-mob-showcase');
    }
});

window.BabyMobShowcase = BabyMobShowcase;
