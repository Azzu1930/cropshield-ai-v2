'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserCheck, ArrowLeft, CheckCircle2, PhoneCall, ShieldCheck, LogIn, UserPlus } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { getActiveFarm } from '@/lib/farm-store';

export default function ExpertReviewPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const farm = getActiveFarm(user?.id);
  const [farmerNotes, setFarmerNotes] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const scope = user?.id || 'anonymous';
    const storageKey = `cropshield_expert_reviews_${scope}`;
    const newRev = {
      id: `exp-${Date.now()}`,
      cropName: farm?.cropName || 'Field Crop',
      status: 'pending' as const,
      farmerNotes,
      contactNumber: phoneNumber,
      createdAt: new Date().toISOString(),
    };

    try {
      const raw = localStorage.getItem(storageKey);
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(newRev);
      localStorage.setItem(storageKey, JSON.stringify(list));
    } catch {
      // Ignore
    }

    try {
      await fetch('/api/expert-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: `expert-direct-${Date.now()}`,
          farmerNotes,
          contactNumber: phoneNumber,
          cropName: farm?.cropName || 'Field Crop',
          userId: user?.id,
        }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-6 animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center mx-auto border-2 border-purple-100">
          <UserCheck className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900">
            {language === 'te'
              ? 'లాగిన్ అవ్వండి'
              : language === 'hi'
              ? 'लॉगिन आवश्यक है'
              : 'Sign In Required'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {language === 'te'
              ? 'వ్యవసాయ శాస్త్రవేత్తలతో సంప్రదించడానికి దయచేసి ఖాతాలోకి లాగిన్ అవ్వండి లేదా కొత్త ఖాతా తెరవండి.'
              : language === 'hi'
              ? 'कृषि वैज्ञानिकों से संपर्क करने के लिए कृपया लॉगिन करें या नया खाता बनाएं।'
              : 'Please sign in or register a free farmer account to consult with agricultural scientists.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{t.nav.login}</span>
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border-2 border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.nav.register}</span>
          </Link>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.wizard.buttons.back} to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-emerald-100 pb-4">
        <Link
          href="/"
          className="p-2 rounded-xl bg-gray-100 hover:bg-emerald-50 text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-purple-700 shrink-0" />
            <span>{t.homeCards.askExpert.title}</span>
          </h1>
          <p className="text-sm font-semibold text-emerald-800 mt-0.5">
            Agricultural Officer / KVK Review
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-purple-200 shadow-md space-y-5">
        <div>
          <h2 className="text-lg font-black text-gray-900">
            {language === 'te'
              ? 'వ్యవసాయ శాస్త్రవేత్త లేదా అధికారిని సంప్రదించండి'
              : language === 'hi'
              ? 'कृषि वैज्ञानिक या अधिकारी से संपर्क करें'
              : 'Connect with an Agricultural Scientist'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Certified agronomists from local Krishi Vigyan Kendras can examine your crop photos, soil report, and weather data.
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-6 space-y-4 animate-in fade-in">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
            <h3 className="text-xl font-black text-gray-900">
              {t.result.expertSavedNotice}
            </h3>
            <p className="text-xs text-gray-600 max-w-sm mx-auto">
              If an expert is not immediately online, your request is stored in the system and queued for the nearest agricultural officer.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-sm"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Your Phone Number (for expert callback)
              </label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full p-3.5 rounded-2xl border-2 border-gray-300 focus:border-purple-600 focus:outline-none text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Describe your crop question or problem
              </label>
              <textarea
                rows={4}
                required
                value={farmerNotes}
                onChange={(e) => setFarmerNotes(e.target.value)}
                placeholder="e.g. Leaves turning yellow in the lower third of the paddy field after heavy rain. What spray is safe?"
                className="w-full p-3.5 rounded-2xl border-2 border-gray-300 focus:border-purple-600 focus:outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-base shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UserCheck className="w-5 h-5" />
              <span>{loading ? t.common.saving : 'Send to Agricultural Expert'}</span>
            </button>
          </form>
        )}
      </div>

      {/* Direct Kisan Call Center Helpline Info */}
      <div className="p-5 rounded-3xl bg-purple-50 border border-purple-200 text-sm space-y-2">
        <h3 className="font-extrabold text-purple-950 flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-purple-700" />
          <span>National Kisan Call Center Helpline</span>
        </h3>
        <p className="text-xs text-purple-900 leading-relaxed">
          Toll-Free Helpline: <span className="font-black text-purple-950 text-sm">1800-180-1551</span> (6:00 AM to 10:00 PM on all 7 days in Telugu, Hindi, and English).
        </p>
      </div>
    </div>
  );
}
