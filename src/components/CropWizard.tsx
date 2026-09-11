'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Droplets,
  FlaskConical,
  Sun,
  Loader2,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { getActiveFarm, type FarmRecord } from '@/lib/farm-store';
import { compressImage } from '@/lib/image-compressor';
import { validateImageClient } from '@/lib/image-validator';
import { SimpleResultView } from './SimpleResultView';
import { LiveVoiceAssistant } from './LiveVoiceAssistant';
import type { ParsedSpeechData } from '@/lib/ai/speech-command-parser';
import type { WeatherData } from '@/lib/supabase/database.types';
import type { CropAnalysisResult } from '@/lib/ai/ai-service.interface';
import { getLocalizedFarmName, getLocalizedAddress } from '@/lib/i18n/location-translations';
import { generateThumbnail, getFallbackCropImage, getCropImage } from '@/lib/crop-images';

// Clean, professional SVG vector crop badges (zero cartoon emojis)
function CropVectorIcon({ id }: { id: string }) {
  switch (id) {
    case 'Rice':
      return (
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/70">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m2 22 10-10" />
            <path d="M16 8a6 6 0 0 1-6 6" />
            <path d="M8.5 2.5A2.12 2.12 0 0 1 11.5 5.5L6 11l-3-3 5.5-5.5Z" />
            <path d="m14 8 2.5-2.5a2.12 2.12 0 0 1 3 3L17 11" />
            <path d="m11 14 2.5-2.5a2.12 2.12 0 0 1 3 3L14 17" />
          </svg>
        </div>
      );
    case 'Maize':
      return (
        <div className="w-12 h-12 rounded-xl bg-yellow-50 text-yellow-700 flex items-center justify-center border border-yellow-200/70">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20" />
            <path d="M7 7c0 4 5 7 5 7s5-3 5-7a5 5 0 0 0-10 0Z" />
            <path d="M5 14c2.5 0 5 2 7 6" />
            <path d="M19 14c-2.5 0-5 2-7 6" />
          </svg>
        </div>
      );
    case 'Tomato':
      return (
        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200/70">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="14" r="7" />
            <path d="M12 7V4" />
            <path d="M9 5c1 1 3 2 3 2s2-1 3-2" />
          </svg>
        </div>
      );
    case 'Chilli':
      return (
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-700 flex items-center justify-center border border-red-200/70">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 4c-1 3-3 4-6 5-4 1-7 4-7 8a5 5 0 0 0 10 0c0-3 2-6 5-7" />
            <path d="M16 2c0 2-1 3-3 3" />
          </svg>
        </div>
      );
    case 'Groundnut':
      return (
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200/70">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="8.5" cy="12" rx="4.5" ry="5.5" />
            <ellipse cx="15.5" cy="12" rx="4.5" ry="5.5" />
            <path d="M11 7a2 2 0 0 1 2 0" />
            <path d="M11 17a2 2 0 0 0 2 0" />
          </svg>
        </div>
      );
    case 'Cotton':
      return (
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="10" r="4" />
            <circle cx="8" cy="13" r="3.5" />
            <circle cx="16" cy="13" r="3.5" />
            <path d="M12 17v5" />
            <path d="m10 19 2 3 2-3" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/70">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 17 4.5s-.5 1.5-1.6 7.2A7 7 0 0 1 11 20Z" />
            <path d="m2 22 10-10" />
          </svg>
        </div>
      );
  }
}

export function CropWizard() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Active Wizard Step: 1 through 7, or 8 = result
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Farm and Weather data
  const [farm, setFarm] = useState<FarmRecord | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Form State
  const [selectedCrop, setSelectedCrop] = useState<string>('Rice');
  const [customCrop, setCustomCrop] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [compressedDataUrl, setCompressedDataUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [imageValidationInfo, setImageValidationInfo] = useState<{ isValid: boolean; plantRatio?: number; skinRatio?: number } | null>(null);
  const [hasVoiceInput, setHasVoiceInput] = useState<boolean>(false);
  const autoAnalyzeTimerRef = useRef<any>(null);

  // Step 3: Symptoms (multi-select)
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  // Step 4: Field Impact & Crop History
  const [affectedArea, setAffectedArea] = useState<string>('< 10%');
  const [durationDays, setDurationDays] = useState<string>('1 - 3 days');
  const [previousCrop, setPreviousCrop] = useState<string>('Groundnut / Pulses (Gram, Soy)');

  // Step 5: Water
  const [waterLevel, setWaterLevel] = useState<'less' | 'normal' | 'more'>('normal');
  const [waterAmount, setWaterAmount] = useState<string>('');

  // Step 5: Soil
  const [hasSoilReport, setHasSoilReport] = useState<boolean>(false);
  const [soilPh, setSoilPh] = useState<string>('');

  // Step 7: Progress sequence
  const [progressStep, setProgressStep] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<CropAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Load Active Farm & Weather
  useEffect(() => {
    const active = getActiveFarm(user?.id);
    setFarm(active);
    if (active) {
      loadFarmWeather(active);
    }
  }, [user, language]);

  const loadFarmWeather = async (f: FarmRecord) => {
    setWeatherLoading(true);
    try {
      const res = await fetch(
        `/api/weather?farmId=${encodeURIComponent(f.id)}&lat=${f.latitude}&lon=${f.longitude}&lang=${language}`
      );
      const data = await res.json();
      if (data.weatherAvailable !== false) {
        setWeather(data);
      }
    } catch (err) {
      console.warn('Weather fetch error:', err);
    } finally {
      setWeatherLoading(false);
    }
  };

  // Step 1: Crops List (Clean, professional, emoji-free)
  const cropsList = [
    { id: 'Rice', label: t.wizard.crops.rice },
    { id: 'Maize', label: t.wizard.crops.maize },
    { id: 'Tomato', label: t.wizard.crops.tomato },
    { id: 'Chilli', label: t.wizard.crops.chilli },
    { id: 'Groundnut', label: t.wizard.crops.groundnut },
    { id: 'Cotton', label: t.wizard.crops.cotton },
    { id: 'Other', label: t.wizard.crops.other },
  ];

  // Step 3: Symptoms List
  const symptomsList = [
    { id: 'yellowLeaves', label: t.wizard.symptoms.yellowLeaves, color: 'border-amber-300' },
    { id: 'brownSpots', label: t.wizard.symptoms.brownSpots, color: 'border-yellow-700' },
    { id: 'podRot', label: t.wizard.symptoms.podRot, color: 'border-stone-600' },
    { id: 'insects', label: t.wizard.symptoms.insects, color: 'border-emerald-500' },
    { id: 'drying', label: t.wizard.symptoms.drying, color: 'border-orange-400' },
    { id: 'wilting', label: t.wizard.symptoms.wilting, color: 'border-blue-400' },
    { id: 'poorGrowth', label: t.wizard.symptoms.poorGrowth, color: 'border-green-400' },
    { id: 'dontKnow', label: t.wizard.symptoms.dontKnow, color: 'border-gray-300' },
  ];

  const toggleSymptom = (id: string) => {
    if (id === 'dontKnow') {
      setSelectedSymptoms(['dontKnow']);
      return;
    }
    const filtered = selectedSymptoms.filter((s) => s !== 'dontKnow');
    if (filtered.includes(id)) {
      setSelectedSymptoms(filtered.filter((s) => s !== id));
    } else {
      setSelectedSymptoms([...filtered, id]);
    }
  };

  const handleVoiceExtracted = (data: ParsedSpeechData) => {
    if (
      data.crop ||
      data.symptoms.length > 0 ||
      data.affectedArea ||
      data.durationDays ||
      data.waterLevel ||
      data.previousCrop
    ) {
      setHasVoiceInput(true);
    }
    if (data.crop) {
      setSelectedCrop(data.crop);
    }
    if (data.symptoms.length > 0) {
      setSelectedSymptoms((prev) => {
        const set = new Set([...prev.filter((s) => s !== 'dontKnow'), ...data.symptoms]);
        return Array.from(set);
      });
    }
    if (data.affectedArea) {
      setAffectedArea(data.affectedArea);
    }
    if (data.durationDays) {
      setDurationDays(data.durationDays);
    }
    if (data.waterLevel) {
      setWaterLevel(data.waterLevel);
    }
    if (data.previousCrop) {
      setPreviousCrop(data.previousCrop);
    }
  };

  // Step 2: Photo Upload & Canvas Validation/Compression
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);
    setIsCompressing(true);

    try {
      // 1. Compress client-side via canvas (<1280px, stripped EXIF, JPEG 82%)
      const comp = await compressImage(file, 1280, 0.82);

      // 2. Validate using canvas chroma inspection covering 100% of the image
      const tempImg = new Image();
      tempImg.onload = () => {
        const activeCropName = selectedCrop === 'Other' ? (customCrop || 'Crop') : selectedCrop;
        const validation = validateImageClient(tempImg, activeCropName);

        if (!validation.isValid) {
          setPhotoPreview(null);
          setCompressedDataUrl(null);
          setImageValidationInfo(null);
          setPhotoError(
            validation.reason === 'human_or_selfie'
              ? (language === 'te'
                  ? 'పంట గుర్తించబడలేదు. మనిషి లేదా చిత్రం ఫోటో గుర్తించబడింది. దయచేసి పంట ఆకు లేదా పైరు ఫోటో తీయండి.'
                  : language === 'hi'
                  ? 'फसल नहीं पहचानी गई। इंसान या चित्र पाया गया। कृपया केवल खेत की फसल या पत्ते की फोटो लें।'
                  : 'Crop not detected. Person, face, or drawing detected. Please upload a clear photo of your crop leaf or plant.')
              : (t.wizard.photoCropNotDetected || t.wizard.photoInvalidGeneral)
          );
          setIsCompressing(false);
          if (cameraInputRef.current) cameraInputRef.current.value = '';
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        generateThumbnail(comp.dataUrl, 200, 0.72)
          .then((thumb) => {
            setPhotoPreview(thumb);
          })
          .catch(() => {
            setPhotoPreview(comp.dataUrl);
          });
        setCompressedDataUrl(comp.dataUrl);
        setImageValidationInfo({
          isValid: true,
          plantRatio: validation.plantRatio,
          skinRatio: validation.skinRatio,
        });
        setPhotoError(null);
        setIsCompressing(false);

        // If user provided input via voice assistant, auto-start AI analysis smoothly after preview
        if (hasVoiceInput) {
          if (autoAnalyzeTimerRef.current) clearTimeout(autoAnalyzeTimerRef.current);
          autoAnalyzeTimerRef.current = setTimeout(() => {
            executeAnalysis();
          }, 1500);
        }
      };
      tempImg.src = comp.dataUrl;
    } catch (err: any) {
      console.error('Image compression error:', err);
      setPhotoError('Could not process photo. Please try again.');
      setIsCompressing(false);
    }
  };

  // Run Step 8 Animated Sequence & Submit to AI Analysis
  const executeAnalysis = async () => {
    if (autoAnalyzeTimerRef.current) {
      clearTimeout(autoAnalyzeTimerRef.current);
    }
    setCurrentStep(8);
    setProgressStep(0);
    setAnalysisError(null);

    const progressInterval = setInterval(() => {
      setProgressStep((prev) => {
        if (prev < 6) return prev + 1;
        clearInterval(progressInterval);
        return prev;
      });
    }, 450);

    try {
      const activeCropName = selectedCrop === 'Other' ? (customCrop || 'Crop') : selectedCrop;

      // Check user-scoped history for previous assessment of same crop to compare
      let previousAssessment: any = undefined;
      const historyScope = user?.id || 'anonymous';
      const historyKey = `cropshield_history_${historyScope}`;
      try {
        const historyRaw = localStorage.getItem(historyKey);
        if (historyRaw) {
          const list = JSON.parse(historyRaw);
          const prev = list.find((item: any) => item.cropName === activeCropName);
          if (prev) {
            previousAssessment = {
              possibleIssue: prev.possibleIssue,
              seriousness: prev.seriousness,
              date: prev.createdAt || new Date().toISOString(),
            };
          }
        }
      } catch {
        // Ignore
      }

      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropName: activeCropName,
          symptoms: selectedSymptoms,
          affectedArea,
          durationDays,
          previousCrop,
          waterLevel,
          waterAmount,
          hasSoilReport,
          soilData: soilPh ? { ph: parseFloat(soilPh) } : undefined,
          weatherData: weather ? {
            temperature: weather.temperature,
            humidity: weather.humidity,
            rainfall: weather.rainfall,
            windSpeed: weather.windSpeed,
            weatherCondition: weather.weatherCondition,
            rainProbability: weather.rainProbability,
          } : undefined,
          farmLocation: farm ? {
            state: farm.state,
            district: farm.district,
            locality: farm.locality,
          } : undefined,
          imageDataUrl: compressedDataUrl,
          imageValidation: imageValidationInfo,
          previousAssessment,
          language,
          farmId: farm?.id,
          userId: user?.id,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        if (errData.error === 'crop_not_detected' || errData.error === 'invalid_image') {
          // Set invalid result directly
          setAnalysisResult({
            isCropDetected: false,
            possibleIssue: 'CROP_NOT_DETECTED',
            issueCategory: 'unknown',
            seriousness: 'LOW',
            confidenceLevel: 'LOW',
            confidenceScore: 0.0,
            explanation: errData.message || 'Crop not detected in this image. Please upload a clear photo of an agricultural crop leaf or plant.',
            whyReasons: ['The uploaded photo does not contain an agricultural crop, leaf, or farm plant.'],
            actions: [],
            isPreliminary: false,
            aiProvider: 'CropShield Gatekeeper',
            language: language as any,
          });
          setTimeout(() => {
            clearInterval(progressInterval);
            setCurrentStep(9);
          }, 1500);
          return;
        }
        throw new Error(errData.message || 'Analysis failed');
      }

      const data = await res.json();
      setAnalysisResult(data);

      // Only save to user-scoped history if crop was actually detected
      if (data.isCropDetected !== false && data.possibleIssue !== 'CROP_NOT_DETECTED') {
        try {
          const historyRaw = localStorage.getItem(historyKey);
          const historyList = historyRaw ? JSON.parse(historyRaw) : [];
          const entryId = data.id || `check-${Date.now()}`;
          const previewToSave = photoPreview || getFallbackCropImage(activeCropName, data.possibleIssue);
          const newRecord = {
            ...data,
            id: entryId,
            cropName: activeCropName,
            photoPreview: previewToSave,
            createdAt: new Date().toISOString(),
            userId: user?.id,
          };
          historyList.unshift(newRecord);
          localStorage.setItem(historyKey, JSON.stringify(historyList.slice(0, 50)));

          // Background sync to Supabase if authenticated with real session and farmId is available
          if (isSupabaseConfigured && supabase && user) {
            const isValidUuid = (str?: string) =>
              Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

            if (isValidUuid(user.id) && isValidUuid(farm?.id)) {
              supabase
                .from('assessments')
                .insert({
                  user_id: user.id,
                  farm_id: farm!.id,
                  crop_name: activeCropName,
                  image_url: previewToSave,
                  symptoms: selectedSymptoms,
                water_level: waterLevel,
                has_soil_report: hasSoilReport,
                weather_snapshot: weather || {},
                possible_issue: data.possibleIssue || 'General Crop Observation',
                issue_category: data.issueCategory || 'general',
                seriousness: data.seriousness || 'LOW',
                confidence_level: data.confidenceLevel || 'MEDIUM',
                confidence_score: data.confidenceScore || 0.85,
                explanation: data.explanation || '',
                why_reasons: data.whyReasons || [],
                actions: data.actions || [],
                previous_comparison: data.previousComparison || null,
                is_preliminary: data.isPreliminary ?? false,
                ai_provider: data.aiProvider || 'rule-based',
                language: language,
              } as any)
              .then(({ error }: { error: any }) => {
                if (error) console.warn('Supabase assessment insert notice:', error.message);
              });
          }
        }
        } catch (saveErr) {
          console.warn('Could not save history locally:', saveErr);
        }
      }

      // Wait for progress animation to finish
      setTimeout(() => {
        clearInterval(progressInterval);
        setCurrentStep(9); // Show result view
      }, 3000);
    } catch (err: any) {
      clearInterval(progressInterval);
      setAnalysisError(err.message || 'Something went wrong during assessment.');
    }
  };

  // If in Result View
  if (currentStep === 9 && analysisResult) {
    return (
      <SimpleResultView
        result={analysisResult}
        cropName={selectedCrop === 'Other' ? (customCrop || 'Crop') : selectedCrop}
        photoPreview={photoPreview}
        onReset={() => {
          if (autoAnalyzeTimerRef.current) clearTimeout(autoAnalyzeTimerRef.current);
          setHasVoiceInput(false);
          setCurrentStep(1);
          setPhotoPreview(null);
          setCompressedDataUrl(null);
          setSelectedSymptoms([]);
          setAnalysisResult(null);
        }}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Live Voice Assistant (Multilingual English, Telugu, Hindi) */}
      {currentStep <= 7 && (
        <LiveVoiceAssistant
          hasPhoto={Boolean(photoPreview)}
          onExtracted={handleVoiceExtracted}
          onRequestPhotoUpload={() => setCurrentStep(2)}
        />
      )}

      {/* Wizard Step Progress Header */}
      {currentStep <= 7 && (
        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>Step {currentStep} of 7</span>
            <span className="text-emerald-700 font-extrabold">
              {Math.round((currentStep / 7) * 100)}% Completed
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-emerald-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-green-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 7) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 1: What crop do you want to check? */}
      {/* ============================================================ */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              {t.wizard.step1Title}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
              Select the crop planted in your field:
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {cropsList.map((crop) => (
              <button
                key={crop.id}
                type="button"
                onClick={() => setSelectedCrop(crop.id)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col items-center justify-center text-center gap-2.5 ${
                  selectedCrop === crop.id
                    ? 'border-2 border-emerald-600 bg-emerald-50/60 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <CropVectorIcon id={crop.id} />
                <span className="font-semibold text-xs sm:text-sm text-slate-900">
                  {crop.label}
                </span>
                {selectedCrop === crop.id && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                )}
              </button>
            ))}
          </div>

          {selectedCrop === 'Other' && (
            <div className="pt-2 animate-in fade-in">
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Enter crop name:
              </label>
              <input
                type="text"
                value={customCrop}
                onChange={(e) => setCustomCrop(e.target.value)}
                placeholder="e.g. Sugarcane, Banana, Sunflower"
                className="w-full p-3.5 rounded-2xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-none text-base"
              />
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-base shadow-md flex items-center justify-center gap-2"
            >
              <span>{t.wizard.buttons.next}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 2: Take or upload a photo */}
      {/* ============================================================ */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-200 shadow-lg space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">
              {t.wizard.step2Title}
            </h2>
            <p className="text-sm font-medium text-emerald-800 mt-1">
              {t.wizard.photoTip}
            </p>
          </div>

          {/* Hidden inputs for Camera and File Chooser */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoSelect}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoSelect}
          />

          {photoPreview ? (
            <div className="space-y-4">
              <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-400 bg-black max-h-80 flex items-center justify-center shadow-md">
                <img
                  src={photoPreview}
                  alt="Crop leaf preview"
                  className="w-full h-full object-contain max-h-80"
                />
                <div className="absolute top-3 right-3 bg-emerald-800/80 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Photo Ready</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 py-3 px-4 rounded-2xl border-2 border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>{t.wizard.rephoto}</span>
                </button>
              </div>

              {hasVoiceInput && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-2.5 shadow-sm animate-in fade-in">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-emerald-950 font-extrabold text-sm">
                      <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                      <span>
                        {language === 'te'
                          ? 'వాయిస్ ద్వారా వివరాలు నమోదయ్యాయి!'
                          : language === 'hi'
                          ? 'आवाज़ से विवरण दर्ज हो गए हैं!'
                          : 'Details recorded via voice!'}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                      {language === 'te' ? 'తక్షణ విశ్లేషణ' : language === 'hi' ? 'तुरंत विश्लेषण' : 'Instant AI'}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 font-medium">
                    {language === 'te'
                      ? 'ఫోటో సిద్ధంగా ఉంది. AI విశ్లేషణ స్వయంచాలకంగా ప్రారంభమవుతుంది లేదా ఇప్పుడే బటన్ నొక్కండి:'
                      : language === 'hi'
                      ? 'फोटो तैयार है। AI विश्लेषण अपने आप शुरू हो रहा है या अभी बटन दबाएं:'
                      : 'Photo ready. AI analysis is starting automatically, or tap now:'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (autoAnalyzeTimerRef.current) clearTimeout(autoAnalyzeTimerRef.current);
                      executeAnalysis();
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {language === 'te'
                        ? '⚡ తక్షణ AI విశ్లేషణ ప్రారంభించండి'
                        : language === 'hi'
                        ? '⚡ तुरंत AI विश्लेषण शुरू करें'
                        : '⚡ Start Instant AI Analysis'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Camera Button */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isCompressing}
                className="p-6 sm:p-8 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-900 flex flex-col items-center justify-center gap-3 transition-colors shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="block font-bold text-sm sm:text-base text-slate-900">
                    {t.wizard.takePhoto}
                  </span>
                  <span className="block text-xs text-slate-500 mt-0.5">
                    Opens device camera
                  </span>
                </div>
              </button>

              {/* Upload Photo Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isCompressing}
                className="p-6 sm:p-8 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-900 flex flex-col items-center justify-center gap-3 transition-colors shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="block font-bold text-sm sm:text-base text-slate-900">
                    {t.wizard.choosePhoto}
                  </span>
                  <span className="block text-xs text-slate-500 mt-0.5">
                    From photo gallery
                  </span>
                </div>
              </button>
            </div>
          )}

          {isCompressing && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-sm text-emerald-800 font-bold">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t.wizard.validatingPhoto}</span>
            </div>
          )}

          {photoError && (
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl flex items-start gap-3 text-sm text-red-800 font-bold animate-in shake">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span>{photoError}</span>
            </div>
          )}

          <div className="pt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                if (autoAnalyzeTimerRef.current) clearTimeout(autoAnalyzeTimerRef.current);
                setCurrentStep(1);
              }}
              className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              {t.wizard.buttons.back}
            </button>

            {hasVoiceInput ? (
              <button
                type="button"
                disabled={!photoPreview || !compressedDataUrl || !!photoError || isCompressing}
                onClick={() => {
                  if (autoAnalyzeTimerRef.current) clearTimeout(autoAnalyzeTimerRef.current);
                  executeAnalysis();
                }}
                className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-sm flex items-center gap-2 transition-colors"
              >
                <span>
                  {language === 'te' ? 'విశ్లేషించండి' : language === 'hi' ? 'विश्लेषण करें' : 'Analyze Now'}
                </span>
                <Sparkles className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!photoPreview || !compressedDataUrl || !!photoError || isCompressing}
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-sm flex items-center gap-2 transition-colors"
              >
                <span>{t.wizard.buttons.next}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 3: What's wrong with the crop? */}
      {/* ============================================================ */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-200 shadow-lg space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">
              {t.wizard.step3Title}
            </h2>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Select any symptoms you observe (you can select more than one):
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {symptomsList.map((item) => {
              const isSelected = selectedSymptoms.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleSymptom(item.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 shadow-md font-black text-emerald-950'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-bold'
                  }`}
                >
                  <span className="text-base leading-snug">{item.label}</span>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-6 py-3.5 rounded-2xl border-2 border-gray-300 text-gray-700 font-bold text-sm"
            >
              {t.wizard.buttons.back}
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-8 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-base shadow-md flex items-center gap-2"
            >
              <span>{t.wizard.buttons.next}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 4: Field Impact & Crop History */}
      {/* ============================================================ */}
      {currentStep === 4 && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-200 shadow-lg space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">
              {t.wizard.fieldImpact.title}
            </h2>
            <p className="text-sm font-medium text-gray-500 mt-1">
              {t.wizard.fieldImpact.subtitle}
            </p>
          </div>

          {/* Question 1: How much area was affected? */}
          <div className="space-y-2.5">
            <label className="block text-sm font-bold text-gray-800">
              📍 {t.wizard.fieldImpact.areaQuestion}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: '< 10%', label: t.wizard.fieldImpact.areas.lessThan10 },
                { id: '10% - 25%', label: t.wizard.fieldImpact.areas.from10to25 },
                { id: '25% - 50%', label: t.wizard.fieldImpact.areas.from25to50 },
                { id: '> 50%', label: t.wizard.fieldImpact.areas.moreThan50 },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAffectedArea(item.id)}
                  className={`p-3.5 rounded-2xl border-2 text-left font-semibold text-sm transition-all flex items-center justify-between ${
                    affectedArea === item.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>{item.label}</span>
                  {affectedArea === item.id && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: From how many days onwards? */}
          <div className="space-y-2.5 pt-2 border-t border-gray-100">
            <label className="block text-sm font-bold text-gray-800">
              ⏱️ {t.wizard.fieldImpact.durationQuestion}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: '1 - 3 days', label: t.wizard.fieldImpact.durations.days1to3 },
                { id: '4 - 7 days', label: t.wizard.fieldImpact.durations.days4to7 },
                { id: '8 - 14 days', label: t.wizard.fieldImpact.durations.days8to14 },
                { id: '> 14 days', label: t.wizard.fieldImpact.durations.moreThan14 },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDurationDays(item.id)}
                  className={`p-3.5 rounded-2xl border-2 text-left font-semibold text-sm transition-all flex items-center justify-between ${
                    durationDays === item.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>{item.label}</span>
                  {durationDays === item.id && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: Previous crop on this land? */}
          <div className="space-y-2.5 pt-2 border-t border-gray-100">
            <label className="block text-sm font-bold text-gray-800">
              🔄 {t.wizard.fieldImpact.previousCropQuestion}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: 'Groundnut / Pulses', label: t.wizard.fieldImpact.previousCrops.groundnutPulses },
                { id: 'Paddy / Rice', label: t.wizard.fieldImpact.previousCrops.paddyRice },
                { id: 'Cotton', label: t.wizard.fieldImpact.previousCrops.cotton },
                { id: 'Maize / Millets', label: t.wizard.fieldImpact.previousCrops.maizeMillets },
                { id: 'Vegetables', label: t.wizard.fieldImpact.previousCrops.vegetables },
                { id: 'Fallow / First time', label: t.wizard.fieldImpact.previousCrops.fallowVirgin },
                { id: 'Other', label: t.wizard.fieldImpact.previousCrops.other },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPreviousCrop(item.id)}
                  className={`p-3.5 rounded-2xl border-2 text-left font-semibold text-sm transition-all flex items-center justify-between ${
                    previousCrop === item.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>{item.label}</span>
                  {previousCrop === item.id && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-6 py-3.5 rounded-2xl border-2 border-gray-300 text-gray-700 font-bold text-sm"
            >
              {t.wizard.buttons.back}
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="px-8 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-base shadow-md flex items-center gap-2"
            >
              <span>{t.wizard.buttons.next}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 5: How much water did you give? */}
      {/* ============================================================ */}
      {currentStep === 5 && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-200 shadow-lg space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">
              {t.wizard.step4Title}
            </h2>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Select your recent watering amount:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {[
              { id: 'less', label: t.wizard.water.lessThanUsual },
              { id: 'normal', label: t.wizard.water.normal },
              { id: 'more', label: t.wizard.water.moreThanUsual },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setWaterLevel(option.id as any)}
                className={`p-5 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
                  waterLevel === option.id
                    ? 'border-blue-600 bg-blue-50 shadow-md font-black text-blue-950'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-bold'
                }`}
              >
                <Droplets className={`w-8 h-8 ${waterLevel === option.id ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="text-base">{option.label}</span>
              </button>
            ))}
          </div>

          {/* Optional exact amount */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-gray-600 mb-1">
              {t.wizard.water.enterAmountOptional}
            </label>
            <input
              type="text"
              value={waterAmount}
              onChange={(e) => setWaterAmount(e.target.value)}
              placeholder={t.wizard.water.amountPlaceholder}
              className="w-full p-3.5 rounded-2xl border-2 border-gray-300 focus:border-blue-600 focus:outline-none text-sm"
            />
          </div>

          <div className="pt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-6 py-3.5 rounded-2xl border-2 border-gray-300 text-gray-700 font-bold text-sm"
            >
              {t.wizard.buttons.back}
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(6)}
              className="px-8 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-base shadow-md flex items-center gap-2"
            >
              <span>{t.wizard.buttons.next}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 6: Do you have a soil test? */}
      {/* ============================================================ */}
      {currentStep === 6 && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-200 shadow-lg space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">
              {t.wizard.step5Title}
            </h2>
            <p className="text-sm font-medium text-gray-500 mt-1">
              {t.wizard.soil.question}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setHasSoilReport(true)}
              className={`p-6 rounded-3xl border-2 text-left transition-all flex flex-col gap-2 ${
                hasSoilReport
                  ? 'border-amber-600 bg-amber-50 shadow-md text-amber-950 font-black'
                  : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-bold'
              }`}
            >
              <FlaskConical className={`w-8 h-8 ${hasSoilReport ? 'text-amber-700' : 'text-gray-400'}`} />
              <span className="text-lg">{t.wizard.soil.yesUpload}</span>
              <span className="text-xs text-gray-500 font-normal">
                Include soil pH & nutrients
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setHasSoilReport(false);
                setSoilPh('');
                setCurrentStep(7);
              }}
              className="p-6 rounded-3xl border-2 border-gray-200 bg-white hover:bg-gray-50 text-left transition-all flex flex-col gap-2"
            >
              <span className="text-3xl">➡️</span>
              <span className="text-lg font-black text-gray-900">{t.wizard.soil.noContinue}</span>
              <span className="text-xs text-gray-500">
                You do not need a soil report to check your crop.
              </span>
            </button>
          </div>

          {hasSoilReport && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3 animate-in fade-in">
              <label className="block text-xs font-bold text-amber-900">
                {t.wizard.soil.phLabel}
              </label>
              <input
                type="number"
                step="0.1"
                min="4"
                max="9"
                value={soilPh}
                onChange={(e) => setSoilPh(e.target.value)}
                placeholder="e.g. 6.5"
                className="w-full p-3 rounded-xl border border-amber-300 text-sm bg-white"
              />
            </div>
          )}

          <div className="pt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="px-6 py-3.5 rounded-2xl border-2 border-gray-300 text-gray-700 font-bold text-sm"
            >
              {t.wizard.buttons.back}
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(7)}
              className="px-8 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-base shadow-md flex items-center gap-2"
            >
              <span>{t.wizard.buttons.next}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 7: AUTOMATIC WEATHER (Zero farmer typing) */}
      {/* ============================================================ */}
      {currentStep === 7 && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-200 shadow-lg space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">
              {t.wizard.step6Title}
            </h2>
            <p className="text-sm font-semibold text-emerald-800 mt-1">
              {t.wizard.noTypingNeeded}
            </p>
          </div>

          {/* Farm Location Detected */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-800 to-teal-950 text-white space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                  📍 {t.wizard.yourFarm}
                </p>
                <p className="text-lg font-black text-white mt-0.5">
                  {getLocalizedFarmName(farm?.name, language)} ({getLocalizedAddress(farm?.locality, farm?.district, undefined, language)})
                </p>
              </div>
            </div>

            {weatherLoading ? (
              <div className="py-6 flex items-center justify-center gap-2 text-emerald-200">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-sm font-bold">{t.wizard.weatherChecking}</span>
              </div>
            ) : weather ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white/15 p-3 rounded-2xl backdrop-blur-sm text-center">
                  <p className="text-xs text-emerald-200 font-bold">Temperature</p>
                  <p className="text-2xl font-black text-white mt-1">🌡️ {weather.temperature}°C</p>
                </div>
                <div className="bg-white/15 p-3 rounded-2xl backdrop-blur-sm text-center">
                  <p className="text-xs text-emerald-200 font-bold">Humidity</p>
                  <p className="text-2xl font-black text-white mt-1">💧 {weather.humidity}%</p>
                </div>
                <div className="col-span-2 sm:col-span-1 bg-white/15 p-3 rounded-2xl backdrop-blur-sm text-center">
                  <p className="text-xs text-emerald-200 font-bold">Weather</p>
                  <p className="text-sm font-extrabold text-white mt-2 truncate">
                    {weather.weatherCondition}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-500/20 rounded-2xl text-xs text-amber-200">
                Weather temporarily unavailable. Assessment will proceed using other observations.
              </div>
            )}
          </div>

          <div className="pt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(6)}
              className="px-6 py-3.5 rounded-2xl border-2 border-gray-300 text-gray-700 font-bold text-sm"
            >
              {t.wizard.buttons.back}
            </button>
            <button
              type="button"
              onClick={executeAnalysis}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-black text-lg shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>{t.wizard.buttons.startCheck}</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 8: Animated Progress Sequence */}
      {/* ============================================================ */}
      {currentStep === 8 && (
        <div className="bg-white rounded-3xl p-8 border-2 border-emerald-300 shadow-xl space-y-6 text-center animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-gray-950">
              {t.wizard.step7Title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Analyzing photo, weather, water, soil and past history...
            </p>
          </div>

          {/* Progress Sequence Checklist */}
          <div className="max-w-md mx-auto text-left space-y-3 pt-2">
            {[
              t.wizard.progress.checkingPhoto,
              t.wizard.progress.checkingSymptoms,
              t.wizard.progress.checkingWeather,
              t.wizard.progress.checkingWater,
              t.wizard.progress.checkingSoil,
              t.wizard.progress.comparingHistory,
              t.wizard.progress.preparingRecs,
            ].map((text, idx) => {
              const isDone = progressStep > idx;
              const isCurrent = progressStep === idx;

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                    isDone
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                      : isCurrent
                      ? 'bg-amber-50 border-amber-300 text-amber-950 font-extrabold scale-[1.02]'
                      : 'bg-gray-50/50 border-gray-200 text-gray-400 font-medium'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-amber-600 animate-spin shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-gray-300 shrink-0" />
                  )}
                  <span className="text-sm">{text}</span>
                </div>
              );
            })}
          </div>

          {analysisError && (
            <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-left space-y-3">
              <div className="flex items-center gap-2 font-bold text-red-900">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span>Crop Not Detected</span>
              </div>
              <p className="text-xs text-red-700">{analysisError}</p>
              <button
                type="button"
                onClick={() => {
                  setAnalysisError(null);
                  setPhotoPreview(null);
                  setCompressedDataUrl(null);
                  setCurrentStep(2);
                }}
                className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-semibold text-xs rounded-xl transition-colors"
              >
                Upload Valid Crop Photo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
