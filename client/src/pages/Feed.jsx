import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import Modal from '../components/Modal';
import CreatePostModal from '../components/CreatePostModal';
import {
  Sparkles,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  Users,
  Compass,
  CheckCircle,
  HelpCircle,
  Shield,
  Layers,
} from 'lucide-react';

export default function Feed({ isCreatePostOpen, setIsCreatePostOpen }) {
  const { currentUser, switchUser, availableUsers } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPostForModal, setSelectedPostForModal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch feed strictly filtered by user's semester
  const fetchFeed = useCallback(async () => {
    if (!currentUser?.semester) return;
    setLoading(true);
    setError(null);

    try {
      const semesterParam = encodeURIComponent(currentUser.semester);
      const res = await api.get(`/feed/${semesterParam}`);
      
      const fetchedPosts = Array.isArray(res.data)
        ? res.data
        : res.data.posts || [];

      setPosts(fetchedPosts);
    } catch (err) {
      console.error('Error loading feed:', err);
      setError(
        err.response?.data?.message ||
        'Unable to connect to the SyncSpace API. Please ensure your backend server and MongoDB are running.'
      );
    } finally {
      setLoading(false);
    }
  }, [currentUser?.semester]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleCountMeIn = (post) => {
    setSelectedPostForModal(post);
    setIsModalOpen(true);
  };

  const handleJoinSuccess = (postId) => {
    setToastMessage(`Matchmaking request sent successfully! Notification email dispatched.`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Live client-side search filtering (by event name, club, or skills)
  const filteredPosts = posts.filter((post) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const eventName = post.eventId?.eventName?.toLowerCase() || '';
    const club = post.eventId?.organizingClub?.toLowerCase() || '';
    const skills = post.requestedSkills?.toLowerCase() || '';
    const poster = post.posterId?.name?.toLowerCase() || '';

    return (
      eventName.includes(term) ||
      club.includes(term) ||
      skills.includes(term) ||
      poster.includes(term)
    );
  });

  return (
    <div className="min-h-screen pb-16 bg-[#0a0d14]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-950/95 border border-indigo-500/50 text-indigo-100 shadow-2xl backdrop-blur-md text-xs font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Hero & Feed Filter Info Header */}
      <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-indigo-950/30 via-[#0d121f] to-[#0a0d14] pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Semester-Filtered Campus Matchmaking</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Teammates for Hackathons, <br className="hidden sm:block" />
                <span className="gradient-text">Zero Social Friction.</span>
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Browse verified campus requests tailored to your cohort. Events where you are not eligible are strictly filtered out in real-time.
              </p>
            </div>

            {/* Quick Interactive Semester Switcher Banner */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shrink-0 max-w-sm space-y-2.5 shadow-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Active Cohort Filter</span>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-600 text-white">
                  {currentUser.semester}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Testing filter accuracy? Switch between test profiles:
              </p>
              <div className="flex items-center gap-2">
                {availableUsers.slice(0, 2).map((user) => {
                  const isCurrent = user.collegeEmail === currentUser.collegeEmail;
                  return (
                    <button
                      key={user.collegeEmail}
                      onClick={() => switchUser(user)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition text-center ${
                        isCurrent
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                      }`}
                    >
                      {user.name.split(' ')[0]} ({user.semester})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Search & Stats Bar */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by event, skill (e.g. React, Python), or club..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-inner font-sans"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Refresh and Count */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs text-slate-400">
                Found <strong className="text-white font-semibold">{filteredPosts.length}</strong> matching {filteredPosts.length === 1 ? 'post' : 'posts'} for <span className="text-indigo-400 font-medium">{currentUser.semester}</span>
              </span>

              <button
                type="button"
                onClick={fetchFeed}
                disabled={loading}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition"
                title="Refresh feed"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Error State */}
        {error && (
          <div className="rounded-2xl bg-red-950/20 border border-red-800/40 p-6 text-center max-w-xl mx-auto space-y-3">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <h3 className="text-sm font-semibold text-white">Connection Notice</h3>
            <p className="text-xs text-red-300/80">{error}</p>
            <div className="pt-2">
              <button
                onClick={fetchFeed}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/60 border border-slate-800/60 p-6 space-y-4 animate-pulse"
              >
                <div className="flex justify-between">
                  <div className="h-5 w-24 bg-slate-800 rounded" />
                  <div className="h-5 w-16 bg-slate-800 rounded" />
                </div>
                <div className="h-6 w-3/4 bg-slate-800 rounded" />
                <div className="h-4 w-1/2 bg-slate-800 rounded" />
                <div className="h-10 bg-slate-800/80 rounded-xl" />
                <div className="flex gap-2 pt-2">
                  <div className="h-6 w-14 bg-slate-800 rounded" />
                  <div className="h-6 w-16 bg-slate-800 rounded" />
                  <div className="h-6 w-20 bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredPosts.length === 0 && (
          <div className="text-center py-16 px-4 max-w-md mx-auto space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Compass className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {searchTerm ? 'No matches found' : 'No posts for this cohort yet'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {searchTerm
                  ? `No posts matching "${searchTerm}". Try a different skill or event name.`
                  : `There are currently no events open to ${currentUser.semester} students. Switch cohort or create a new post.`}
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 border border-slate-700"
                >
                  Clear Search
                </button>
              )}
              {setIsCreatePostOpen && (
                <button
                  onClick={() => setIsCreatePostOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
                >
                  Create First Post
                </button>
              )}
            </div>
          </div>
        )}

        {/* Post Cards Grid */}
        {!loading && !error && filteredPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => {
              const isOwnPost = post.posterId?.collegeEmail === currentUser.collegeEmail;
              return (
                <PostCard
                  key={post._id}
                  post={post}
                  onCountMeIn={handleCountMeIn}
                  isOwnPost={isOwnPost}
                />
              );
            })}
          </div>
        )}

      </main>

      {/* Count Me In Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPostForModal(null);
        }}
        post={selectedPostForModal}
        onSuccess={handleJoinSuccess}
      />

      {/* Create Post Modal */}
      {setIsCreatePostOpen && (
        <CreatePostModal
          isOpen={isCreatePostOpen}
          onClose={() => setIsCreatePostOpen(false)}
          onPostCreated={() => {
            fetchFeed();
            setToastMessage('New teammate request published to feed!');
            setTimeout(() => setToastMessage(null), 5000);
          }}
        />
      )}
    </div>
  );
}
