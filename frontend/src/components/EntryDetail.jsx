import React, { useState, useEffect, useCallback } from 'react';
import { sanitizeHTML } from '../utils/sanitize';

const CATEGORY_COLORS = {
  youtube: 'bg-red-100 text-red-800',
  business: 'bg-blue-100 text-blue-800',
  investments: 'bg-green-100 text-green-800',
  activity: 'bg-purple-100 text-purple-800',
  default: 'bg-gray-100 text-gray-800'
};

const MOVE_TO_OPTIONS = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'business', label: 'Business' },
  { value: 'investments', label: 'Investments' },
  { value: 'activity', label: 'Activity' }
];

/**
 * EntryDetail Component
 * Displays entry details in a modal with "move to" functionality
 * 
 * Supports two usage patterns:
 * 1. entryId + onClose (fetches entry data)
 * 2. entry + isOpen + onClose (uses provided entry data)
 */
export default function EntryDetail({ 
  entryId, 
  entry: propEntry, 
  isOpen: propIsOpen, 
  onClose,
  onMove 
}) {
  // State for entryId-based usage
  const [fetchedEntry, setFetchedEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for move functionality
  const [isMoveDropdownOpen, setIsMoveDropdownOpen] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [moveError, setMoveError] = useState(null);
  const [moveSuccess, setMoveSuccess] = useState(false);

  // Determine which mode we're in and get the effective entry
  const isEntryIdMode = entryId !== undefined;
  const effectiveIsOpen = isEntryIdMode ? !!entryId : propIsOpen;
  const effectiveEntry = isEntryIdMode ? fetchedEntry : propEntry;

  // Fetch entry data when entryId changes
  useEffect(() => {
    if (isEntryIdMode && entryId) {
      fetchEntry(entryId);
    }
  }, [entryId, isEntryIdMode]);

  // Reset states when modal closes
  useEffect(() => {
    if (!effectiveIsOpen) {
      setIsMoveDropdownOpen(false);
      setMoveError(null);
      setMoveSuccess(false);
      if (isEntryIdMode) {
        setFetchedEntry(null);
      }
    }
  }, [effectiveIsOpen, isEntryIdMode]);

  const fetchEntry = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/entries/${id}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch entry');
      }
      
      setFetchedEntry(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async (newCategory) => {
    if (!effectiveEntry || newCategory === effectiveEntry.category) {
      setIsMoveDropdownOpen(false);
      return;
    }

    setIsMoving(true);
    setMoveError(null);
    setMoveSuccess(false);

    try {
      const response = await fetch(`/api/entries/${effectiveEntry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': localStorage.getItem('apiKey') || ''
        },
        body: JSON.stringify({ category: newCategory })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to move entry');
      }

      // Update local entry data
      if (isEntryIdMode) {
        setFetchedEntry(data.data);
      }

      setMoveSuccess(true);
      setIsMoveDropdownOpen(false);

      // Call onMove callback if provided
      if (onMove) {
        onMove(data.data);
      }

      // Close modal after successful move (with delay for user to see success)
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (err) {
      setMoveError(err.message);
    } finally {
      setIsMoving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Prevent XSS by sanitizing HTML content
  const renderContent = (content) => {
    if (!content) return null;
    return sanitizeHTML(content);
  };

  // Don't render if not open
  if (!effectiveIsOpen) return null;

  const categoryClass = CATEGORY_COLORS[effectiveEntry?.category] || CATEGORY_COLORS.default;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          
          {/* Loading State */}
          {loading && (
            <div className="px-4 py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading entry...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="px-4 py-12 text-center">
              <div className="text-red-600 mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-600">{error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
              >
                Close
              </button>
            </div>
          )}

          {/* Content */}
          {!loading && !error && effectiveEntry && (
            <>
              {/* Header */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-between items-center border-b">
                <div className="flex items-center gap-3">
                  {effectiveEntry.category && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryClass}`}>
                      {effectiveEntry.category}
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    Confidence: {((effectiveEntry.confidence || 0) * 100).toFixed(0)}%
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label="Close modal"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Success/Error Messages */}
              {moveSuccess && (
                <div className="mx-4 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  Entry moved successfully! Closing...
                </div>
              )}
              {moveError && (
                <div className="mx-4 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  Error: {moveError}
                </div>
              )}

              {/* Content */}
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {effectiveEntry.title || 'Untitled Entry'}
                </h2>

                {effectiveEntry.description && (
                  <p className="text-gray-600 mb-4 italic">{effectiveEntry.description}</p>
                )}

                {effectiveEntry.content && (
                  <div className="prose max-w-none">
                    <div className="text-gray-800 whitespace-pre-wrap">
                      {renderContent(effectiveEntry.content)}
                    </div>
                  </div>
                )}

                {effectiveEntry.source_url && (
                  <div className="mt-4">
                    <a
                      href={effectiveEntry.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Source →
                    </a>
                  </div>
                )}

                {effectiveEntry.tags && effectiveEntry.tags.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {effectiveEntry.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-between items-center border-t">
                <div className="text-sm text-gray-500">
                  <div>Created: {formatDate(effectiveEntry.created_at)}</div>
                  {effectiveEntry.updated_at && effectiveEntry.updated_at !== effectiveEntry.created_at && (
                    <div className="mt-1">Updated: {formatDate(effectiveEntry.updated_at)}</div>
                  )}
                </div>

                {/* Move To Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsMoveDropdownOpen(!isMoveDropdownOpen)}
                    disabled={isMoving}
                    className="
                      inline-flex items-center px-4 py-2
                      bg-white border border-gray-300 rounded-md
                      text-sm font-medium text-gray-700
                      hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    {isMoving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Moving...
                      </>
                    ) : (
                      <>
                        Move to
                        <svg className="ml-2 -mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {isMoveDropdownOpen && (
                    <>
                      {/* Backdrop to close dropdown when clicking outside */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsMoveDropdownOpen(false)}
                      />
                      <div className="absolute right-0 bottom-full mb-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                        <div className="py-1" role="menu">
                          {MOVE_TO_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleMove(option.value)}
                              disabled={option.value === effectiveEntry.category}
                              className={`
                                w-full text-left px-4 py-2 text-sm
                                ${option.value === effectiveEntry.category 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                }
                              `}
                              role="menuitem"
                            >
                              {option.label}
                              {option.value === effectiveEntry.category && (
                                <span className="ml-2 text-xs">(current)</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
