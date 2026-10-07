import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { LostFoundItem } from '../../types';
import {
  Search,
  PlusCircle,
  Filter,
  MapPin,
  Calendar,
  Tag,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';

interface LostFoundDashboardProps {
  setActiveTab: (tab: string) => void;
  onSelectItem: (itemId: string) => void;
}

export const LostFoundDashboard: React.FC<LostFoundDashboardProps> = ({
  setActiveTab,
  onSelectItem,
}) => {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'lost' | 'found'>('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const categories = [
    'All',
    'ID Card',
    'Books',
    'Calculator',
    'Bottle',
    'Bag',
    'Laptop',
    'Electronics',
    'Wallet',
    'Keys',
    'Clothing',
    'Documents',
    'Other',
  ];

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await api.getItems({
        search: searchTerm || undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
      });
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedType, selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems();
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Top Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
              <Search className="w-3.5 h-3.5 text-blue-400" />
              <span>Campus Security & Safety Network</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Lost & Found Campus Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Search for your lost belongings or help someone find what they lost with AI-powered description and location matching.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('report-lost')}
              className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              + Report Lost Item
            </button>
            <button
              onClick={() => setActiveTab('report-found')}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              + Report Found Item
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className="px-4 py-3 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold text-xs border border-indigo-400/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              AI Matches Matrix
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Panel */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by item name, description, brand, Casio, Casio calculator, blue Hydro Flask..."
              className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
          {/* Lost / Found toggle */}
          <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedType === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              All Items ({items.length})
            </button>
            <button
              onClick={() => setSelectedType('lost')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedType === 'lost' ? 'bg-rose-500 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Lost Only
            </button>
            <button
              onClick={() => setSelectedType('found')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedType === 'found' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Found Only
            </button>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active (Open)</option>
              <option value="returned">Returned / Resolved</option>
            </select>
          </div>
        </div>

        {/* Categories Chip Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-bold shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Item Listings Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading campus listings...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 space-y-3">
          <Search className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No items matching your search criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, clearing filters, or report a new lost or found item.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setSelectedType('all');
              setSelectedStatus('All');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onSelectItem(item.id);
                setActiveTab('item-detail');
              }}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 cursor-pointer flex flex-col group"
            >
              {/* Photo Box */}
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.itemName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Status & Type Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs ${
                      item.type === 'lost'
                        ? 'bg-rose-500 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {item.type}
                  </span>
                  {item.status === 'returned' && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900/90 text-white backdrop-blur-xs">
                      Returned
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 text-slate-800 backdrop-blur-xs shadow-xs">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-extrabold text-sm text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {item.itemName}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-medium">{item.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {new Date(item.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      View Details <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
