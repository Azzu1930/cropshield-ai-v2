'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, Square } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface VoiceNarratorProps {
  text: string;
  label?: string;
  className?: string;
}

export function VoiceNarrator({ text, label, className = '' }: VoiceNarratorProps) {
  const { language, t } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  const handleToggleVoice = () => {
    if (!isSupported || typeof window === 'undefined') return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending utterances
    const utterance = new SpeechSynthesisUtterance(text);

    // Map language code
    if (language === 'te') {
      utterance.lang = 'te-IN';
    } else if (language === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.9; // Slightly slower, clear pace for rural users
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={handleToggleVoice}
      aria-label={isSpeaking ? t.nav.stopListening : (label || t.nav.listen)}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
        isSpeaking
          ? 'bg-red-100 text-red-700 border-2 border-red-300 animate-pulse'
          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
      } ${className}`}
    >
      {isSpeaking ? (
        <>
          <Square className="w-4 h-4 text-red-600 fill-current" />
          <span>{t.nav.stopListening}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-5 h-5 text-emerald-700" />
          <span>{label || t.nav.listen}</span>
        </>
      )}
    </button>
  );
}
