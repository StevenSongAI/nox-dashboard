import React, { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useEntries } from '../hooks/useEntries.js'
import Card from '../components/Card.jsx'
import SearchBar from '../components/SearchBar.jsx'
import FilterPills from '../components/FilterPills.jsx'
import EntryDetail from '../components/EntryDetail.jsx'

const typeFilters = [
  { value: 'market_update', label: 'Market Updates' },
  { value: 'opportunity', label: 'Opportunities' },
  { value: 'strategy', label: 'Strategy' },
  { value: 'research_note', label: 'Research' }
]

const inboxFilters = [
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' }
]

const subStatusFilters = {
  active: [
    { value: '', label: 'All Active' },
    { value: 'new', label: 'New' },
    { value: 'evaluating', label: 'Evaluating' },
    { value: 'won', label: 'Won' }
  ],
  archived: [
    { value: '', label: 'All Archived' },
    { value: 'passed', label: 'Passed' },
    { value: 'lost', label: 'Lost' }
  ]
}

function BusinessView() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlSearchQuery = searchParams.get('q') || ''
  
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery)
  const [selectedType, setSelectedType] = useState('')
  const [inboxView, setInboxView] = useState('active')
  const [selectedSubStatus, setSelectedSubStatus] = useState('')
  const [selectedEntry, setSelectedEntry] = useState(null)
  
  const effectiveSearchQuery = urlSearchQuery || searchQuery
  
  const { entries, loading, error, pagination, loadMore, refresh } = useEntries(
    'business',
    selectedType,
    effectiveSearchQuery,
    20
  )

  const handleSearch = useCallback((query) => {
    setSearchQuery(query)
    if (query.trim()) {
      setSearchParams({ q: query })
    } else {
      setSearchParams({})
    }
  }, [setSearchParams])

  // Filter entries by inbox view and sub-status
  const filteredEntries = entries.filter(entry => {
    const status = entry.status || 'new'
    
    // Inbox filtering
    if (inboxView === 'active') {
      if (status === 'passed' || status === 'lost') return false
    } else {
      if (status !== 'passed' && status !== 'lost') return false
    }
    
    // Sub-status filtering
    if (selectedSubStatus && status !== selectedSubStatus) {
      return false
    }
    
    return true
  })

  const handleStatusChange = (entryId, newStatus) => {
    // Refresh entries after status change
    refresh()
  }

  if (error) {
    return <div className="text-red-400 text-center py-12">Error: {error}</div>
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Business</h2>
        <p className="text-gray-400">
          {filteredEntries.length} of {pagination.total} entries • {inboxView === 'active' ? 'Active opportunities' : 'Archived items'}
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search opportunities, strategies, research..."
        />
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <FilterPills
          filters={typeFilters}
          selected={selectedType}
          onSelect={setSelectedType}
        />
        
        {/* Inbox Toggle */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex bg-gray-800 rounded-lg p-1">
            {inboxFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => {
                  setInboxView(filter.value)
                  setSelectedSubStatus('')
                }}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${inboxView === filter.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                  }
                `}
              >
                {filter.label}
              </button>
            ))}
          </div>
          
          {/* Sub-status filter */}
          <div className="flex gap-2">
            {subStatusFilters[inboxView].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedSubStatus(filter.value)}
                className={`
                  px-3 py-1.5 rounded-full text-sm transition-colors
                  ${selectedSubStatus === filter.value
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-500 hover:text-gray-300'
                  }
                `}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
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
        {filteredEntries.map((entry) => (
          <Card
            key={entry.id}
            entry={entry}
            onClick={() => setSelectedEntry(entry.id)}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      {/* Entry Detail Modal */}
      <EntryDetail 
        entryId={selectedEntry} 
        onClose={() => setSelectedEntry(null)} 
        onMove={refresh}
      />

      {/* Empty State */}
      {!loading && filteredEntries.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">
            {inboxView === 'active' ? 'No active items' : 'No archived items'}
          </p>
          <p className="text-gray-600 mt-2">
            {inboxView === 'active' 
              ? 'Items marked as Passed or Lost go to Archived'
              : 'Mark items as Passed or Lost to archive them'
            }
          </p>
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
            "
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  )
}

export default BusinessView