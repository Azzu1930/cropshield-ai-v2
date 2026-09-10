'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  ChevronRight,
  Sprout,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ClipboardList,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { SimpleResultView } from './SimpleResultView';
import type { CropAnalysisResult } from '@/lib/ai/ai-service.interface';

export interface HistoryItem extends CropAnalysisResult {
  id: string;
  cropName: string;
  photoPreview?: string;
  createdAt: string;
}

export function RecentChecksSection() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [recentChecks, setRecentChecks] = useState<HistoryItem[]>([]);
  const [selectedCheck, setSelectedCheck] = useState<HistoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true);
      const itemsMap = new Map<string, HistoryItem>();

      const scope = user?.id || 'anonymous';
      const storageKey = `cropshield_history_${scope}`;

      // 1. First, load from user-isolated localStorage
      try {
        const localRaw = localStorage.getItem(storageKey);
        if (localRaw) {
          const parsed = JSON.parse(localRaw);
          if (Array.isArray(parsed)) {
            parsed.forEach((item: any) => {
              if (item && (item.id || item.cropName)) {
                itemsMap.set(item.id || `${item.cropName}-${item.createdAt}`, item);
              }
            });
          }
        }
      } catch {
        // Ignore localStorage read errors
      }

      // 2. If user is logged in & Supabase is configured, fetch latest from Supabase
      if (isSupabaseConfigured && supabase && user) {
        try {
          const { data, error } = await supabase
            .from('assessments')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

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
        } catch (sbErr) {
          console.warn('Could not fetch remote assessments:', sbErr);
        }
      }

      const allItems = Array.from(itemsMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setRecentChecks(allItems.slice(0, 3));
      setIsLoading(false);
    }

    loadHistory();
  }, [user, language]);

  // If a report is clicked, show the modal view
  if (selectedCheck) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in">
        <div className="bg-white rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
          <SimpleResultView
            result={selectedCheck}
            cropName={selectedCheck.cropName}
            photoPreview={selectedCheck.photoPreview}
            onReset={() => setSelectedCheck(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <section aria-label="Recent Crop Health History" className="space-y-3.5">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-emerald-700" />
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            {t.recentChecks.title}
          </h2>
        </div>

        <Link
          href="/history"
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline transition-all"
        >
          <span>{t.recentChecks.viewAll}</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-white border border-slate-200 p-4 animate-pulse"
            />
          ))}
        </div>
      ) : recentChecks.length === 0 ? (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-emerald-700 flex items-center justify-center mx-auto">
            <Sprout className="w-5 h-5" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-600 max-w-md mx-auto">
            {t.recentChecks.noChecksYet}
          </p>
          <Link
            href="/check-crop"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm transition-colors"
          >
            <Sprout className="w-4 h-4" />
            <span>{t.homeCards.checkCrop.title}</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {recentChecks.map((item) => {
            const dateObj = new Date(item.createdAt);
            const dateStr = dateObj.toLocaleDateString(
              language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-US',
              { month: 'short', day: 'numeric' }
            );

            const isHigh = item.seriousness === 'HIGH';
            const isMedium = item.seriousness === 'MEDIUM';

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedCheck(item)}
                className="w-full text-left p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-sm transition-all flex flex-col justify-between group"
              >
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.photoPreview ? (
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                          <img
                            src={item.photoPreview}
                            alt={item.cropName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
                          <Sprout className="w-4 h-4" />
                        </div>
                      )}
                      <span className="font-semibold text-xs text-slate-900 truncate">
                        {item.cropName}
                      </span>
                    </div>

                    <span className="text-[11px] font-medium text-slate-400">
                      {dateStr}
                    </span>
                  </div>

                  <p className="font-bold text-xs text-gray-800 line-clamp-2 leading-snug">
                    {item.possibleIssue}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100 w-full">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isHigh
                        ? 'bg-red-100 text-red-800'
                        : isMedium
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isHigh ? 'bg-red-600' : isMedium ? 'bg-amber-600' : 'bg-emerald-600'
                      }`}
                    />
                    {isHigh ? 'High Risk' : isMedium ? 'Medium Risk' : 'Healthy'}
                  </span>

                  <span className="text-xs font-bold text-emerald-700 flex items-center group-hover:translate-x-0.5 transition-transform">
                    <span>View</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
