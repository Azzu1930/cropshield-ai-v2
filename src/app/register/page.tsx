'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Phone, Mail, User, Lock, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';

export default function RegisterPage() {
  const { t, language, setLanguage } = useLanguage();
  const { register } = useAuth();
  const router = useRouter();

  // Registration Mode: 'phone' or 'email'
  const [authMode, setAuthMode] = useState<'phone' | 'email'>('phone');

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string>(language);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (authMode === 'phone' && !phone.trim()) {
      setErrorMsg('Please enter your mobile phone number.');
      return;
    }

    if (authMode === 'email' && !email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    const res = await register({
      name: name.trim(),
      email: authMode === 'email' ? email.trim() : undefined,
      phone: authMode === 'phone' ? phone.trim() : undefined,
      password,
      language: selectedLang,
    });

    setIsLoading(false);

    if (res.success) {
      // Sync language preference
      if (selectedLang === 'te' || selectedLang === 'hi' || selectedLang === 'en') {
        setLanguage(selectedLang as any);
      }
      router.push('/');
    } else {
      setErrorMsg(res.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-4 sm:py-8 space-y-6 animate-in fade-in pb-16">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center shadow-lg shadow-emerald-700/20 mx-auto">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          {t.auth.registerTitle}
        </h1>
        <p className="text-sm font-semibold text-emerald-800">
          {t.auth.registerSubtitle}
        </p>
      </div>

      {/* Main Register Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-200 shadow-xl space-y-5">
        {/* Toggle Mode: Phone Number OR Email Address */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Choose Registration Method:
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setAuthMode('phone')}
              className={`py-2.5 px-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                authMode === 'phone'
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>{t.auth.phoneTab}</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthMode('email')}
              className={`py-2.5 px-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                authMode === 'email'
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Mail className="w-4 h-4 text-emerald-600" />
              <span>{t.auth.emailTab}</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-600" />
              <span>{t.auth.fullName}</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Patel"
              className="w-full p-3.5 rounded-2xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-none text-base font-semibold text-gray-900"
            />
          </div>

          {/* Conditional Phone or Email */}
          {authMode === 'phone' ? (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>{t.auth.phoneNumber}</span>
              </label>
              <div className="flex gap-2">
                <span className="p-3.5 rounded-2xl bg-gray-100 border-2 border-gray-300 text-gray-600 font-bold text-base select-none">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="flex-1 p-3.5 rounded-2xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-none text-base font-semibold text-gray-900"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span>{t.auth.emailAddress}</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@example.com"
                className="w-full p-3.5 rounded-2xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-none text-base font-semibold text-gray-900"
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>{t.auth.password}</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>{t.auth.confirmPassword}</span>
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type password"
              className="w-full p-3.5 rounded-2xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-none text-base font-semibold text-gray-900"
            />
          </div>

          {/* Preferred Language */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              {t.auth.preferredLanguage}
            </label>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="w-full p-3.5 rounded-2xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-none text-sm font-bold bg-white text-gray-900"
            >
              <option value="en">English (English)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-red-700 animate-in shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Register Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-black text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isLoading ? t.common.loading : t.auth.registerBtn}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        {/* Link to Login */}
        <div className="pt-2 text-center">
          <Link
            href="/login"
            className="text-sm font-bold text-emerald-800 hover:text-emerald-950 underline underline-offset-4"
          >
            {t.auth.haveAccountPrompt}
          </Link>
        </div>
      </div>
    </div>
  );
}
