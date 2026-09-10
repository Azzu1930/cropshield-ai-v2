'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FlaskConical, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getActiveFarm } from '@/lib/farm-store';

export default function SoilTestPage() {
  const { t, language } = useLanguage();
  const farm = getActiveFarm();
  const [phValue, setPhValue] = useState('6.8');
  const [soilType, setSoilType] = useState('Loamy / Black Soil');
  const [evaluated, setEvaluated] = useState(false);

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    setEvaluated(true);
  };

  const ph = parseFloat(phValue) || 6.8;

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
            <span>🧪</span> {t.homeCards.soilTest.title}
          </h1>
          <p className="text-sm font-semibold text-emerald-800 mt-0.5">
            📍 {farm.name} ({farm.locality})
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-md space-y-5">
        <div>
          <h2 className="text-lg font-black text-gray-900">
            {language === 'te'
              ? 'మట్టి పరీక్ష వివరాలు నమోదు చేయండి'
              : language === 'hi'
              ? 'मिट्टी परीक्षण विवरण दर्ज करें'
              : 'Enter Soil Test Parameters'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Optional: Soil pH and nutrient balance help predict nutritional deficiencies vs viral symptoms.
          </p>
        </div>

        <form onSubmit={handleEvaluate} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Soil pH Level (4.0 to 9.0)
            </label>
            <input
              type="number"
              step="0.1"
              min="4.0"
              max="9.0"
              value={phValue}
              onChange={(e) => setPhValue(e.target.value)}
              className="w-full p-3.5 rounded-2xl border-2 border-gray-300 focus:border-amber-600 focus:outline-none text-base font-bold text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Soil Type
            </label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="w-full p-3.5 rounded-2xl border-2 border-gray-300 focus:border-amber-600 focus:outline-none text-sm font-semibold bg-white"
            >
              <option value="Alluvial / Delta Soil">Alluvial / Delta Soil (Paddy)</option>
              <option value="Black Cotton Soil">Black Cotton Soil (Regur)</option>
              <option value="Red Sandy Soil">Red Sandy Soil (Chilli / Groundnut)</option>
              <option value="Laterite Soil">Laterite Soil</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-base shadow-md transition-all flex items-center justify-center gap-2"
          >
            <FlaskConical className="w-5 h-5" />
            <span>Evaluate Soil Health</span>
          </button>
        </form>

        {evaluated && (
          <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-2 animate-in fade-in">
            <h3 className="font-extrabold text-base text-amber-950 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-700" />
              <span>
                {ph < 6.0
                  ? 'Acidic Soil (Low pH)'
                  : ph > 7.8
                  ? 'Alkaline / Saline Soil (High pH)'
                  : 'Optimal Soil pH (Favorable)'}
              </span>
            </h3>
            <p className="text-xs text-amber-900 leading-relaxed">
              {ph < 6.0
                ? 'Your soil is acidic. Micronutrients like iron and aluminum become excessively soluble, while phosphorus is locked up. Apply 150-200 kg agricultural lime per acre.'
                : ph > 7.8
                ? 'High alkalinity locks zinc and iron, causing interveinal yellowing of young leaves. Apply gypsum and green manure.'
                : 'Your soil pH is in the optimal range (6.2 - 7.5). Crop roots will readily absorb nitrogen, phosphorus, and potassium.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
