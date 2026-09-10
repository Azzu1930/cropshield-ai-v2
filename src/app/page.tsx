'use client';

import React from 'react';
import Link from 'next/link';
import { Sprout, ShieldCheck, ArrowRight, User, LogIn, UserPlus } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { WeatherCard } from '@/components/WeatherCard';
import { HomeCards } from '@/components/HomeCards';
import { ExpertReviewTracker } from '@/components/ExpertReviewTracker';
import { RecentChecksSection } from '@/components/RecentChecksSection';

export default function HomePage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();

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

      {/* Account Status / Active Farmer Profile Bar */}
      {user ? (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
              {user.name?.charAt(0).toUpperCase() || 'F'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{user.name}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {language === 'te' ? 'రైతు ఖాతా' : language === 'hi' ? 'किसान खाता' : 'Farmer Account'}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {user.phone ? `+91 ${user.phone}` : user.email || 'Registered User'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Link
              href="/history"
              className="text-emerald-800 hover:text-emerald-950 underline underline-offset-4"
            >
              {t.homeCards.myReports.title}
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              href="/farms"
              className="text-emerald-800 hover:text-emerald-950 underline underline-offset-4"
            >
              {t.homeCards.myFarms.title}
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 text-slate-700">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
            <p className="text-xs sm:text-sm font-medium">
              {language === 'te'
                ? 'వ్యక్తిగత పంట తనిఖీ చరిత్ర మరియు పొలం వివరాలను భద్రపరచుకోవడానికి ఖాతా తెరవండి.'
                : language === 'hi'
                ? 'अपने व्यक्तिगत फसल इतिहास और खेत के विवरण को सुरक्षित रखने के लिए खाता बनाएं।'
                : 'Sign in or register a free farmer account to securely track your crops and field locations.'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-white text-slate-800 font-semibold text-xs transition-colors"
            >
              {t.nav.login}
            </Link>
            <Link
              href="/register"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm transition-colors"
            >
              {t.nav.register}
            </Link>
          </div>
        </div>
      )}

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
