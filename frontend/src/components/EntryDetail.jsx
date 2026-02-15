import React, { useEffect } from 'react'
import { useEntry } from '../hooks/useEntries.js'

// XSS Protection: Escape HTML entities to prevent script injection
function escapeHtml(text) {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function EntryDetail({ entryId, onClose }) {
  // Always call hooks first - no conditional hooks
  const { entry, loading, error } = useEntry(entryId)

  // Handle ESC key to close modal
  useEffect(() => {
    if (!entryId) return
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [entryId, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (!entryId) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [entryId])

  // Return null if no entryId provided (modal is closed)
  if (!entryId) return null

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full mx-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !entry) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full mx-4">
          <div className="text-red-400">Error loading entry</div>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  const categoryColors = {
    youtube: 'text-red-400',
    business: 'text-green-400',
    investments: 'text-blue-400'
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
          <div>
            <span className={`text-sm font-medium uppercase tracking-wider ${categoryColors[entry.category] || 'text-gray-400'}`}>
              {entry.category}
            </span>
            <h2 className="text-2xl font-bold mt-1">{entry.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <span className="bg-gray-700 px-3 py-1 rounded-full">{entry.type}</span>
            <span>{entry.source}</span>
            <span>{new Date(entry.created_at).toLocaleDateString()}</span>
            {entry.confidence && (
              <span className={`
                px-3 py-1 rounded-full font-medium
                ${entry.confidence >= 80 ? 'bg-green-500/20 text-green-400' :
                  entry.confidence >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'}
              `}>
                {entry.confidence}% confidence
              </span>
            )}
          </div>

          {/* Full Content */}
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: escapeHtml(entry.content || entry.summary || 'No content available') }}
            />
          </div>

          {/* Metadata JSON */}
          {entry.metadata && Object.keys(entry.metadata).length > 0 && (
            <div className="bg-gray-900 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Metadata</h3>
              <pre className="text-xs text-gray-500 overflow-x-auto">
                {JSON.stringify(entry.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EntryDetail
