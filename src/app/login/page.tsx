'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, ArrowRight, Eye, EyeOff, Sparkles, AlertCircle, Phone, Mail } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';

export default function LoginPage() {
  const { t, language } = useLanguage();
  const { login, loginDemo } = useAuth();
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

    const res = await login(identifier, password || 'password123');
    setIsLoading(false);

    if (res.success) {
      router.push('/');
    } else {
      setErrorMsg(res.error || 'Login failed. Please check your phone/email.');
    }
  };

  const handleDemoLogin = () => {
    loginDemo();
    router.push('/');
  };

  return (
    <div className="max-w-md mx-auto py-4 sm:py-8 space-y-6 animate-in fade-in pb-16">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center shadow-lg shadow-emerald-700/20 mx-auto">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          {t.auth.loginTitle}
        </h1>
        <p className="text-sm font-semibold text-emerald-800">
          {t.auth.loginSubtitle}
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-200 shadow-xl space-y-5">
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Phone or Email Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>{t.auth.phoneOrEmailLabel}</span>
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={language === 'te' ? 'ఉదా: 9876543210 లేదా email@domain.com' : language === 'hi' ? 'उदा: 9876543210 या email@domain.com' : 'e.g. 9876543210 or farmer@gmail.com'}
              className="w-full p-3.5 rounded-2xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-none text-base font-semibold text-gray-900"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>{t.auth.password}</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3.5 pr-11 rounded-2xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-none text-base font-semibold text-gray-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-red-700 animate-in shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Sign In Button */}
          <button
            type="submit"
            disabled={isLoading || !identifier.trim()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-black text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isLoading ? t.common.loading : t.auth.loginBtn}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="relative flex items-center gap-3 my-2">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* 1-Click Instant Demo Login Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full py-3.5 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-950 font-black text-sm shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
        >
          <Sparkles className="w-5 h-5 text-amber-600" />
          <span>{t.auth.demoLoginBtn}</span>
        </button>

        {/* Link to Register */}
        <div className="pt-2 text-center">
          <Link
            href="/register"
            className="text-sm font-bold text-emerald-800 hover:text-emerald-950 underline underline-offset-4"
          >
            {t.auth.noAccountPrompt}
          </Link>
        </div>
      </div>
    </div>
  );
}
