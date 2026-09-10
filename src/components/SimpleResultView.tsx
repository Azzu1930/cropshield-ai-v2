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
import { VoiceNarrator } from './VoiceNarrator';
import type { CropAnalysisResult } from '@/lib/ai/ai-service.interface';

interface SimpleResultViewProps {
  result: CropAnalysisResult;
  cropName: string;
  photoPreview?: string | null;
  onReset: () => void;
}

export function SimpleResultView({ result, cropName, photoPreview, onReset }: SimpleResultViewProps) {
  const { t, language } = useLanguage();
  const [showWhyDetails, setShowWhyDetails] = useState(false);
  const [isExpertModalOpen, setIsExpertModalOpen] = useState(false);
  const [farmerNotes, setFarmerNotes] = useState('');
  const [expertSubmitted, setExpertSubmitted] = useState(false);
  const [submittingExpert, setSubmittingExpert] = useState(false);

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

  // Prepare spoken text for Voice Narrator
  const spokenText = `${result.possibleIssue}. ${t.result.howSeriousTitle}: ${badge.label}. ${t.result.whatShouldIDoTitle}: ${result.actions.join('. ')}. ${t.result.checkAgainNotice}`;

  const handleAskExpertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingExpert(true);
    try {
      await fetch('/api/expert-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: (result as any).id || `eval-${Date.now()}`,
          farmerNotes,
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

        {/* 🔊 Listen Button (Browser Speech Synthesis) */}
        <VoiceNarrator text={spokenText} label={t.result.listenResult} />
      </div>

      {/* Main Diagnosis Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-200 shadow-xl space-y-6">
        {/* Header with Photo Preview & Title */}
        <div className="flex items-start gap-4">
          {photoPreview && (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-emerald-300 shrink-0 bg-gray-100 shadow-sm">
              <img
                src={photoPreview}
                alt="Crop symptom"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black uppercase tracking-wider mb-1.5">
              {cropName}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-950 leading-snug">
              {result.possibleIssue}
            </h2>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              {result.explanation}
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
        {result.previousComparison && (
          <div className="p-4 rounded-2xl bg-blue-50/80 border-2 border-blue-200 space-y-1">
            <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              {t.result.comparedWithLast}
            </p>
            <p className="text-sm font-extrabold text-blue-950">
              {result.previousComparison.status === 'better'
                ? t.result.comparisonStatus.better
                : result.previousComparison.status === 'needs_attention'
                ? t.result.comparisonStatus.needsAttention
                : t.result.comparisonStatus.same}
            </p>
            <p className="text-xs text-blue-800">
              {result.previousComparison.explanation}
            </p>
          </div>
        )}

        {/* 3-5 Simple Action Steps */}
        <div className="pt-2">
          <h3 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
            <span>📋</span> {t.result.whatShouldIDoTitle}
          </h3>
          <div className="space-y-3">
            {result.actions.map((action, idx) => (
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
              {result.whyReasons.map((reason, idx) => (
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
            <p className="text-sm font-bold text-purple-900">
              👨🌾 {t.result.expertPrompt}
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
                <h3 className="text-lg font-black text-gray-900">
                  👨🌾 {t.result.askExpertBtn}
                </h3>
                <p className="text-xs text-gray-500">
                  An expert from Krishi Vigyan Kendra (KVK) can review your crop symptoms, weather, and photo.
                </p>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Any specific question for the expert?
                  </label>
                  <textarea
                    rows={3}
                    value={farmerNotes}
                    onChange={(e) => setFarmerNotes(e.target.value)}
                    placeholder="e.g. Can I spray neem oil tomorrow? Will this spread to other plots?"
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
                    {submittingExpert ? t.common.saving : 'Submit Request'}
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
