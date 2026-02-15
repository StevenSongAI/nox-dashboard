import React, { useState, useEffect } from 'react';
import OutlierRankedList from '../components/OutlierRankedList';

// Sample outlier data for demonstration
const SAMPLE_OUTLIERS = [
  {
    id: 'outlier-001',
    title: 'This Strategy Made Me $100K in 30 Days',
    channelName: 'Finance Bros',
    thumbnailUrl: 'https://i.ytimg.com/vi/sample1/hqdefault.jpg',
    viewCount: 2500000,
    viralScore: 94.5,
    engagementRate: 8.2,
    date: '2026-02-14T10:30:00Z',
    url: 'https://youtube.com/watch?v=sample1'
  },
  {
    id: 'outlier-002',
    title: 'The AI Tool That Replaced My Entire Team',
    channelName: 'Tech Insider',
    thumbnailUrl: 'https://i.ytimg.com/vi/sample2/hqdefault.jpg',
    viewCount: 1800000,
    viralScore: 88.3,
    engagementRate: 6.5,
    date: '2026-02-13T15:45:00Z',
    url: 'https://youtube.com/watch?v=sample2'
  },
  {
    id: 'outlier-003',
    title: 'I Built a $1M Business in 6 Months (Full Breakdown)',
    channelName: 'Entrepreneur Life',
    thumbnailUrl: 'https://i.ytimg.com/vi/sample3/hqdefault.jpg',
    viewCount: 3200000,
    viralScore: 91.7,
    engagementRate: 9.1,
    date: '2026-02-12T08:20:00Z',
    url: 'https://youtube.com/watch?v=sample3'
  },
  {
    id: 'outlier-004',
    title: 'Why Everyone Is Wrong About Bitcoin',
    channelName: 'Crypto Daily',
    thumbnailUrl: 'https://i.ytimg.com/vi/sample4/hqdefault.jpg',
    viewCount: 950000,
    viralScore: 76.2,
    engagementRate: 4.8,
    date: '2026-02-11T22:00:00Z',
    url: 'https://youtube.com/watch?v=sample4'
  },
  {
    id: 'outlier-005',
    title: 'The Silent Recession Nobody Is Talking About',
    channelName: 'Economic Observer',
    thumbnailUrl: 'https://i.ytimg.com/vi/sample5/hqdefault.jpg',
    viewCount: 1500000,
    viralScore: 82.4,
    engagementRate: 7.3,
    date: '2026-02-10T14:15:00Z',
    url: 'https://youtube.com/watch?v=sample5'
  },
  {
    id: 'outlier-006',
    title: 'My YouTube Studio Tour 2026',
    channelName: 'Creator Central',
    thumbnailUrl: 'https://i.ytimg.com/vi/sample6/hqdefault.jpg',
    viewCount: 450000,
    viralScore: 45.8,
    engagementRate: 5.2,
    date: '2026-02-09T11:30:00Z',
    url: 'https://youtube.com/watch?v=sample6'
  }
];

/**
 * OutlierResearchView
 * 
 * Research page for viewing and analyzing outlier videos.
 * Features the OutlierRankedList component with seen/unseen tracking.
 */
export default function OutlierResearchView() {
  const [outliers, setOutliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutlier, setSelectedOutlier] = useState(null);

  // Simulate fetching outliers
  useEffect(() => {
    // In production, this would fetch from an API
    const fetchOutliers = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setOutliers(SAMPLE_OUTLIERS);
      setLoading(false);
    };

    fetchOutliers();
  }, []);

  const handleOutlierClick = (outlier) => {
    setSelectedOutlier(outlier);
    // In production, this might open a detail modal or navigate to the video
    console.log('Clicked outlier:', outlier);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Outlier Research</h1>
          <p className="text-gray-400 text-sm mt-1">
            Track and analyze viral video patterns. Click any video to mark it as seen.
          </p>
        </div>
        
        {/* Stats Summary */}
        <div className="flex space-x-4">
          <div className="bg-gray-800 px-4 py-2 rounded-lg text-center">
            <p className="text-2xl font-bold text-white">{outliers.length}</p>
            <p className="text-xs text-gray-400 uppercase">Total</p>
          </div>
          <div className="bg-gray-800 px-4 py-2 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-400">
              {outliers.filter(o => (o.viralScore || 0) >= 80).length}
            </p>
            <p className="text-xs text-gray-400 uppercase">High Viral</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-800/50 rounded-lg p-4 text-sm">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-gray-300">Unseen (bold text)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
            <span className="text-gray-300">Seen (normal text)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400">
              90+
            </span>
            <span className="text-gray-300">High viral score</span>
          </div>
        </div>
      </div>

      {/* Outlier List */}
      <OutlierRankedList 
        outliers={outliers}
        onOutlierClick={handleOutlierClick}
      />

      {/* Selected Outlier Detail */}
      {selectedOutlier && (
        <div className="bg-gray-800 rounded-xl p-6 mt-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-white">Selected Outlier</h3>
            <button
              onClick={() => setSelectedOutlier(null)}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-white font-medium">{selectedOutlier.title}</h4>
              <p className="text-gray-400 text-sm mt-1">{selectedOutlier.channelName}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {selectedOutlier.viewCount >= 1000000 
                    ? (selectedOutlier.viewCount / 1000000).toFixed(1) + 'M'
                    : (selectedOutlier.viewCount / 1000).toFixed(1) + 'K'}
                </p>
                <p className="text-xs text-gray-400">Views</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">{selectedOutlier.viralScore}</p>
                <p className="text-xs text-gray-400">Viral Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{selectedOutlier.engagementRate}%</p>
                <p className="text-xs text-gray-400">Engagement</p>
              </div>
            </div>
          </div>
          
          {selectedOutlier.url && (
            <div className="mt-4">
              <a
                href={selectedOutlier.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
                Watch on YouTube
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}