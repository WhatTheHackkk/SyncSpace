import React from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  User,
  Award,
  Layers,
  ArrowRight,
  Code2,
} from 'lucide-react';

export default function PostCard({ post, onCountMeIn, isOwnPost }) {
  if (!post) return null;

  const event = post.eventId || {};
  const poster = post.posterId || {};

  // Format deadline date nicely
  const deadline = event.deadlineDate ? new Date(event.deadlineDate) : null;
  const isDeadlineValid = deadline && !isNaN(deadline.getTime());
  
  const formattedDate = isDeadlineValid
    ? deadline.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Ongoing';

  // Calculate days remaining
  let daysRemaining = null;
  if (isDeadlineValid) {
    const diffTime = deadline.getTime() - Date.now();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Parse requested skills string into chips
  const skillsList = post.requestedSkills
    ? post.requestedSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="group relative rounded-2xl bg-[#111726]/90 border border-slate-800/90 hover:border-indigo-500/40 p-5 sm:p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between">
      
      {/* Top Banner: Club & Points */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700/80">
              {event.organizingClub || 'Campus Society'}
            </span>
            {post.isSpecificRoleNeeded ? (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Specific Role
              </span>
            ) : (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Open Teammate
              </span>
            )}
          </div>

          {event.points !== undefined && (
            <div className="flex items-center gap-1 text-xs font-bold text-indigo-400 bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-800/40">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span>{event.points} pts</span>
            </div>
          )}
        </div>

        {/* Event Title */}
        <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-indigo-200 transition-colors tracking-tight line-clamp-2">
          {event.eventName || 'Unnamed Event'}
        </h3>

        {/* Deadline Information */}
        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Deadline: <strong className="text-slate-200 font-medium">{formattedDate}</strong></span>
          </div>

          {daysRemaining !== null && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                daysRemaining <= 3
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              <Clock className="w-3 h-3" />
              {daysRemaining > 0 ? `${daysRemaining} days left` : 'Due today'}
            </span>
          )}
        </div>

        {/* Poster Profile Row */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {poster.name ? poster.name.charAt(0) : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="text-xs font-semibold text-slate-200">
                  {poster.name || 'Anonymous Poster'}
                </span>
                {poster.semester && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-medium border border-indigo-800/60">
                    {poster.semester}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 font-mono block">
                {poster.collegeEmail}
              </span>
            </div>
          </div>
        </div>

        {/* Required Skills Section */}
        <div className="mt-4">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mb-2">
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Requested Skills / Stack:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skillsList.length > 0 ? (
              skillsList.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/70 transition"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">
                Any passionate teammate welcome
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer: Highly Visible "Count Me In" Button */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
        <div className="text-[11px] text-slate-500 hidden sm:block">
          One-click teammate matchmaking
        </div>
        
        <button
          type="button"
          onClick={() => onCountMeIn(post)}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all duration-200 shadow-lg ${
            isOwnPost
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-200" />
          <span>{isOwnPost ? 'Test Team-Up Notification' : 'Count Me In!'}</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

    </div>
  );
}
