import React from 'react'

const categoryColors = {
  youtube: 'border-red-500',
  business: 'border-green-500',
  investments: 'border-blue-500'
}

const categoryBgColors = {
  youtube: 'bg-red-500/10',
  business: 'bg-green-500/10',
  investments: 'bg-blue-500/10'
}

function Card({ entry, onClick }) {
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

  const category = entry.category || 'unknown'
  const type = entry.type || 'Unknown'
  const title = entry.title || 'Untitled'
  const content = entry.content || entry.summary || 'No description available'
  const source = entry.source || ''
  const confidence = entry.confidence
  const verified = entry.verified
  const createdAt = entry.created_at

  return (
    <div
      onClick={onClick}
      className={`
        bg-gray-800 rounded-xl p-5 border-l-4 cursor-pointer
        hover:bg-gray-700 transition-all duration-200
        hover:shadow-lg hover:shadow-black/20
        hover:-translate-y-1
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

      {/* Title */}
      <h3 className="font-semibold text-lg mb-2 line-clamp-2 leading-snug">
        {title}
      </h3>

      {/* Content Preview */}
      <p className="text-sm text-gray-400 mb-4 line-clamp-3 leading-relaxed">
        {content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs">
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
  )
}

export default Card
