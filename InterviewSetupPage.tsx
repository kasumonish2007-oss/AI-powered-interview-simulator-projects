import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { InterviewSession } from '../../types';
import {
  Bot,
  Sparkles,
  ArrowRight,
  Briefcase,
  Layers,
  Sliders,
  CheckCircle2,
  Tag,
  Building,
} from 'lucide-react';

interface InterviewSetupPageProps {
  onStartSession: (session: InterviewSession) => void;
  setActiveTab: (tab: string) => void;
}

export const InterviewSetupPage: React.FC<InterviewSetupPageProps> = ({
  onStartSession,
  setActiveTab,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [role, setRole] = useState(user?.targetRole || 'Full Stack Software Engineer');
  const [interviewType, setInterviewType] = useState('Technical Interview');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [targetCompany, setTargetCompany] = useState('Google / Top Tech');
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [skills, setSkills] = useState<string[]>(
    user?.skills || ['React', 'Node.js', 'System Design', 'PostgreSQL']
  );
  const [customSkill, setCustomSkill] = useState('');

  const rolePresets = [
    'Full Stack Software Engineer',
    'Frontend Developer',
    'Backend Engineer',
    'Machine Learning Engineer',
    'Cloud & DevOps Engineer',
    'Embedded Systems Engineer',
    'Product Manager',
    'Data Analyst',
  ];

  const interviewTypes = [
    {
      id: 'Technical Interview',
      title: 'Technical Interview',
      desc: 'Architecture, core algorithms, data flow, framework internals & trade-offs.',
    },
    {
      id: 'HR Interview',
      title: 'HR Interview',
      desc: 'Career aspirations, motivation, company fit, salary expectations, values.',
    },
    {
      id: 'Behavioral Interview',
      title: 'Behavioral Interview',
      desc: 'STAR method, conflict resolution, leadership, failure recovery, teamwork.',
    },
    {
      id: 'Coding Interview',
      title: 'Coding Interview',
      desc: 'Data structures, algorithm complexity (Big-O), code structure, edge cases.',
    },
    {
      id: 'Aptitude Interview',
      title: 'Aptitude Interview',
      desc: 'Logical reasoning, quantitative problem-solving, analytical deduction.',
    },
    {
      id: 'Mixed Interview',
      title: 'Mixed Comprehensive',
      desc: 'Blended technical scrutiny and behavioral questions replicating a final round.',
    },
  ];

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      setSkills([...skills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const session = await api.startInterview({
        role,
        interviewType,
        difficulty,
        skills,
        targetCompany,
        totalQuestions,
      });
      onStartSession(session);
    } catch (err: any) {
      alert(err.message || 'Failed to start interview session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white border border-slate-800 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
          <Bot className="w-3.5 h-3.5 text-emerald-400" />
          <span>Module 1 • Personalized AI Interview Simulator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Configure Your Mock Interview
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          The AI interviewer will analyze your profile and target role to generate adaptive questions, evaluate communication, confidence and technical depth, and challenge you with real-time follow-ups.
        </p>
      </div>

      <form onSubmit={handleStart} className="space-y-8">
        {/* Step 1: Target Role & Company */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            <span>Target Role & Focus</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Job Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
              {/* Presets */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {rolePresets.slice(0, 4).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-all ${
                      role === r
                        ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Company (Optional)
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="e.g. Google, Microsoft, Seed Stage AI Startup"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                The AI will tailor question framing to this company's interview style.
              </p>
            </div>
          </div>
        </div>

        {/* Step 2: Interview Type Selection */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
            <Layers className="w-5 h-5 text-teal-600" />
            <span>Select Interview Type</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {interviewTypes.map((t) => (
              <div
                key={t.id}
                onClick={() => setInterviewType(t.id)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  interviewType === t.id
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-bold text-xs text-slate-900">{t.title}</h4>
                  {interviewType === t.id && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Difficulty & Parameters */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <span>Difficulty & Format</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Difficulty */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Experience Level / Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      difficulty === lvl
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                {difficulty === 'Beginner' && 'Focuses on fundamentals, clear definitions and core concepts.'}
                {difficulty === 'Intermediate' && 'Tests real-world implementation, trade-offs and edge cases.'}
                {difficulty === 'Advanced' && 'Deep dive into system scale, race conditions, and optimization.'}
              </p>
            </div>

            {/* Questions count */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700">Number of Questions</label>
                <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {totalQuestions} Questions
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="8"
                step="1"
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>3 (Quick Mock ~10m)</span>
                <span>5 (Standard ~20m)</span>
                <span>8 (Full Drill ~35m)</span>
              </div>
            </div>
          </div>

          {/* Skills Tags Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Target Skills & Technologies Assessed
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder="Type a skill and press Enter (e.g. Docker, Redux, STAR, SQL)"
                className="flex-1 px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
              >
                Add Skill
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"
                >
                  <Tag className="w-3 h-3 text-emerald-600" />
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSkill(s)}
                    className="hover:text-rose-600 ml-1 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>AI Interviewer is generating personalized question 1...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Begin Live AI Interview</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
