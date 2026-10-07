import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';

interface LoginPageProps {
  setActiveTab: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ setActiveTab }) => {
  const { login, switchRole } = useAuth();
  const [email, setEmail] = useState('alex.rivera@campusconnect.edu');
  const [password, setPassword] = useState('campus1234');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      setActiveTab('dashboard');
    }
  };

  const handleQuickDemo = async (role: 'student' | 'admin' | 'moderator') => {
    setLoading(true);
    await switchRole(role);
    setLoading(false);
    setActiveTab(role === 'admin' ? 'admin' : 'dashboard');
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 mx-auto flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
        <p className="text-xs text-slate-500">Log in to your CampusConnect AI portal account</p>
      </div>

      {/* 1-Click Demo Login options */}
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>One-Click Instant Demo Login:</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemo('student')}
            className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-emerald-500 text-[11px] font-bold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 shadow-2xs transition-all cursor-pointer text-center"
          >
            Alex (Student)
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('moderator')}
            className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-amber-500 text-[11px] font-bold text-slate-700 hover:text-amber-700 hover:bg-amber-50 shadow-2xs transition-all cursor-pointer text-center"
          >
            Marcus (Mod)
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('admin')}
            className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-indigo-500 text-[11px] font-bold text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 shadow-2xs transition-all cursor-pointer text-center"
          >
            Dr. Elena (Admin)
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Campus Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="student@campusconnect.edu"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Default demo password: campus1234</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'Sign In to CampusConnect'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-500">
          Don't have an account?{' '}
          <button
            onClick={() => setActiveTab('register')}
            className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
          >
            Register Student ID
          </button>
        </p>
      </div>
    </div>
  );
};
