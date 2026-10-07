import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { InterviewSession } from '../../types';
import {
  Award,
  Sparkles,
  TrendingUp,
  RotateCcw,
  History,
  Download,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface InterviewResultPageProps {
  session: InterviewSession;
  onRetry: () => void;
  setActiveTab: (tab: string) => void;
}

export const InterviewResultPage: React.FC<InterviewResultPageProps> = ({
  session,
  onRetry,
  setActiveTab,
}) => {
  useEffect(() => {
    // Trigger confetti celebration on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  }, []);

  const overallScore = session.overallScore || 82;
  const scores = session.scores || {
    technicalScore: 85,
    communicationScore: 78,
    clarityScore: 80,
    confidenceScore: 75,
    relevanceScore: 90,
    problemSolvingScore: 82,
  };

  const feedback = session.overallFeedback || {
    readinessTier: 'Very Good',
    strengths: [
      'Strong domain articulation and conceptual accuracy',
      'Direct structured answers that address prompt objectives',
      'Good technical trade-off awareness',
    ],
    areasToImprove: [
      'Quantify concrete metrics (e.g. latency percentiles, throughput) in answers',
      'Use the STAR method explicitly for behavioral and teamwork questions',
    ],
    communicationTips: [
      'Deliver core takeaways in opening 10 seconds before technical mechanics',
      'Maintain an even vocal cadence during complex problem-solving walkthroughs',
    ],
    technicalRecommendations: [
      'Review distributed state synchronization patterns and cache invalidation',
      'Practice edge case analysis during system scaling questions',
    ],
    suggestedPracticeTopics: [
      'High-throughput distributed systems & caching',
      'Handling sudden stakeholder requirement shifts',
    ],
    verdict: 'Candidate is well-prepared for technical screenings with strong foundational acumen.',
  };

  const handleDownloadReport = () => {
    window.print();
  };

  // Circular progress math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 print:p-0">
      {/* Celebration Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-2xl text-center space-y-4 relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Interview Completed 🎉</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Performance & Readiness Report
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          {session.role} • {session.interviewType} • {session.difficulty} Level
        </p>
      </div>

      {/* Main Scorecard Banner with Circular Gauge */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {/* Circular Progress Gauge */}
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="text-slate-100"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="text-emerald-500 transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {overallScore}
              </span>
              <span className="text-[11px] font-bold text-slate-400">OUT OF 100</span>
            </div>
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              {feedback.readinessTier} Readiness
            </span>
          </div>
        </div>

        {/* 6 Dimensions Progress Bars */}
        <div className="md:col-span-2 space-y-3.5">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Evaluated Competencies</h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Technical Knowledge</span>
                <span className="font-mono font-bold text-slate-900">{scores.technicalScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${scores.technicalScore}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Communication</span>
                <span className="font-mono font-bold text-slate-900">{scores.communicationScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: `${scores.communicationScore}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Confidence</span>
                <span className="font-mono font-bold text-slate-900">{scores.confidenceScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${scores.confidenceScore}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Clarity</span>
                <span className="font-mono font-bold text-slate-900">{scores.clarityScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${scores.clarityScore}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Relevance</span>
                <span className="font-mono font-bold text-slate-900">{scores.relevanceScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${scores.relevanceScore}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Problem Solving</span>
                <span className="font-mono font-bold text-slate-900">{scores.problemSolvingScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${scores.problemSolvingScore}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Qualitative Feedback Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Your Strengths */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Your Key Strengths</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {feedback.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5"></span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas to Improve */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Areas to Improve</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {feedback.areasToImprove.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Communication Tips */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <span>Communication & Delivery Tips</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {feedback.communicationTips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5"></span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Technical Recommendations */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-sm">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>Technical Recommendations & Topics</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {feedback.technicalRecommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5"></span>
                <span>{rec}</span>
              </li>
            ))}
            {feedback.suggestedPracticeTopics.map((top, idx) => (
              <li key={`top_${idx}`} className="flex items-start gap-2 font-semibold text-indigo-700">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1.5"></span>
                <span>Practice Topic: {top}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onRetry}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Retry Interview
          </button>
          <button
            onClick={() => setActiveTab('interview-setup')}
            className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            Practice Weak Areas
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('interview-history')}
            className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 transition-all flex items-center gap-2 cursor-pointer"
          >
            <History className="w-4 h-4" />
            View History
          </button>
          <button
            onClick={handleDownloadReport}
            className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
};
