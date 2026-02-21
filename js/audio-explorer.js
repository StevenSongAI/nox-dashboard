/**
 * Minecraft 26.1 Audio Explorer
 * Interactive widget showcasing new mob sound variants
 */

class MinecraftAudioExplorer {
    constructor() {
        this.mobs = [
            {
                id: 'wolf',
                name: 'Wolf',
                icon: '🐺',
                variants: 9,
                description: 'Wolf pups now have 9 sound variants with chunkier appearance',
                soundTypes: ['Ambient', 'Hurt', 'Death', 'Growl', 'Whine'],
                hasRealAudio: true,
                contentAngle: 'Wolf sound variant comparison video'
            },
            {
                id: 'cat',
                name: 'Cat',
                icon: '🐱',
                variants: 11,
                description: 'Kittens match adult counterparts with 11 sound variants',
                soundTypes: ['Meow', 'Purr', 'Hiss', 'Hurt', 'Eat'],
                hasRealAudio: true,
                contentAngle: 'Real cat sounds in Minecraft comparison'
            },
            {
                id: 'baby-zombie',
                name: 'Baby Zombie',
                icon: '🧟',
                variants: 3,
                description: 'Unique sounds for baby zombie variants',
                soundTypes: ['Ambient', 'Hurt', 'Death', 'Attack'],
                hasRealAudio: false,
                contentAngle: 'Baby zombie sounds vs adult comparison'
            },
            {
                id: 'piglin',
                name: 'Baby Piglin',
                icon: '🐷',
                variants: 4,
                description: 'Distinct baby piglin sound set',
                soundTypes: ['Ambient', 'Angry', 'Hurt', 'Death', 'Admire'],
                hasRealAudio: false,
                contentAngle: 'Nether baby mob sounds showcase'
            },
            {
                id: 'drowned',
                name: 'Baby Drowned',
                icon: '💀',
                variants: 3,
                description: 'Underwater baby drowned variants',
                soundTypes: ['Ambient', 'Hurt', 'Death', 'Step'],
                hasRealAudio: false,
                contentAngle: 'Underwater baby mob audio test'
            }
        ];
        this.selectedMob = null;
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="audio-explorer">
                <div class="audio-header">
                    <div class="audio-title">
                        <span class="audio-icon">🔊</span>
                        <h3>Minecraft 26.1 Audio Explorer</h3>
                    </div>
                    <span class="audio-badge">Real Audio Recorded</span>
                </div>

                <div class="audio-stats">
                    <div class="audio-stat">
                        <span class="stat-num">${this.mobs.reduce((a, b) => a + b.variants, 0)}</span>
                        <span class="stat-label">Total Variants</span>
                    </div>
                    <div class="audio-stat">
                        <span class="stat-num">${this.mobs.filter(m => m.hasRealAudio).length}</span>
                        <span class="stat-label">Real Animal Audio</span>
                    </div>
                </div>

                <div class="mob-grid" id="mob-grid">
                    ${this.mobs.map(m => this.renderMobCard(m)).join('')}
                </div>

                <div class="mob-detail hidden" id="mob-detail">
                    <div class="detail-header">
                        <button onclick="audioExplorer.closeDetail()" class="detail-back">← Back</button>
                    </div>
                    <div id="mob-detail-content"></div>
                </div>
            </div>
        `;

        // Add click handlers
        this.mobs.forEach(m => {
            const card = document.getElementById(`mob-card-${m.id}`);
            if (card) {
                card.onclick = () => this.showDetail(m);
            }
        });
    }

    renderMobCard(mob) {
        return `
            <div class="mob-card ${mob.hasRealAudio ? 'real-audio' : ''}" id="mob-card-${mob.id}">
                <div class="mob-header">
                    <span class="mob-icon">${mob.icon}</span>
                    ${mob.hasRealAudio ? '<span class="real-badge">🎙️ Real</span>' : ''}
                </div>
                <h4 class="mob-name">${mob.name}</h4>
                <p class="mob-desc">${mob.description}</p>
                
                <div class="mob-meta">
                    <span class="mob-variants">${mob.variants} variants</span>
                    <span class="mob-cta">Explore →</span>
                </div>
            </div>
        `;
    }

    showDetail(mob) {
        this.selectedMob = mob;
        const grid = document.getElementById('mob-grid');
        const detail = document.getElementById('mob-detail');
        const content = document.getElementById('mob-detail-content');

        if (grid) grid.classList.add('hidden');
        if (detail) detail.classList.remove('hidden');

        if (content) {
            content.innerHTML = `
                <div class="detail-hero">
                    <span class="detail-icon">${mob.icon}</span>
                    <h2>${mob.name}</h2>
                    <p>${mob.description}</p>
                    ${mob.hasRealAudio ? '<span class="detail-real-badge">🎙️ Recorded with real animals</span>' : ''}
                </div>

                <div class="sound-types">
                    <h4>🔊 Sound Types (${mob.soundTypes.length})</h4>
                    <div class="sound-tags">
                        ${mob.soundTypes.map(s => `<span class="sound-tag">${s}</span>`).join('')}
                    </div>
                </div>

                <div class="variant-visual">
                    <h4>📊 Variant Distribution</h4>
                    <div class="variant-bar">
                        ${Array(mob.variants).fill(0).map((_, i) => `
                            <div class="variant-block" style="animation-delay: ${i * 0.05}s"></div>
                        `).join('')}
                    </div>
                    <span class="variant-count">${mob.variants} unique sound sets</span>
                </div>

                <div class="content-idea">
                    <h4>💡 Content Angle</h4>
                    <p>${mob.contentAngle}</p>
                </div>

                <div class="detail-actions">
                    <button class="action-btn" onclick="window.open('https://www.minecraft.net/en-us/article/minecraft-26-1-snapshot-7', '_blank')">
                        View Official Post →
                    </button>
                </div>
            `;
        }
    }

    closeDetail() {
        const grid = document.getElementById('mob-grid');
        const detail = document.getElementById('mob-detail');

        if (grid) grid.classList.remove('hidden');
        if (detail) detail.classList.add('hidden');
        this.selectedMob = null;
    }

    destroy() {
        this.selectedMob = null;
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('audio-explorer');
    if (container) {
        window.audioExplorer = new MinecraftAudioExplorer();
        window.audioExplorer.render('audio-explorer');
    }
});

window.MinecraftAudioExplorer = MinecraftAudioExplorer;
