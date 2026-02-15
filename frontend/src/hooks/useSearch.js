import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * useSearch Hook
 * Domain-specific hook for search functionality with URL synchronization
 * 
 * @param {Object} options - Configuration options
 * @param {function} options.onSearch - Callback when search is triggered
 * @param {number} options.debounceMs - Debounce delay in milliseconds (default: 300)
 * @param {string} options.paramName - URL query parameter name (default: 'q')
 * @returns {Object} Search state and control functions
 */
export function useSearch(options = {}) {
  const { 
    onSearch, 
    debounceMs = 300, 
    paramName = 'q' 
  } = options;
  
  const [searchParams, setSearchParams] = useSearchParams();
  const isSyncingRef = useRef(false);
  const onSearchRef = useRef(onSearch);
  const debounceTimeoutRef = useRef(null);
  
  // Keep ref updated with latest onSearch callback
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Initialize state from URL query param
  const [searchTerm, setSearchTerm] = useState(() => {
    return searchParams.get(paramName) || '';
  });

  // Sync input value with URL query param when it changes (e.g., back/forward navigation)
  useEffect(() => {
    const urlQuery = searchParams.get(paramName) || '';
    if (urlQuery !== searchTerm && !isSyncingRef.current) {
      isSyncingRef.current = true;
      setSearchTerm(urlQuery);
      const timeoutId = setTimeout(() => { 
        isSyncingRef.current = false; 
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [searchParams, paramName]); // eslint-disable-line react-hooks/exhaustive-deps

  // DEFECT-RT-005 FIX: Cleanup debounce timeout on unmount and when debounceMs changes
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
    };
  }, [debounceMs]);

  /**
   * Execute search with debouncing
   */
  const executeSearch = useCallback((term) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      if (onSearchRef.current) {
        onSearchRef.current(term);
      }
    }, debounceMs);
  }, [debounceMs]);

  /**
   * Update search term and URL
   */
  const handleChange = useCallback((value) => {
    setSearchTerm(value);
    
    // Update URL query param
    if (value.trim()) {
      setSearchParams({ [paramName]: value });
    } else {
      searchParams.delete(paramName);
      setSearchParams(searchParams);
    }
    
    // Trigger debounced search
    executeSearch(value);
  }, [setSearchParams, searchParams, paramName, executeSearch]);

  /**
   * Clear search
   */
  const handleClear = useCallback(() => {
    setSearchTerm('');
    searchParams.delete(paramName);
    setSearchParams(searchParams);
    
    if (onSearchRef.current) {
      onSearchRef.current('');
    }
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, [setSearchParams, searchParams, paramName]);

  /**
   * Submit search immediately (on form submit)
   */
  const handleSubmit = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    if (onSearchRef.current) {
      onSearchRef.current(searchTerm);
    }
  }, [searchTerm]);

  return {
    // State
    searchTerm,
    searchParams,
    
    // Actions
    setSearchTerm,
    handleChange,
    handleClear,
    handleSubmit,
    executeSearch
  };
}

/**
 * useSearchWithResults Hook
 * Combines search with automatic results fetching
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.endpoint - API endpoint to search
 * @param {Object} options.params - Additional query parameters
 * @returns {Object} Search results state and control functions
 */
export function useSearchWithResults(options = {}) {
  const { endpoint = '/api/entries', params = {} } = options;
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const performSearch = useCallback(async (searchTerm) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams(params);
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      const response = await fetch(`${endpoint}?${queryParams}`, {
        signal: abortControllerRef.current.signal
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Search failed');
      }
      
      setResults(data.data);
      return data;
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, params]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const searchProps = useSearch({ 
    onSearch: performSearch,
    debounceMs: 300 
  });

  return {
    // Search state
    ...searchProps,
    
    // Results state
    results,
    loading,
    error,
    
    // Actions
    setResults,
    refresh: () => performSearch(searchProps.searchTerm)
  };
}
