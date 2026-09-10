'use client';

import React from 'react';
import Link from 'next/link';
import { Sprout, ShieldCheck, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { WeatherCard } from '@/components/WeatherCard';
import { HomeCards } from '@/components/HomeCards';
import { ExpertReviewTracker } from '@/components/ExpertReviewTracker';
import { RecentChecksSection } from '@/components/RecentChecksSection';

export default function HomePage() {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in">
      {/* Institutional Portal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {language === 'te'
                ? 'పంట రక్షణ & వ్యవసాయ సలహా కేంద్రం'
                : language === 'hi'
                ? 'फसल सुरक्षा एवं कृषि सलाहकार पोर्टल'
                : 'National Crop Health & Advisory Portal'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
            {t.tagline}
          </p>
        </div>

        <Link
          href="/check-crop"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-sm transition-colors shrink-0"
        >
          <Sprout className="w-4 h-4 text-white" />
          <span>{t.homeCards.checkCrop.title}</span>
          <ArrowRight className="w-4 h-4 text-emerald-200" />
        </Link>
      </div>

      {/* 1. Live Weather Card (Auto-detected per Farm, no manual typing) */}
      <section aria-label="Farm Weather">
        <WeatherCard />
      </section>

      {/* 2. Primary Agritech Modules */}
      <section aria-label="Agricultural Operations" className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">
          {language === 'te'
            ? 'ప్రధాన సేవలు'
            : language === 'hi'
            ? 'मुख्य सेवाएं'
            : 'Core Operations'}
        </h2>
        <HomeCards />
      </section>

      {/* 3. Live Agricultural Scientist / Expert Review Tracker */}
      <ExpertReviewTracker />

      {/* 4. Recent Crop Checks & Previously Checked History */}
      <RecentChecksSection />

      {/* 5. Advisory Disclaimer */}
      <footer className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 flex items-start gap-3 shadow-sm">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-normal">
          {t.common.disclaimer}
        </p>
      </footer>
    </div>
  );
}
