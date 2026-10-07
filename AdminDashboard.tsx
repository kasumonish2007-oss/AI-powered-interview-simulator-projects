import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { AdminStats, User, LostFoundItem } from '../../types';
import {
  ShieldAlert,
  Users,
  Bot,
  Search,
  CheckCircle2,
  AlertTriangle,
  Award,
  Trash2,
  TrendingUp,
  BarChart3,
  Layers,
  CheckCheck,
} from 'lucide-react';

interface AdminDashboardProps {
  setActiveTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [itemsList, setItemsList] = useState<LostFoundItem[]>([]);
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'users' | 'items' | 'reports'>('overview');
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [s, u, itms, reps] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getItems(),
        api.getAdminReports(),
      ]);
      setStats(s);
      setUsersList(u);
      setItemsList(itms);
      setReportsList(reps);
    } catch (err: any) {
      error(err.message || 'Failed to load administration data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole);
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u))
      );
      success('User role updated successfully');
    } catch (err: any) {
      error(err.message || 'Failed to update user role');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to remove this listing?')) return;
    try {
      await api.deleteItem(itemId);
      setItemsList((prev) => prev.filter((i) => i.id !== itemId));
      success('Listing removed from campus portal');
    } catch (err: any) {
      error(err.message || 'Failed to remove item');
    }
  };

  const handleResolveReport = async (reportId: string, action: 'resolve' | 'dismiss' | 'remove_item') => {
    try {
      await api.resolveReport(reportId, action);
      success(`Report ${action} completed`);
      loadAdminData();
    } catch (err: any) {
      error(err.message || 'Failed to resolve report');
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
            <span>Campus Administration & Moderator Control</span>
          </div>
          <h1 className="text-2xl font-black text-white">Campus Affairs Dashboard</h1>
          <p className="text-xs text-slate-300">
            Logged in as {user?.name} ({user?.role.toUpperCase()})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'overview' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'users' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Users ({usersList.length})
          </button>
          <button
            onClick={() => setActiveSubTab('items')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'items' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Listings ({itemsList.length})
          </button>
          <button
            onClick={() => setActiveSubTab('reports')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'reports' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Reports
            {reportsList.filter((r) => r.status === 'pending').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            )}
          </button>
        </div>
      </div>

      {/* Top 7 Metrics Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center space-y-1">
          <p className="text-xs font-bold text-slate-400">Total Students</p>
          <p className="text-2xl font-black text-slate-900">{stats?.totalStudents || 8}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center space-y-1">
          <p className="text-xs font-bold text-slate-400">Interviews</p>
          <p className="text-2xl font-black text-slate-900">{stats?.totalInterviews || 5}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center space-y-1">
          <p className="text-xs font-bold text-slate-400">Avg Readiness</p>
          <p className="text-2xl font-black text-emerald-600">{stats?.avgScore || 82}%</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center space-y-1">
          <p className="text-xs font-bold text-slate-400">Lost Items</p>
          <p className="text-2xl font-black text-rose-600">{stats?.lostItems || 10}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center space-y-1">
          <p className="text-xs font-bold text-slate-400">Found Items</p>
          <p className="text-2xl font-black text-blue-600">{stats?.foundItems || 10}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center space-y-1">
          <p className="text-xs font-bold text-slate-400">Returned Items</p>
          <p className="text-2xl font-black text-teal-600">{stats?.returnedItems || 1}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center space-y-1">
          <p className="text-xs font-bold text-slate-400">Disputes</p>
          <p className="text-2xl font-black text-amber-600">{stats?.pendingReports || 1}</p>
        </div>
      </div>

      {/* Subtab 1: Overview & Analytics */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Trend Bars */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Monthly Platform Activity Trends
              </h3>
              <div className="space-y-3 pt-2">
                {(stats?.monthlyTrends || []).map((m) => (
                  <div key={m.month} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>{m.month} 2026</span>
                      <span>
                        {m.interviews} Mocks • {m.lost} Lost • {m.returned} Reunited
                      </span>
                    </div>
                    <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 gap-0.5">
                      <div
                        className="bg-emerald-500 h-full"
                        style={{ width: `${m.interviews}%` }}
                        title="Interviews"
                      ></div>
                      <div
                        className="bg-rose-400 h-full"
                        style={{ width: `${m.lost}%` }}
                        title="Lost Reports"
                      ></div>
                      <div
                        className="bg-blue-500 h-full"
                        style={{ width: `${m.returned * 2}%` }}
                        title="Returned Items"
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-4 text-[10px] text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span> Mock Interviews
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-rose-400 rounded-sm"></span> Lost Reports
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span> Returned & Resolved
                </span>
              </div>
            </div>

            {/* Interview Types Distribution */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                Interview Types & Benchmark Scores
              </h3>
              <div className="space-y-3 pt-2">
                {(stats?.interviewTypeBreakdown || []).map((t) => (
                  <div key={t.type} className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-800">{t.type}</span>
                      <span className="font-mono text-slate-600">
                        Avg: <strong className="text-emerald-600">{t.avgScore}%</strong> ({t.count} sessions)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${t.avgScore}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Users Management Table */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Student & Staff Accounts</h3>
              <p className="text-xs text-slate-500">Manage user roles, departments, and permissions</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Email / Student ID</th>
                  <th className="py-3 px-6">Department & Year</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&auto=format&fit=crop&q=80'}
                          alt={u.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      <div>{u.email}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{u.studentId}</span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      <div>{u.department}</div>
                      <span className="text-[10px] text-slate-400">{u.year}</span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-indigo-100 text-indigo-800'
                            : u.role === 'moderator'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u.id, e.target.value)}
                        className="p-1 text-xs border border-slate-200 rounded-lg bg-slate-50 cursor-pointer"
                      >
                        <option value="student">Student</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 3: Lost & Found Listings Moderation */}
      {activeSubTab === 'items' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-slate-900">Active Campus Listings Moderation</h3>
            <p className="text-xs text-slate-500">Remove inappropriate listings, review reports, and verify safe custody</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Item</th>
                  <th className="py-3 px-6">Type</th>
                  <th className="py-3 px-6">Location & Date</th>
                  <th className="py-3 px-6">Reporter</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {itemsList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.image}
                          alt={item.itemName}
                          className="w-8 h-8 rounded-lg object-cover shrink-0"
                        />
                        <div>
                          <p className="truncate max-w-xs">{item.itemName}</p>
                          <span className="text-[10px] text-slate-400">{item.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.type === 'lost'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      <div className="truncate max-w-xs">{item.location}</div>
                      <span className="text-[10px] text-slate-400">{item.date}</span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      {item.reporterName}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 4: Reported Items / Dispute Resolution */}
      {activeSubTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">Reported Listings & Disputes</h3>

          {reportsList.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No reported listings pending review.</p>
          ) : (
            <div className="space-y-3">
              {reportsList.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-600">Report Flag #{r.id}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {r.status}
                      </span>
                    </div>
                    <p className="text-slate-800 font-semibold">
                      Reason: "{r.reason}" • Reported by {r.reporterName}
                    </p>
                    {r.item && (
                      <p className="text-slate-500">
                        Target Listing: <strong>{r.item.itemName}</strong> ({r.item.type})
                      </p>
                    )}
                  </div>

                  {r.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResolveReport(r.id, 'dismiss')}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-slate-700"
                      >
                        Dismiss Flag
                      </button>
                      <button
                        onClick={() => handleResolveReport(r.id, 'remove_item')}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 font-bold text-white"
                      >
                        Remove Listing
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
