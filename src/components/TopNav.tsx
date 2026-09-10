'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShieldCheck, MapPin, ChevronDown, User, LogOut, FileText, LogIn } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { LanguageSelector } from './LanguageSelector';
import { getStoredFarms, getActiveFarmId, setActiveFarmId, type FarmRecord } from '@/lib/farm-store';

export function TopNav() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [farms, setFarms] = useState<FarmRecord[]>([]);
  const [activeFarmId, setActiveFarmState] = useState<string>('');
  const [isFarmDropdownOpen, setIsFarmDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const farmRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = getStoredFarms();
    const currentId = getActiveFarmId();
    setFarms(list);
    setActiveFarmState(currentId);

    function handleClickOutside(e: MouseEvent) {
      if (farmRef.current && !farmRef.current.contains(e.target as Node)) {
        setIsFarmDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeFarm = farms.find((f) => f.id === activeFarmId) || farms[0];

  const handleSelectFarm = (id: string) => {
    setActiveFarmId(id);
    setActiveFarmState(id);
    setIsFarmDropdownOpen(false);
    window.dispatchEvent(new CustomEvent('farmChanged', { detail: { farmId: id } }));
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Brand & Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-emerald-950 leading-none">
              {t.appTitle}
            </h1>
            <p className="text-xs font-semibold text-emerald-700 mt-0.5">
              {t.appSubtitle}
            </p>
          </div>
        </Link>

        {/* Right Section: Farm Switcher, User Auth & Language */}
        <div className="flex items-center gap-2">
          {/* Active Farm Switcher */}
          {farms.length > 0 && (
            <div className="relative" ref={farmRef}>
              <button
                type="button"
                onClick={() => {
                  setIsFarmDropdownOpen(!isFarmDropdownOpen);
                  setIsUserDropdownOpen(false);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold text-emerald-900 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="max-w-[110px] truncate">{activeFarm?.locality || activeFarm?.name || t.nav.selectFarm}</span>
                <ChevronDown className="w-3 h-3 text-emerald-600" />
              </button>

              {isFarmDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.nav.selectFarm}</p>
                  </div>
                  {farms.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleSelectFarm(f.id)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 transition-colors ${
                        activeFarmId === f.id ? 'bg-emerald-50 font-bold text-emerald-900' : 'text-gray-700'
                      }`}
                    >
                      <p className="font-semibold text-gray-900 truncate">{f.name}</p>
                      <p className="text-xs text-emerald-700">{f.locality}, {f.district}</p>
                    </button>
                  ))}
                  <div className="p-2 border-t border-gray-100">
                    <Link
                      href="/farms"
                      onClick={() => setIsFarmDropdownOpen(false)}
                      className="block text-center py-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      + {t.location.addFarmTitle}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Auth: Profile Dropdown or Login Button */}
          {user ? (
            <div className="relative" ref={userRef}>
              <button
                type="button"
                onClick={() => {
                  setIsUserDropdownOpen(!isUserDropdownOpen);
                  setIsFarmDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-extrabold text-xs transition-colors border border-emerald-300"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[90px] truncate">{user.name}</span>
                <ChevronDown className="w-3 h-3 text-emerald-800" />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="font-bold text-sm text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.phone || user.email || 'Farmer'}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/history"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-900"
                    >
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>{t.nav.reports}</span>
                    </Link>
                    <Link
                      href="/farms"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-900"
                    >
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span>{t.nav.farms}</span>
                    </Link>
                  </div>
                  <div className="border-t border-gray-100 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>{t.nav.logout}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-sm transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.nav.login}</span>
              </Link>
              <Link
                href="/register"
                className="hidden sm:inline-flex px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors"
              >
                {t.nav.register}
              </Link>
            </div>
          )}

          {/* Prominent Trilingual Language Selector */}
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
}
