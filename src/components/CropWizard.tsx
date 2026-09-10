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
import { getActiveFarm, type FarmRecord } from '@/lib/farm-store';
import { compressImage } from '@/lib/image-compressor';
import { validateImageClient } from '@/lib/image-validator';
import { SimpleResultView } from './SimpleResultView';
import type { WeatherData } from '@/lib/supabase/database.types';
import type { CropAnalysisResult } from '@/lib/ai/ai-service.interface';

export function CropWizard() {
  const { t, language } = useLanguage();
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

  // Step 3: Symptoms (multi-select)
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  // Step 4: Water
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
    const active = getActiveFarm();
    setFarm(active);
    loadFarmWeather(active);
  }, [language]);

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

  // Step 1: Crops List
  const cropsList = [
    { id: 'Rice', label: t.wizard.crops.rice, icon: '🌾' },
    { id: 'Maize', label: t.wizard.crops.maize, icon: '🌽' },
    { id: 'Tomato', label: t.wizard.crops.tomato, icon: '🍅' },
    { id: 'Chilli', label: t.wizard.crops.chilli, icon: '🌶️' },
    { id: 'Groundnut', label: t.wizard.crops.groundnut, icon: '🥜' },
    { id: 'Cotton', label: t.wizard.crops.cotton, icon: '⚪' },
    { id: 'Other', label: t.wizard.crops.other, icon: '🌿' },
  ];

  // Step 3: Symptoms List
  const symptomsList = [
    { id: 'yellowLeaves', label: t.wizard.symptoms.yellowLeaves, color: 'border-amber-300' },
    { id: 'brownSpots', label: t.wizard.symptoms.brownSpots, color: 'border-yellow-700' },
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

  // Step 2: Photo Upload & Canvas Validation/Compression
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);
    setIsCompressing(true);

    try {
      // 1. Compress client-side via canvas (<1280px, stripped EXIF, JPEG 82%)
      const comp = await compressImage(file, 1280, 0.82);

      // 2. Validate using canvas chroma inspection (detect human portraits / non-crop images)
      const tempImg = new Image();
      tempImg.onload = () => {
        const c = document.createElement('canvas');
        c.width = tempImg.width;
        c.height = tempImg.height;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.drawImage(tempImg, 0, 0);
          const validation = validateImageClient(c);

          if (!validation.isValid) {
            setPhotoError(
              validation.reason === 'human_or_selfie'
                ? t.wizard.photoInvalidHuman
                : t.wizard.photoInvalidGeneral
            );
            setIsCompressing(false);
            return;
          }
        }

        setPhotoPreview(comp.dataUrl);
        setCompressedDataUrl(comp.dataUrl);
        setIsCompressing(false);
      };
      tempImg.src = comp.dataUrl;
    } catch (err: any) {
      console.error('Image compression error:', err);
      setPhotoError('Could not process photo. Please try again.');
      setIsCompressing(false);
    }
  };

  // Run Step 7 Animated Sequence & Submit to AI Analysis
  const executeAnalysis = async () => {
    setCurrentStep(7);
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

      // Check localStorage for previous assessment of same crop to compare
      let previousAssessment: any = undefined;
      try {
        const historyRaw = localStorage.getItem('cropshield_history');
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
          previousAssessment,
          language,
          farmId: farm?.id,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Analysis failed');
      }

      const data = await res.json();
      setAnalysisResult(data);

      // Save to localStorage history for offline persistence & comparison
      try {
        const historyRaw = localStorage.getItem('cropshield_history');
        const historyList = historyRaw ? JSON.parse(historyRaw) : [];
        historyList.unshift({
          ...data,
          cropName: activeCropName,
          photoPreview,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('cropshield_history', JSON.stringify(historyList.slice(0, 50)));
      } catch (saveErr) {
        console.warn('Could not save history locally:', saveErr);
      }

      // Wait for progress animation to finish
      setTimeout(() => {
        clearInterval(progressInterval);
        setCurrentStep(8); // Show result view
      }, 3000);
    } catch (err: any) {
      clearInterval(progressInterval);
      setAnalysisError(err.message || 'Something went wrong during assessment.');
    }
  };

  // If in Result View
  if (currentStep === 8 && analysisResult) {
    return (
      <SimpleResultView
        result={analysisResult}
        cropName={selectedCrop === 'Other' ? (customCrop || 'Crop') : selectedCrop}
        photoPreview={photoPreview}
        onReset={() => {
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
      {/* Wizard Step Progress Header */}
      {currentStep <= 6 && (
        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>Step {currentStep} of 6</span>
            <span className="text-emerald-700 font-extrabold">
              {Math.round((currentStep / 6) * 100)}% Completed
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-emerald-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-green-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 1: What crop do you want to check? */}
      {/* ============================================================ */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-200 shadow-lg space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">
              {t.wizard.step1Title}
            </h2>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Select the crop planted in your field:
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {cropsList.map((crop) => (
              <button
                key={crop.id}
                type="button"
                onClick={() => setSelectedCrop(crop.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col items-center justify-center text-center gap-2 ${
                  selectedCrop === crop.id
                    ? 'border-emerald-600 bg-emerald-50 shadow-md scale-[1.02]'
                    : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-4xl">{crop.icon}</span>
                <span className="font-extrabold text-sm sm:text-base text-gray-900">
                  {crop.label}
                </span>
                {selectedCrop === crop.id && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-1" />
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
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Big Touch Camera Button */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isCompressing}
                className="p-8 rounded-3xl border-2 border-dashed border-emerald-500 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-950 flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-100"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <Camera className="w-9 h-9" />
                </div>
                <span className="font-extrabold text-lg sm:text-xl">
                  {t.wizard.takePhoto}
                </span>
                <span className="text-xs text-emerald-700 font-semibold">
                  Opens your phone camera
                </span>
              </button>

              {/* Big Touch Choose Photo Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isCompressing}
                className="p-8 rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-900 flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-100"
              >
                <div className="w-16 h-16 rounded-2xl bg-gray-700 text-white flex items-center justify-center shadow-md">
                  <Upload className="w-9 h-9" />
                </div>
                <span className="font-extrabold text-lg sm:text-xl">
                  {t.wizard.choosePhoto}
                </span>
                <span className="text-xs text-gray-500 font-semibold">
                  From phone gallery
                </span>
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
              onClick={() => setCurrentStep(1)}
              className="px-6 py-3.5 rounded-2xl border-2 border-gray-300 text-gray-700 font-bold text-sm"
            >
              {t.wizard.buttons.back}
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-8 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-base shadow-md flex items-center gap-2"
            >
              <span>{t.wizard.buttons.next}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
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
      {/* STEP 4: How much water did you give? */}
      {/* ============================================================ */}
      {currentStep === 4 && (
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
      {/* STEP 5: Do you have a soil test? */}
      {/* ============================================================ */}
      {currentStep === 5 && (
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
                setCurrentStep(6);
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
      {/* STEP 6: AUTOMATIC WEATHER (Zero farmer typing) */}
      {/* ============================================================ */}
      {currentStep === 6 && (
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
                  {farm?.name} ({farm?.locality}, {farm?.district})
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
              onClick={() => setCurrentStep(5)}
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
      {/* STEP 7: Animated Progress Sequence */}
      {/* ============================================================ */}
      {currentStep === 7 && (
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
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl text-red-800 text-sm font-bold">
              {analysisError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
