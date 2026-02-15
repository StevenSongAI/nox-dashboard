import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import client from '../api/client.js'
import Card from '../components/Card.jsx'
import EntryDetail from '../components/EntryDetail.jsx'

function SearchView() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [inputValue, setInputValue] = useState(query)
  const setSearchParamsRef = useRef(setSearchParams)

  // Keep ref in sync with the latest callback
  useEffect(() => {
    setSearchParamsRef.current = setSearchParams
  }, [setSearchParams])

  // Debounce URL update - 300ms after user stops typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputValue) {
        setSearchParamsRef.current({ q: inputValue })
      } else {
        setSearchParamsRef.current({})
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [inputValue])

  useEffect(() => {
    if (!query) return

    const search = async () => {
      setLoading(true)
      try {
        const response = await client.get(`/search?q=${encodeURIComponent(query)}&limit=50`)
        setResults(response.data.results || [])
      } catch (err) {
        console.error('Search failed:', err)
      } finally {
        setLoading(false)
      }
    }

    search()
  }, [query])

  const handleSearch = (e) => {
    setInputValue(e.target.value)
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Search</h2>
        <input
          type="text"
          value={inputValue}
          onChange={handleSearch}
          placeholder="Search all entries..."
          className="
            w-full max-w-xl bg-gray-800 text-white px-4 py-3 rounded-xl
            border border-gray-700 focus:border-gray-500
            focus:outline-none focus:ring-2 focus:ring-gray-600
          "
          autoFocus
        />
      </div>

      {/* Results */}
      {query && (
        <>
          <p className="text-gray-400 mb-6">
            {loading ? 'Searching...' : `${results.length} results for "${query}"`}
          </p>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((entry) => (
                <Card
                  key={entry.id}
                  entry={entry}
                  onClick={() => setSelectedEntry(entry.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No results found</p>
              <p className="text-gray-600 mt-2">Try different keywords</p>
            </div>
          )}
        </>
      )}

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <EntryDetail
          entryId={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  )
}

export default SearchView
