'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { CropWizard } from '@/components/CropWizard';

export default function CheckCropPage() {
  const { user, isLoading } = useAuth();
  const { language, t } = useLanguage();

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Checking authorization...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-6 animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-100">
          <ShieldCheck className="w-8 h-8" />
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
              ? 'మీ పంట ఆరోగ్యాన్ని తనిఖీ చేయడానికి మరియు నివేదికలను భద్రపరచుకోవడానికి దయచేసి ఖాతాలోకి లాగిన్ అవ్వండి లేదా కొత్త ఖాతా తెరవండి.'
              : language === 'hi'
              ? 'फसल स्वास्थ्य की जांच करने और रिपोर्ट सुरक्षित रखने के लिए कृपया लॉगिन करें या नया खाता बनाएं।'
              : 'Please sign in or register a free farmer account to check your crop and save diagnostic reports.'}
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
    <div className="py-2">
      <CropWizard />
    </div>
  );
}
