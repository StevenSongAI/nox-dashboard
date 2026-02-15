import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * SearchView Component
 * Provides search functionality with URL synchronization
 * 
 * CRITICAL FIX: Fixed useEffect dependency loop that caused search duplicates
 * CRITICAL FIX: URL sync now uses ref to prevent infinite re-renders
 * RT-001 FIX: Stale closure in debounce fixed with useRef for onSearch callback
 */
export default function SearchView({ onSearch, placeholder = "Search entries..." }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const isSyncingRef = useRef(false);
  // RT-001 FIX: Use ref to prevent stale closure in debounce
  const onSearchRef = useRef(onSearch);
  
  // Keep ref updated with latest onSearch callback
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Initialize state from URL query param
  const [searchTerm, setSearchTerm] = useState(() => {
    return searchParams.get('q') || '';
  });

  // Sync input value with URL query param when it changes (e.g., back/forward navigation)
  // CRITICAL FIX: Use ref to prevent loop when setSearchTerm is called
  // NEW-DEFECT-004 FIX: Clear timeout to prevent race condition
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    if (urlQuery !== searchTerm && !isSyncingRef.current) {
      isSyncingRef.current = true;
      setSearchTerm(urlQuery);
      // Reset flag after state update
      const timeoutId = setTimeout(() => { isSyncingRef.current = false; }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [searchParams]); // Only depends on searchParams for external changes (back/forward)

  // Debounced search callback
  // RT-001 FIX: Uses onSearchRef to prevent stale closure
  // NEW-DEFECT-001 FIX: Store debounce instance for cleanup
  const debouncedSearchRef = useRef(null);
  
  if (!debouncedSearchRef.current) {
    debouncedSearchRef.current = debounce((term) => {
      if (onSearchRef.current) {
        onSearchRef.current(term);
      }
    }, 300);
  }
  
  // NEW-DEFECT-001 FIX: Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debouncedSearchRef.current) {
        debouncedSearchRef.current.cancel();
      }
    };
  }, []);

  // Update URL and trigger search when user types
  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Update URL query param
    if (value.trim()) {
      setSearchParams({ q: value });
    } else {
      searchParams.delete('q');
      setSearchParams(searchParams);
    }
    
    // Trigger debounced search
    debouncedSearchRef.current(value);
  };

  // Clear search
  const handleClear = () => {
    setSearchTerm('');
    searchParams.delete('q');
    setSearchParams(searchParams);
    if (onSearch) {
      onSearch('');
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className="h-5 w-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>

        {/* Search Input - NEW-DEFECT-002: Added aria-label */}
        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          placeholder={placeholder}
          aria-label="Search entries"
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
        />

        {/* Clear Button */}
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            aria-label="Clear search"
          >
            <svg 
              className="h-5 w-5 text-gray-400 hover:text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        )}
      </div>
    </form>
  );
}

// Utility function for debouncing
// NEW-DEFECT-001 FIX: Added cancel method for cleanup
function debounce(func, wait) {
  let timeout;
  const debounced = function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
  
  debounced.cancel = function() {
    clearTimeout(timeout);
  };
  
  return debounced;
}
