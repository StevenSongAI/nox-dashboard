import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useEntries Hook
 * Domain-specific hook for fetching and managing entry data
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.initialPage - Initial page number (default: 1)
 * @param {number} options.limit - Items per page (default: 20)
 * @param {string} options.initialCategory - Initial category filter (default: 'all')
 * @returns {Object} Entries state and control functions
 */
export function useEntries(options = {}) {
  const { initialPage = 1, limit = 20, initialCategory = 'all' } = options;
  
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(initialCategory);
  const [page, setPage] = useState(initialPage);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit,
    hasNext: false,
    hasPrev: false,
    totalCount: 0,
    totalPages: 1
  });

  /**
   * Fetch entries with optional filters
   */
  const fetchEntries = useCallback(async (fetchOptions = {}) => {
    const { 
      pageNum = page, 
      cat = category, 
      searchTerm = '', 
      signal 
    } = fetchOptions;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString()
      });
      
      if (cat !== 'all') {
        params.append('category', cat);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await fetch(`/api/entries?${params}`, { signal });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch entries');
      }
      
      setEntries(data.data);
      setPagination(data.pagination);
      setPage(pageNum);
      return data;
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [page, category, limit]);

  /**
   * Refresh current page
   */
  const refresh = useCallback(() => {
    return fetchEntries({ pageNum: page, cat: category });
  }, [fetchEntries, page, category]);

  /**
   * Go to specific page
   */
  const goToPage = useCallback((pageNum) => {
    return fetchEntries({ pageNum, cat: category });
  }, [fetchEntries, category]);

  /**
   * Go to next page
   */
  const nextPage = useCallback(() => {
    if (pagination.hasNext) {
      return fetchEntries({ pageNum: page + 1, cat: category });
    }
  }, [fetchEntries, pagination.hasNext, page, category]);

  /**
   * Go to previous page
   */
  const prevPage = useCallback(() => {
    if (pagination.hasPrev) {
      return fetchEntries({ pageNum: page - 1, cat: category });
    }
  }, [fetchEntries, pagination.hasPrev, page, category]);

  /**
   * Change category filter
   */
  const changeCategory = useCallback((newCategory) => {
    setCategory(newCategory);
    return fetchEntries({ pageNum: 1, cat: newCategory });
  }, [fetchEntries]);

  // DEFECT-RT-003 FIX: Initial fetch with ref to prevent stale closure
  const isInitialMount = useRef(true);
  
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      const controller = new AbortController();
      // Use a function that captures current state at call time
      const doFetch = async () => {
        try {
          await fetchEntries({ signal: controller.signal });
        } catch (err) {
          // Error handled in fetchEntries
        }
      };
      doFetch();
      
      return () => controller.abort();
    }
  }, [fetchEntries]);

  return {
    // State
    entries,
    loading,
    error,
    category,
    page,
    pagination,
    
    // Actions
    setEntries,
    fetchEntries,
    refresh,
    goToPage,
    nextPage,
    prevPage,
    changeCategory,
    setError
  };
}

/**
 * useEntry Hook
 * Fetch and manage a single entry
 * 
 * @param {string} entryId - The entry ID to fetch
 * @returns {Object} Single entry state and control functions
 */
export function useEntry(entryId) {
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEntry = useCallback(async (id) => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/entries/${id}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch entry');
      }
      
      setEntry(data.data);
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
      fetchEntry(entryId);
    }
  }, [entryId, fetchEntry]);

  return {
    entry,
    loading,
    error,
    fetchEntry,
    setEntry
  };
}
