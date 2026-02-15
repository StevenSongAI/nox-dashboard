import React from 'react';

/**
 * ErrorFallback - Visual display when an error is caught by ErrorBoundary
 */
function ErrorFallback({ error, errorInfo, onReload, onReset }) {
  const isDev = process.env.NODE_ENV === 'development';
  
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-gray-800 rounded-lg shadow-xl border border-red-900/50 overflow-hidden">
        {/* Header */}
        <div className="bg-red-900/20 px-6 py-4 border-b border-red-900/30">
          <div className="flex items-center space-x-3">
            <svg 
              className="w-8 h-8 text-red-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
            <div>
              <h2 className="text-xl font-bold text-white">Something went wrong</h2>
              <p className="text-gray-400 text-sm">The dashboard encountered an unexpected error</p>
            </div>
          </div>
        </div>

        {/* Error Details */}
        <div className="px-6 py-6">
          <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
            <p className="text-red-400 font-medium mb-2">
              {error?.message || 'Unknown error occurred'}
            </p>
            
            {isDev && errorInfo && (
              <details className="mt-4">
                <summary className="text-gray-400 cursor-pointer hover:text-gray-300 text-sm">
                  Show technical details
                </summary>
                <pre className="mt-3 p-3 bg-gray-950 rounded text-xs text-gray-400 overflow-x-auto">
                  {errorInfo.componentStack}
                </pre>
                {error?.stack && (
                  <pre className="mt-2 p-3 bg-gray-950 rounded text-xs text-gray-500 overflow-x-auto">
                    {error.stack}
                  </pre>
                )}
              </details>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onReload}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Reload Dashboard</span>
            </button>

            <button
              onClick={onReset}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Try Again</span>
            </button>

            <a
              href="/"
              className="flex items-center space-x-2 px-4 py-2 border border-gray-600 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Go Home</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800/50 px-6 py-3 border-t border-gray-700 text-center">
          <p className="text-gray-500 text-sm">
            If this error persists, please check the browser console for more details
            {isDev && ' (development mode - full stack traces enabled)'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ErrorFallback;
