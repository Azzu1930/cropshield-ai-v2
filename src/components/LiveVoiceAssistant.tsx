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
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0]?.transcript || '';
          if (event.results[i].isFinal) {
            final += trans + ' ';
          } else {
            interim += trans;
          }
        }

        const currentText = (final + ' ' + interim).trim();
        setLiveTranscript(currentText);

        if (final.trim()) {
          const parsed = parseAgriculturalSpeech(final.trim(), language as any);
          if (
            parsed.crop ||
            parsed.symptoms.length > 0 ||
            parsed.affectedArea ||
            parsed.durationDays ||
            parsed.previousCrop
          ) {
            setLastParsed(parsed);
            onExtracted(parsed);

            // If photo has not been uploaded yet, explicitly prompt the farmer in their language to upload it
            let feedback = parsed.summaryFeedback;
            if (!hasPhotoRef.current) {
              if (language === 'te') {
                feedback = `${parsed.crop ? `పంట ${parsed.crop} ` : ''}వివరాలు నమోదయ్యాయి. దయచేసి ఇప్పుడు మీ పంట ఫోటోను తీయండి లేదా అప్‌లోడ్ చేయండి.`;
              } else if (language === 'hi') {
                feedback = `${parsed.crop ? `फसल ${parsed.crop} ` : ''}की जानकारी दर्ज हो गई है। कृपया अब अपनी फसल की फोटो अपलोड करें।`;
              } else {
                feedback = `${parsed.crop ? `Crop ${parsed.crop} ` : ''}details recorded. Please take or upload a photo of your crop now.`;
              }
            }

            // Speak voice feedback to farmer in their language
            speakAgentResponse(feedback);

            if (onRequestPhotoUpload && !hasPhotoRef.current) {
              setTimeout(() => {
                onRequestPhotoUpload();
              }, 1200);
            }
          }
        }
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
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Could not initialize SpeechRecognition:', err);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
    };
  }, [language, t]);

  const speakAgentResponse = (message: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !message) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    const targetLang = language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.lang = targetLang;
    utterance.rate = 0.95;

    // Try finding matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) => v.lang.startsWith(language));
    if (matchingVoice) utterance.voice = matchingVoice;

    utterance.onstart = () => setAgentSpeaking(true);
    utterance.onend = () => setAgentSpeaking(false);
    utterance.onerror = () => setAgentSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
      setIsListening(false);
    } else {
      try {
        setErrorMessage(null);
        setLiveTranscript('');
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
    <div className={`bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 shadow-sm space-y-3 ${className}`}>
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
                {isListening ? (t.wizard.voice?.speakNow || 'Listening...') : (t.wizard.voice?.startListening || 'Voice Assistant')}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                {language === 'te' ? 'తెలుగు' : language === 'hi' ? 'हिंदी' : 'English'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {isListening
                ? (t.wizard.voice?.listeningStatus || 'Speak your crop, symptoms, or affected area...')
                : (t.wizard.voice?.clickOrSpeakHelp || 'Tap mic to speak instead of typing')}
            </p>
          </div>
        </div>

        {agentSpeaking && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-100 text-teal-800 text-xs font-bold animate-pulse">
            <Volume2 className="w-4 h-4" />
            <span>AI Speaking...</span>
          </div>
        )}
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

      {/* Last extracted parameters preview */}
      {lastParsed && (lastParsed.crop || lastParsed.symptoms.length > 0 || lastParsed.affectedArea) && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="font-bold text-emerald-900">{t.wizard.voice?.detectedPrompt || 'Detected:'}</span>
          {lastParsed.crop && (
            <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-semibold border border-emerald-300">
              🌾 {lastParsed.crop}
            </span>
          )}
          {lastParsed.symptoms.length > 0 && (
            <span className="px-2 py-1 rounded-lg bg-amber-100 text-amber-900 font-semibold border border-amber-300">
              ⚠️ {lastParsed.symptoms.length} symptom(s)
            </span>
          )}
          {lastParsed.affectedArea && (
            <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-900 font-semibold border border-blue-300">
              📐 Area: {lastParsed.affectedArea}
            </span>
          )}
          {lastParsed.durationDays && (
            <span className="px-2 py-1 rounded-lg bg-purple-100 text-purple-900 font-semibold border border-purple-300">
              ⏱️ {lastParsed.durationDays}
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
