import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { NotificationItem } from '../types';
import {
  Sparkles,
  Bot,
  Search,
  Compass,
  Bell,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  CheckCheck,
  ChevronDown,
  Layers,
  Award,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout, switchRole } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    if (!user) return;
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Demo Role Switcher Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-slate-200">CampusConnect AI Prototype Environment</span>
          <span className="hidden sm:inline text-slate-400">• Role-based Access Active</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 hidden md:inline">Quick Demo Switch:</span>
          <div className="inline-flex rounded-lg p-0.5 bg-slate-800 border border-slate-700">
            <button
              onClick={() => switchRole('student')}
              className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
                user?.role === 'student'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => switchRole('moderator')}
              className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
                user?.role === 'moderator'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Moderator
            </button>
            <button
              onClick={() => switchRole('admin')}
              className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
                user?.role === 'admin'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">CampusConnect</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                Interview Simulator & Lost/Found
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('landing')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'landing'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('interview-setup')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'interview-setup' || activeTab === 'interview-session'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bot className="w-4 h-4 text-teal-600" />
              Interview Simulator
            </button>
            <button
              onClick={() => setActiveTab('lost-found')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'lost-found' || activeTab === 'report-lost' || activeTab === 'report-found'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4 text-blue-600" />
              Lost & Found
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'matches'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-600" />
              AI Matches
            </button>
            {(user?.role === 'admin' || user?.role === 'moderator') && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'text-indigo-700 bg-indigo-50 border border-indigo-200'
                    : 'text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-indigo-600" />
                Admin Panel
              </button>
            )}
          </nav>

          {/* Right Action Icons & User Dropdown */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Menu */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Notifications</h4>
                      <p className="text-xs text-slate-500">
                        {unreadCount} unread update{unreadCount === 1 ? '' : 's'}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setNotifOpen(false);
                            if (n.type === 'match') setActiveTab('matches');
                            else if (n.type === 'system') setActiveTab('dashboard');
                            else setActiveTab('notifications');
                          }}
                          className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                            !n.read ? 'bg-emerald-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-xs text-slate-900">{n.title}</span>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1"></span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-snug line-clamp-2">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-4 py-2 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        setNotifOpen(false);
                        setActiveTab('notifications');
                      }}
                      className="text-xs font-bold text-emerald-600 hover:underline"
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                >
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-300"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-slate-900 leading-tight">{user.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      {user.role}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                          {user.role}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">{user.department}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        setActiveTab('profile');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      View Student Profile
                    </button>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        setActiveTab('interview-history');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Award className="w-4 h-4 text-slate-400" />
                      Interview History
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                        setActiveTab('login');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('login')}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                >
                  Log In
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs shadow-emerald-500/20"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 shadow-lg">
          <button
            onClick={() => {
              setActiveTab('landing');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Home
          </button>
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-emerald-600" />
            Dashboard
          </button>
          <button
            onClick={() => {
              setActiveTab('interview-setup');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <Bot className="w-4 h-4 text-teal-600" />
            Interview Simulator
          </button>
          <button
            onClick={() => {
              setActiveTab('lost-found');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-blue-600" />
            Lost & Found Portal
          </button>
          <button
            onClick={() => {
              setActiveTab('matches');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            AI Matches Matrix
          </button>
          {(user?.role === 'admin' || user?.role === 'moderator') && (
            <button
              onClick={() => {
                setActiveTab('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-indigo-700 bg-indigo-50 flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 text-indigo-600" />
              Admin Management
            </button>
          )}
        </div>
      )}
    </header>
  );
};
