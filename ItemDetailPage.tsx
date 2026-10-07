import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { LostFoundItem, ItemMatch } from '../../types';
import {
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Layers,
  X,
  User,
  Tag,
  Share2,
} from 'lucide-react';

interface ItemDetailPageProps {
  itemId: string;
  setActiveTab: (tab: string) => void;
  onSelectMatchedItem: (id: string) => void;
}

export const ItemDetailPage: React.FC<ItemDetailPageProps> = ({
  itemId,
  setActiveTab,
  onSelectMatchedItem,
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [item, setItem] = useState<LostFoundItem | null>(null);
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [loading, setLoading] = useState(true);

  // Contact Modal
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [contactInfo, setContactInfo] = useState(user?.email || '');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Dispute Report Modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Duplicate or suspicious listing');

  useEffect(() => {
    const loadItemData = async () => {
      setLoading(true);
      try {
        const itemData = await api.getItemById(itemId);
        setItem(itemData);

        // Fetch AI matches
        const matchesData = await api.getItemMatches(itemId);
        setMatches(matchesData.matches || []);
      } catch (err: any) {
        error(err.message || 'Failed to load item details');
      } finally {
        setLoading(false);
      }
    };
    loadItemData();
  }, [itemId]);

  const handleMarkReturned = async () => {
    if (!item) return;
    try {
      const updated = await api.markItemReturned(item.id);
      setItem(updated);
      success('Item marked as returned and resolved! 🎉');
    } catch (err: any) {
      error(err.message || 'Failed to mark as returned');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !messageText.trim()) return;

    setSendingMsg(true);
    try {
      await api.contactReporter(item.id, messageText.trim(), contactInfo);
      success(`Message delivered securely to ${item.reporterName}!`);
      setContactModalOpen(false);
      setMessageText('');
    } catch (err: any) {
      error(err.message || 'Failed to deliver message');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleReportListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    try {
      await api.reportItemDispute(item.id, reportReason);
      success('Listing submitted to campus moderator team for review.');
      setReportModalOpen(false);
    } catch (err: any) {
      error(err.message || 'Failed to submit report');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-400">Loading item details...</div>
    );
  }

  if (!item) {
    return (
      <div className="p-12 text-center space-y-3">
        <h3 className="text-sm font-bold text-slate-800">Item not found</h3>
        <button
          onClick={() => setActiveTab('lost-found')}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
        >
          Return to Lost & Found
        </button>
      </div>
    );
  }

  const isOwner = user?.id === item.userId;
  const isStaff = user?.role === 'admin' || user?.role === 'moderator';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Back button */}
      <button
        onClick={() => setActiveTab('lost-found')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Listings
      </button>

      {/* Main Item Detail Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Photo Column */}
          <div className="relative h-72 sm:h-96 md:h-full bg-slate-100 overflow-hidden">
            <img
              src={item.image}
              alt={item.itemName}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-md ${
                  item.type === 'lost' ? 'bg-rose-500' : 'bg-emerald-600'
                }`}
              >
                {item.type}
              </span>
              {item.status === 'returned' && (
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-900 text-white shadow-md">
                  Returned & Resolved
                </span>
              )}
            </div>
          </div>

          {/* Details Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                  {item.category}
                </span>
                <span className="text-xs font-mono text-slate-400">ID: {item.id}</span>
              </div>

              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  {item.itemName}
                </h1>
                {item.brand && (
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Brand: <span className="text-slate-800">{item.brand}</span>
                    {item.color && ` • Color: ${item.color}`}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1">
                <p className="font-bold text-slate-900">Description:</p>
                <p>{item.description}</p>
                {item.identifiers && (
                  <p className="pt-2 text-blue-900 font-medium border-t border-slate-200/80">
                    🔑 <strong>Unique Identifiers:</strong> {item.identifiers}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{new Date(item.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{item.time || '12:00 PM'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">Reported by {item.reporterName}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-3">
                {!isOwner && item.status !== 'returned' && (
                  <button
                    onClick={() => setContactModalOpen(true)}
                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    Contact Reporter
                  </button>
                )}

                {(isOwner || isStaff) && item.status !== 'returned' && (
                  <button
                    onClick={handleMarkReturned}
                    className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark as Returned
                  </button>
                )}

                <button
                  onClick={() => setReportModalOpen(true)}
                  className="py-3 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                  title="Report inappropriate listing"
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                🔒 Privacy Protected: Personal phone & student details are not shared publicly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Matches Suggestions Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                AI Suggested Matches ({matches.length})
              </h3>
              <p className="text-xs text-slate-500">
                Automated similarity comparison against opposite reports on campus
              </p>
            </div>
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No matching counterpart reports found currently. You will receive an automatic notification as soon as a match is submitted!
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((m) => (
              <div
                key={m.foundItemId}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  {m.item?.image && (
                    <img
                      src={m.item.image}
                      alt={m.item.itemName}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {m.item?.itemName || 'Candidate Item'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          m.matchScore >= 90
                            ? 'bg-emerald-100 text-emerald-800'
                            : m.matchScore >= 80
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {m.matchScore}% Confidence
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">{m.matchReason}</p>
                    <p className="text-[11px] text-slate-400">
                      Location: {m.item?.location} • Date: {m.item?.date}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onSelectMatchedItem(m.foundItemId)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 cursor-pointer"
                >
                  Inspect Matched Item
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Reporter Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Contact Reporter</h3>
                <p className="text-xs text-slate-500">Send a secure notification to {item.reporterName}</p>
              </div>
              <button
                onClick={() => setContactModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message
                </label>
                <textarea
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  required
                  placeholder="Hello, I believe this is my item / I found this item. Can we arrange to meet at the Campus Security Desk?"
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Return Contact (Email or Student Phone)
                </label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setContactModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingMsg}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  {sendingMsg ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Dispute Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Report Inappropriate Listing</h3>
              <button
                onClick={() => setReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportListing} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Reporting
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Duplicate or spam listing">Duplicate or spam listing</option>
                  <option value="Inaccurate description / False claim">Inaccurate description / False claim</option>
                  <option value="Inappropriate image or text">Inappropriate image or text</option>
                  <option value="Suspicious item ownership dispute">Suspicious item ownership dispute</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  Submit Flag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
