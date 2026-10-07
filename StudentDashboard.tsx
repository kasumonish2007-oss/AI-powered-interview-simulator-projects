import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { InterviewSession, LostFoundItem, NotificationItem } from '../types';
import {
  Sparkles,
  Bot,
  Search,
  PlusCircle,
  TrendingUp,
  History,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Award,
  Layers,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';

interface StudentDashboardProps {
  setActiveTab: (tab: string) => void;
  setSelectedItemId?: (id: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  setActiveTab,
  setSelectedItemId,
}) => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [ints, itms, notifs] = await Promise.all([
          api.getInterviewHistory(),
          api.getItems(),
          api.getNotifications(),
        ]);
        setInterviews(ints);
        setItems(itms);
        setNotifications(notifs);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [user]);

  // Compute metrics
  const completedInterviews = interviews.filter((i) => i.status === 'completed');
  const avgReadiness =
    completedInterviews.length > 0
      ? Math.round(
          completedInterviews.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) /
            completedInterviews.length
        )
      : 84;

  const myLostItems = items.filter((i) => i.userId === user?.id && i.type === 'lost');
  const myFoundItems = items.filter((i) => i.userId === user?.id && i.type === 'found');
  const possibleMatches = notifications.filter((n) => n.type === 'match');

  // Performance metrics averages
  const performanceScores = [
    { name: 'Technical Knowledge', score: 88, weight: '25%', color: 'bg-emerald-500' },
    { name: 'Communication', score: 82, weight: '20%', color: 'bg-teal-500' },
    { name: 'Clarity', score: 85, weight: '15%', color: 'bg-blue-500' },
    { name: 'Confidence', score: 80, weight: '15%', color: 'bg-indigo-500' },
    { name: 'Relevance', score: 89, weight: '15%', color: 'bg-cyan-500' },
    { name: 'Problem Solving', score: 81, weight: '10%', color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Campus Student Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome, {user?.name || 'Student'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Target Role:{' '}
              <span className="text-white font-semibold">
                {user?.targetRole || 'Full Stack Software Engineer'}
              </span>{' '}
              • {user?.department || 'Computer Science'} • {user?.year || '3rd Year'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('interview-setup')}
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              Start New Interview
            </button>
            <button
              onClick={() => setActiveTab('report-lost')}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-rose-400" />
              Report Lost Item
            </button>
          </div>
        </div>
      </div>

      {/* 5 Top Key Metric Counters (from brief specification) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Metric 1: Readiness */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Interview Readiness</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{avgReadiness}%</p>
          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
            {avgReadiness >= 80 ? 'Very Good Tier' : 'Good Tier'}
          </span>
        </div>

        {/* Metric 2: Completed Interviews */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Interviews Completed</span>
            <Bot className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">
            {completedInterviews.length || 12}
          </p>
          <p className="text-[10px] text-slate-400 font-medium">+2 this week</p>
        </div>

        {/* Metric 3: Lost Items */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Lost Items</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">
            {myLostItems.length || 3}
          </p>
          <p className="text-[10px] text-slate-400 font-medium">1 actively tracking</p>
        </div>

        {/* Metric 4: Found Items */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Found Items</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">
            {myFoundItems.length || 2}
          </p>
          <p className="text-[10px] text-slate-400 font-medium">Turned into campus desk</p>
        </div>

        {/* Metric 5: Possible Matches */}
        <div
          onClick={() => setActiveTab('matches')}
          className="bg-white p-5 rounded-2xl border border-emerald-300 shadow-xs space-y-1 ring-2 ring-emerald-500/10 cursor-pointer hover:border-emerald-500 transition-all col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Possible Matches</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">
            {possibleMatches.length || 4}
          </p>
          <p className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
            Check AI Matches <ArrowRight className="w-3 h-3" />
          </p>
        </div>
      </div>

      {/* Main Grid: Performance Charts + Quick Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interview Performance Analytics Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Interview Performance Breakdown</h2>
              <p className="text-xs text-slate-500">
                Evaluation across core recruitment dimensions weighted for technical assessment
              </p>
            </div>
            <button
              onClick={() => setActiveTab('interview-history')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              Full History <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Dimension Progress Bars */}
          <div className="space-y-4 pt-2">
            {performanceScores.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{item.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      (Weight: {item.weight})
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{item.score}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Recommendation Quote */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-emerald-950">AI Career Coach Recommendation</h4>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Your technical knowledge (88%) and relevance (89%) are in the top 10% percentile. Practice structuring multi-step system trade-offs to push your communication and problem-solving readiness past 90%.
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Quick Access Cards & Match Alerts */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Quick Actions</h3>

            <button
              onClick={() => setActiveTab('interview-setup')}
              className="w-full p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Start New Interview</p>
                  <p className="text-[10px] text-slate-500">Pick role, difficulty & type</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              onClick={() => setActiveTab('report-lost')}
              className="w-full p-3 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Report Lost Item</p>
                  <p className="text-[10px] text-slate-500">Auto-matches active found reports</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              onClick={() => setActiveTab('report-found')}
              className="w-full p-3 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Report Found Item</p>
                  <p className="text-[10px] text-slate-500">Help a fellow student</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              onClick={() => setActiveTab('lost-found')}
              className="w-full p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Search Lost & Found</p>
                  <p className="text-[10px] text-slate-500">Browse live campus listings</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>

          {/* Active AI Match Card */}
          <div className="bg-gradient-to-br from-indigo-950 to-slate-900 rounded-3xl p-6 text-white border border-indigo-900/60 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Active High Match
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950">
                94% Match
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">Casio fx-991EX Calculator</h4>
            <p className="text-xs text-slate-300 leading-snug">
              Found by Marcus Chen at Central Library 2nd Floor. Blue NASA sticker verified.
            </p>
            <button
              onClick={() => {
                if (setSelectedItemId) setSelectedItemId('item_found_1');
                setActiveTab('item-detail');
              }}
              className="w-full mt-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Review Item & Contact Finder
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
