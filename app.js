
// ==================== MARKETPLACE CREATOR PATH WIDGET ====================
// Interactive guide for becoming a Minecraft Marketplace creator
// Research: $7M+ payouts, 25M+ downloads, partner program (Feb 2026)

function renderMarketplaceCreatorPath() {
  const container = document.getElementById('marketplace-creator-path');
  if (!container) return;

  const steps = [
    {
      step: 1,
      title: 'Apply for Partnership',
      icon: '📝',
      description: 'Submit application to Microsoft Partner Program',
      requirements: ['Minecraft experience', 'Portfolio of builds/skins', 'Business entity or individual'],
      time: '2-4 weeks review',
      tips: ['Show unique style', 'Demonstrate technical skill', 'Include diverse content samples']
    },
    {
      step: 2,
      title: 'Create Your First Content',
      icon: '🎨',
      description: 'Build skins, worlds, or texture packs',
      requirements: ['Follow Marketplace guidelines', 'Quality standards', 'Original content'],
      time: '1-3 months',
      tips: ['Start with skin packs (easiest)', 'Study top sellers', 'Focus on niche themes']
    },
    {
      step: 3,
      title: 'Submit & Review',
      icon: '🔍',
      description: 'Microsoft reviews your submission',
      requirements: ['Pass quality check', 'No copyright issues', 'Appropriate content'],
      time: '1-2 weeks',
      tips: ['Test thoroughly', 'Get feedback first', 'Follow submission guidelines exactly']
    },
    {
      step: 4,
      title: 'Publish & Earn',
      icon: '💰',
      description: 'Content goes live, start earning Minecoins',
      requirements: ['Set pricing (490-1480 Minecoins)', 'Marketing plan', 'Update schedule'],
      time: 'Ongoing',
      tips: ['Price competitively', 'Update regularly', 'Build audience on social media']
    }
  ];

  const stats = {
    totalPayout: '$7M+',
    downloads: '25M+',
    creators: '45+',
    topEarners: '$100K+ annually'
  };

  let html = `
    <div class="bg-dark-800/50 border border-dark-600 rounded-lg p-4">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-xl">🏪</span>
        <h3 class="text-lg font-bold text-white">Marketplace Creator Path</h3>
        <span class="text-xs bg-accent-green/20 text-accent-green px-2 py-0.5 rounded ml-auto">$7M+ Paid Out</span>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <div class="bg-dark-700/50 rounded-lg p-2 text-center">
          <div class="text-lg font-bold text-accent-green">${stats.totalPayout}</div>
          <div class="text-[10px] text-gray-400">Total Payouts</div>
        </div>
        <div class="bg-dark-700/50 rounded-lg p-2 text-center">
          <div class="text-lg font-bold text-accent-blue">${stats.downloads}</div>
          <div class="text-[10px] text-gray-400">Downloads</div>
        </div>
        <div class="bg-dark-700/50 rounded-lg p-2 text-center">
          <div class="text-lg font-bold text-accent-purple">${stats.creators}</div>
          <div class="text-[10px] text-gray-400">Partners</div>
        </div>
        <div class="bg-dark-700/50 rounded-lg p-2 text-center">
          <div class="text-lg font-bold text-accent-yellow">${stats.topEarners}</div>
          <div class="text-[10px] text-gray-400">Top Earners</div>
        </div>
      </div>

      <div class="space-y-3 mb-4">
        ${steps.map(s => `
          <div class="bg-dark-700/30 rounded-lg p-3 border-l-4 border-accent-primary">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xl">${s.icon}</span>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-xs bg-accent-primary/20 text-accent-primary px-1.5 py-0.5 rounded">Step ${s.step}</span>
                  <span class="font-semibold text-white text-sm">${s.title}</span>
                </div>
                <div class="text-xs text-gray-400">${s.description}</div>
              </div>
            </div>
            <div class="text-xs text-accent-yellow mb-1">⏱️ ${s.time}</div>
            <div class="flex flex-wrap gap-1 mb-1">
              ${s.requirements.map(r => `<span class="text-[10px] bg-dark-600 px-1.5 py-0.5 rounded text-gray-300">${r}</span>`).join('')}
            </div>
            <div class="text-[10px] text-accent-green">💡 ${s.tips[0]}</div>
          </div>
        `).join('')}
      </div>

      <div class="flex gap-2">
        <a href="https://partner.minecraft.net" target="_blank" class="btn-primary flex-1 text-center">
          <span>📝</span> Apply Now
        </a>
        <button onclick="copyCreatorTips()" class="btn-secondary flex-1">
          <span>📋</span> Copy Tips
        </button>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function copyCreatorTips() {
  const tips = `Minecraft Marketplace Creator Tips:

1. Start with skin packs - lowest barrier to entry
2. Study top sellers - understand what works
3. Focus on unique niches - stand out from crowd
4. Build social media presence - drive organic traffic
5. Update content regularly - keeps it fresh
6. Price competitively - 490-1480 Minecoins range
7. Get feedback before submitting - avoid rejections

Potential Earnings: $100K+ annually for top creators`;

  navigator.clipboard.writeText(tips).then(() => {
    alert('Creator tips copied!');
  });
}

// Global exports
window.renderMarketplaceCreatorPath = renderMarketplaceCreatorPath;
window.copyCreatorTips = copyCreatorTips;
