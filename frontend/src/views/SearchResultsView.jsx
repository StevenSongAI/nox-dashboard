import React, { useState, useEffect } from 'react';
import EntryCard from '../components/EntryCard';
import EntryDetail from '../components/EntryDetail';
import SearchView from './SearchView';

export default function SearchResultsView() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [facets, setFacets] = useState({ categories: [], tags: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    hasNext: false,
    hasPrev: false,
    totalCount: 0
  });

  // Search function
  const performSearch = async (searchQuery, page = 1) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        page: page.toString(),
        limit: '20'
      });

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data.data.results);
      setFacets(data.data.facets);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input
  const handleSearch = (term) => {
    setQuery(term);
    setPagination(prev => ({ ...prev, page: 1 }));
    performSearch(term, 1);
  };

  // Handle entry click
  const handleEntryClick = (entry) => {
    setSelectedEntry(entry);
    setModalOpen(true);
  };

  // Handle pagination
  const handlePrevPage = () => {
    if (pagination.hasPrev) {
      performSearch(query, pagination.page - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNext) {
      performSearch(query, pagination.page + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
        <div className="w-full max-w-md">
          <SearchView onSearch={handleSearch} placeholder="Search all entries..." />
        </div>
      </div>

      {/* Facets */}
      {query && !loading && results.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Filters</h3>
          
          {/* Category Facets */}
          {facets.categories.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Categories</p>
              <div className="flex flex-wrap gap-2">
                {facets.categories.map((facet) => (
                  <span
                    key={facet.category}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                  >
                    {facet.category} ({facet.count})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tag Facets */}
          {facets.tags.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {facets.tags.slice(0, 10).map((facet) => (
                  <span
                    key={facet.tag}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {facet.tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Summary */}
      {query && (
        <div className="text-sm text-gray-600">
          {loading ? (
            'Searching...'
          ) : (
            `Found ${pagination.totalCount} results for "${query}"`
          )}
        </div>
      )}

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

      {/* Results Grid */}
      {!loading && !error && query && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onClick={() => handleEntryClick(entry)}
              />
            ))}
          </div>

          {/* Empty State */}
          {results.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No results found for "{query}"</p>
              <p className="text-sm text-gray-400 mt-2">
                Try adjusting your search terms
              </p>
            </div>
          )}

          {/* Pagination */}
          {results.length > 0 && (
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
