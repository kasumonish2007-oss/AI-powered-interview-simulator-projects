import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { InterviewSession } from '../../types';
import {
  History,
  Bot,
  Award,
  ChevronRight,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';

interface InterviewHistoryPageProps {
  setActiveTab: (tab: string) => void;
  onSelectSession?: (session: InterviewSession) => void;
}

export const InterviewHistoryPage: React.FC<InterviewHistoryPageProps> = ({
  setActiveTab,
  onSelectSession,
}) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDetail, setSelectedDetail] = useState<InterviewSession | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.getInterviewHistory();
        setHistory(data);
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Interview History & Analytics</h1>
          <p className="text-xs text-slate-500">
            Review past mock performance reports, questions answered, and growth metrics
          </p>
        </div>
        <button
          onClick={() => setActiveTab('interview-setup')}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 self-start cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Start New Mock
        </button>
      </div>

      {/* History Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading interview sessions...</div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <History className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Interview History Yet</h3>
            <p className="text-xs text-slate-500">Complete your first AI mock interview to track readiness.</p>
            <button
              onClick={() => setActiveTab('interview-setup')}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
            >
              Start First Interview
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Target Role</th>
                  <th className="py-3.5 px-6">Type & Level</th>
                  <th className="py-3.5 px-6">Score</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {history.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => setSelectedDetail(item)}
                  >
                    <td className="py-4 px-6 font-mono text-slate-600">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {item.role}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      <div>{item.interviewType}</div>
                      <span className="text-[10px] text-slate-400">{item.difficulty}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 font-mono">
                          {item.overallScore || 'N/A'}%
                        </span>
                        {item.overallScore && item.overallScore >= 80 && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDetail(item);
                        }}
                        className="text-xs font-bold text-emerald-600 group-hover:text-emerald-700 flex items-center gap-1 ml-auto"
                      >
                        View Report <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail Breakdown */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {selectedDetail.interviewType}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">{selectedDetail.role}</h3>
                <p className="text-xs text-slate-500">
                  {new Date(selectedDetail.createdAt).toLocaleDateString()} • Score:{' '}
                  <span className="font-bold text-emerald-600 font-mono">
                    {selectedDetail.overallScore}%
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedDetail(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions breakdown */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Questions & Answers Log ({selectedDetail.questions.length})
              </h4>
              <div className="space-y-4">
                {selectedDetail.questions.map((q, idx) => (
                  <div key={q.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-700">Question {idx + 1}</span>
                      {q.evaluation?.overallScore && (
                        <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          Score: {q.evaluation.overallScore}%
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-slate-900">"{q.question}"</p>
                    {q.candidateAnswer ? (
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 italic">
                        "{q.candidateAnswer}"
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">No answer recorded</p>
                    )}
                    {q.evaluation && (
                      <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-emerald-900">
                        <p className="font-bold mb-1">AI Evaluator Feedback:</p>
                        <p>{q.evaluation.summaryFeedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDetail(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
