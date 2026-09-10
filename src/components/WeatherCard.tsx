'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Droplets, Wind, CloudRain, AlertTriangle, RefreshCw, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { getActiveFarm, type FarmRecord } from '@/lib/farm-store';
import type { WeatherData } from '@/lib/supabase/database.types';

export function WeatherCard() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [farm, setFarm] = useState<FarmRecord | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadWeatherForFarm = async (currentFarm: FarmRecord) => {
    setLoading(true);
    setErrorMsg(null);
    setNotice(null);

    try {
      const res = await fetch(
        `/api/weather?farmId=${encodeURIComponent(currentFarm.id)}&lat=${currentFarm.latitude}&lon=${currentFarm.longitude}&lang=${language}`
      );
      const data = await res.json();

      if (data.weatherAvailable === false) {
        setNotice(data.notice || t.weatherCard.tempUnavailable);
        setWeather(null);
      } else {
        setWeather(data);
        if (data.notice) {
          setNotice(data.notice);
        }
      }
    } catch (err) {
      console.error('Failed to load weather:', err);
      setNotice(t.weatherCard.tempUnavailable);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const active = getActiveFarm(user?.id);
    setFarm(active);
    if (active) {
      loadWeatherForFarm(active);
    } else {
      setLoading(false);
    }

    const handleFarmChange = () => {
      const updatedFarm = getActiveFarm(user?.id);
      setFarm(updatedFarm);
      if (updatedFarm) {
        loadWeatherForFarm(updatedFarm);
      } else {
        setLoading(false);
        setWeather(null);
      }
    };

    window.addEventListener('farmChanged', handleFarmChange);
    return () => window.removeEventListener('farmChanged', handleFarmChange);
  }, [user, language]);

  if (!farm) {
    return (
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-dashed border-emerald-300 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl shrink-0">
            📍
          </div>
          <div>
            <h3 className="text-base font-black text-emerald-950">
              {language === 'te' ? 'మీ పొలం స్థానాన్ని నమోదు చేయండి' : language === 'hi' ? 'अपने खेत का स्थान जोड़ें' : 'Set Your Farm Location'}
            </h3>
            <p className="text-xs text-emerald-800 font-medium mt-0.5">
              {language === 'te'
                ? 'ఖచ్చితమైన స్థానిక వాతావరణం మరియు తెగుళ్ల హెచ్చరికల కోసం మీ పొలాన్ని జోడించండి.'
                : language === 'hi'
                ? 'सटीक मौसम और कीट चेतावनियों के लिए अपने खेत का स्थान जोड़ें।'
                : 'Add your farm to automatically detect temperature, rainfall forecast, and disease risks.'}
            </p>
          </div>
        </div>
        <Link
          href="/farms"
          className="px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md shrink-0 transition-all hover:scale-105 active:scale-100"
        >
          {language === 'te' ? '+ పొలం జోడించండి' : language === 'hi' ? '+ खेत जोड़ें' : '+ Add My Farm'}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Background soft agricultural radial glow */}
      <div className="absolute -top-16 -right-16 w-52 h-52 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Farm Location Header */}
      <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white/15 rounded-full backdrop-blur-sm">
            <MapPin className="w-4 h-4 text-emerald-200" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-200 uppercase tracking-wide">
              {t.weatherCard.farmPrefix}: <span className="text-white">{farm?.name}</span>
            </p>
            <p className="text-sm font-semibold text-emerald-100">
              📍 {farm?.locality}, {farm?.district} ({farm?.state})
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => farm && loadWeatherForFarm(farm)}
          disabled={loading}
          aria-label="Refresh weather"
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-emerald-100 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && !weather ? (
        <div className="py-8 flex flex-col items-center justify-center text-emerald-200">
          <RefreshCw className="w-8 h-8 animate-spin mb-2" />
          <p className="text-sm font-medium">{t.wizard.weatherChecking}</p>
        </div>
      ) : weather ? (
        <div className="relative z-10 space-y-4">
          {/* Main Temp & Condition */}
          <div className="flex items-baseline justify-between">
            <div>
              <div className="flex items-start gap-1">
                <span className="text-5xl sm:text-6xl font-black tracking-tight text-white">
                  {weather.temperature}°
                </span>
                <span className="text-xl font-bold text-emerald-200 mt-1">C</span>
              </div>
              <p className="text-lg font-bold text-emerald-100 mt-1">
                {weather.weatherCondition}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex flex-col items-end gap-1.5 text-right">
              <div className="flex items-center gap-1.5 text-emerald-100 font-semibold text-sm">
                <Droplets className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>{weather.humidity}% {t.weatherCard.humidity}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-100 font-semibold text-sm">
                <CloudRain className="w-4 h-4 text-blue-300 shrink-0" />
                <span>{weather.rainProbability}% {t.weatherCard.rainProb}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-100 font-semibold text-sm">
                <Wind className="w-4 h-4 text-teal-300 shrink-0" />
                <span>{weather.windSpeed} km/h</span>
              </div>
            </div>
          </div>

          {/* Stale Cache or Warning Alert */}
          {notice && (
            <div className="bg-amber-400/20 border border-amber-300/40 rounded-xl p-2.5 text-xs text-amber-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          {weather.warning && (
            <div className="bg-emerald-500/20 border border-emerald-300/30 rounded-2xl p-3 text-sm text-emerald-50 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-200">{t.weatherCard.weatherImpactTitle}</p>
                <p className="text-xs text-emerald-100 mt-0.5 leading-relaxed">{weather.warning}</p>
              </div>
            </div>
          )}

          {/* Simple Advice Note + Details Link */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200">
            <span>{t.weatherCard.weatherImpactDesc}</span>
            <Link
              href="/weather"
              className="inline-flex items-center gap-1 font-bold text-white hover:text-emerald-200 underline decoration-emerald-400 decoration-2 underline-offset-4"
            >
              <span>{t.weatherCard.seeDetails}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        /* Fallback if weather completely unavailable */
        <div className="py-6 text-center text-emerald-100 relative z-10">
          <AlertTriangle className="w-8 h-8 text-amber-300 mx-auto mb-2" />
          <p className="font-bold text-base">{t.weatherCard.tempUnavailable}</p>
          <p className="text-xs text-emerald-200 mt-1 max-w-sm mx-auto">
            {notice || 'Recommendations will use the other available crop and watering information.'}
          </p>
        </div>
      )}
    </div>
  );
}
