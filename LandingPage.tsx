import React from 'react';
import {
  Sparkles,
  Bot,
  Search,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Award,
  Zap,
  Mic,
  BrainCircuit,
  HelpCircle,
  Users,
} from 'lucide-react';

interface LandingPageProps {
  setActiveTab: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActiveTab }) => {
  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Next-Gen College Career & Safety Platform</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Your Campus. Your Career.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600">
                One Smart Platform.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
              Practice smarter interviews and reconnect lost belongings with AI-powered campus technology.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setActiveTab('interview-setup')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Bot className="w-5 h-5" />
                Start AI Interview
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('lost-found')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border-2 border-slate-200 shadow-xs hover:border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-5 h-5 text-blue-600" />
                Find Lost Items
              </button>
            </div>

            {/* Trust badge */}
            <div className="pt-6 flex items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                No setup required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Adaptive AI questioning
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                94% item match rate
              </span>
            </div>
          </div>

          {/* Interactive Feature Cards Grid */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: AI Interview */}
            <div
              onClick={() => setActiveTab('interview-setup')}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center justify-between">
                AI Interview
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Adaptive 1-on-1 interview practice with real-time follow-up questions tailored to your resume, role, and difficulty level.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                <Mic className="w-3.5 h-3.5" />
                Voice & text response enabled
              </div>
            </div>

            {/* Card 2: Lost & Found */}
            <div
              onClick={() => setActiveTab('lost-found')}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-500/40 transition-all duration-300 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center justify-between">
                Lost & Found
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Instantly catalog lost or discovered calculators, ID cards, keys, and laptops across university buildings.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                Privacy-protected contact
              </div>
            </div>

            {/* Card 3: Smart Matching */}
            <div
              onClick={() => setActiveTab('matches')}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-indigo-500/40 transition-all duration-300 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center justify-between">
                Smart Matching
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Multimodal AI evaluates timestamps, locations, colors, stickers, and descriptions to compute instant match probabilities.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
                <Zap className="w-3.5 h-3.5" />
                Up to 96% match confidence
              </div>
            </div>

            {/* Card 4: Student Dashboard */}
            <div
              onClick={() => setActiveTab('dashboard')}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-teal-500/40 transition-all duration-300 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center justify-between">
                Student Dashboard
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition-colors" />
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Track readiness benchmarks across technical knowledge, communication, confidence, and active item claims in real time.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-teal-700">
                <Award className="w-3.5 h-3.5" />
                Readiness tier: 84% Ready
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Module 1 Spotlight: AI Interview Simulator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <Bot className="w-3.5 h-3.5" />
                Module 1 — AI Interview Simulator
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-snug">
                Personalized Questions that adapt dynamically to your answers.
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Unlike static mock banks, CampusConnect AI behaves like a genuine hiring bar-raiser. It analyzes your skill tree, asks focused technical or HR questions, evaluates answer clarity, and poses intelligent follow-ups on the fly.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-xs text-slate-300">
                    <strong className="text-white">Dynamic Difficulty:</strong> Ramps up or simplifies questions based on candidate depth and confidence.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-xs text-slate-300">
                    <strong className="text-white">6-Metric Evaluation:</strong> Technical Knowledge, Communication, Clarity, Confidence, Relevance, Problem Solving.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-xs text-slate-300">
                    <strong className="text-white">AI Improved Answer:</strong> Shows exemplary rephrasing with quantifiable impact metrics.
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('interview-setup')}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                Launch Interview Simulator
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Visual Simulator Preview Card */}
            <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs text-slate-400 font-mono">live-mock-session</span>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Question 2 of 5
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Bot className="w-4 h-4" />
                  AI Interviewer (Technical Full Stack)
                </div>
                <p className="text-xs text-slate-200 italic leading-relaxed">
                  "You mentioned using React state in your project. What specific problem did React help you solve, and how did you prevent unnecessary component re-renders?"
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Candidate Response Analysis</span>
                  <span className="text-emerald-400 font-bold">Score: 88/100</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[88%]"></div>
                </div>
                <p className="text-[11px] text-slate-300">
                  ✓ Strong explanation of React memoization and stable callback handlers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Module 2 Spotlight: Campus Lost & Found */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6 order-2 lg:order-1">
              {/* Item Match Preview Card */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      94% AI Match Confidence
                    </span>
                    <span className="text-xs text-slate-500">Central Library</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">Today</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                      Lost Item Report
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">Casio fx-991EX</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Black & Silver, blue NASA sticker</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-300 ring-2 ring-emerald-500/20">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                      Found Item Report
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">Scientific Calculator</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Casio, found on 2nd floor desk #14</p>
                  </div>
                </div>

                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900 leading-snug">
                  🤖 <strong>AI Verification:</strong> High correlation across location (Central Library), brand (Casio), category (Calculator), and unique identifier (NASA sticker).
                </div>
              </div>
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                <Search className="w-3.5 h-3.5" />
                Module 2 — Campus Lost & Found Portal
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug">
                Never lose a campus belonging again.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                From high-value items like laptops and wallets to student essentials like scientific calculators, smart ID cards, and lab manuals, CampusConnect AI connects seekers with finders safely and quickly.
              </p>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">Privacy-First</h4>
                  <p className="text-slate-500">Contact finders through secure in-app messaging without exposing phone numbers.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">Moderator Verified</h4>
                  <p className="text-slate-500">Student council moderators verify reports and coordinate safe returns.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('report-lost')}
                  className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Report Lost Item
                </button>
                <button
                  onClick={() => setActiveTab('report-found')}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Report Found Item
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-3xl sm:text-4xl font-black text-emerald-600">84%</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Average Readiness Score</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-3xl sm:text-4xl font-black text-blue-600">1,240+</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Mock Interviews Completed</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-3xl sm:text-4xl font-black text-teal-600">74%</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Belongings Reunited Rate</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-3xl sm:text-4xl font-black text-indigo-600">&lt; 30s</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">AI Match Notification</p>
          </div>
        </div>
      </section>
    </div>
  );
};
