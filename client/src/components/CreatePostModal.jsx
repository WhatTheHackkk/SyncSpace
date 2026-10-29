import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, Plus, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export default function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [requestedSkills, setRequestedSkills] = useState('');
  const [isSpecificRoleNeeded, setIsSpecificRoleNeeded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetchingEvents, setFetchingEvents] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchEvents();
    }
  }, [isOpen]);

  const fetchEvents = async () => {
    setFetchingEvents(true);
    try {
      const res = await api.get('/events');
      const list = res.data.events || [];
      setEvents(list);
      if (list.length > 0 && !selectedEventId) {
        setSelectedEventId(list[0]._id);
      }
    } catch (err) {
      console.warn('Could not fetch events list:', err.message);
    } finally {
      setFetchingEvents(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEventId || !requestedSkills.trim()) {
      setError('Please select an event and specify requested skills.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First ensure the user exists in DB or find user by collegeEmail
      const usersRes = await api.get('/users');
      const dbUsers = usersRes.data.users || [];
      const dbUser = dbUsers.find((u) => u.collegeEmail === currentUser.collegeEmail);

      const posterId = dbUser ? dbUser._id : dbUsers[0]?._id;

      if (!posterId) {
        throw new Error('No user found in database. Please run the seed script.');
      }

      await api.post('/posts', {
        posterId,
        eventId: selectedEventId,
        isSpecificRoleNeeded,
        requestedSkills,
      });

      if (onPostCreated) {
        onPostCreated();
      }
      onClose();
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />

      <div className="relative w-full max-w-md rounded-2xl bg-[#0f172a] border border-slate-700/80 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Create Teammate Request</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Select Upcoming Event</label>
            {fetchingEvents ? (
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">Loading events...</div>
            ) : (
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {events.map((evt) => (
                  <option key={evt._id} value={evt._id}>
                    {evt.eventName} ({evt.eligibleSemesters?.join(', ')})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Requested Skills (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. React, Node.js, UI/UX, Python"
              value={requestedSkills}
              onChange={(e) => setRequestedSkills(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs placeholder:text-slate-600"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="roleNeeded"
              checked={isSpecificRoleNeeded}
              onChange={(e) => setIsSpecificRoleNeeded(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
            />
            <label htmlFor="roleNeeded" className="text-slate-300 cursor-pointer select-none">
              Looking for a specific role or specialization
            </label>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-[11px] text-slate-400">
            Posting as <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.collegeEmail})
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/30"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Publish Post</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
