/**
 * Dashboard Data Loader
 * 
 * Simple module for the Nox Dashboard to load intelligence data.
 * Usage: const data = window.DashboardDataLoader.load('x-intel');
 */

class DashboardDataLoader {
  static DATA_PATH = './data/x-intel-data.json';

  static async load(type = 'x-intel') {
    if (type !== 'x-intel') {
      throw new Error(`Unknown data type: ${type}`);
    }

    try {
      const response = await fetch(this.DATA_PATH);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('[DashboardDataLoader] Failed to load:', error);
      return this.getFallbackData();
    }
  }

  static getFallbackData() {
    return {
      timestamp: new Date().toISOString(),
      categories: {},
      topTrending: [],
      summary: { error: 'Failed to load data', totalTopics: 0 }
    };
  }

  static async getTopTrending(limit = 5) {
    const data = await this.load('x-intel');
    return data.topTrending?.slice(0, limit) || [];
  }

  static async getCategory(category) {
    const data = await this.load('x-intel');
    return data.categories?.[category] || [];
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DashboardDataLoader;
}

// Expose to window for browser
if (typeof window !== 'undefined') {
  window.DashboardDataLoader = DashboardDataLoader;
}
