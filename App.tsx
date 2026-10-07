import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { InterviewSetupPage } from './pages/interview/InterviewSetupPage';
import { InterviewSessionPage } from './pages/interview/InterviewSessionPage';
import { InterviewResultPage } from './pages/interview/InterviewResultPage';
import { InterviewHistoryPage } from './pages/interview/InterviewHistoryPage';
import { LostFoundDashboard } from './pages/lostfound/LostFoundDashboard';
import { ReportItemPage } from './pages/lostfound/ReportItemPage';
import { ItemDetailPage } from './pages/lostfound/ItemDetailPage';
import { MatchesPage } from './pages/lostfound/MatchesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboard } from './pages/admin/AdminDashboard';

import { InterviewSession } from './types';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('landing');

  // Active state for detailed views
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [completedSession, setCompletedSession] = useState<InterviewSession | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string>('item_lost_1');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-500">Loading CampusConnect AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'landing' && <LandingPage setActiveTab={setActiveTab} />}
        {activeTab === 'login' && <LoginPage setActiveTab={setActiveTab} />}
        {activeTab === 'register' && <RegisterPage setActiveTab={setActiveTab} />}
        {activeTab === 'dashboard' && (
          <StudentDashboard
            setActiveTab={setActiveTab}
            setSelectedItemId={setSelectedItemId}
          />
        )}

        {/* Interview Module */}
        {activeTab === 'interview-setup' && (
          <InterviewSetupPage
            onStartSession={(session) => {
              setActiveSession(session);
              setActiveTab('interview-session');
            }}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'interview-session' && activeSession && (
          <InterviewSessionPage
            session={activeSession}
            onFinishSession={(finished) => {
              setCompletedSession(finished);
              setActiveTab('interview-result');
            }}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'interview-result' && completedSession && (
          <InterviewResultPage
            session={completedSession}
            onRetry={() => setActiveTab('interview-setup')}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'interview-history' && (
          <InterviewHistoryPage
            setActiveTab={setActiveTab}
            onSelectSession={(sess) => {
              setCompletedSession(sess);
              setActiveTab('interview-result');
            }}
          />
        )}

        {/* Lost & Found Module */}
        {activeTab === 'lost-found' && (
          <LostFoundDashboard
            setActiveTab={setActiveTab}
            onSelectItem={(id) => {
              setSelectedItemId(id);
              setActiveTab('item-detail');
            }}
          />
        )}
        {activeTab === 'report-lost' && (
          <ReportItemPage
            initialType="lost"
            setActiveTab={setActiveTab}
            onItemCreated={(id) => {
              setSelectedItemId(id);
              setActiveTab('item-detail');
            }}
          />
        )}
        {activeTab === 'report-found' && (
          <ReportItemPage
            initialType="found"
            setActiveTab={setActiveTab}
            onItemCreated={(id) => {
              setSelectedItemId(id);
              setActiveTab('item-detail');
            }}
          />
        )}
        {activeTab === 'item-detail' && (
          <ItemDetailPage
            itemId={selectedItemId}
            setActiveTab={setActiveTab}
            onSelectMatchedItem={(id) => {
              setSelectedItemId(id);
              setActiveTab('item-detail');
            }}
          />
        )}
        {activeTab === 'matches' && (
          <MatchesPage
            onSelectItem={(id) => {
              setSelectedItemId(id);
              setActiveTab('item-detail');
            }}
            setActiveTab={setActiveTab}
          />
        )}

        {/* User & Administration */}
        {activeTab === 'notifications' && (
          <NotificationsPage
            setActiveTab={setActiveTab}
            onSelectItem={(id) => {
              setSelectedItemId(id);
              setActiveTab('item-detail');
            }}
          />
        )}
        {activeTab === 'profile' && <ProfilePage />}
        {activeTab === 'admin' && <AdminDashboard setActiveTab={setActiveTab} />}
      </main>

      <Footer setActiveTab={setActiveTab} />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
