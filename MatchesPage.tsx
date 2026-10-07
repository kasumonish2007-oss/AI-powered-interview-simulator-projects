import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { LostFoundItem, ItemMatch } from '../../types';
import {
  Sparkles,
  Layers,
  ArrowRight,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface MatchesPageProps {
  onSelectItem: (id: string) => void;
  setActiveTab: (tab: string) => void;
}

export const MatchesPage: React.FC<MatchesPageProps> = ({
  onSelectItem,
  setActiveTab,
}) => {
  const [lostItems, setLostItems] = useState<LostFoundItem[]>([]);
  const [selectedLostId, setSelectedLostId] = useState<string>('');
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchingLoading, setMatchingLoading] = useState(false);

  useEffect(() => {
    const loadLostItems = async () => {
      try {
        const allItems = await api.getItems({ type: 'lost' });
        setLostItems(allItems);
        if (allItems.length > 0) {
          setSelectedLostId(allItems[0].id);
        }
      } catch (err) {
        console.error('Failed to load lost items:', err);
      } finally {
        setLoading(false);
      }
    };
    loadLostItems();
  }, []);

  useEffect(() => {
    if (!selectedLostId) return;
    const fetchMatchesForSelected = async () => {
      setMatchingLoading(true);
      try {
        const res = await api.getItemMatches(selectedLostId);
        setMatches(res.matches || []);
      } catch (err) {
        console.error('Failed to get matches:', err);
      } finally {
        setMatchingLoading(false);
      }
    };
    fetchMatchesForSelected();
  }, [selectedLostId]);

  const selectedLostItem = lostItems.find((i) => i.id === selectedLostId);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white border border-slate-800 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Multimodal Matching Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          AI Lost & Found Match Matrix
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          The engine computes weighted similarity across 6 dimensions: Item Name (30%), Description (20%), Location Proximity (20%), Date Proximity (10%), Brand/Color (10%), and Unique Identifiers (10%).
        </p>
      </div>

      {/* Select Lost Item Selector */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
        <label className="block text-xs font-bold text-slate-700">
          Select Lost Item to Analyze:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {lostItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedLostId(item.id)}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                selectedLostId === item.id
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <img
                src={item.image}
                alt={item.itemName}
                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
              />
              <div className="overflow-hidden">
                <p className="font-bold text-xs text-slate-900 truncate">{item.itemName}</p>
                <p className="text-[10px] text-slate-500 truncate">{item.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Comparison Card */}
      {selectedLostItem && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                Target Lost Item
              </span>
              <h2 className="text-lg font-black text-slate-900">{selectedLostItem.itemName}</h2>
              <p className="text-xs text-slate-500">
                {selectedLostItem.category} • {selectedLostItem.location} • {selectedLostItem.date}
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 self-start sm:self-auto">
              {matches.length} Candidate Matches Scored
            </span>
          </div>

          {/* Matches List */}
          {matchingLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Comparing embeddings & weighted vectors...
            </div>
          ) : matches.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching records found with &gt;=50% confidence.
            </div>
          ) : (
            <div className="space-y-6">
              {matches.map((m) => (
                <div
                  key={m.foundItemId}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-400 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {m.item?.image && (
                        <img
                          src={m.item.image}
                          alt={m.item.itemName}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-sm text-slate-900">
                            {m.item?.itemName}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              m.matchScore >= 90
                                ? 'bg-emerald-100 text-emerald-800'
                                : m.matchScore >= 80
                                ? 'bg-teal-100 text-teal-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {m.matchScore}% — {m.confidenceTier}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-snug">{m.matchReason}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Found by {m.item?.reporterName} near {m.item?.location} on {m.item?.date}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectItem(m.foundItemId);
                        setActiveTab('item-detail');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 cursor-pointer self-start sm:self-auto"
                    >
                      Inspect Match & Contact
                    </button>
                  </div>

                  {/* Factor Breakdown */}
                  {m.factors && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-3 border-t border-slate-200/80 text-[11px]">
                      <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                        <span className="text-slate-400 block text-[10px]">Item Sim (30%)</span>
                        <span className="font-bold text-slate-800 font-mono">
                          {m.factors.itemSimilarity}%
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                        <span className="text-slate-400 block text-[10px]">Desc (20%)</span>
                        <span className="font-bold text-slate-800 font-mono">
                          {m.factors.descriptionSimilarity}%
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                        <span className="text-slate-400 block text-[10px]">Location (20%)</span>
                        <span className="font-bold text-slate-800 font-mono">
                          {m.factors.locationSimilarity}%
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                        <span className="text-slate-400 block text-[10px]">Date (10%)</span>
                        <span className="font-bold text-slate-800 font-mono">
                          {m.factors.dateProximity}%
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                        <span className="text-slate-400 block text-[10px]">Brand/Color (10%)</span>
                        <span className="font-bold text-slate-800 font-mono">
                          {m.factors.colorBrandMatch}%
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                        <span className="text-slate-400 block text-[10px]">Identifiers (10%)</span>
                        <span className="font-bold text-slate-800 font-mono">
                          {m.factors.identifierMatch}%
                        </span>
                      </div>
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
