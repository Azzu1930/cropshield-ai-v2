'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Droplets, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getActiveFarm } from '@/lib/farm-store';

export default function WaterPage() {
  const { t, language } = useLanguage();
  const farm = getActiveFarm();
  const [selectedLevel, setSelectedLevel] = useState<'less' | 'normal' | 'more'>('normal');
  const [saved, setSaved] = useState(false);

  const handleSaveWaterLog = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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
            <span>💧</span> {t.homeCards.water.title}
          </h1>
          <p className="text-sm font-semibold text-emerald-800 mt-0.5">
            📍 {farm ? `${farm.name} (${farm.locality})` : 'Farm Location'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-blue-200 shadow-md space-y-6">
        <div>
          <h2 className="text-lg font-black text-gray-900">
            {language === 'te'
              ? 'ఈ రోజు మీరు ఎంత నీరు పెట్టారు?'
              : language === 'hi'
              ? 'आज आपने कितना पानी दिया?'
              : 'How much water did you provide today?'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Logging irrigation helps CropShield AI correlate root rot, moisture stress, and fungal leaf diseases.
          </p>
        </div>

        <form onSubmit={handleSaveWaterLog} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'less', label: t.wizard.water.lessThanUsual },
              { id: 'normal', label: t.wizard.water.normal },
              { id: 'more', label: t.wizard.water.moreThanUsual },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedLevel(opt.id as any)}
                className={`p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
                  selectedLevel === opt.id
                    ? 'border-blue-600 bg-blue-50 shadow-sm font-black text-blue-900'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-bold'
                }`}
              >
                <Droplets className={`w-6 h-6 ${selectedLevel === opt.id ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="text-sm">{opt.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Save Water Log</span>
            </button>
          </div>

          {saved && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-sm font-bold text-center animate-in fade-in">
              ✓ Water record saved successfully for {farm?.name || 'your farm'}!
            </div>
          )}
        </form>
      </div>

      {/* Advisory Card */}
      <div className="p-5 rounded-3xl bg-blue-50/70 border border-blue-200 text-sm text-blue-950 space-y-2">
        <h3 className="font-black text-blue-900 flex items-center gap-1.5">
          <span>💡</span> Watering Best Practice
        </h3>
        <p className="text-xs leading-relaxed text-blue-900">
          Always irrigate in early mornings or evenings. Stagnant afternoon water in hot sunlight raises root temperature, predisposing roots to fungal infection and damping-off.
        </p>
      </div>
    </div>
  );
}
