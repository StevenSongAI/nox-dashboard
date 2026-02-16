import React, { useState } from 'react'

const categoryColors = {
  youtube: 'border-red-500',
  business: 'border-green-500',
  investments: 'border-blue-500',
  activity: 'border-purple-500'
}

const categoryBgColors = {
  youtube: 'bg-red-500/10',
  business: 'bg-green-500/10',
  investments: 'bg-blue-500/10',
  activity: 'bg-purple-500/10'
}

const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'evaluating', label: 'Evaluating' },
  { value: 'passed', label: 'Passed' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' }
]

function Card({ entry, onClick, onStatusChange, onDelete }) {
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isMoveOpen, setIsMoveOpen] = useState(false)
  const [updating, setUpdating] = useState(false)

  // Defensive check for missing entry
  if (!entry) {
    return null
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return ''
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num?.toString() || ''
  }

  const handleStatusChange = async (newStatus) => {
    setIsStatusOpen(false)
    if (newStatus === entry.status) return
    
    setUpdating(true)
    try {
      const response = await fetch(`/api/entries/${entry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (response.ok && onStatusChange) {
        onStatusChange(entry.id, newStatus)
      }
    } catch (err) {
      console.error('Failed to update status:', err)
    } finally {
      setUpdating(false)
    }
  }

  const category = entry.category || 'unknown'
  const type = entry.type || 'Unknown'
  const title = entry.title || 'Untitled'
  const content = entry.content || entry.summary || 'No description available'
  const source = entry.source || ''
  const confidence = entry.confidence
  const verified = entry.verified
  const createdAt = entry.created_at
  const status = entry.status

  return (
    <div
      className={`
        bg-gray-800 rounded-xl p-5 border-l-4
        hover:bg-gray-700 transition-all duration-200
        hover:shadow-lg hover:shadow-black/20
        ${categoryColors[category] || 'border-gray-500'}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <span className={`
          text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded
          ${categoryBgColors[category] || 'bg-gray-700'}
          text-gray-300
        `}>
          {type}
        </span>
        <span className="text-xs text-gray-500">
          {formatDate(createdAt)}
        </span>
      </div>

      {/* Clickable content area */}
      <div onClick={onClick} className="cursor-pointer">
        {/* Title */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 leading-snug">
          {title}
        </h3>

        {/* Content Preview */}
        <p className="text-sm text-gray-400 mb-4 line-clamp-3 leading-relaxed">
          {content}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs mb-4">
          <div className="flex items-center space-x-3">
            {source && <span className="text-gray-500">{source}</span>}
            
            {confidence && (
              <span className={`
                px-2 py-0.5 rounded-full font-medium
                ${confidence >= 80 ? 'bg-green-500/20 text-green-400' :
                  confidence >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'}
              `}>
                {confidence}% confidence
              </span>
            )}
          </div>

          {verified && (
            <span className="text-green-400 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-700">
        {/* Status Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            disabled={updating}
            className="
              px-3 py-1.5 bg-gray-800 hover:bg-gray-700
              border border-gray-600 rounded-lg
              text-sm text-gray-300
              flex items-center gap-2
              disabled:opacity-50
            "
          >
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Set Status'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isStatusOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsStatusOpen(false)}
              />
              <div className="absolute left-0 bottom-full mb-1 w-36 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20 py-1">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    className={`
                      w-full text-left px-3 py-2 text-sm
                      ${status === option.value 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Delete Button */}
        {onDelete && (
          <button
            onClick={() => onDelete(entry.id)}
            className="
              px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50
              border border-red-800 rounded-lg
              text-sm text-red-400
              ml-auto
            "
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}

export default Card