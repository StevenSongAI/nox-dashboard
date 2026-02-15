import { useState, useEffect, useCallback } from 'react';

/**
 * useStats Hook
 * Domain-specific hook for fetching and managing statistics data
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.timeRange - Time range for stats (default: '7d')
 * @param {string} options.category - Category filter (default: 'all')
 * @returns {Object} Statistics state and control functions
 */
export function useStats(options = {}) {
  const { timeRange: initialTimeRange = '7d', category: initialCategory = 'all' } = options;
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(initialTimeRange);
  const [category, setCategory] = useState(initialCategory);

  /**
   * Fetch statistics from API
   */
  const fetchStats = useCallback(async (opts = {}) => {
    const { 
      range = timeRange, 
      cat = category,
      signal 
    } = opts;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      if (range) {
        params.append('range', range);
      }
      
      if (cat !== 'all') {
        params.append('category', cat);
      }
      
      const response = await fetch(`/api/stats?${params}`, { signal });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch statistics');
      }
      
      setStats(data.data);
      return data.data;
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [timeRange, category]);

  /**
   * Refresh current stats
   */
  const refresh = useCallback(() => {
    return fetchStats({ range: timeRange, cat: category });
  }, [fetchStats, timeRange, category]);

  /**
   * Change time range
   */
  const changeTimeRange = useCallback((newRange) => {
    setTimeRange(newRange);
    return fetchStats({ range: newRange, cat: category });
  }, [fetchStats, category]);

  /**
   * Change category filter
   */
  const changeCategory = useCallback((newCategory) => {
    setCategory(newCategory);
    return fetchStats({ range: timeRange, cat: newCategory });
  }, [fetchStats, timeRange]);

  // Initial fetch
  useEffect(() => {
    const controller = new AbortController();
    fetchStats({ signal: controller.signal });
    
    return () => controller.abort();
  }, []); // Only on mount

  return {
    // State
    stats,
    loading,
    error,
    timeRange,
    category,
    
    // Actions
    setStats,
    fetchStats,
    refresh,
    changeTimeRange,
    changeCategory,
    setTimeRange,
    setCategory
  };
}

/**
 * useEntryStats Hook
 * Get statistics for a specific entry
 * 
 * @param {string} entryId - Entry ID to get stats for
 * @returns {Object} Entry statistics state
 */
export function useEntryStats(entryId) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEntryStats = useCallback(async (id) => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/entries/${id}/stats`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch entry stats');
      }
      
      setStats(data.data);
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (entryId) {
      fetchEntryStats(entryId);
    }
  }, [entryId, fetchEntryStats]);

  return {
    stats,
    loading,
    error,
    fetchEntryStats,
    refresh: () => fetchEntryStats(entryId)
  };
}

/**
 * useDashboardStats Hook
 * Get high-level dashboard statistics
 * 
 * @returns {Object} Dashboard statistics state
 */
export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalViews: 0,
    recentActivity: 0,
    topCategories: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/stats/dashboard');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch dashboard stats');
      }
      
      setStats(data.data);
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  return {
    stats,
    loading,
    error,
    fetchDashboardStats,
    refresh: fetchDashboardStats
  };
}
