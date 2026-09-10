'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, ArrowRight, Eye, EyeOff, AlertCircle, Phone, UserPlus } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';

export default function LoginPage() {
  const { t, language } = useLanguage();
  const { login } = useAuth();
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    const res = await login(identifier, password);
    setIsLoading(false);

    if (res.success) {
      router.push('/');
    } else {
      setErrorMsg(res.error || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-10 space-y-6 pb-16">
      {/* Institutional Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-emerald-700 flex items-center justify-center shadow-sm mx-auto">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t.auth.loginTitle}
        </h1>
        <p className="text-sm font-medium text-slate-600">
          {t.auth.loginSubtitle}
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Phone or Email Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.auth.phoneOrEmailLabel}</span>
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={
                language === 'te'
                  ? 'ఫోన్ నంబర్ లేదా ఈమెయిల్ (ఉదా: 9876543210)'
                  : language === 'hi'
                  ? 'फ़ोन नंबर या ईमेल (उदा: 9876543210)'
                  : 'Phone or email (e.g. 9876543210 or farmer@gmail.com)'
              }
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none text-sm text-slate-900 placeholder:text-slate-400 bg-white"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.auth.password}</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none text-sm text-slate-900 placeholder:text-slate-400 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Sign In Button */}
          <button
            type="submit"
            disabled={isLoading || !identifier.trim()}
            className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isLoading ? t.common.loading : t.auth.loginBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Don't have an account? Register CTA Button */}
        <div className="pt-2">
          <Link
            href="/register"
            className="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-emerald-700" />
            <span>{t.auth.noAccountPrompt}</span>
          </Link>
        </div>

        {/* Security & Cryptography Badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-500 pt-2 border-t border-slate-100">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Encrypted Authentication & Session Security (SHA-256)</span>
        </div>
      </div>
    </div>
  );
}
