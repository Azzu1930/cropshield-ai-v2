'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Sprout, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { WeatherCard } from '@/components/WeatherCard';
import { HomeCards } from '@/components/HomeCards';
import { RecentChecksSection } from '@/components/RecentChecksSection';

export default function HomePage() {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">🌾</span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {language === 'te'
                ? 'నమస్కారం! మీరు ఏమి చేయాలనుకుంటున్నారు?'
                : language === 'hi'
                ? 'नमस्ते किसान भाई! आप क्या करना चाहते हैं?'
                : 'Hello! What do you want to do?'}
            </h1>
          </div>
          <p className="text-sm font-semibold text-emerald-800 mt-1">
            {t.tagline}
          </p>
        </div>

        <Link
          href="/check-crop"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 text-white font-extrabold text-base shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-100"
        >
          <Sprout className="w-5 h-5 text-white" />
          <span>{t.homeCards.checkCrop.title}</span>
        </Link>
      </div>

      {/* 1. Live Weather Card (Auto-detected per Farm, no manual typing) */}
      <section aria-label="Farm Weather">
        <WeatherCard />
      </section>

      {/* 2. 8 Large Touch Cards */}
      <section aria-label="Main Agricultural Actions" className="space-y-3">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider px-1">
          {language === 'te'
            ? 'ప్రధాన సేవలు'
            : language === 'hi'
            ? 'मुख्य सेवाएं'
            : 'Quick Actions'}
        </h2>
        <HomeCards />
      </section>

      {/* 3. Recent Crop Checks & Previously Checked History */}
      <RecentChecksSection />

      {/* 4. Farmer Safety Notice / Disclaimer */}
      <footer className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-medium">
          {t.common.disclaimer}
        </p>
      </footer>
    </div>
  );
}
