import React from 'react';
import { Sparkles, ShieldCheck, Heart, MapPin, Mail, Phone, BookOpen } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">CampusConnect AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering college students with next-generation AI mock interviews and an intelligent campus lost & found network.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Campus Security & Placement Cell Verified</span>
            </div>
          </div>

          {/* Col 2: AI Interview Simulator */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 tracking-wide">Interview Simulator</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setActiveTab('interview-setup')} className="hover:text-emerald-400 transition-colors">
                  Technical Coding Interviews
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('interview-setup')} className="hover:text-emerald-400 transition-colors">
                  HR & Behavioral Mocks
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('interview-setup')} className="hover:text-emerald-400 transition-colors">
                  Adaptive AI Follow-Up Questions
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('interview-history')} className="hover:text-emerald-400 transition-colors">
                  Readiness Score & Benchmarks
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Lost & Found Portal */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 tracking-wide">Lost & Found Portal</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setActiveTab('report-lost')} className="hover:text-emerald-400 transition-colors">
                  Report a Lost Item
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('report-found')} className="hover:text-emerald-400 transition-colors">
                  Report a Found Belonging
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('matches')} className="hover:text-emerald-400 transition-colors">
                  AI Match Confidence Engine
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('lost-found')} className="hover:text-emerald-400 transition-colors">
                  Search Campus Listings
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Campus Helpdesk */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 tracking-wide">Campus Helpdesk</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Student Affairs, Central Block 2</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>support@campusconnect.edu</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Campus Safety Helpline: (555) 019-SAFE</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 CampusConnect AI. Built for collegiate excellence.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              Engineered with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for campus students
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
