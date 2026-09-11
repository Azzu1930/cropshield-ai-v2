'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Share2,
  ArrowLeft,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { VoiceNarrator } from './VoiceNarrator';
import type { CropAnalysisResult } from '@/lib/ai/ai-service.interface';
import { getLocalizedResultContent, translateExplanation } from '@/lib/i18n/agricultural-translations';
import { getCropImage, getFallbackCropImage } from '@/lib/crop-images';

interface SimpleResultViewProps {
  result: CropAnalysisResult;
  cropName: string;
  photoPreview?: string | null;
  onReset: () => void;
}

export function SimpleResultView({ result, cropName, photoPreview, onReset }: SimpleResultViewProps) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [showWhyDetails, setShowWhyDetails] = useState(false);
  const [isExpertModalOpen, setIsExpertModalOpen] = useState(false);
  const [farmerNotes, setFarmerNotes] = useState('');
  const [expertSubmitted, setExpertSubmitted] = useState(false);
  const [submittingExpert, setSubmittingExpert] = useState(false);

  // Check if image was rejected or crop was not detected
  const isCropDetected =
    result.isCropDetected !== false &&
    result.possibleIssue !== 'CROP_NOT_DETECTED' &&
    result.issueCategory !== 'unknown';

  if (!isCropDetected) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
        <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-emerald-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.wizard.buttons.back}</span>
          </button>
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
            {language === 'te' ? 'చెల్లని చిత్రం' : language === 'hi' ? 'अमान्य चित्र' : 'Invalid Image'}
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-red-200 shadow-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border-2 border-red-100">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">
              {language === 'te'
                ? 'పంట గుర్తించబడలేదు'
                : language === 'hi'
                ? 'फसल नहीं पहचानी गई'
                : 'Crop Not Detected'}
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              {translateExplanation(result.explanation, language) ||
                (language === 'te'
                  ? 'మీరు అప్‌లోడ్ చేసిన చిత్రంలో వ్యవసాయ పంట లేదా ఆకు గుర్తించబడలేదు. సిస్టమ్ కేవలం పంటలు, ఆకులు మరియు మొక్కల ఫోటోలను మాత్రమే విశ్లేషిస్తుంది. మనుషులు, డ్రాయింగ్‌లు లేదా ఇతర చిత్రాలకు ఎటువంటి సిఫార్సులు ఇవ్వబడవు.'
                  : language === 'hi'
                  ? 'अपलोड की गई फोटो में कृषि फसल या पत्ता नहीं पहचाना गया। सिस्टम केवल फसल और पौधों की तस्वीरों का विश्लेषण करता है। अन्य किसी भी फोटो के लिए सिफारिशें नहीं दी जाएंगी।'
                  : 'The uploaded image does not contain an agricultural crop, leaf, or farm plant. CropShield AI only provides recommendations for genuine crop photos. Random images, faces, and drawings are rejected.')}
            </p>
          </div>

          {photoPreview && (
            <div className="relative max-w-xs mx-auto rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100">
              <img
                src={photoPreview}
                alt="Uploaded photo"
                className="w-full h-48 object-cover opacity-60 grayscale"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-black uppercase tracking-wider shadow">
                  {language === 'te' ? 'తిరస్కరించబడింది' : language === 'hi' ? 'अस्वीकृत' : 'Rejected'}
                </span>
              </div>
            </div>
          )}

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 text-left space-y-2">
            <span className="font-bold text-slate-800 block">
              {language === 'te' ? 'సరైన ఫోటో ఎలా తీయాలి?' : language === 'hi' ? 'सही फोटो कैसे लें?' : 'How to take a valid photo?'}
            </span>
            <ul className="list-disc list-inside space-y-1">
              <li>{language === 'te' ? 'పంట యొక్క ఆకు లేదా కొమ్మను దగ్గరగా ఉంచి స్పష్టమైన ఫోటో తీయండి.' : language === 'hi' ? 'फसल की पत्ती या पौधे की स्पष्ट फोटो लें।' : 'Take a clear, close-up photo of the crop leaf or plant.'}</li>
              <li>{language === 'te' ? 'మనుషుల ముఖాలు, కాగితాలు లేదా వస్తువుల ఫోటోలు తీయవద్దు.' : language === 'hi' ? 'इंसान, चेहरे, कागज या अन्य वस्तुओं की फोटो न लें।' : 'Do not take photos of people, drawings, documents, or random objects.'}</li>
              <li>{language === 'te' ? 'మంచి వెలుతురులో మాత్రమే ఫోటో తీయండి.' : language === 'hi' ? 'अच्छी रोशनी में फोटो खींचें।' : 'Ensure good daytime lighting in the field.'}</li>
            </ul>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onReset}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md transition-colors"
            >
              {language === 'te'
                ? 'మళ్లీ సరైన పంట ఫోటో తీయండి'
                : language === 'hi'
                ? 'फिर से असली फसल की फोटो लें'
                : 'Upload a Real Crop Photo'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Determine Seriousness Badge
  const getSeriousnessBadge = () => {
    switch (result.seriousness) {
      case 'HIGH':
        return {
          bg: 'bg-red-50 border-red-300 text-red-800',
          dot: 'bg-red-500',
          label: t.result.seriousness.high,
          icon: AlertTriangle,
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-50 border-amber-300 text-amber-800',
          dot: 'bg-amber-500',
          label: t.result.seriousness.medium,
          icon: AlertTriangle,
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-50 border-emerald-300 text-emerald-800',
          dot: 'bg-emerald-500',
          label: result.issueCategory === 'healthy' ? t.result.seriousness.healthy : t.result.seriousness.low,
          icon: CheckCircle2,
        };
    }
  };

  // Determine Confidence Badge
  const getConfidenceBadge = () => {
    switch (result.confidenceLevel) {
      case 'HIGH':
        return { text: t.result.confidence.high, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'MEDIUM':
        return { text: t.result.confidence.medium, color: 'text-amber-700 bg-amber-50 border-amber-200' };
      case 'LOW':
      default:
        return { text: t.result.confidence.low, color: 'text-red-700 bg-red-50 border-red-200' };
    }
  };

  const badge = getSeriousnessBadge();
  const conf = getConfidenceBadge();

  // Dynamically resolve localized content based on selected language
  const localized = getLocalizedResultContent(result, language);
  const activePossibleIssue = localized.possibleIssue || result.possibleIssue;
  const activeExplanation = localized.explanation || result.explanation;
  const activeActions =
    localized.actions && localized.actions.length > 0
      ? localized.actions
      : result.actions;
  const activeWhyReasons =
    localized.whyReasons && localized.whyReasons.length > 0
      ? localized.whyReasons
      : result.whyReasons;
  const activeComparison = localized.previousComparison || result.previousComparison;

  // Localized crop name for badge
  const getLocalizedCropName = (crop: string) => {
    const c = (crop || '').toLowerCase();
    if (c.includes('groundnut') || c.includes('వేరుశనగ') || c.includes('मूंगफली')) {
      return t.wizard.crops.groundnut;
    }
    if (c.includes('tomato') || c.includes('టమాట') || c.includes('टमाटर')) {
      return t.wizard.crops.tomato;
    }
    if (c.includes('rice') || c.includes('paddy') || c.includes('వరి') || c.includes('धान')) {
      return t.wizard.crops.rice;
    }
    if (c.includes('chilli') || c.includes('మిరప') || c.includes('मिर्च')) {
      return t.wizard.crops.chilli;
    }
    if (c.includes('cotton') || c.includes('పత్తి') || c.includes('कपास')) {
      return t.wizard.crops.cotton;
    }
    if (c.includes('maize') || c.includes('corn') || c.includes('మొక్కజొన్న') || c.includes('मक्का')) {
      return t.wizard.crops.maize;
    }
    return crop;
  };

  // Prepare spoken text for Voice Narrator in selected language
  const spokenText = `${activePossibleIssue}. ${t.result.howSeriousTitle}: ${badge.label}. ${t.result.whatShouldIDoTitle}: ${activeActions.join('. ')}. ${t.result.checkAgainNotice}`;

  const handleAskExpertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingExpert(true);

    const scope = user?.id || 'anonymous';
    const storageKey = `cropshield_expert_reviews_${scope}`;
    const newRev = {
      id: `exp-${Date.now()}`,
      cropName: cropName || 'Field Crop',
      status: 'pending' as const,
      farmerNotes: farmerNotes || 'Farmer requested review from KVK scientist',
      createdAt: new Date().toISOString(),
    };

    try {
      const raw = localStorage.getItem(storageKey);
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(newRev);
      localStorage.setItem(storageKey, JSON.stringify(list));
    } catch {
      // Ignore
    }

    try {
      await fetch('/api/expert-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: (result as any).id || `eval-${Date.now()}`,
          farmerNotes,
          cropName,
          userId: user?.id,
        }),
      });
      setExpertSubmitted(true);
    } catch (err) {
      console.error(err);
      setExpertSubmitted(true);
    } finally {
      setSubmittingExpert(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Controls & Voice Listen Button */}
      <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-sm">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-emerald-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.wizard.buttons.back}</span>
        </button>

        {/* 🔊 Listen Button (Browser Speech Synthesis with auto-play) */}
        <VoiceNarrator text={spokenText} label={t.result.listenResult} autoPlay={true} />
      </div>

      {/* Main Diagnosis Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-200 shadow-xl space-y-6">
        {/* Header with Photo Preview & Title */}
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-emerald-300 shrink-0 bg-gray-100 shadow-sm">
            <img
              src={getCropImage(cropName, activePossibleIssue, photoPreview)}
              alt="Crop symptom"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = getFallbackCropImage(cropName, activePossibleIssue);
              }}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black uppercase tracking-wider mb-1.5">
              {getLocalizedCropName(cropName)}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-950 leading-snug">
              {activePossibleIssue}
            </h2>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              {activeExplanation}
            </p>
          </div>
        </div>

        {/* Seriousness Status (Green / Yellow / Red) */}
        <div className="pt-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            {t.result.howSeriousTitle}
          </p>
          <div className={`p-4 rounded-2xl border-2 flex items-center gap-3 ${badge.bg}`}>
            <span className={`w-4 h-4 rounded-full ${badge.dot} shrink-0 animate-pulse`} />
            <span className="text-base sm:text-lg font-extrabold">{badge.label}</span>
          </div>
        </div>

        {/* History Comparison (if previous assessment exists) */}
        {activeComparison && (
          <div className="p-4 rounded-2xl bg-blue-50/80 border-2 border-blue-200 space-y-1">
            <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              {t.result.comparedWithLast}
            </p>
            <p className="text-sm font-extrabold text-blue-950">
              {activeComparison.status === 'better'
                ? t.result.comparisonStatus.better
                : activeComparison.status === 'needs_attention'
                ? t.result.comparisonStatus.needsAttention
                : t.result.comparisonStatus.same}
            </p>
            <p className="text-xs text-blue-800">
              {activeComparison.explanation}
            </p>
          </div>
        )}

        {/* 3-5 Simple Action Steps */}
        <div className="pt-2">
          <h3 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
            <span>📋</span> {t.result.whatShouldIDoTitle}
          </h3>
          <div className="space-y-3">
            {activeActions.map((action, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-3.5"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-black text-sm flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-sm sm:text-base font-bold text-emerald-950 leading-relaxed">
                  {action}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Explain "WHY" Did We Give This Advice? */}
        <div className="pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setShowWhyDetails(!showWhyDetails)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-700 shrink-0" />
              <span className="font-extrabold text-sm sm:text-base text-gray-900">
                {t.result.whyTitle}
              </span>
            </div>
            {showWhyDetails ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {showWhyDetails && (
            <div className="mt-3 p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2.5 text-xs sm:text-sm text-gray-700 animate-in fade-in">
              {activeWhyReasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span className="font-medium leading-relaxed">{reason}</span>
                </div>
              ))}
              <p className="font-bold text-gray-900 pt-2 border-t border-gray-200">
                {language === 'te'
                  ? 'కాబట్టి, ఈ కారణాల కలయిక వల్ల ఈ సమస్య వచ్చి ఉండవచ్చు.'
                  : language === 'hi'
                  ? 'अतः, इन सभी कारणों के मेल से यह समस्या हो सकती है।'
                  : 'Therefore, these factors combined may be contributing to the problem.'}
              </p>
            </div>
          )}
        </div>

        {/* Result Confidence (Simplified - Green/Yellow/Red, no raw % initially) */}
        <div className="pt-2 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100">
          <span>{t.result.resultConfidenceTitle}</span>
          <span className={`px-3 py-1 rounded-full font-bold border ${conf.color}`}>
            {conf.text}
          </span>
        </div>

        {/* Re-check Notice */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-xs sm:text-sm text-amber-900 font-semibold">
          <Calendar className="w-5 h-5 text-amber-600 shrink-0" />
          <span>{t.result.checkAgainNotice}</span>
        </div>

        {/* Ask an Agricultural Expert Banner */}
        <div className="pt-2 border-t border-gray-100">
          <div className="p-5 rounded-3xl bg-purple-50 border-2 border-purple-200 text-center space-y-3">
            <p className="text-sm font-bold text-purple-900 flex items-center justify-center gap-1.5">
              <UserCheck className="w-4 h-4 text-purple-700" />
              <span>{t.result.expertPrompt}</span>
            </p>
            <p className="text-xs text-purple-800/80 max-w-sm mx-auto">
              {t.result.expertSubtitle}
            </p>
            <button
              type="button"
              onClick={() => setIsExpertModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-sm sm:text-base shadow-md transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <UserCheck className="w-5 h-5" />
              <span>{t.result.askExpertBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expert Modal */}
      {isExpertModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200 animate-in zoom-in-95">
            {expertSubmitted ? (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-black text-gray-900">
                  {t.result.expertSavedNotice}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsExpertModalOpen(false);
                    setExpertSubmitted(false);
                  }}
                  className="px-6 py-2.5 bg-emerald-700 text-white font-bold text-sm rounded-xl"
                >
                  {t.common.close}
                </button>
              </div>
            ) : (
              <form onSubmit={handleAskExpertSubmit} className="space-y-4">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-purple-700" />
                  <span>{t.result.askExpertBtn}</span>
                </h3>
                <p className="text-xs text-gray-500">
                  {t.result.expertModalSubtitle}
                </p>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t.result.expertQuestionLabel}
                  </label>
                  <textarea
                    rows={3}
                    value={farmerNotes}
                    onChange={(e) => setFarmerNotes(e.target.value)}
                    placeholder={t.result.expertPlaceholder}
                    className="w-full p-3 rounded-xl border border-gray-300 text-sm focus:border-purple-600 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsExpertModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-50"
                  >
                    {t.common.close}
                  </button>
                  <button
                    type="submit"
                    disabled={submittingExpert}
                    className="flex-1 py-2.5 rounded-xl bg-purple-700 text-white text-sm font-bold hover:bg-purple-800 disabled:opacity-50"
                  >
                    {submittingExpert ? t.common.saving : t.result.submitRequestBtn}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
