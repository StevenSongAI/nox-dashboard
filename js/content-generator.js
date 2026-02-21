/**
 * Minecraft Content Idea Generator
 * Generate viral video ideas for Minecraft YouTubers
 */

class MinecraftContentGenerator {
    constructor() {
        this.categories = {
            survival: [
                { title: 'Hardcore Day 1 → Day 100', format: 'Series', viral: 95 },
                { title: 'Surviving 100 Days in [Biome]', format: 'Challenge', viral: 90 },
                { title: 'Minecraft But [Challenge]', format: 'Twist', viral: 88 },
                { title: 'One Block Skyblock', format: 'Challenge', viral: 85 },
                { title: 'No Damage Run', format: 'Challenge', viral: 82 }
            ],
            building: [
                { title: 'Time-Lapse: Building [Structure]', format: 'Cinematic', viral: 92 },
                { title: 'Building with BBS Cinematics', format: 'Showcase', viral: 88 },
                { title: 'Recreating [Famous Place] in Minecraft', format: 'Build', viral: 90 },
                { title: 'Baby Mob Zoo Build', format: 'Creative', viral: 85 },
                { title: 'Redstone Contraption Showcase', format: 'Technical', viral: 80 }
            ],
            mods: [
                { title: 'Mods That Break Minecraft', format: 'Series', viral: 94 },
                { title: 'Create Mod Factory Build', format: 'Showcase', viral: 88 },
                { title: 'BBS + Custom NPCs Showcase', format: 'Cinematic', viral: 86 },
                { title: '100 Mods at Once', format: 'Chaos', viral: 84 },
                { title: 'Medieval/Fantasy Mod Pack', format: 'Roleplay', viral: 82 }
            ],
            cinematic: [
                { title: 'Minecraft Movie Trailer', format: 'BBS/Aperture', viral: 93 },
                { title: 'War Scene with 1000 NPCs', format: 'BBS Crowd', viral: 91 },
                { title: 'Cinematic Build Reveal', format: 'Camera Work', viral: 89 },
                { title: 'Music Video with BBS', format: 'Creative', viral: 87 },
                { title: 'Adventure Map Cinematic', format: 'Story', viral: 85 }
            ],
            trends: [
                { title: 'Reacting to 26.1 Baby Mobs', format: 'Reaction', viral: 90 },
                { title: 'Minecraft Live 2026 Predictions', format: 'News', viral: 88 },
                { title: 'Testing Viral TikTok Hacks', format: 'Testing', viral: 86 },
                { title: 'Recreating Viral Shorts', format: 'Challenge', viral: 84 },
                { title: 'Minecraft 26.1 First Look', format: 'News', viral: 92 }
            ]
        };
        this.generatedIdea = null;
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="content-generator">
                <div class="generator-header">
                    <div class="generator-title">
                        <span class="generator-icon">💡</span>
                        <h3>Minecraft Content Generator</h3>
                    </div>
                    <span class="generator-badge">For @ZMDE</span>
                </div>

                <div class="generator-intro">
                    Click a category to generate viral Minecraft video ideas tailored for your channel.
                </div>

                <div class="category-buttons">
                    <button class="cat-btn survival" onclick="contentGen.generate('survival')">
                        ⚔️ Survival
                    </button>
                    <button class="cat-btn building" onclick="contentGen.generate('building')">
                        🏗️ Building
                    </button>
                    <button class="cat-btn mods" onclick="contentGen.generate('mods')">
                        ⚙️ Mods
                    </button>
                    <button class="cat-btn cinematic" onclick="contentGen.generate('cinematic')">
                        🎬 Cinematic
                    </button>
                    <button class="cat-btn trends" onclick="contentGen.generate('trends')">
                        🔥 Trends
                    </button>
                </div>

                <div class="generated-idea hidden" id="generated-idea">
                    <div class="idea-card">
                        <div class="idea-header">
                            <span class="idea-category" id="idea-category"></span>
                            <span class="idea-format" id="idea-format"></span>
                        </div>
                        <h4 class="idea-title" id="idea-title"></h4>
                        
                        <div class="idea-viral">
                            <span class="viral-label">Viral Potential:</span>
                            <div class="viral-bar">
                                <div class="viral-fill" id="viral-fill"></div>
                            </div>
                            <span class="viral-score" id="viral-score"></span>
                        </div>

                        <button class="generate-new-btn" onclick="contentGen.generateNew()">
                            🎲 Generate Another
                        </button>
                    </div>
                </div>

                <div class="generator-footer">
                    <div class="tips-box">
                        <h4>📝 Content Tips</h4>
                        <ul>
                            <li><strong>Series format</strong> drives binge-watching (Day 1→100)</li>
                            <li><strong>BBS cinematics</strong> differentiate your builds</li>
                            <li><strong>Baby mob content</strong> trending with 26.1 release</li>
                            <li><strong>First 3 seconds</strong> are critical for retention</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    generate(category) {
        this.currentCategory = category;
        const ideas = this.categories[category];
        const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
        this.generatedIdea = randomIdea;

        const ideaEl = document.getElementById('generated-idea');
        const categoryEl = document.getElementById('idea-category');
        const formatEl = document.getElementById('idea-format');
        const titleEl = document.getElementById('idea-title');
        const viralFill = document.getElementById('viral-fill');
        const viralScore = document.getElementById('viral-score');

        if (ideaEl) ideaEl.classList.remove('hidden');
        if (categoryEl) categoryEl.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        if (formatEl) formatEl.textContent = randomIdea.format;
        if (titleEl) titleEl.textContent = randomIdea.title;
        if (viralFill) viralFill.style.width = randomIdea.viral + '%';
        if (viralScore) viralScore.textContent = randomIdea.viral + '/100';

        // Scroll to idea
        ideaEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    generateNew() {
        if (this.currentCategory) {
            this.generate(this.currentCategory);
        }
    }

    destroy() {
        this.generatedIdea = null;
        this.currentCategory = null;
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('content-generator');
    if (container) {
        window.contentGen = new MinecraftContentGenerator();
        window.contentGen.render('content-generator');
    }
});

window.MinecraftContentGenerator = MinecraftContentGenerator;
