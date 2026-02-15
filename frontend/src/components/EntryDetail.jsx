import React from 'react';
import { sanitizeHtml } from '../utils/sanitize';

const CATEGORY_COLORS = {
  youtube: 'bg-red-100 text-red-800',
  business: 'bg-blue-100 text-blue-800',
  investments: 'bg-green-100 text-green-800',
  activity: 'bg-purple-100 text-purple-800',
  default: 'bg-gray-100 text-gray-800'
};

export default function EntryDetail({ entry, isOpen, onClose }) {
  if (!isOpen) return null;

  const categoryClass = CATEGORY_COLORS[entry?.category] || CATEGORY_COLORS.default;

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
    // DEFECT-RT-001 FIX: Use sanitizeHtml to prevent XSS
    return sanitizeHtml(content);
  };

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
          {/* Header */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-between items-center border-b">
            <div className="flex items-center gap-3">
              {entry?.category && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryClass}`}>
                  {entry.category}
                </span>
              )}
              <span className="text-sm text-gray-500">
                Confidence: {((entry?.confidence || 0) * 100).toFixed(0)}%
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

          {/* Content */}
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {entry?.title || 'Untitled Entry'}
            </h2>

            {entry?.description && (
              <p className="text-gray-600 mb-4 italic">{entry.description}</p>
            )}

            {entry?.content && (
              <div className="prose max-w-none">
                <div className="text-gray-800 whitespace-pre-wrap">
                  {renderContent(entry.content)}
                </div>
              </div>
            )}

            {entry?.source_url && (
              <div className="mt-4">
                <a
                  href={entry.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View Source →
                </a>
              </div>
            )}

            {entry?.tags && entry.tags.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag, idx) => (
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
          <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-between items-center text-sm text-gray-500">
            <div>
              Created: {formatDate(entry?.created_at)}
            </div>
            {entry?.updated_at && entry.updated_at !== entry.created_at && (
              <div>
                Updated: {formatDate(entry.updated_at)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
