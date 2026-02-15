import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import YouTubeView from './views/YouTubeView.jsx'
import BusinessView from './views/BusinessView.jsx'
import InvestmentsView from './views/InvestmentsView.jsx'
import ActivityView from './views/ActivityView.jsx'
import SearchView from './views/SearchView.jsx'
import GlobalSearch from './components/GlobalSearch.jsx'
import Navigation from './components/Navigation.jsx'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header with Navigation and Search */}
        <Navigation />
        
        {/* Global Search Bar */}
        <div className="fixed top-14 left-0 right-0 bg-gray-800 border-b border-gray-700 px-6 py-3 z-40">
          <div className="max-w-7xl mx-auto flex justify-center">
            <GlobalSearch />
          </div>
        </div>

        {/* Main Content */}
        <main className="pt-32 px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/youtube" element={<YouTubeView />} />
              <Route path="/business" element={<BusinessView />} />
              <Route path="/investments" element={<InvestmentsView />} />
              <Route path="/activity" element={<ActivityView />} />
              <Route path="/search" element={<SearchView />} />
              <Route path="/" element={<Navigate to="/youtube" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  )
}

export default App
