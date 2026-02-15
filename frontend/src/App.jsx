import React, { useState, useEffect } from 'react'
import SearchView from './views/SearchView'
import FilterPills from './components/FilterPills'
import EntryDetail from './components/EntryDetail'

const FILTERS = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'business', label: 'Business' },
  { value: 'investments', label: 'Investments' },
  { value: 'activity', label: 'Activity' },
]

// Production-safe default entry
const DEFAULT_ENTRY = {
  id: '',
  title: '',
  description: '',
  content: '',
  category: '',
  confidence: 0,
  tags: [],
  created_at: '',
  url: ''
}

// RT-004 FIX: Test data loaded dynamically to ensure it's excluded from production builds
function App() {
  const [selectedFilter, setSelectedFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [testEntry, setTestEntry] = useState(DEFAULT_ENTRY)
  const [isDevMode, setIsDevMode] = useState(false)

  // Dynamically load test data only in DEV mode
  useEffect(() => {
    if (import.meta.env.DEV) {
      setIsDevMode(true)
      import('./data/testEntries').then(({ SAMPLE_ENTRY }) => {
        setTestEntry(SAMPLE_ENTRY)
      })
    }
  }, [])

  const handleSearch = (term) => {
    console.log('Search term:', term)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Entry Manager</h1>
        
        {/* Search Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Search</h2>
          <SearchView onSearch={handleSearch} />
        </section>

        {/* Filter Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>
          <FilterPills 
            filters={FILTERS}
            selected={selectedFilter}
            onChange={setSelectedFilter}
          />
        </section>

        {/* Entry Detail Modal Demo - DEV ONLY */}
        {isDevMode && (
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Entry Detail Modal (Dev Only)</h2>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Open Entry Detail
            </button>
          </section>
        )}
      </div>

      {/* Modal - Uses test data in DEV, empty default in production */}
      <EntryDetail
        entry={isDevMode ? testEntry : DEFAULT_ENTRY}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}

export default App