'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, CheckCircle2, AlertCircle, Volume2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { parseAgriculturalSpeech, type ParsedSpeechData } from '@/lib/ai/speech-command-parser';

interface LiveVoiceAssistantProps {
  onExtracted: (data: ParsedSpeechData) => void;
  onRequestPhotoUpload?: () => void;
  hasPhoto?: boolean;
  className?: string;
}

function getLocalizedCropSpoken(crop: string | undefined, lang: string): string {
  if (!crop) return '';
  const c = crop.toLowerCase();
  if (c.includes('groundnut') || c.includes('peanut')) {
    return lang === 'te' ? 'వేరుశనగ' : lang === 'hi' ? 'मूंगफली' : 'Groundnut';
  }
  if (c.includes('rice') || c.includes('paddy')) {
    return lang === 'te' ? 'వరి' : lang === 'hi' ? 'धान' : 'Rice';
  }
  if (c.includes('tomato')) {
    return lang === 'te' ? 'టమాట' : lang === 'hi' ? 'टमाटर' : 'Tomato';
  }
  if (c.includes('chilli') || c.includes('chili')) {
    return lang === 'te' ? 'మిరప' : lang === 'hi' ? 'मिर्च' : 'Chilli';
  }
  if (c.includes('cotton')) {
    return lang === 'te' ? 'పత్తి' : lang === 'hi' ? 'कपास' : 'Cotton';
  }
  if (c.includes('maize') || c.includes('corn')) {
    return lang === 'te' ? 'మొక్కజొన్న' : lang === 'hi' ? 'मक्का' : 'Maize';
  }
  return crop;
}

export function LiveVoiceAssistant({
  onExtracted,
  onRequestPhotoUpload,
  hasPhoto = false,
  className = '',
}: LiveVoiceAssistantProps) {
  const { language, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [lastParsed, setLastParsed] = useState<ParsedSpeechData | null>(null);
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const hasPhotoRef = useRef(hasPhoto);
  hasPhotoRef.current = hasPhoto;

  const accumulatedTranscriptRef = useRef<string>('');
  const latestParsedRef = useRef<ParsedSpeechData | null>(null);
  const silenceTimeoutRef = useRef<any>(null);
  const hasFinishedRef = useRef<boolean>(false);

  const speakAgentResponse = (message: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !message) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      const targetLang = language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.lang = targetLang;
      utterance.rate = 0.94;

      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find((v) => v.lang.startsWith(language));
      if (matchingVoice) utterance.voice = matchingVoice;

      utterance.onstart = () => setAgentSpeaking(true);
      utterance.onend = () => setAgentSpeaking(false);
      utterance.onerror = () => setAgentSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  const finishVoiceSession = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);

    const fullText = (accumulatedTranscriptRef.current || liveTranscript).trim();
    const parsed = latestParsedRef.current || parseAgriculturalSpeech(fullText, language as any);

    if (
      parsed &&
      (parsed.crop ||
        parsed.symptoms.length > 0 ||
        parsed.affectedArea ||
        parsed.durationDays ||
        parsed.previousCrop ||
        parsed.waterLevel)
    ) {
      onExtracted(parsed);
      setLastParsed(parsed);

      // Build respectful confirmation speech in farmer's language
      const cropNameSpoken = getLocalizedCropSpoken(parsed.crop, language);
      let feedback = '';

      if (language === 'te') {
        const parts: string[] = [];
        if (cropNameSpoken) parts.push(`పంట ${cropNameSpoken}`);
        if (parsed.symptoms.length > 0) parts.push(`${parsed.symptoms.length} లక్షణాలు`);
        if (parsed.affectedArea) parts.push(`${parsed.affectedArea} విస్తీర్ణం`);
        if (parsed.durationDays) parts.push(`${parsed.durationDays}`);
        if (parsed.previousCrop) parts.push(`గత పంట ${parsed.previousCrop}`);

        const summary = parts.length > 0 ? parts.join(', ') : 'మీ పంట వివరాలు';
        feedback = `${summary} విజయవంతంగా నమోదయ్యాయి. దయచేసి ఇప్పుడు మీ పంట ఫోటోను తీయండి లేదా అప్‌లోడ్ చేయండి.`;
      } else if (language === 'hi') {
        const parts: string[] = [];
        if (cropNameSpoken) parts.push(`फसल ${cropNameSpoken}`);
        if (parsed.symptoms.length > 0) parts.push(`${parsed.symptoms.length} लक्षण`);
        if (parsed.affectedArea) parts.push(`${parsed.affectedArea} क्षेत्र`);
        if (parsed.durationDays) parts.push(`${parsed.durationDays}`);
        if (parsed.previousCrop) parts.push(`पिछली फसल ${parsed.previousCrop}`);

        const summary = parts.length > 0 ? parts.join(', ') : 'आपकी फसल की जानकारी';
        feedback = `${summary} सफलतापूर्वक दर्ज कर ली गई है। कृपया अब अपनी फसल की फोटो खींचें या अपलोड करें।`;
      } else {
        const parts: string[] = [];
        if (cropNameSpoken) parts.push(`Crop ${cropNameSpoken}`);
        if (parsed.symptoms.length > 0) parts.push(`${parsed.symptoms.length} symptom(s)`);
        if (parsed.affectedArea) parts.push(`${parsed.affectedArea} area`);
        if (parsed.durationDays) parts.push(`${parsed.durationDays}`);
        if (parsed.previousCrop) parts.push(`previous crop ${parsed.previousCrop}`);

        const summary = parts.length > 0 ? parts.join(', ') : 'Crop details';
        feedback = `${summary} recorded successfully. Please take or upload a photo of your crop now.`;
      }

      // Voice prompt to guide farmer to upload photo
      speakAgentResponse(feedback);

      if (onRequestPhotoUpload && !hasPhotoRef.current) {
        setTimeout(() => {
          onRequestPhotoUpload();
        }, 900);
      }
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0]?.transcript || '';
          if (event.results[i].isFinal) {
            finalChunk += trans + ' ';
          } else {
            interim += trans;
          }
        }

        if (finalChunk.trim()) {
          accumulatedTranscriptRef.current +=
            (accumulatedTranscriptRef.current ? ' ' : '') + finalChunk.trim();
        }

        const currentFullText = (
          accumulatedTranscriptRef.current +
          (interim ? ' ' + interim : '')
        ).trim();

        setLiveTranscript(currentFullText);

        // Continuous real-time parsing without premature cutoff
        if (currentFullText) {
          const parsed = parseAgriculturalSpeech(currentFullText, language as any);
          latestParsedRef.current = parsed;
          setLastParsed(parsed);
          onExtracted(parsed);
        }

        // Reset silence timer: wait 3.2 seconds of silence before auto-finalizing
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        silenceTimeoutRef.current = setTimeout(() => {
          if (
            latestParsedRef.current &&
            (latestParsedRef.current.crop ||
              latestParsedRef.current.symptoms.length > 0 ||
              latestParsedRef.current.affectedArea ||
              latestParsedRef.current.durationDays ||
              latestParsedRef.current.previousCrop)
          ) {
            finishVoiceSession();
          }
        }, 3200);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage(t.wizard.voice?.micPermissionDenied || 'Microphone access denied.');
          setIsListening(false);
        } else if (event.error !== 'no-speech') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // If recognition ended naturally and user spoke meaningful input, finalize session
        if (
          !hasFinishedRef.current &&
          latestParsedRef.current &&
          (latestParsedRef.current.crop ||
            latestParsedRef.current.symptoms.length > 0 ||
            latestParsedRef.current.affectedArea)
        ) {
          finishVoiceSession();
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Could not initialize SpeechRecognition:', err);
      setIsSupported(false);
    }

    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [language, t]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      finishVoiceSession();
    } else {
      try {
        setErrorMessage(null);
        setLiveTranscript('');
        accumulatedTranscriptRef.current = '';
        latestParsedRef.current = null;
        hasFinishedRef.current = false;
        setLastParsed(null);

        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }

        const langCode = language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
        recognitionRef.current.lang = langCode;
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Error starting speech recognition:', err);
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div
      className={`bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 shadow-sm space-y-3 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleListening}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse ring-4 ring-rose-200'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white hover:scale-105'
            }`}
            title={isListening ? t.wizard.voice?.stopListening : t.wizard.voice?.startListening}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900">
                {isListening
                  ? t.wizard.voice?.speakNow || 'Listening...'
                  : t.wizard.voice?.startListening || 'Voice Assistant'}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                {language === 'te' ? 'తెలుగు' : language === 'hi' ? 'हिंदी' : 'English'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {isListening
                ? t.wizard.voice?.listeningStatus ||
                  'Speak your crop, symptoms, area, duration, and water level...'
                : t.wizard.voice?.clickOrSpeakHelp || 'Tap mic to speak instead of typing'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isListening && (
            <button
              type="button"
              onClick={finishVoiceSession}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>{t.wizard.voice?.doneSpeaking || 'Done Speaking'}</span>
            </button>
          )}

          {agentSpeaking && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-100 text-teal-800 text-xs font-bold animate-pulse">
              <Volume2 className="w-4 h-4" />
              <span>AI Speaking...</span>
            </div>
          )}
        </div>
      </div>

      {/* Live speech transcription display */}
      {liveTranscript && (
        <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-slate-800 font-medium space-y-1 shadow-inner">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live Voice Input:</span>
          </div>
          <p className="italic text-slate-700">&quot;{liveTranscript}&quot;</p>
        </div>
      )}

      {/* Real-time extracted parameters chips */}
      {lastParsed &&
        (lastParsed.crop ||
          lastParsed.symptoms.length > 0 ||
          lastParsed.affectedArea ||
          lastParsed.durationDays ||
          lastParsed.previousCrop ||
          lastParsed.waterLevel) && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="font-bold text-emerald-900">
              {t.wizard.voice?.detectedPrompt || 'Detected:'}
            </span>
            {lastParsed.crop && (
              <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-semibold border border-emerald-300">
                🌾 {getLocalizedCropSpoken(lastParsed.crop, language)}
              </span>
            )}
            {lastParsed.symptoms.length > 0 && (
              <span className="px-2 py-1 rounded-lg bg-amber-100 text-amber-900 font-semibold border border-amber-300">
                ⚠️ {lastParsed.symptoms.length} symptom(s)
              </span>
            )}
            {lastParsed.affectedArea && (
              <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-900 font-semibold border border-blue-300">
                📐 {lastParsed.affectedArea}
              </span>
            )}
            {lastParsed.durationDays && (
              <span className="px-2 py-1 rounded-lg bg-purple-100 text-purple-900 font-semibold border border-purple-300">
                ⏱️ {lastParsed.durationDays}
              </span>
            )}
            {lastParsed.waterLevel && (
              <span className="px-2 py-1 rounded-lg bg-cyan-100 text-cyan-900 font-semibold border border-cyan-300">
                💧 {lastParsed.waterLevel}
              </span>
            )}
            {lastParsed.previousCrop && (
              <span className="px-2 py-1 rounded-lg bg-stone-100 text-stone-800 font-semibold border border-stone-300">
                🔄 {lastParsed.previousCrop}
              </span>
            )}
          </div>
        )}

      {errorMessage && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}

