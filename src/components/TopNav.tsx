'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, MapPin, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { getStoredFarms, getActiveFarmId, setActiveFarmId, type FarmRecord } from '@/lib/farm-store';

export function TopNav() {
  const { t } = useLanguage();
  const [farms, setFarms] = useState<FarmRecord[]>([]);
  const [activeFarmId, setActiveFarmState] = useState<string>('');
  const [isFarmDropdownOpen, setIsFarmDropdownOpen] = useState(false);

  useEffect(() => {
    const list = getStoredFarms();
    const currentId = getActiveFarmId();
    setFarms(list);
    setActiveFarmState(currentId);
  }, []);

  const activeFarm = farms.find((f) => f.id === activeFarmId) || farms[0];

  const handleSelectFarm = (id: string) => {
    setActiveFarmId(id);
    setActiveFarmState(id);
    setIsFarmDropdownOpen(false);
    // Reload farm weather & state on change
    window.dispatchEvent(new CustomEvent('farmChanged', { detail: { farmId: id } }));
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Brand & Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
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

        {/* Right Section: Farm Switcher & Language */}
        <div className="flex items-center gap-2">
          {/* Active Farm Switcher */}
          {farms.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFarmDropdownOpen(!isFarmDropdownOpen)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold text-emerald-900 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="max-w-[120px] truncate">{activeFarm?.locality || activeFarm?.name || t.nav.selectFarm}</span>
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

          {/* Prominent Trilingual Language Selector */}
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
}
