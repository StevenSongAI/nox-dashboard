import React, { useState, useEffect } from 'react';
import EntryCard from '../components/EntryCard';
import EntryDetail from '../components/EntryDetail';
import FilterPills from '../components/FilterPills';
import SearchView from './SearchView';

const CATEGORIES = [
  { value: 'all', label: 'All Entries' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'business', label: 'Business' },
  { value: 'investments', label: 'Investments' },
  { value: 'activity', label: 'Activity' },
];

export default function DashboardView() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    hasNext: false,
    hasPrev: false,
    totalCount: 0
  });

  // Fetch entries
  const fetchEntries = async (page = 1, category = selectedCategory, searchTerm = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (category !== 'all') {
        params.append('category', category);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await fetch(`/api/entries?${params}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch entries');
      }
      
      setEntries(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchEntries(1);
  }, []);

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    fetchEntries(1, category);
  };

  // Handle search
  const handleSearch = (term) => {
    fetchEntries(1, selectedCategory, term);
  };

  // Handle entry click
  const handleEntryClick = (entry) => {
    setSelectedEntry(entry);
    setModalOpen(true);
  };

  // Handle pagination
  const handlePrevPage = () => {
    if (pagination.hasPrev) {
      fetchEntries(pagination.page - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNext) {
      fetchEntries(pagination.page + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="w-full sm:w-auto">
          <SearchView onSearch={handleSearch} placeholder="Search entries..." />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <FilterPills
          filters={CATEGORIES}
          selected={selectedCategory}
          onChange={handleCategoryChange}
        />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Entries</p>
          <p className="text-2xl font-bold text-gray-900">{pagination.totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Current Page</p>
          <p className="text-2xl font-bold text-gray-900">{pagination.page}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Showing</p>
          <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Entries Grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onClick={() => handleEntryClick(entry)}
              />
            ))}
          </div>

          {/* Empty State */}
          {entries.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No entries found</p>
            </div>
          )}

          {/* Pagination */}
          {entries.length > 0 && (
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={handlePrevPage}
                disabled={!pagination.hasPrev}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={!pagination.hasNext}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Entry Detail Modal */}
      <EntryDetail
        entry={selectedEntry || {}}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedEntry(null);
        }}
      />
    </div>
  );
}
