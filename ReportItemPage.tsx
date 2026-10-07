import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  PlusCircle,
  Upload,
  Image as ImageIcon,
  MapPin,
  Calendar,
  Clock,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface ReportItemPageProps {
  initialType?: 'lost' | 'found';
  setActiveTab: (tab: string) => void;
  onItemCreated?: (itemId: string) => void;
}

export const ReportItemPage: React.FC<ReportItemPageProps> = ({
  initialType = 'lost',
  setActiveTab,
  onItemCreated,
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [type, setType] = useState<'lost' | 'found'>(initialType);
  const [loading, setLoading] = useState(false);

  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Calculator');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:30');
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');
  const [identifiers, setIdentifiers] = useState('');
  const [contactPreference, setContactPreference] = useState<'in_app' | 'email' | 'phone'>('in_app');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop&q=80'
  );

  const categories = [
    'Calculator',
    'ID Card',
    'Electronics',
    'Bottle',
    'Bag',
    'Laptop',
    'Mobile Phone',
    'Wallet',
    'Keys',
    'Clothing',
    'Books',
    'Documents',
    'Other',
  ];

  const presetImages: Record<string, string> = {
    Calculator: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop&q=80',
    'ID Card': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    Electronics: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
    Bottle: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
    Wallet: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
    Bag: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    Keys: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
    Clothing: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80',
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCategory(val);
    if (presetImages[val]) {
      setImageUrl(presetImages[val]);
    }
  };

  // Image Upload handler
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      error('Image size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !description || !location || !date) {
      error('Please complete all required fields.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        itemName,
        category,
        description,
        image: imageUrl,
        location,
        date,
        time,
        color,
        brand,
        identifiers,
        contactPreference,
      };

      let createdItem;
      if (type === 'lost') {
        createdItem = await api.reportLostItem(payload);
        success(`Lost report submitted! AI matching active.`);
      } else {
        createdItem = await api.reportFoundItem(payload);
        success(`Found report submitted! Thank you for helping fellow students.`);
      }

      if (onItemCreated && createdItem.id) {
        onItemCreated(createdItem.id);
      }
      setActiveTab('lost-found');
    } catch (err: any) {
      error(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Campus Security Registry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {type === 'lost' ? 'Report a Lost Item' : 'Report a Found Item'}
        </h1>
        <p className="text-xs text-slate-500 max-w-lg mx-auto">
          Our intelligent AI matcher compares descriptions, locations, colors, and timestamps across student reports.
        </p>

        {/* Type Toggle */}
        <div className="pt-2 inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setType('lost')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              type === 'lost' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            I Lost Something
          </button>
          <button
            type="button"
            onClick={() => setType('found')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              type === 'found' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            I Found Something
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Item Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Item Name *
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
                placeholder="e.g. Casio fx-991EX Scientific Calculator"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Brand / Make</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Casio, Apple, Nike, Hydro Flask, HP"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Color</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Matte Black, Cobalt Blue, Olive Green"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Detailed Description *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Describe distinguishing features, markings, where it was left or found, contents inside..."
              className="w-full p-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 leading-relaxed"
            />
          </div>

          {/* Unique Identifiers */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Unique Identifiers / Stickers / Engravings
            </label>
            <input
              type="text"
              value={identifiers}
              onChange={(e) => setIdentifiers(e.target.value)}
              placeholder="e.g. Blue NASA round sticker on back, initials 'AR' inscribed, scratch on left corner"
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Crucial for AI matching and safe ownership verification!
            </p>
          </div>
        </div>

        {/* Location & Time Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Campus Location & Date</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Campus Location *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  placeholder="e.g. Central Library 2nd Floor, CS Lab 2"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Date *</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Approx. Time</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Photo Upload & Preview Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Item Photograph</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Upload control */}
            <div className="space-y-3">
              <label className="block p-6 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl text-center cursor-pointer transition-colors bg-slate-50 hover:bg-blue-50/50">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Click to upload custom photograph</p>
                <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="hidden"
                />
              </label>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Or Image URL:
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            {/* Preview Box */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-44 relative">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Image preview will show here
                </div>
              )}
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-semibold">
                Live Preview
              </span>
            </div>
          </div>
        </div>

        {/* Contact Preference */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Privacy & Contact Preference</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'in_app', label: 'In-App Secure Chat (Recommended)', sub: 'Keeps phone private' },
              { id: 'email', label: 'Campus Email', sub: 'Verified .edu email' },
              { id: 'phone', label: 'Phone Number', sub: 'Direct SMS/Call' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setContactPreference(opt.id as any)}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  contactPreference === opt.id
                    ? 'border-blue-500 bg-blue-50/60 font-bold'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <p className="text-xs text-slate-900">{opt.label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{opt.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-2xl text-white font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
            type === 'lost'
              ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
              : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
          }`}
        >
          {loading ? (
            <span>Running AI matching and publishing report...</span>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {type === 'lost' ? 'Submit Report & Check AI Matches' : 'Submit Found Item Listing'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
