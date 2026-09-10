'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sprout, Sun, MapPin, FileText } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: '/', label: t.nav.home, icon: Home },
    { href: '/check-crop', label: t.nav.checkCrop, icon: Sprout, highlight: true },
    { href: '/weather', label: t.nav.weather, icon: Sun },
    { href: '/farms', label: t.nav.farms, icon: MapPin },
    { href: '/history', label: t.nav.reports, icon: FileText },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-emerald-100 shadow-lg px-2 py-1.5 md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-5 group"
              >
                <div className="w-13 h-13 p-3 bg-gradient-to-tr from-emerald-600 to-green-500 rounded-full shadow-lg shadow-emerald-600/30 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-emerald-900 mt-1">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
                isActive ? 'text-emerald-800 font-extrabold' : 'text-gray-500 hover:text-emerald-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-emerald-700' : ''}`} />
              <span className="text-[10px] font-semibold mt-0.5 max-w-[64px] truncate text-center">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
