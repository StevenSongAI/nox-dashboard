import React, { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useEntries } from '../hooks/useEntries.js'
import Card from '../components/Card.jsx'
import SearchBar from '../components/SearchBar.jsx'
import FilterPills from '../components/FilterPills.jsx'
import EntryDetail from '../components/EntryDetail.jsx'
import { Loader2 } from 'lucide-react'

const categoryFilters = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'business', label: 'Business' },
  { value: 'investments', label: 'Investments' },
]

function ActivityView() {
  const [searchParams, setSearchParams] = useSearchParams()
  // Read search query from URL for global search integration (DEFECT-005)
  const urlSearchQuery = searchParams.get('q') || ''
  
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedEntry, setSelectedEntry] = useState(null)
  
  // Combine URL search with local search (DEFECT-005)
  const effectiveSearchQuery = urlSearchQuery || searchQuery
  
  const { entries, loading, error, pagination, loadMore } = useEntries(
    selectedCategory,
    '',
    effectiveSearchQuery,
    20
  )

  const handleSearch = useCallback((query) => {
    setSearchQuery(query)
    // Update URL to sync with global search (DEFECT-005)
    if (query.trim()) {
      setSearchParams({ q: query })
    } else {
      setSearchParams({})
    }
  }, [setSearchParams])

  if (error) {
    return <div className="text-red-400 text-center py-12">Error: {error}</div>
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Activity Feed</h2>
        <p className="text-gray-400">
          {pagination.total} entries • All activity across categories
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search activity..."
        />
      </div>

      {/* Filters */}
      <div className="mb-8">
        <FilterPills
          filters={categoryFilters}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Loading */}
      {loading && entries.length === 0 && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading entries...</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map((entry) => (
          <Card
            key={entry.id}
            entry={entry}
            onClick={() => setSelectedEntry(entry.id)}
          />
        ))}
      </div>

      {/* Entry Detail Modal */}
      <EntryDetail 
        entryId={selectedEntry} 
        onClose={() => setSelectedEntry(null)} 
      />

      {/* Empty State */}
      {!loading && entries.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No entries found</p>
          <p className="text-gray-600 mt-2">Try adjusting your filters</p>
        </div>
      )}

      {/* Load More */}
      {pagination.hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="
              px-6 py-3 bg-gray-800 hover:bg-gray-700
              rounded-xl font-medium transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2 mx-auto
            "
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default ActivityView
