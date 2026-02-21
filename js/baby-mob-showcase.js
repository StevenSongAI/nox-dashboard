/**
 * Baby Mob Collection Showcase
 * Complete visual guide to all redesigned baby mobs in Minecraft 26.1
 */

class BabyMobShowcase {
    constructor() {
        this.categories = [
            {
                id: 'farm',
                name: 'Farm Animals',
                icon: '🌾',
                mobs: ['Chicken', 'Cow', 'Pig', 'Sheep', 'Goat'],
                color: '#f59e0b',
                description: 'Classic farmyard babies with unique designs'
            },
            {
                id: 'mount',
                name: 'Mounts',
                icon: '🏇',
                mobs: ['Horse', 'Donkey', 'Mule', 'Llama', 'Camel'],
                color: '#d97706',
                description: 'Rideable companions from tiny foals to camel calves'
            },
            {
                id: 'aquatic',
                name: 'Aquatic',
                icon: '🌊',
                mobs: ['Axolotl', 'Dolphin', 'Turtle', 'Squid', 'Glow Squid'],
                color: '#3b82f6',
                description: 'Ocean and river dwellers with aquatic adaptations'
            },
            {
                id: 'wild',
                name: 'Wild Animals',
                icon: '🌲',
                mobs: ['Wolf', 'Cat', 'Ocelot', 'Rabbit', 'Fox', 'Bee'],
                color: '#10b981',
                description: 'Forest and plains creatures including 9 wolf variants'
            },
            {
                id: 'hostile',
                name: 'Hostile Mobs',
                icon: '⚔️',
                mobs: ['Zombie', 'Husk', 'Drowned', 'Piglin', 'Zombified Piglin'],
                color: '#ef4444',
                description: 'Baby monsters that are deceptively cute but dangerous'
            },
            {
                id: 'nether',
                name: 'Nether Creatures',
                icon: '🔥',
                mobs: ['Hoglin', 'Zoglin', 'Strider', 'Sniffer'],
                color: '#dc2626',
                description: 'The final batch — hellish babies with unique traits'
            }
        ];
        this.totalMobs = this.categories.reduce((sum, cat) => sum + cat.mobs.length, 0);
        this.selectedCategory = null;
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="baby-mob-showcase">
                <div class="showcase-header">
                    <div class="showcase-title">
                        <span class="showcase-icon">🍼</span>
                        <h3>Baby Mob Collection</h3>
                    </div>
                    <div class="showcase-stats">
                        <span class="stat-badge">${this.totalMobs} mobs</span>
                        <span class="days-badge">22 days to Live</span>
                    </div>
                </div>

                <div class="category-grid" id="category-grid">
                    ${this.categories.map(c => this.renderCategoryCard(c)).join('')}
                </div>

                <div class="category-detail hidden" id="category-detail">
                    <div class="detail-header">
                        <button onclick="babyMobShowcase.closeDetail()" class="detail-back">← Back</button>
                    </div>
                    <div id="category-detail-content"></div>
                </div>

                <div class="showcase-footer">
                    <div class="feature-highlight">
                        <span class="highlight-icon">🌼</span>
                        <span class="highlight-text">Golden Dandelion: Prevents babies from aging</span>
                    </div>
                </div>
            </div>
        `;

        // Add click handlers
        this.categories.forEach(c => {
            const card = document.getElementById(`category-${c.id}`);
            if (card) {
                card.onclick = () => this.showDetail(c);
            }
        });
    }

    renderCategoryCard(category) {
        return `
            <div class="category-card" id="category-${category.id}" style="--category-color: ${category.color}">
                <div class="category-header" style="background: ${category.color}20; border-color: ${category.color}">
                    <span class="category-icon">${category.icon}</span>
                    <span class="category-count">${category.mobs.length}</span>
                </div>
                <h4 class="category-name" style="color: ${category.color}">${category.name}</h4>
                <p class="category-desc">${category.description}</p>
                
                <div class="category-preview">
                    ${category.mobs.slice(0, 3).map(m => `<span class="mob-preview">${m}</span>`).join('')}
                    ${category.mobs.length > 3 ? `<span class="mob-more">+${category.mobs.length - 3} more</span>` : ''}
                </div>
            </div>
        `;
    }

    showDetail(category) {
        this.selectedCategory = category;
        const grid = document.getElementById('category-grid');
        const detail = document.getElementById('category-detail');
        const content = document.getElementById('category-detail-content');

        if (grid) grid.classList.add('hidden');
        if (detail) detail.classList.remove('hidden');

        if (content) {
            content.innerHTML = `
                <div class="detail-hero" style="background: ${category.color}10; border-color: ${category.color}">
                    <span class="detail-icon" style="color: ${category.color}">${category.icon}</span>
                    <h2 style="color: ${category.color}">${category.name}</h2>
                    <p>${category.description}</p>
                </div>

                <div class="mob-list">
                    <h4>🐾 Complete Mob List</h4>
                    <div class="mob-tiles">
                        ${category.mobs.map(m => `
                            <div class="mob-tile" style="border-color: ${category.color}40">
                                <span class="mob-tile-name">${m}</span>
                                <span class="mob-tile-status">Redesigned</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="content-angles">
                    <h4>🎬 Content Ideas</h4>
                    <ul>
                        <li>Showcase all ${category.mobs.length} ${category.name.toLowerCase()} variants side-by-side</li>
                        <li>Before/after: Old vs new baby ${category.name.toLowerCase()} designs</li>
                        <li>Breeding tutorial: How to get every baby ${category.name.toLowerCase()} variant</li>
                        ${category.id === 'nether' ? '<li>🔥 FIRST LOOK: The final Nether baby mobs (hoglin, zoglin, strider, sniffer)</li>' : ''}
                    </ul>
                </div>

                <div class="detail-actions">
                    <button class="action-btn primary" onclick="window.open('https://www.minecraft.net/en-us/article/final-baby-mobs', '_blank')">
                        Official Announcement →
                    </button>
                </div>
            `;
        }
    }

    closeDetail() {
        const grid = document.getElementById('category-grid');
        const detail = document.getElementById('category-detail');

        if (grid) grid.classList.remove('hidden');
        if (detail) detail.classList.add('hidden');
        this.selectedCategory = null;
    }

    destroy() {
        this.selectedCategory = null;
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
