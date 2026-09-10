'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShieldCheck, MapPin, ChevronDown, User, LogOut, FileText, LogIn, UserPlus } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { LanguageSelector } from './LanguageSelector';
import { getStoredFarms, getActiveFarmId, setActiveFarmId, type FarmRecord } from '@/lib/farm-store';
import { getLocalizedLocation, getLocalizedFarmName, getLocalizedAddress } from '@/lib/i18n/location-translations';

export function TopNav() {
  const { t, language } = useLanguage();
  const { user, logout } = useAuth();
  const [farms, setFarms] = useState<FarmRecord[]>([]);
  const [activeFarmId, setActiveFarmState] = useState<string>('');
  const [isFarmDropdownOpen, setIsFarmDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const farmRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function refreshFarms() {
      const list = getStoredFarms(user?.id);
      const currentId = getActiveFarmId(user?.id);
      setFarms(list);
      setActiveFarmState(currentId || '');
    }

    refreshFarms();

    function handleClickOutside(e: MouseEvent) {
      if (farmRef.current && !farmRef.current.contains(e.target as Node)) {
        setIsFarmDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }

    window.addEventListener('farmChanged', refreshFarms);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('farmChanged', refreshFarms);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [user]);

  const activeFarm = farms.find((f) => f.id === activeFarmId) || farms[0] || null;

  const handleSelectFarm = (id: string) => {
    setActiveFarmId(id, user?.id);
    setActiveFarmState(id);
    setIsFarmDropdownOpen(false);
    window.dispatchEvent(new CustomEvent('farmChanged', { detail: { farmId: id } }));
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Brand & Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center shadow-sm text-white group-hover:bg-emerald-800 transition-colors">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-900 leading-none">
              {t.appTitle}
            </h1>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">
              {t.appSubtitle}
            </p>
          </div>
        </Link>

        {/* Right Section: Farm Switcher, User Auth & Language */}
        <div className="flex items-center gap-2">
          {/* Active Farm Switcher or Add Farm Prompt - Only visible to logged in users */}
          {user && (
            farms.length > 0 ? (
              <div className="relative" ref={farmRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsFarmDropdownOpen(!isFarmDropdownOpen);
                    setIsUserDropdownOpen(false);
                  }}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="max-w-[110px] truncate">
                    {activeFarm?.locality
                      ? getLocalizedLocation(activeFarm.locality, language)
                      : activeFarm?.name
                      ? getLocalizedFarmName(activeFarm.name, language)
                      : t.nav.selectFarm}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {isFarmDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5">
                    <div className="px-3 py-1.5 border-b border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.nav.selectFarm}</p>
                    </div>
                    {farms.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleSelectFarm(f.id)}
                        className={`w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 transition-colors ${
                          activeFarmId === f.id ? 'bg-emerald-50/70 font-semibold text-emerald-900' : 'text-slate-700'
                        }`}
                      >
                        <p className="font-medium text-slate-900 truncate">{getLocalizedFarmName(f.name, language)}</p>
                        <p className="text-[11px] text-slate-500">{getLocalizedAddress(f.locality, f.district, undefined, language)}</p>
                      </button>
                    ))}
                    <div className="p-1.5 border-t border-slate-100">
                      <Link
                        href="/farms"
                        onClick={() => setIsFarmDropdownOpen(false)}
                        className="block text-center py-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        + {t.location.addFarmTitle}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/farms"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>+ {t.location.addFarmTitle}</span>
              </Link>
            )
          )}

          {/* User Account / Profile Button */}
          {user ? (
            <div className="relative" ref={userRef}>
              <button
                type="button"
                onClick={() => {
                  setIsUserDropdownOpen(!isUserDropdownOpen);
                  setIsFarmDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-xs font-semibold text-slate-800 transition-colors shadow-xs"
                title={`${user.name} (${user.phone || user.email || 'Farmer'})`}
              >
                <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {user.name?.charAt(0).toUpperCase() || 'F'}
                </div>
                <div className="text-left hidden sm:flex flex-col leading-tight">
                  <span className="font-bold text-slate-900 max-w-[110px] truncate">{user.name}</span>
                  <span className="text-[10px] text-emerald-800 font-medium truncate">
                    {user.phone ? `+91 ${user.phone}` : user.email || 'Farmer Account'}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-emerald-700 shrink-0" />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-emerald-50/40">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-600 truncate font-mono mt-0.5">
                      {user.phone ? `+91 ${user.phone}` : user.email || 'Registered Farmer'}
                    </p>
                    <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Verified Farmer Account
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/history"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{t.homeCards.myReports.title}</span>
                    </Link>

                    <Link
                      href="/farms"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{t.homeCards.myFarms.title}</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 p-1.5 bg-slate-50/50">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t.nav.logout}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-800 font-semibold text-xs transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>{t.nav.login}</span>
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1 px-3 sm:px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5 shrink-0" />
                <span>{t.nav.register}</span>
              </Link>
            </div>
          )}

          {/* Language Selector */}
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
}
