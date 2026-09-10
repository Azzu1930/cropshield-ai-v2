'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { SupportedLanguage } from '@/lib/i18n/types';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: SupportedLanguage; label: string; nativeName: string }[] = [
    { code: 'en', label: 'English', nativeName: 'English' },
    { code: 'te', label: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
  ];

  const current = languages.find((l) => l.code === language) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Language"
        className="flex items-center gap-2 px-3 py-2 bg-white/90 border-2 border-emerald-600 rounded-full text-emerald-950 font-bold text-sm shadow-sm hover:bg-emerald-50 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <Globe className="w-4 h-4 text-emerald-700" />
        <span>{current.nativeName}</span>
        <ChevronDown className="w-3.5 h-3.5 text-emerald-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-1">
          {languages.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                setLanguage(item.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm font-semibold transition-colors ${
                language === item.code
                  ? 'bg-emerald-50 text-emerald-900'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div>
                <p className="font-bold text-base leading-none">{item.nativeName}</p>
                <p className="text-xs text-gray-500 mt-1">{item.label}</p>
              </div>
              {language === item.code && <Check className="w-4 h-4 text-emerald-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
