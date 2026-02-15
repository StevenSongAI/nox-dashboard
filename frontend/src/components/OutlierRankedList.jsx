import React, { useState, useEffect, useMemo } from 'react';

// Storage key for seen outliers
const SEEN_OUTLIERS_KEY = 'nox_dashboard_seen_outliers';

// Sort options
const SORT_OPTIONS = {
  VIEWS: { key: 'viewCount', label: 'View Count' },
  VIRAL_SCORE: { key: 'viralScore', label: 'Viral Score' },
  ENGAGEMENT: { key: 'engagementRate', label: 'Engagement Rate' },
  DATE: { key: 'date', label: 'Date' },
  TITLE: { key: 'title', label: 'Title' },
};

// Sort direction
const SORT_DIR = {
  ASC: 'asc',
  DESC: 'desc',
};

/**
 * OutlierRankedList Component
 * 
 * Displays outlier videos with:
 * - Ranked list view with sortable columns
 * - Seen/Unseen tabs (like email inbox)
 * - LocalStorage tracking of seen state
 * - Click to mark as seen with visual indicator
 */
export default function OutlierRankedList({ 
  outliers = [], 
  onOutlierClick,
  className = '' 
}) {
  // Tab state: 'unseen' | 'seen' | 'all'
  const [activeTab, setActiveTab] = useState('unseen');
  
  // Sort state
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.VIRAL_SCORE.key);
  const [sortDir, setSortDir] = useState(SORT_DIR.DESC);
  
  // Seen state from LocalStorage
  const [seenIds, setSeenIds] = useState(new Set());

  // Load seen IDs from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SEEN_OUTLIERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSeenIds(new Set(parsed));
      }
    } catch (error) {
      console.error('Failed to load seen outliers:', error);
    }
  }, []);

  // Save seen IDs to LocalStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(SEEN_OUTLIERS_KEY, JSON.stringify([...seenIds]));
    } catch (error) {
      console.error('Failed to save seen outliers:', error);
    }
  }, [seenIds]);

  // Mark an outlier as seen
  const markAsSeen = (id) => {
    setSeenIds(prev => new Set([...prev, id]));
  };

  // Mark an outlier as unseen
  const markAsUnseen = (id) => {
    setSeenIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Handle row click
  const handleRowClick = (outlier) => {
    markAsSeen(outlier.id);
    if (onOutlierClick) {
      onOutlierClick(outlier);
    }
  };

  // Handle sort click
  const handleSort = (key) => {
    if (sortBy === key) {
      // Toggle direction
      setSortDir(prev => prev === SORT_DIR.ASC ? SORT_DIR.DESC : SORT_DIR.ASC);
    } else {
      setSortBy(key);
      setSortDir(SORT_DIR.DESC); // Default to descending for new sort
    }
  };

  // Filter outliers based on active tab
  const filteredOutliers = useMemo(() => {
    switch (activeTab) {
      case 'unseen':
        return outliers.filter(o => !seenIds.has(o.id));
      case 'seen':
        return outliers.filter(o => seenIds.has(o.id));
      case 'all':
      default:
        return outliers;
    }
  }, [outliers, seenIds, activeTab]);

  // Sort filtered outliers
  const sortedOutliers = useMemo(() => {
    const sorted = [...filteredOutliers];
    
    sorted.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      // Handle string comparison
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      // Handle null/undefined
      if (aVal == null) aVal = '';
      if (bVal == null) bVal = '';
      
      if (sortDir === SORT_DIR.ASC) {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
    
    return sorted;
  }, [filteredOutliers, sortBy, sortDir]);

  // Counts for tabs
  const unseenCount = outliers.filter(o => !seenIds.has(o.id)).length;
  const seenCount = outliers.filter(o => seenIds.has(o.id)).length;

  // Format numbers
  const formatNumber = (num) => {
    if (num == null) return '-';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  // Format percentage
  const formatPercent = (num) => {
    if (num == null) return '-';
    return num.toFixed(1) + '%';
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  // Sort indicator component
  const SortIndicator = ({ columnKey }) => {
    if (sortBy !== columnKey) {
      return (
        <span className="ml-1 text-gray-500 opacity-0 group-hover:opacity-50">
          <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </span>
      );
    }
    
    return (
      <span className="ml-1 text-blue-400">
        {sortDir === SORT_DIR.ASC ? (
          <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </span>
    );
  };

  return (
    <div className={`bg-gray-800 rounded-xl overflow-hidden ${className}`}>
      {/* Tabs Header */}
      <div className="border-b border-gray-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab('unseen')}
            className={`
              px-6 py-3 text-sm font-medium border-b-2 transition-colors
              ${activeTab === 'unseen' 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-gray-400 hover:text-gray-300'}
            `}
          >
            Unseen
            {unseenCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                {unseenCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('seen')}
            className={`
              px-6 py-3 text-sm font-medium border-b-2 transition-colors
              ${activeTab === 'seen' 
                ? 'border-green-500 text-green-400' 
                : 'border-transparent text-gray-400 hover:text-gray-300'}
            `}
          >
            Seen
            {seenCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                {seenCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`
              px-6 py-3 text-sm font-medium border-b-2 transition-colors
              ${activeTab === 'all' 
                ? 'border-purple-500 text-purple-400' 
                : 'border-transparent text-gray-400 hover:text-gray-300'}
            `}
          >
            All
            {outliers.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-600 text-gray-300 rounded-full">
                {outliers.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-750 border-b border-gray-700 text-xs font-medium text-gray-400 uppercase tracking-wider">
        {/* Title - 4 cols */}
        <button
          onClick={() => handleSort(SORT_OPTIONS.TITLE.key)}
          className="col-span-4 text-left flex items-center group hover:text-gray-300"
        >
          Video
          <SortIndicator columnKey={SORT_OPTIONS.TITLE.key} />
        </button>
        
        {/* Views - 2 cols */}
        <button
          onClick={() => handleSort(SORT_OPTIONS.VIEWS.key)}
          className="col-span-2 text-right flex items-center justify-end group hover:text-gray-300"
        >
          Views
          <SortIndicator columnKey={SORT_OPTIONS.VIEWS.key} />
        </button>
        
        {/* Viral Score - 2 cols */}
        <button
          onClick={() => handleSort(SORT_OPTIONS.VIRAL_SCORE.key)}
          className="col-span-2 text-right flex items-center justify-end group hover:text-gray-300"
        >
          Viral Score
          <SortIndicator columnKey={SORT_OPTIONS.VIRAL_SCORE.key} />
        </button>
        
        {/* Engagement - 2 cols */}
        <button
          onClick={() => handleSort(SORT_OPTIONS.ENGAGEMENT.key)}
          className="col-span-2 text-right flex items-center justify-end group hover:text-gray-300"
        >
          Engagement
          <SortIndicator columnKey={SORT_OPTIONS.ENGAGEMENT.key} />
        </button>
        
        {/* Date - 2 cols */}
        <button
          onClick={() => handleSort(SORT_OPTIONS.DATE.key)}
          className="col-span-2 text-right flex items-center justify-end group hover:text-gray-300"
        >
          Date
          <SortIndicator columnKey={SORT_OPTIONS.DATE.key} />
        </button>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-700">
        {sortedOutliers.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            {activeTab === 'unseen' ? (
              <>
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
                <p>All caught up! No unseen outliers.</p>
              </>
            ) : activeTab === 'seen' ? (
              <>
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <p>No outliers viewed yet.</p>
              </>
            ) : (
              <>
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No outliers found.</p>
              </>
            )}
          </div>
        ) : (
          sortedOutliers.map((outlier) => {
            const isSeen = seenIds.has(outlier.id);
            const isUnseen = !isSeen;
            
            return (
              <div
                key={outlier.id}
                onClick={() => handleRowClick(outlier)}
                className={`
                  grid grid-cols-12 gap-4 px-6 py-4 cursor-pointer
                  transition-all duration-150 group
                  ${isUnseen 
                    ? 'bg-gray-800 hover:bg-gray-750' 
                    : 'bg-gray-800/50 hover:bg-gray-750/50'}
                `}
              >
                {/* Title with thumbnail */}
                <div className="col-span-4 flex items-start space-x-3 min-w-0">
                  {/* Unseen indicator dot */}
                  <div className="flex-shrink-0 mt-1">
                    {isUnseen ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
                    )}
                  </div>
                  
                  {/* Thumbnail */}
                  {outlier.thumbnailUrl && (
                    <img 
                      src={outlier.thumbnailUrl} 
                      alt=""
                      className="w-20 h-12 object-cover rounded flex-shrink-0 bg-gray-700"
                    />
                  )}
                  
                  {/* Title and channel */}
                  <div className="min-w-0 flex-1">
                    <h4 className={`
                      text-sm truncate
                      ${isUnseen ? 'font-semibold text-white' : 'font-normal text-gray-300'}
                    `}>
                      {outlier.title || 'Untitled Video'}
                    </h4>
                    {outlier.channelName && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {outlier.channelName}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Views */}
                <div className="col-span-2 text-right">
                  <span className={`text-sm ${isUnseen ? 'text-white font-medium' : 'text-gray-400'}`}>
                    {formatNumber(outlier.viewCount)}
                  </span>
                </div>
                
                {/* Viral Score */}
                <div className="col-span-2 text-right">
                  <span className={`
                    inline-flex items-center px-2 py-0.5 rounded text-sm font-medium
                    ${(outlier.viralScore || 0) >= 80 ? 'bg-red-500/20 text-red-400' :
                      (outlier.viralScore || 0) >= 60 ? 'bg-orange-500/20 text-orange-400' :
                      (outlier.viralScore || 0) >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-600/20 text-gray-400'}
                    ${isUnseen ? 'font-semibold' : ''}
                  `}>
                    {outlier.viralScore?.toFixed(1) || '-'}
                  </span>
                </div>
                
                {/* Engagement Rate */}
                <div className="col-span-2 text-right">
                  <span className={`text-sm ${isUnseen ? 'text-white font-medium' : 'text-gray-400'}`}>
                    {formatPercent(outlier.engagementRate)}
                  </span>
                </div>
                
                {/* Date with mark as seen/unseen action */}
                <div className="col-span-2 text-right flex items-center justify-end space-x-2">
                  <span className={`text-xs ${isUnseen ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatDate(outlier.date)}
                  </span>
                  
                  {/* Hover action to toggle seen/unseen */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isSeen) {
                        markAsUnseen(outlier.id);
                      } else {
                        markAsSeen(outlier.id);
                      }
                    }}
                    className={`
                      opacity-0 group-hover:opacity-100 transition-opacity
                      p-1 rounded hover:bg-gray-700
                      ${isSeen ? 'text-yellow-400' : 'text-blue-400'}
                    `}
                    title={isSeen ? 'Mark as unseen' : 'Mark as seen'}
                  >
                    {isSeen ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Footer with summary */}
      {sortedOutliers.length > 0 && (
        <div className="px-6 py-3 bg-gray-850 border-t border-gray-700 text-xs text-gray-500 flex justify-between items-center">
          <span>
            Showing {sortedOutliers.length} {activeTab !== 'all' ? activeTab : ''} outlier{sortedOutliers.length !== 1 ? 's' : ''}
          </span>
          <span>
            Sorted by {SORT_OPTIONS[Object.keys(SORT_OPTIONS).find(k => SORT_OPTIONS[k].key === sortBy)]?.label || sortBy} ({sortDir === SORT_DIR.DESC ? 'descending' : 'ascending'})
          </span>
        </div>
      )}
    </div>
  );
}
