import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Feed from './pages/Feed';

function AppContent() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0d14] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar onOpenCreatePost={() => setIsCreatePostOpen(true)} />

      {/* Main Routed Content */}
      <div className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <Feed
                isCreatePostOpen={isCreatePostOpen}
                setIsCreatePostOpen={setIsCreatePostOpen}
              />
            }
          />
          <Route
            path="/feed"
            element={
              <Feed
                isCreatePostOpen={isCreatePostOpen}
                setIsCreatePostOpen={setIsCreatePostOpen}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#090d16] py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">SyncSpace</span>
            <span>&bull;</span>
            <span>College-Exclusive Teammate Matchmaking</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Cohort Filtering Active
            </span>
            <span className="text-slate-600">|</span>
            <span>MERN MVP Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
