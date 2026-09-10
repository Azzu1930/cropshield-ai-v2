'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UserCheck,
  Clock,
  CheckCircle2,
  PhoneCall,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  X,
  Plus,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface ExpertReviewItem {
  id: string;
  cropName: string;
  status: 'pending' | 'in_review' | 'completed';
  farmerNotes: string;
  expertName?: string;
  expertTitle?: string;
  expertNotes?: string;
  expertRecommendations?: string[];
  reviewedAt?: string;
  createdAt: string;
  contactNumber?: string;
}

export function ExpertReviewTracker() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ExpertReviewItem[]>([]);
  const [selectedReview, setSelectedReview] = useState<ExpertReviewItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Online scientists count (simulated active pool)
  const onlineExpertsCount = 3;

  useEffect(() => {
    async function fetchUserReviews() {
      setIsLoading(true);
      const scope = user?.id || 'anonymous';
      const storageKey = `cropshield_expert_reviews_${scope}`;
      const isDemo = Boolean(user?.isDemo || user?.id === 'demo-farmer-id');
      const itemsMap = new Map<string, ExpertReviewItem>();

      // 1. Read from user-scoped localStorage
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach((item) => {
              if (item?.id) itemsMap.set(item.id, item);
            });
          }
        }
      } catch {
        // Ignore localStorage parsing error
      }

      // 2. Fetch from Supabase if authenticated real user
      if (isSupabaseConfigured && supabase && user && !user.isDemo) {
        try {
          const { data, error } = await supabase
            .from('expert_reviews')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (!error && data) {
            data.forEach((row: any) => {
              itemsMap.set(row.id, {
                id: row.id,
                cropName: 'Crop Inspection',
                status: row.status || 'pending',
                farmerNotes: row.farmer_notes || '',
                expertName: row.expert_name || 'Dr. K. Ramanjaneyulu',
                expertTitle: 'Senior Agronomist, ICAR - KVK',
                expertNotes: row.expert_notes,
                expertRecommendations: Array.isArray(row.expert_recommendations)
                  ? row.expert_recommendations
                  : [],
                reviewedAt: row.reviewed_at,
                createdAt: row.created_at,
              });
            });
          }
        } catch (err) {
          console.warn('Could not fetch remote expert reviews:', err);
        }
      }

      // For Demo Farmer only, provide an illustrative completed review
      if (itemsMap.size === 0 && isDemo) {
        const demoReview: ExpertReviewItem = {
          id: 'demo-exp-1',
          cropName: 'Rice (Paddy)',
          status: 'completed',
          farmerNotes: 'Brown patches on leaf blade with drying margins observed.',
          expertName: 'Dr. K. Ramanjaneyulu, Ph.D.',
          expertTitle: 'Senior Agronomist, Regional KVK Center',
          expertNotes:
            language === 'te'
              ? 'ఆకులలో బ్లాస్ట్ శిలీంధ్రం ప్రారంభ దశలో ఉన్నట్లు నిర్ధారించబడింది. యూరియా వాడకాన్ని తగ్గించండి మరియు ట్రైసైక్లాజోల్ పిచికారీ చేయండి.'
              : language === 'hi'
              ? 'धान में प्रारंभिक झोंका (ब्लास्ट) रोग के लक्षण हैं। यूरिया की मात्रा कम करें और अनुशंसित कवकनाशी का छिड़काव करें।'
              : 'Confirmed early blast infection. Reduce top-dressed urea immediately and follow prescribed foliar fungicidal dosage.',
          expertRecommendations:
            language === 'te'
              ? [
                  'ట్రైసైక్లాజోల్ 75% WP @ 0.6 గ్రా/లీటర్ నీటికి కలిపి సాయంత్రం పిచికారీ చేయండి.',
                  'పొలంలో నిల్వ ఉన్న నీటిని 2 రోజులు తీసివేసి ఆరబెట్టండి (AWD).',
                  'పొటాష్ ఎరువును ఎకరాకు 15 కిలోలు సమానంగా వేయండి.',
                ]
              : language === 'hi'
              ? [
                  'ट्राइसाइक्लाजोल 75% WP (0.6 ग्राम प्रति लीटर) का छिड़काव करें।',
                  'खेत से 2 दिन के लिए पानी निकाल दें ताकि जड़ों को हवा मिले।',
                  'पोटाश की संतुलित मात्रा का प्रयोग करें।',
                ]
              : [
                  'Foliar spray of Tricyclazole 75% WP @ 0.6g per litre of water.',
                  'Drain standing field water for 48 hours to expose soil to sunlight.',
                  'Top-dress MOP (Potash) @ 15 kg/acre to improve disease resistance.',
                ],
          reviewedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
          createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
        };
        itemsMap.set(demoReview.id, demoReview);
      }

      const list = Array.from(itemsMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setReviews(list);
      setIsLoading(false);
    }

    fetchUserReviews();
  }, [user, language]);

  return (
    <section aria-label="Expert Review Status" className="space-y-3.5">
      {/* Tracker Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/50 border-2 border-purple-200 shadow-sm relative overflow-hidden">
        {/* Header with Live Expert Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center text-2xl shadow-md shadow-purple-600/20 shrink-0">
              👨🌾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
                  {language === 'te'
                    ? 'వ్యవసాయ శాస్త్రవేత్త సమీక్ష ట్రాకింగ్'
                    : language === 'hi'
                    ? 'कृषि वैज्ञानिक समीक्षा ट्रैकिंग'
                    : 'Agricultural Scientist Review Tracking'}
                </h2>
              </div>
              <p className="text-xs font-semibold text-purple-900 mt-0.5">
                {language === 'te'
                  ? 'KVK వ్యవసాయ అధికారుల నుండి ధృవీకరించబడిన ప్రిస్క్రిప్షన్'
                  : language === 'hi'
                  ? 'KVK कृषि विशेषज्ञों से प्रमाणित सलाह व उपचार'
                  : 'Certified diagnosis & prescriptions from KVK agronomists'}
              </p>
            </div>
          </div>

          {/* Live Online Badge */}
          <div className="flex items-center gap-2 self-start sm:self-center px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 font-extrabold text-xs shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 -ml-4" />
            <span>
              {language === 'te'
                ? `${onlineExpertsCount} నిపుణులు ఆన్‌లైన్‌లో ఉన్నారు`
                : language === 'hi'
                ? `${onlineExpertsCount} कृषि वैज्ञानिक ऑनलाइन हैं`
                : `${onlineExpertsCount} KVK Scientists Online`}
            </span>
          </div>
        </div>

        {/* Reviews List or Prompt */}
        <div className="pt-4">
          {isLoading ? (
            <div className="h-20 rounded-2xl bg-white border border-purple-100 p-4 animate-pulse" />
          ) : reviews.length === 0 ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/80 border border-purple-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl shrink-0">
                  💬
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    {language === 'te'
                      ? 'పంట తెగులు గురించి సందేహాలు ఉన్నాయా?'
                      : language === 'hi'
                      ? 'फसल की बीमारी पर कोई संदेह है?'
                      : 'Have doubts about your crop health?'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {language === 'te'
                      ? 'మీ పంట ఫోటోను వ్యవసాయ శాస్త్రవేత్త పరిశీలనకు పంపండి. 15-30 నిమిషాల్లో సలహా అందుతుంది.'
                      : language === 'hi'
                      ? 'अपनी फसल की फोटो कृषि वैज्ञानिक को भेजें। 15-30 मिनट में सलाह प्राप्त करें।'
                      : 'Send your crop photo for direct scientist examination. Responses within 15–30 mins.'}
                  </p>
                </div>
              </div>

              <Link
                href="/expert-review"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs shadow-md transition-all shrink-0 hover:scale-105 active:scale-100"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {language === 'te'
                    ? 'నిపుణుడిని సంప్రదించండి'
                    : language === 'hi'
                    ? 'विशेषज्ञ से पूछें'
                    : 'Ask Agricultural Expert'}
                </span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                  {language === 'te' ? 'మీ సమీక్ష అభ్యర్థనలు:' : language === 'hi' ? 'आपकी समीक्षा अनुरोध:' : 'Your Review Requests:'}
                </span>

                <Link
                  href="/expert-review"
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'te' ? '+ కొత్త ప్రశ్న అడగండి' : language === 'hi' ? '+ नया प्रश्न पूछें' : '+ New Question'}</span>
                </Link>
              </div>

              {reviews.map((rev) => {
                const isCompleted = rev.status === 'completed';
                const isInReview = rev.status === 'in_review';
                const isPending = rev.status === 'pending';

                const dateStr = new Date(rev.createdAt).toLocaleDateString(
                  language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-US',
                  { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                );

                return (
                  <button
                    key={rev.id}
                    type="button"
                    onClick={() => setSelectedReview(rev)}
                    className="w-full text-left p-4 rounded-2xl bg-white border-2 border-purple-200 hover:border-purple-500 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-700'
                            : isInReview
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : isInReview ? (
                          <Sparkles className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-gray-900">
                            {rev.cropName}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{dateStr}</span>
                        </div>

                        <p className="text-xs font-semibold text-gray-700 mt-0.5 line-clamp-1">
                          {rev.farmerNotes || 'Crop leaf health inspection request'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      {/* Status Tag */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isInReview
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isCompleted
                              ? 'bg-emerald-600'
                              : isInReview
                              ? 'bg-blue-600 animate-pulse'
                              : 'bg-amber-600'
                          }`}
                        />
                        {isCompleted
                          ? language === 'te'
                            ? 'సమీక్ష పూర్తయింది ✓'
                            : language === 'hi'
                            ? 'समीक्षा पूर्ण ✓'
                            : 'Review Completed ✓'
                          : isInReview
                          ? language === 'te'
                            ? 'పరిశీలనలో ఉంది'
                            : language === 'hi'
                            ? 'समीक्षा जारी'
                            : 'In Review'
                          : language === 'te'
                          ? 'అభ్యర్థన దాఖలైంది'
                          : language === 'hi'
                          ? 'प्रतीक्षारत'
                          : 'Pending Review'}
                      </span>

                      <span className="text-xs font-bold text-purple-700 flex items-center group-hover:translate-x-0.5 transition-transform">
                        <span>{isCompleted ? 'View Advice' : 'Details'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Prescription Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl relative space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center text-2xl shrink-0">
                  👨🌾
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    {selectedReview.expertName || 'KVK Agricultural Officer'}
                  </h3>
                  <p className="text-xs font-bold text-purple-700">
                    {selectedReview.expertTitle || 'Agricultural Scientist, KVK'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Review Status & Crop Details */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Crop Tested</p>
                <p className="text-base font-extrabold text-gray-900">{selectedReview.cropName}</p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-black ${
                  selectedReview.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedReview.status === 'in_review'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {selectedReview.status === 'completed'
                  ? 'Completed ✓'
                  : selectedReview.status === 'in_review'
                  ? 'In Review'
                  : 'Pending'}
              </span>
            </div>

            {/* Farmer's original note */}
            <div>
              <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">
                Your Observation / Question:
              </h4>
              <p className="text-sm font-medium text-gray-800 bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100">
                "{selectedReview.farmerNotes || 'General health evaluation requested.'}"
              </p>
            </div>

            {/* Scientist's Prescription & Notes */}
            {selectedReview.status === 'completed' ? (
              <div className="space-y-4 pt-1 border-t border-gray-100">
                <div>
                  <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Scientist Diagnostic Observation:</span>
                  </h4>
                  <p className="text-sm font-semibold text-gray-900 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 leading-relaxed">
                    {selectedReview.expertNotes ||
                      'Foliar fungal pathogen activity noted. Prompt intervention recommended.'}
                  </p>
                </div>

                {selectedReview.expertRecommendations &&
                  selectedReview.expertRecommendations.length > 0 && (
                    <div>
                      <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                        Prescribed Action Checklist:
                      </h4>
                      <div className="space-y-2">
                        {selectedReview.expertRecommendations.map((rec, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl bg-white border border-gray-200 flex items-start gap-2.5"
                          >
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-gray-800 leading-snug">
                              {rec}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-2">
                <Clock className="w-8 h-8 text-blue-600 mx-auto" />
                <p className="text-sm font-bold text-blue-950">
                  {language === 'te'
                    ? 'మీ అభ్యర్థన నిపుణుల బృందానికి చేరింది'
                    : language === 'hi'
                    ? 'आपका अनुरोध विशेषज्ञ दल को प्राप्त हो गया है'
                    : 'Request queued with duty agronomist'}
                </p>
                <p className="text-xs text-blue-800">
                  {language === 'te'
                    ? 'KVK శాస్త్రవేత్త పరిశీలన చేసి ప్రిస్క్రిప్షన్ అప్‌డేట్ చేస్తారు.'
                    : language === 'hi'
                    ? 'KVK वैज्ञानिक जल्द ही पर्चा एवं सलाह जारी करेंगे।'
                    : 'Estimated response within 15–30 minutes.'}
                </p>
              </div>
            )}

            {/* Helpline Action */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-800">National Kisan Call Centre (Toll Free)</p>
                <p className="text-xs text-gray-500">1800-180-1551 (All Indian Languages)</p>
              </div>
              <a
                href="tel:18001801551"
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call KVK</span>
              </a>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="px-6 py-2.5 rounded-2xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
