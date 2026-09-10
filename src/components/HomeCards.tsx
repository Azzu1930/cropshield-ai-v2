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
      color: 'from-emerald-600 to-green-700',
      textColor: 'text-white',
      badge: '🔥 2 min',
      primary: true,
    },
    {
      href: '/check-crop?step=2',
      title: t.homeCards.uploadPhoto.title,
      desc: t.homeCards.uploadPhoto.desc,
      icon: Camera,
      color: 'from-teal-600 to-emerald-700',
      textColor: 'text-white',
      primary: true,
    },
    {
      href: '/farms',
      title: t.homeCards.myFarms.title,
      desc: t.homeCards.myFarms.desc,
      icon: MapPin,
      bgColor: 'bg-white',
      borderColor: 'border-emerald-200',
      iconColor: 'text-emerald-700',
      textColor: 'text-gray-900',
    },
    {
      href: '/water',
      title: t.homeCards.water.title,
      desc: t.homeCards.water.desc,
      icon: Droplets,
      bgColor: 'bg-white',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      textColor: 'text-gray-900',
    },
    {
      href: '/soil-test',
      title: t.homeCards.soilTest.title,
      desc: t.homeCards.soilTest.desc,
      icon: FlaskConical,
      bgColor: 'bg-white',
      borderColor: 'border-amber-200',
      iconColor: 'text-amber-700',
      textColor: 'text-gray-900',
    },
    {
      href: '/weather',
      title: t.homeCards.weather.title,
      desc: t.homeCards.weather.desc,
      icon: Sun,
      bgColor: 'bg-white',
      borderColor: 'border-orange-200',
      iconColor: 'text-orange-500',
      textColor: 'text-gray-900',
    },
    {
      href: '/history',
      title: t.homeCards.myReports.title,
      desc: t.homeCards.myReports.desc,
      icon: ClipboardList,
      bgColor: 'bg-white',
      borderColor: 'border-emerald-200',
      iconColor: 'text-emerald-600',
      textColor: 'text-gray-900',
    },
    {
      href: '/expert-review',
      title: t.homeCards.askExpert.title,
      desc: t.homeCards.askExpert.desc,
      icon: UserCheck,
      bgColor: 'bg-white',
      borderColor: 'border-purple-200',
      iconColor: 'text-purple-700',
      textColor: 'text-gray-900',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;

        if (card.primary) {
          return (
            <Link
              key={idx}
              href={card.href}
              className={`group relative overflow-hidden rounded-3xl p-6 bg-gradient-to-r ${card.color} text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-between border-2 border-white/20`}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                      {card.title}
                    </h3>
                    {card.badge && (
                      <span className="text-[11px] font-extrabold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">
                        {card.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-emerald-100 mt-1">
                    {card.desc}
                  </p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:bg-white/30 transition-colors ml-2">
                <ChevronRight className="w-6 h-6 text-white" />
              </div>
            </Link>
          );
        }

        return (
          <Link
            key={idx}
            href={card.href}
            className={`group rounded-3xl p-5 ${card.bgColor} border-2 ${card.borderColor} shadow-sm hover:shadow-md hover:border-emerald-400 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-between`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-7 h-7 ${card.iconColor}`} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-tight">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mt-0.5">
                  {card.desc}
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 transition-colors ml-2">
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
