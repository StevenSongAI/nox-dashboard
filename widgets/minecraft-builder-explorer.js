// Minecraft Builder Explorer Widget
// Analyzes top Minecraft builders, their styles, and content opportunities

const MinecraftBuilderExplorer = {
  // Builder database based on research
  builders: [
    {
      id: 'grian',
      name: 'Grian',
      channel: '@Grian',
      subscribers: '8.5M+',
      style: 'Small Scale Detail',
      specialties: ['Compact builds', 'Interior design', 'Building tips', 'Hermitcraft'],
      signatureElements: ['Diagonal builds', 'Detailing', 'Palette choice', 'Hidden rooms'],
      contentAngles: [
        'Building tutorials for beginners',
        'Mystery rooms and hidden mechanisms',
        'Small space optimization',
        'Collaboration challenges'
      ],
      recentTrends: ['Build and Seek format', 'Hermitcraft Season 10', 'Smallishbeans collabs'],
      viralScore: 95,
      collabPotential: 'High - Active in Hermitcraft'
    },
    {
      id: 'bdoubleo100',
      name: 'BdoubleO100',
      channel: '@BdoubleO100',
      subscribers: '2.1M+',
      style: 'Large Scale Realism',
      specialties: ['Realistic architecture', 'Terraforming', 'Castle builds', 'Interior decorating'],
      signatureElements: ['Organic shapes', 'Depth and texture', 'Natural lighting', 'Real-world inspiration'],
      contentAngles: [
        'Realistic house builds',
        'Castle construction series',
        'Interior design transformations',
        'Construction time-lapses'
      ],
      recentTrends: ['Hermitcraft mega builds', 'Renaissance-style castles', 'Modern mansion series'],
      viralScore: 88,
      collabPotential: 'High - Regular Hermitcraft collaborator'
    },
    {
      id: 'smallishbeans',
      name: 'Smallishbeans',
      channel: '@SmallishBeans',
      subscribers: '4.2M+',
      style: 'Whimsical Storytelling',
      specialties: ['Narrative builds', 'Themed series', 'Couple gaming', 'Build challenges'],
      signatureElements: ['Colorful palettes', 'Character-focused', 'Story arcs', 'Cozy aesthetics'],
      contentAngles: [
        'Themed build competitions',
        'Relationship-driven content',
        'Series with ongoing narratives',
        'Aesthetic cozy builds'
      ],
      recentTrends: ['Build and Seek with Grian', 'Empires SMP', 'Afterlife SMP', 'Color-coded builds'],
      viralScore: 92,
      collabPotential: 'Very High - Cross-collaborates frequently'
    },
    {
      id: 'keralis',
      name: 'Keralis',
      channel: '@Keralis',
      subscribers: '2.8M+',
      style: 'Modern Architecture',
      specialties: ['Modern houses', 'City builds', 'Interior design', 'Clean aesthetics'],
      signatureElements: ['Glass and white concrete', 'Open floor plans', 'Minimalist design', 'Urban landscapes'],
      contentAngles: [
        'Modern house tutorials',
        'City building series',
        'Interior design makeovers',
        'Architecture inspiration'
      ],
      recentTrends: ['Modern city districts', 'Hermitcraft Season 10', 'Realistic urban planning'],
      viralScore: 85,
      collabPotential: 'Medium - Hermitcraft regular'
    },
    {
      id: 'goodtimeswithscar',
      name: 'GoodTimesWithScar',
      channel: '@GoodTimesWithScar',
      subscribers: '2.4M+',
      style: 'Landscaping Master',
      specialties: ['Terraforming', 'Nature builds', 'Disney-inspired', 'Path design'],
      signatureElements: ['Organic terrain', 'Custom trees', 'Water features', 'Atmospheric lighting'],
      contentAngles: [
        'Terraforming tutorials',
        'Nature reserve builds',
        'Disney park recreations',
        'Environmental storytelling'
      ],
      recentTrends: ['Scarland theme park', 'Hermitcraft mega-terraforming', 'Disney-style castles'],
      viralScore: 90,
      collabPotential: 'High - Hermitcraft core member'
    },
    {
      id: 'jeracraft',
      name: 'Jeracraft',
      channel: '@Jeracraft',
      subscribers: '3.1M+',
      style: 'Epic Scale Fantasy',
      specialties: ['Massive fantasy builds', 'World-building', 'Cinematic presentation', 'Medieval architecture'],
      signatureElements: ['Mountain fortresses', 'Epic scale', 'Custom terrain', 'Cinematic flythroughs'],
      contentAngles: [
        'Fantasy world building',
        'Cinematic build showcases',
        'Medieval kingdom series',
        'Epic transformation videos'
      ],
      recentTrends: ['Massive castle series', 'Fantasy world projects', 'Cinematic editing focus'],
      viralScore: 87,
      collabPotential: 'Low - Primarily solo content'
    }
  ],

  // Build style categories for filtering
  styleCategories: [
    { id: 'all', name: 'All Styles', icon: '🏗️' },
    { id: 'small-scale', name: 'Small Scale Detail', icon: '🔍' },
    { id: 'large-scale', name: 'Large Scale Realism', icon: '🏰' },
    { id: 'modern', name: 'Modern Architecture', icon: '🏢' },
    { id: 'landscaping', name: 'Landscaping/Terraforming', icon: '🌲' },
    { id: 'fantasy', name: 'Epic Fantasy', icon: '🐉' },
    { id: 'whimsical', name: 'Whimsical/Storytelling', icon: '🎭' }
  ],

  // Content format opportunities based on builder trends
  contentOpportunities: [
    {
      format: 'Build and Seek',
      description: 'Players build themed structures then hide while others seek',
      originators: ['Grian', 'Smallishbeans'],
      viralPotential: 'Very High',
      whyItWorks: 'Combines creativity with gameplay tension',
      bbsAngle: 'Use BBS Crowd Spawner to add NPCs that hide or seek alongside players'
    },
    {
      format: 'Build Swap',
      description: 'Builders swap incomplete projects and finish each other\'s builds',
      originators: ['Grian', 'Smallishbeans'],
      viralPotential: 'High',
      whyItWorks: 'Unexpected outcomes and creative problem-solving',
      bbsAngle: 'BBS Crowd Spawner can add "judges" or audience NPCs'
    },
    {
      format: 'Mystery Build Box',
      description: 'Builders get surprise themes/items and must incorporate them',
      originators: ['Hermitcraft community'],
      viralPotential: 'Medium-High',
      whyItWorks: 'Constraints drive creativity',
      bbsAngle: 'NPCs deliver mystery boxes or act as challenge givers'
    },
    {
      format: '100 Days Building',
      description: 'Time-lapse of 100 days of building with narrative',
      originators: ['Multiple creators'],
      viralPotential: 'High',
      whyItWorks: 'Progression + storytelling format',
      bbsAngle: 'BBS Crowd Spawner adds population that grows over 100 days'
    }
  ],

  // Collaboration matrix - who works with whom
  collabMatrix: {
    'grian': ['smallishbeans', 'bdoubleo100', 'goodtimeswithscar', 'tango', 'smajor'],
    'bdoubleo100': ['grian', 'keralis', 'goodtimeswithscar'],
    'smallishbeans': ['grian', 'ldshadowlady', 'smajor'],
    'keralis': ['bdoubleo100', 'xisuma'],
    'goodtimeswithscar': ['grian', 'bdoubleo100', 'mumbo'],
    'jeracraft': []
  },

  /**
   * Initialize the widget
   */
  init() {
    this.renderWidget();
    this.attachEventListeners();
  },

  /**
   * Render the main widget HTML
   */
  renderWidget() {
    const container = document.getElementById('minecraft-builder-explorer');
    if (!container) return;

    container.innerHTML = `
      <div class="builder-explorer-container">
        <div class="builder-header">
          <h3>🏗️ Minecraft Builder Explorer</h3>
          <p class="builder-subtitle">Analyze top builders, their styles & content opportunities</p>
        </div>
        
        <div class="builder-filters">
          <select id="builder-style-filter" class="builder-select">
            ${this.styleCategories.map(cat => 
              `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`
            ).join('')}
          </select>
          <input type="text" id="builder-search" placeholder="🔍 Search builders..." class="builder-search-input">
        </div>
        
        <div class="builder-grid" id="builder-grid">
          ${this.renderBuilderCards()}
        </div>
        
        <div class="content-opportunities-section">
          <h4>🎯 Viral Content Formats</h4>
          <div class="opportunities-grid" id="opportunities-grid">
            ${this.renderOpportunities()}
          </div>
        </div>
        
        <div class="collab-matrix-section">
          <h4>🤝 Collaboration Network</h4>
          <div class="collab-visualization" id="collab-visualization">
            ${this.renderCollabMatrix()}
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render builder cards
   */
  renderBuilderCards(filter = 'all') {
    let filteredBuilders = this.builders;
    
    if (filter !== 'all') {
      filteredBuilders = this.builders.filter(b => {
        const styleKey = b.style.toLowerCase().replace(/[^a-z]/g, '-');
        return styleKey.includes(filter) || filter.includes(styleKey);
      });
    }

    return filteredBuilders.map(builder => `
      <div class="builder-card" data-builder-id="${builder.id}">
        <div class="builder-card-header">
          <h5>${builder.name}</h5>
          <span class="viral-score" title="Viral Potential Score">🔥 ${builder.viralScore}</span>
        </div>
        <div class="builder-meta">
          <span class="subscribers">${builder.subscribers}</span>
          <span class="style-badge">${builder.style}</span>
        </div>
        <div class="builder-specialties">
          ${builder.specialties.map(s => `<span class="specialty-tag">${s}</span>`).join('')}
        </div>
        <div class="builder-signature">
          <strong>Signature:</strong> ${builder.signatureElements.join(' • ')}
        </div>
        <div class="builder-content-angles">
          <strong>Content Angles:</strong>
          <ul>
            ${builder.contentAngles.slice(0, 2).map(a => `<li>${a}</li>`).join('')}
          </ul>
        </div>
        <div class="builder-collab">
          <span class="collab-badge">${builder.collabPotential}</span>
        </div>
      </div>
    `).join('');
  },

  /**
   * Render content opportunities
   */
  renderOpportunities() {
    return this.contentOpportunities.map(opp => `
      <div class="opportunity-card">
        <h5>${opp.format}</h5>
        <p class="opp-description">${opp.description}</p>
        <div class="opp-meta">
          <span class="viral-badge ${opp.viralPotential.toLowerCase().replace(' ', '-')}">${opp.viralPotential}</span>
        </div>
        <div class="opp-originators">
          <strong>Popularized by:</strong> ${opp.originators.join(', ')}
        </div>
        <div class="opp-bbs-angle">
          <strong>💡 BBS Angle:</strong> ${opp.bbsAngle}
        </div>
      </div>
    `).join('');
  },

  /**
   * Render collaboration matrix visualization
   */
  renderCollabMatrix() {
    const nodes = this.builders.map(b => ({
      id: b.id,
      name: b.name,
      collabs: this.collabMatrix[b.id] || []
    }));

    return `
      <div class="collab-network">
        ${nodes.map(node => `
          <div class="collab-node" data-node="${node.id}">
            <span class="node-name">${node.name}</span>
            ${node.collabs.length > 0 ? `
              <div class="collab-connections">
                ${node.collabs.map(c => {
                  const partner = this.builders.find(b => b.id === c);
                  return partner ? `<span class="connection">→ ${partner.name}</span>` : '';
                }).join('')}
              </div>
            ` : '<span class="solo-badge">Solo Creator</span>'}
          </div>
        `).join('')}
      </div>
    `;
  },

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const styleFilter = document.getElementById('builder-style-filter');
    const searchInput = document.getElementById('builder-search');
    const grid = document.getElementById('builder-grid');

    if (styleFilter) {
      styleFilter.addEventListener('change', (e) => {
        grid.innerHTML = this.renderBuilderCards(e.target.value);
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const cards = grid.querySelectorAll('.builder-card');
        cards.forEach(card => {
          const name = card.querySelector('h5').textContent.toLowerCase();
          const style = card.querySelector('.style-badge').textContent.toLowerCase();
          card.style.display = (name.includes(term) || style.includes(term)) ? '' : 'none';
        });
      });
    }
  },

  /**
   * Get content recommendations for a specific builder style
   */
  getRecommendations(style) {
    const recommendations = {
      'small-scale': {
        formats: ['Build tutorials', 'Interior tours', 'Detailing tips'],
        bbsIntegration: 'Use BBS Crowd Spawner to populate small builds with NPCs for scale reference'
      },
      'large-scale': {
        formats: ['Time-lapse builds', 'Castle tours', 'Architecture breakdowns'],
        bbsIntegration: '100+ NPCs as villagers/citizens brings massive builds to life'
      },
      'modern': {
        formats: ['House tours', 'Design inspiration', 'City planning'],
        bbsIntegration: 'NPCs as pedestrians create realistic urban environments'
      },
      'landscaping': {
        formats: ['Terraforming timelapses', 'Nature builds', 'Park tours'],
        bbsIntegration: 'Wildlife NPCs enhance natural environments'
      }
    };
    return recommendations[style] || recommendations['small-scale'];
  }
};

// CSS styles for the widget
const builderExplorerStyles = `
<style>
.builder-explorer-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  padding: 20px;
  color: #e0e0e0;
}

.builder-header h3 {
  margin: 0 0 8px 0;
  font-size: 1.4rem;
  background: linear-gradient(90deg, #f59e0b, #ef4444);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.builder-subtitle {
  color: #9ca3af;
  font-size: 0.9rem;
  margin: 0 0 20px 0;
}

.builder-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.builder-select, .builder-search-input {
  background: #0f0f1a;
  border: 1px solid #374151;
  border-radius: 8px;
  padding: 10px 14px;
  color: #e0e0e0;
  font-size: 0.95rem;
}

.builder-select {
  min-width: 180px;
  cursor: pointer;
}

.builder-search-input {
  flex: 1;
  min-width: 200px;
}

.builder-select:focus, .builder-search-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.builder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

.builder-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid #374151;
  border-radius: 10px;
  padding: 16px;
  transition: all 0.2s ease;
}

.builder-card:hover {
  border-color: #f59e0b;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.15);
}

.builder-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.builder-card-header h5 {
  margin: 0;
  font-size: 1.1rem;
  color: #fbbf24;
}

.viral-score {
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.builder-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.subscribers {
  color: #10b981;
  font-size: 0.85rem;
}

.style-badge {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.builder-specialties {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.specialty-tag {
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
}

.builder-signature {
  font-size: 0.85rem;
  color: #9ca3af;
  margin-bottom: 10px;
  line-height: 1.4;
}

.builder-content-angles {
  font-size: 0.85rem;
  margin-bottom: 10px;
}

.builder-content-angles ul {
  margin: 6px 0 0 0;
  padding-left: 18px;
}

.builder-content-angles li {
  color: #9ca3af;
  margin-bottom: 3px;
}

.builder-collab {
  margin-top: 10px;
}

.collab-badge {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.content-opportunities-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #374151;
}

.content-opportunities-section h4 {
  margin: 0 0 16px 0;
  color: #fbbf24;
}

.opportunities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.opportunity-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid #374151;
  border-radius: 10px;
  padding: 16px;
}

.opportunity-card h5 {
  margin: 0 0 8px 0;
  color: #60a5fa;
  font-size: 1rem;
}

.opp-description {
  color: #9ca3af;
  font-size: 0.85rem;
  margin-bottom: 10px;
}

.opp-meta {
  margin-bottom: 10px;
}

.viral-badge {
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.viral-badge.very-high {
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  color: white;
}

.viral-badge.high {
  background: rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}

.viral-badge.medium-high {
  background: rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}

.opp-originators {
  font-size: 0.8rem;
  color: #9ca3af;
  margin-bottom: 10px;
}

.opp-bbs-angle {
  background: rgba(16, 185, 129, 0.1);
  border-left: 3px solid #10b981;
  padding: 8px 12px;
  font-size: 0.8rem;
  color: #34d399;
}

.collab-matrix-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #374151;
}

.collab-matrix-section h4 {
  margin: 0 0 16px 0;
  color: #fbbf24;
}

.collab-network {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.collab-node {
  background: rgba(255,255,255,0.03);
  border: 1px solid #374151;
  border-radius: 8px;
  padding: 12px;
}

.node-name {
  font-weight: 600;
  color: #fbbf24;
  display: block;
  margin-bottom: 8px;
}

.collab-connections {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.connection {
  font-size: 0.8rem;
  color: #60a5fa;
}

.solo-badge {
  font-size: 0.8rem;
  color: #9ca3af;
  font-style: italic;
}
</style>
`;

// Export for use in dashboard
if (typeof window !== 'undefined') {
  window.MinecraftBuilderExplorer = MinecraftBuilderExplorer;
  window.builderExplorerStyles = builderExplorerStyles;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MinecraftBuilderExplorer;
}
