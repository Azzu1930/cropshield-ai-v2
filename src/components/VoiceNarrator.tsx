'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Square, VolumeX } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface VoiceNarratorProps {
  text: string;
  label?: string;
  className?: string;
  autoPlay?: boolean;
}

// Cleans markdown, technical symbols, and expands agricultural units for articulate speech synthesis
function cleanTextForSpeech(rawText: string): string {
  if (!rawText) return '';
  return rawText
    // Remove markdown headers, bold, italics, code
    .replace(/[#*`_~]/g, '')
    // Expand common dosage and agricultural abbreviations
    .replace(/\bml\/L\b/gi, ' milliliters per liter')
    .replace(/\bg\/L\b/gi, ' grams per liter')
    .replace(/\bkg\/ac\b/gi, ' kilograms per acre')
    .replace(/\bkg\/ha\b/gi, ' kilograms per hectare')
    .replace(/\b°C\b/g, ' degrees Celsius')
    .replace(/%/g, ' percent')
    // Remove markdown list numbers/bullets at start of lines
    .replace(/^\s*[-•*]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // Normalize punctuation & whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

export function VoiceNarrator({ text, label, className = '', autoPlay = false }: VoiceNarratorProps) {
  const { language, t } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const isCancelledRef = useRef(false);
  const hasAutoPlayedRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          setAvailableVoices(voices);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;

      return () => {
        window.speechSynthesis.cancel();
      };
    }
  }, []);

  // Select the highest-quality natural voice for the target language
  const selectBestVoice = (lang: string): SpeechSynthesisVoice | null => {
    if (availableVoices.length === 0) return null;

    if (lang === 'te') {
      // Telugu voice
      const teluguVoice = availableVoices.find(
        (v) => v.lang.startsWith('te') || v.name.toLowerCase().includes('telugu')
      );
      if (teluguVoice) return teluguVoice;
    } else if (lang === 'hi') {
      // Hindi voice
      const hindiVoice = availableVoices.find(
        (v) =>
          v.lang.startsWith('hi') ||
          v.name.toLowerCase().includes('hindi') ||
          v.name.toLowerCase().includes('kalpana')
      );
      if (hindiVoice) return hindiVoice;
    }

    // English voices: prioritize Natural, Indian English, or high-fidelity voices
    const naturalIndian = availableVoices.find(
      (v) =>
        (v.lang === 'en-IN' || v.lang.startsWith('en')) &&
        (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Online'))
    );
    if (naturalIndian) return naturalIndian;

    const indianVoice = availableVoices.find(
      (v) =>
        v.lang === 'en-IN' ||
        v.name.toLowerCase().includes('india') ||
        v.name.toLowerCase().includes('ravi') ||
        v.name.toLowerCase().includes('veena')
    );
    if (indianVoice) return indianVoice;

    const highQualityEnglish = availableVoices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
    );
    if (highQualityEnglish) return highQualityEnglish;

    // Fallback to first matching language prefix
    return availableVoices.find((v) => v.lang.startsWith(lang)) || availableVoices[0] || null;
  };

  const startSpeaking = () => {
    if (!isSupported || typeof window === 'undefined') return;

    window.speechSynthesis.cancel();
    isCancelledRef.current = false;

    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) return;

    // Split text into natural sentences to avoid browser audio cutoffs & stutter
    const sentences = cleaned
      .split(/(?<=[.!?।])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (sentences.length === 0) return;

    const targetLangCode = language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    const chosenVoice = selectBestVoice(language);

    setIsSpeaking(true);

    // Chain utterances sequentially for smooth, articulate pacing
    let currentIdx = 0;

    const speakNext = () => {
      if (isCancelledRef.current || currentIdx >= sentences.length) {
        setIsSpeaking(false);
        return;
      }

      const sentenceText = sentences[currentIdx];
      const utterance = new SpeechSynthesisUtterance(sentenceText);

      utterance.lang = targetLangCode;
      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }

      // 0.92 gives clear, calm, articulate pace for agricultural instructions
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        currentIdx++;
        if (currentIdx < sentences.length && !isCancelledRef.current) {
          // Brief 70ms pause between sentences for natural breathing cadence
          setTimeout(speakNext, 70);
        } else {
          setIsSpeaking(false);
        }
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  const handleToggleVoice = () => {
    if (!isSupported || typeof window === 'undefined') return;

    if (isSpeaking) {
      isCancelledRef.current = true;
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    startSpeaking();
  };

  useEffect(() => {
    if (!autoPlay || hasAutoPlayedRef.current || !isSupported || !text) return;

    const timer = setTimeout(() => {
      if (!hasAutoPlayedRef.current && !isSpeaking) {
        hasAutoPlayedRef.current = true;
        startSpeaking();
      }
    }, 550);

    return () => clearTimeout(timer);
  }, [autoPlay, isSupported, text, availableVoices]);

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={handleToggleVoice}
      aria-label={isSpeaking ? t.nav.stopListening : (label || t.nav.listen)}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border shadow-sm ${
        isSpeaking
          ? 'bg-rose-50 text-rose-800 border-rose-200'
          : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-200'
      } ${className}`}
    >
      {isSpeaking ? (
        <>
          <Square className="w-3.5 h-3.5 text-rose-600 fill-current" />
          <span>{t.nav.stopListening}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4 text-emerald-700" />
          <span>{label || t.nav.listen}</span>
        </>
      )}
    </button>
  );
}
