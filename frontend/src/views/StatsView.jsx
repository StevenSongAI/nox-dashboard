import React, { useState, useEffect } from 'react';

export default function StatsView() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stats/overview');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch stats');
      }

      setStats(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Entries</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalEntries.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Last 7 Days</p>
          <p className="text-3xl font-bold text-green-600">{stats.recentEntries}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Last 30 Days</p>
          <p className="text-3xl font-bold text-blue-600">{stats.monthlyEntries}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Avg Confidence</p>
          <p className="text-3xl font-bold text-purple-600">{stats.avgConfidence}</p>
        </div>
      </div>

      {/* Categories Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Entries by Category</h2>
        <div className="space-y-3">
          {stats.categories.map((cat) => (
            <div key={cat.category} className="flex items-center">
              <div className="w-32 text-sm text-gray-600">{cat.category}</div>
              <div className="flex-1 mx-4">
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{
                      width: `${(cat.count / stats.totalEntries) * 100}%`
                    }}
                  />
                </div>
              </div>
              <div className="w-16 text-right text-sm font-medium text-gray-900">
                {cat.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Tags */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Tags</h2>
        <div className="flex flex-wrap gap-2">
          {stats.topTags.map((tag) => (
            <span
              key={tag.tag}
              className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
            >
              {tag.tag} ({tag.count})
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
