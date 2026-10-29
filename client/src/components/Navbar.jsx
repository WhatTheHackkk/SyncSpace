import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Sparkles, ShieldCheck, ChevronDown, Check, PlusCircle } from 'lucide-react';

export default function Navbar({ onOpenCreatePost }) {
  const { currentUser, switchUser, availableUsers } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-[#0a0d14]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                Sync<span className="gradient-text">Space</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <ShieldCheck className="w-3 h-3 text-indigo-400" />
                Campus Exclusive
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Hackathon & Tech Event Matchmaking
            </p>
          </div>
        </div>

        {/* User Switcher & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {onOpenCreatePost && (
            <button
              onClick={onOpenCreatePost}
              className="hidden md:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700/80 transition shadow-sm hover:text-white"
            >
              <PlusCircle className="w-4 h-4 text-indigo-400" />
              <span>Post Request</span>
            </button>
          )}

          {/* Quick Mock User Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              title="Click to switch simulated student account"
            >
              <div className={`h-7 w-7 rounded-lg bg-gradient-to-tr ${currentUser.avatarColor || 'from-indigo-500 to-purple-600'} flex items-center justify-center text-xs font-bold text-white shadow-inner`}>
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-xs font-medium text-slate-200">{currentUser.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {currentUser.semester}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono leading-none">
                  {currentUser.collegeEmail}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu to test semester filtering */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#111726] border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-2 border-b border-slate-800 mb-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Simulate Logged-In Student
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Test how the feed dynamically filters events based on semester eligibility.
                  </p>
                </div>
                <div className="space-y-1">
                  {availableUsers.map((user) => {
                    const isSelected = user.collegeEmail === currentUser.collegeEmail;
                    return (
                      <button
                        key={user.collegeEmail}
                        onClick={() => {
                          switchUser(user);
                          setDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition ${
                          isSelected
                            ? 'bg-indigo-600/20 text-white border border-indigo-500/30'
                            : 'hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`h-7 w-7 rounded-lg bg-gradient-to-tr ${user.avatarColor} flex items-center justify-center text-xs font-bold text-white`}>
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-medium text-slate-200">{user.name}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                                {user.semester}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {user.collegeEmail}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
