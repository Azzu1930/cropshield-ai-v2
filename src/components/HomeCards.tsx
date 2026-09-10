'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sprout,
  Camera,
  MapPin,
  Droplets,
  FlaskConical,
  Sun,
  ClipboardList,
  UserCheck,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function HomeCards() {
  const { t } = useLanguage();

  const cards = [
    {
      href: '/check-crop',
      title: t.homeCards.checkCrop.title,
      desc: t.homeCards.checkCrop.desc,
      icon: Sprout,
      featured: 'emerald',
      badge: 'Interactive',
    },
    {
      href: '/check-crop?step=2',
      title: t.homeCards.uploadPhoto.title,
      desc: t.homeCards.uploadPhoto.desc,
      icon: Camera,
      featured: 'slate',
      badge: 'Vision AI',
    },
    {
      href: '/farms',
      title: t.homeCards.myFarms.title,
      desc: t.homeCards.myFarms.desc,
      icon: MapPin,
    },
    {
      href: '/weather',
      title: t.homeCards.weather.title,
      desc: t.homeCards.weather.desc,
      icon: Sun,
    },
    {
      href: '/water',
      title: t.homeCards.water.title,
      desc: t.homeCards.water.desc,
      icon: Droplets,
    },
    {
      href: '/soil-test',
      title: t.homeCards.soilTest.title,
      desc: t.homeCards.soilTest.desc,
      icon: FlaskConical,
    },
    {
      href: '/history',
      title: t.homeCards.myReports.title,
      desc: t.homeCards.myReports.desc,
      icon: ClipboardList,
    },
    {
      href: '/expert-review',
      title: t.homeCards.askExpert.title,
      desc: t.homeCards.askExpert.desc,
      icon: UserCheck,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;

        if (card.featured === 'emerald') {
          return (
            <Link
              key={idx}
              href={card.href}
              className="group relative overflow-hidden rounded-2xl p-5 bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm hover:shadow transition-all flex items-center justify-between border border-emerald-700/80"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6 text-emerald-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold tracking-tight leading-tight text-white">
                      {card.title}
                    </h3>
                    {card.badge && (
                      <span className="text-[10px] font-semibold bg-emerald-900/90 text-emerald-200 border border-emerald-600/50 px-2 py-0.5 rounded-full">
                        {card.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-200/90 mt-0.5">
                    {card.desc}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-emerald-300/80 group-hover:text-white group-hover:translate-x-0.5 transition-all ml-2 shrink-0" />
            </Link>
          );
        }

        if (card.featured === 'slate') {
          return (
            <Link
              key={idx}
              href={card.href}
              className="group relative overflow-hidden rounded-2xl p-5 bg-slate-900 hover:bg-slate-950 text-white shadow-sm hover:shadow transition-all flex items-center justify-between border border-slate-800"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6 text-slate-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold tracking-tight leading-tight text-white">
                      {card.title}
                    </h3>
                    {card.badge && (
                      <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full">
                        {card.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300/90 mt-0.5">
                    {card.desc}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all ml-2 shrink-0" />
            </Link>
          );
        }

        return (
          <Link
            key={idx}
            href={card.href}
            className="group rounded-2xl p-4 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-emerald-50 text-slate-700 group-hover:text-emerald-800 flex items-center justify-center shrink-0 transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-900 transition-colors leading-snug">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                  {card.desc}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all ml-2 shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}
