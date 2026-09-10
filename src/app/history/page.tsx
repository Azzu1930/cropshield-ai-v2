'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Sprout,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { SimpleResultView } from '@/components/SimpleResultView';
import type { CropAnalysisResult } from '@/lib/ai/ai-service.interface';

interface HistoryItem extends CropAnalysisResult {
  id: string;
  cropName: string;
  photoPreview?: string;
  createdAt: string;
}

export default function HistoryPage() {
  const { t, language } = useLanguage();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<HistoryItem | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cropshield_history');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      } else {
        // Initial sample history items if none exists
        const sample: HistoryItem[] = [
          {
            id: 'sample-1',
            cropName: 'Rice',
            possibleIssue: language === 'te' ? 'వరి ఆకుమచ్చ తెగులు ప్రారంభ లక్షణాలు' : language === 'hi' ? 'धान पत्ता धब्बा रोग के शुरुआती लक्षण' : 'Early Fungal Brown Spot on Rice',
            issueCategory: 'fungal',
            seriousness: 'MEDIUM',
            confidenceLevel: 'HIGH',
            confidenceScore: 0.88,
            explanation: language === 'te' ? 'ఆకులపై గోధుమ రంగు మచ్చలు మరియు అధిక తేమ గుర్తించబడ్డాయి.' : 'Brown leaf spotting observed under humid micro-climate.',
            whyReasons: [
              'Brown spots on leaf margins.',
              'Farm humidity above 80% with afternoon showers.',
            ],
            actions: [
              'Inspect affected leaves today.',
              'Avoid unnecessary irrigation.',
              'Check again in 3 days.',
            ],
            previousComparison: {
              status: 'better',
              explanation: 'Condition improved compared to last week check.',
            },
            isPreliminary: true,
            aiProvider: 'rule-based',
            language,
            createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          },
          {
            id: 'sample-2',
            cropName: 'Chilli',
            possibleIssue: language === 'te' ? 'మిరపలో ఆకుముడత మరియు రసం పీల్చే పురుగులు' : language === 'hi' ? 'मिर्च में मरोड़िया रोग और रस चूसक कीट' : 'Chilli Leaf Curl & Sucking Pest Infestation',
            issueCategory: 'pest',
            seriousness: 'HIGH',
            confidenceLevel: 'HIGH',
            confidenceScore: 0.92,
            explanation: language === 'te' ? 'ఆకులు పైకి ముడుచుకోవడం మరియు రసం పీల్చే కీటకాలు గమనించబడ్డాయి.' : 'Upward leaf curling and thrips activity observed.',
            whyReasons: [
              'Leaf curl symptoms present.',
              'Warm temperatures facilitating pest reproduction.',
            ],
            actions: [
              'Spray neem oil (5ml/L) immediately.',
              'Install yellow sticky traps.',
              'Consult local agricultural officer.',
            ],
            isPreliminary: true,
            aiProvider: 'rule-based',
            language,
            createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
          },
        ];
        setHistory(sample);
      }
    } catch {
      // Ignore
    }
  }, [language]);

  if (selectedReport) {
    return (
      <div className="py-2">
        <SimpleResultView
          result={selectedReport}
          cropName={selectedReport.cropName}
          photoPreview={selectedReport.photoPreview}
          onReset={() => setSelectedReport(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in pb-16">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-emerald-100 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-gray-100 hover:bg-emerald-50 text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
              <span>📋</span> {t.homeCards.myReports.title}
            </h1>
            <p className="text-sm font-semibold text-emerald-800 mt-0.5">
              {t.homeCards.myReports.desc}
            </p>
          </div>
        </div>

        <Link
          href="/check-crop"
          className="px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md flex items-center gap-1.5 transition-all"
        >
          <Sprout className="w-4 h-4" />
          <span>+ New Check</span>
        </Link>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-gray-300 space-y-4">
          <FileText className="w-12 h-12 text-gray-400 mx-auto" />
          <h2 className="text-lg font-bold text-gray-800">No crop checks yet</h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Take a photo of your crop to get instant health advice and start tracking your crop history.
          </p>
          <Link
            href="/check-crop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-700 text-white font-extrabold text-sm shadow-md"
          >
            <Sprout className="w-4 h-4" />
            <span>Check My Crop Now</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider px-1">
            Tap any card to view full diagnosis & action steps:
          </h2>

          <div className="grid grid-cols-1 gap-3.5">
            {history.map((item, idx) => {
              const dateObj = new Date(item.createdAt);
              const dateStr = dateObj.toLocaleDateString(
                language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-US',
                { month: 'short', day: 'numeric', year: 'numeric' }
              );

              const isHigh = item.seriousness === 'HIGH';
              const isMedium = item.seriousness === 'MEDIUM';

              return (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={() => setSelectedReport(item)}
                  className="w-full text-left p-5 rounded-3xl bg-white border-2 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-4">
                    {item.photoPreview ? (
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-emerald-300 shrink-0 bg-gray-100">
                        <img
                          src={item.photoPreview}
                          alt={item.cropName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl shrink-0">
                        🌾
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-gray-900">
                          {item.cropName}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs font-semibold text-gray-500">
                          {dateStr}
                        </span>
                      </div>

                      <p className="font-extrabold text-sm text-gray-800 mt-1 line-clamp-1">
                        {item.possibleIssue}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        {/* Risk Tag */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isHigh
                              ? 'bg-red-100 text-red-800'
                              : isMedium
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isHigh ? 'bg-red-600' : isMedium ? 'bg-amber-600' : 'bg-emerald-600'
                            }`}
                          />
                          {isHigh ? 'High Risk' : isMedium ? 'Medium Risk' : 'Healthy / Low Risk'}
                        </span>

                        {/* Comparison Tag */}
                        {item.previousComparison && (
                          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                            {item.previousComparison.status === 'better' ? '🟢 Improving' : 'Needs attention'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-700" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
