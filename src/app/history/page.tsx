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
  Trash2,
  Filter,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
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
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<HistoryItem | null>(null);
  const [filterCrop, setFilterCrop] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load history from localStorage & Supabase
  useEffect(() => {
    async function fetchHistory() {
      setIsLoading(true);
      const itemsMap = new Map<string, HistoryItem>();

      // 1. Read from localStorage
      try {
        const raw = localStorage.getItem('cropshield_history');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach((item: any) => {
              if (item && (item.id || item.cropName)) {
                itemsMap.set(item.id || `${item.cropName}-${item.createdAt}`, item);
              }
            });
          }
        }
      } catch {
        // Ignore localStorage parsing error
      }

      // 2. Fetch from Supabase if authenticated
      if (isSupabaseConfigured && supabase && user && !user.isDemo) {
        try {
          const { data, error } = await supabase
            .from('assessments')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (!error && data) {
            data.forEach((row: any) => {
              const mapped: HistoryItem = {
                id: row.id,
                cropName: row.crop_name,
                photoPreview: row.image_url,
                possibleIssue: row.possible_issue,
                issueCategory: row.issue_category,
                seriousness: row.seriousness,
                confidenceLevel: row.confidence_level,
                confidenceScore: row.confidence_score ? Number(row.confidence_score) : 0.85,
                explanation: row.explanation,
                whyReasons: Array.isArray(row.why_reasons) ? row.why_reasons : [],
                actions: Array.isArray(row.actions) ? row.actions : [],
                previousComparison: row.previous_comparison,
                isPreliminary: row.is_preliminary,
                aiProvider: row.ai_provider,
                language: row.language,
                createdAt: row.created_at,
              };
              itemsMap.set(row.id, mapped);
            });
          }
        } catch (err) {
          console.warn('Error fetching Supabase history:', err);
        }
      }

      // If completely empty, supply realistic default samples so the farmer sees the format
      if (itemsMap.size === 0) {
        const sample: HistoryItem[] = [
          {
            id: 'sample-1',
            cropName: 'Rice',
            possibleIssue:
              language === 'te'
                ? 'వరి ఆకుమచ్చ తెగులు ప్రారంభ లక్షణాలు'
                : language === 'hi'
                ? 'धान पत्ता धब्बा रोग के शुरुआती लक्षण'
                : 'Early Fungal Brown Spot on Rice',
            issueCategory: 'fungal',
            seriousness: 'MEDIUM',
            confidenceLevel: 'HIGH',
            confidenceScore: 0.88,
            explanation:
              language === 'te'
                ? 'ఆకులపై గోధుమ రంగు మచ్చలు మరియు అధిక తేమ గుర్తించబడ్డాయి.'
                : 'Brown leaf spotting observed under humid micro-climate.',
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
            possibleIssue:
              language === 'te'
                ? 'మిరపలో ఆకుముడత మరియు రసం పీల్చే పురుగులు'
                : language === 'hi'
                ? 'मिर्च में मरोड़िया रोग और रस चूसक कीट'
                : 'Chilli Leaf Curl & Sucking Pest Infestation',
            issueCategory: 'pest',
            seriousness: 'HIGH',
            confidenceLevel: 'HIGH',
            confidenceScore: 0.92,
            explanation:
              language === 'te'
                ? 'ఆకులు పైకి ముడుచుకోవడం మరియు రసం పీల్చే కీటకాలు గమనించబడ్డాయి.'
                : 'Upward leaf curling and thrips activity observed.',
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
        sample.forEach((s) => itemsMap.set(s.id, s));
      }

      const list = Array.from(itemsMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setHistory(list);
      setIsLoading(false);
    }

    fetchHistory();
  }, [user, language]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(language === 'te' ? 'ఈ నివేదికను తొలగించాలనుకుంటున్నారా?' : language === 'hi' ? 'क्या आप इस रिपोर्ट को हटाना चाहते हैं?' : 'Delete this check report?')) {
      return;
    }

    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    try {
      localStorage.setItem('cropshield_history', JSON.stringify(updated));
    } catch {
      // Ignore
    }

    if (isSupabaseConfigured && supabase && user && !user.isDemo) {
      supabase.from('assessments').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase delete assessment error:', error.message);
      });
    }
  };

  const crops = Array.from(new Set(history.map((h) => h.cropName)));

  const filteredHistory = filterCrop === 'ALL'
    ? history
    : history.filter((h) => h.cropName.toLowerCase() === filterCrop.toLowerCase());

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

      {/* Filter by Crop tabs if multiple crops exist */}
      {crops.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-bold text-gray-500 flex items-center gap-1 shrink-0 pl-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>

          <button
            type="button"
            onClick={() => setFilterCrop('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 ${
              filterCrop === 'ALL'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Crops ({history.length})
          </button>

          {crops.map((crop) => (
            <button
              key={crop}
              type="button"
              onClick={() => setFilterCrop(crop)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 ${
                filterCrop === crop
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              🌾 {crop}
            </button>
          ))}
        </div>
      )}

      {/* History List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-3xl bg-white border border-gray-200 p-4 animate-pulse" />
          ))}
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-gray-300 space-y-4">
          <FileText className="w-12 h-12 text-gray-400 mx-auto" />
          <h2 className="text-lg font-bold text-gray-800">No crop checks found</h2>
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
            {filteredHistory.map((item, idx) => {
              const dateObj = new Date(item.createdAt);
              const dateStr = dateObj.toLocaleDateString(
                language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-US',
                { month: 'short', day: 'numeric', year: 'numeric' }
              );

              const isHigh = item.seriousness === 'HIGH';
              const isMedium = item.seriousness === 'MEDIUM';

              return (
                <div
                  key={item.id || idx}
                  onClick={() => setSelectedReport(item)}
                  className="w-full text-left p-5 rounded-3xl bg-white border-2 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4 group cursor-pointer"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
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

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-gray-900 truncate">
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

                      <div className="flex items-center gap-2 mt-2 flex-wrap">
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

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.id, e)}
                      title="Delete Report"
                      className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-700" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
