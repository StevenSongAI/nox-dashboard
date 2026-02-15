import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import client from '../api/client.js'

function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const navigate = useNavigate()
  const location = useLocation()
  const inputRef = useRef(null)
  const resultsRef = useRef(null)

  // Sync with URL query parameter for view filtering (DEFECT-005)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const urlQuery = searchParams.get('q') || ''
    setQuery(urlQuery)
  }, [location.search])

  const search = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const response = await client.get(`/search?q=${encodeURIComponent(searchQuery)}&limit=5`)
      setResults(response.data.results || [])
    } catch (err) {
      console.error('Search failed:', err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      search(query)
    }, 300)

    return () => clearTimeout(timeout)
  }, [query, search])

  // Update URL when query changes for view filtering (DEFECT-005)
  const updateUrlQuery = useCallback((newQuery) => {
    const searchParams = new URLSearchParams(location.search)
    if (newQuery.trim()) {
      searchParams.set('q', newQuery)
    } else {
      searchParams.delete('q')
    }
    // Keep the current path but update query params
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true })
  }, [location.pathname, location.search, navigate])

  const handleSelect = (entry) => {
    setQuery('')
    setShowResults(false)
    setHighlightedIndex(-1)
    navigate(`/${entry.category}?highlight=${entry.id}`)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && results[highlightedIndex]) {
        handleSelect(results[highlightedIndex])
      } else if (query.trim()) {
        setShowResults(false)
        // Update URL with search query to filter current view (DEFECT-005)
        updateUrlQuery(query)
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Escape') {
      setShowResults(false)
      setHighlightedIndex(-1)
      inputRef.current?.blur()
    }
  }

  // Reset highlighted index when results change
  useEffect(() => {
    setHighlightedIndex(-1)
  }, [results])

  const handleInputChange = (e) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    setShowResults(true)
    // Auto-filter current view as user types (DEFECT-005)
    updateUrlQuery(newQuery)
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowResults(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search across all entries..."
          aria-label="Search across all entries"
          aria-expanded={showResults && query.trim().length > 0}
          aria-haspopup="listbox"
          aria-controls="search-results"
          className="
            w-full bg-gray-900 text-white pl-10 pr-4 py-2 rounded-full
            border border-gray-700 focus:border-gray-500
            focus:outline-none focus:ring-2 focus:ring-gray-600
            transition-colors text-sm
          "
        />
        <svg
          className="absolute left-3 top-2.5 w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        
        {loading && (
          <div className="absolute right-3 top-2.5">
            <div className="w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && query.trim() && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowResults(false)}
          />
          <div 
            id="search-results"
            ref={resultsRef}
            role="listbox"
            className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-xl border border-gray-700 shadow-xl z-40 overflow-hidden"
          >
            {results.length > 0 ? (
              <>
                {results.map((entry, index) => (
                  <button
                    key={entry.id}
                    role="option"
                    aria-selected={index === highlightedIndex}
                    onClick={() => handleSelect(entry)}
                    className={`w-full text-left px-4 py-3 transition-colors border-b border-gray-700 last:border-0 ${
                      index === highlightedIndex 
                        ? 'bg-gray-700' 
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{entry.title}</span>
                      <span className="text-xs text-gray-500 ml-2 shrink-0">{entry.category}</span>
                    </div>
                    <p className="text-sm text-gray-400 truncate mt-1">
                      {String(entry.content || '').substring(0, 60)}...
                    </p>
                  </button>
                ))}
                <button
                  onClick={() => {
                    setShowResults(false)
                    navigate(`/search?q=${encodeURIComponent(query)}`)
                  }}
                  className="w-full text-center py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  View all results →
                </button>
              </>
            ) : (
              <div className="px-4 py-3 text-gray-500 text-sm">
                {loading ? 'Searching...' : 'No results found'}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default GlobalSearch
