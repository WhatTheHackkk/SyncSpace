import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Mail,
  Send,
  Calendar,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function Modal({ isOpen, onClose, post, onSuccess }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  if (!isOpen || !post) return null;

  const eventName = post.eventId?.eventName || 'Hackathon / Event';
  const posterName = post.posterId?.name || 'Fellow Student';
  const posterEmail = post.posterId?.collegeEmail || '';
  const organizingClub = post.eventId?.organizingClub || 'Campus Club';

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/join', {
        postId: post._id,
        requesterEmail: currentUser.collegeEmail,
        posterEmail: posterEmail,
      });

      setResult(response.data);
      if (onSuccess) {
        onSuccess(post._id);
      }
    } catch (err) {
      console.error('Failed to submit join request:', err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        'Could not dispatch match request. Please check your backend connection.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Dark backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={!loading ? handleClose : undefined}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0f172a] border border-slate-700/80 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Glow */}
        <div className="relative bg-gradient-to-r from-indigo-900/50 via-slate-900 to-indigo-950/40 p-6 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Count Me In!
                </h3>
                <p className="text-xs text-slate-400">
                  Instant Matchmaking Team-up Request
                </p>
              </div>
            </div>
            {!loading && (
              <button
                onClick={handleClose}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Request Failed</p>
                <p className="mt-0.5 text-red-300/90">{error}</p>
              </div>
            </div>
          )}

          {result ? (
            /* Success confirmation */
            <div className="text-center py-4 space-y-4">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-white">
                  Match Request Sent!
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                  An automated email notification has been triggered to{' '}
                  <span className="text-indigo-300 font-mono font-medium">{posterEmail}</span>.
                </p>
              </div>

              {result.data?.emailPreviewUrl && (
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-left">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Nodemailer (Ethereal Sandbox)</span>
                    <a
                      href={result.data.emailPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      <span>View Sent Email</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition border border-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* Pending Confirmation View */
            <>
              {/* Event & Poster Summary Card */}
              <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-indigo-400">
                      Target Event
                    </span>
                    <h4 className="text-sm font-semibold text-white mt-0.5">
                      {eventName}
                    </h4>
                    <p className="text-xs text-slate-400">{organizingClub}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {post.eventId?.points || 0} pts
                  </span>
                </div>

                <div className="border-t border-slate-800/80 pt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Poster:</span>
                    <span className="text-slate-200 font-medium">{posterName}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {posterEmail}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">You (Requester):</span>
                    <span className="text-slate-200 font-medium">{currentUser.name}</span>
                    <span className="text-[10px] text-indigo-300 font-mono block">
                      {currentUser.collegeEmail}
                    </span>
                  </div>
                </div>

                {post.requestedSkills && (
                  <div className="border-t border-slate-800/80 pt-2.5">
                    <span className="text-[10px] text-slate-500 block">Skills requested by team:</span>
                    <span className="text-xs text-slate-300 font-mono">
                      {post.requestedSkills}
                    </span>
                  </div>
                )}
              </div>

              {/* Email Trigger Preview Callout */}
              <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-800/40 text-xs text-slate-300 space-y-1.5">
                <div className="flex items-center gap-1.5 text-indigo-300 font-semibold text-[11px]">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Notification Preview (Nodemailer Trigger)</span>
                </div>
                <p className="italic text-slate-200 bg-slate-900/60 p-2 rounded border border-slate-800">
                  "A student wants to team up with you for {eventName}! Check their profile."
                </p>
                <p className="text-[11px] text-slate-400">
                  The recipient can review your campus email (<span className="text-slate-300 font-mono">{currentUser.collegeEmail}</span>) and reply directly.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 font-semibold text-xs transition border border-slate-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Email...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Confirm & Connect</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
