import React, { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

function SearchBar({ onSearch, placeholder = 'Search...' }) {
  const [query, setQuery] = useState('')
  const onSearchRef = useRef(onSearch)
  
  // Keep ref in sync with the latest callback
  useEffect(() => {
    onSearchRef.current = onSearch
  }, [onSearch])

  // Debounce search - trigger search 300ms after user stops typing
  // Uses ref to avoid resetting timeout when onSearch reference changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearchRef.current(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="
          w-full bg-gray-800 text-white px-4 py-3 pl-11 rounded-xl
          border border-gray-700 focus:border-gray-500
          focus:outline-none focus:ring-2 focus:ring-gray-600
          transition-colors
        "
      />
      <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
      
      {query && (
        <button
          type="button"
          onClick={() => { setQuery(''); onSearch(''); }}
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </form>
  )
}

export default SearchBar
