'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Droplets, Wind, CloudRain, AlertTriangle, RefreshCw, ChevronRight, ShieldCheck, Thermometer } from 'lucide-react';
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
  const [notice, setNotice] = useState<string | null>(null);

  const loadWeatherForFarm = async (currentFarm: FarmRecord) => {
    setLoading(true);
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
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {language === 'te' ? 'పొలం స్థానాన్ని నమోదు చేయండి' : language === 'hi' ? 'खेत का स्थान जोड़ें' : 'Add Farm Location'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'te'
                ? 'ఖచ్చితమైన స్థానిక వాతావరణం మరియు తెగుళ్ల హెచ్చరికల కోసం మీ పొలాన్ని జోడించండి.'
                : language === 'hi'
                ? 'सटीक मौसम और कीट चेतावनियों के लिए अपने खेत का स्थान जोड़ें।'
                : 'Connect your field location to auto-detect temperature, rain probability, and disease risks.'}
            </p>
          </div>
        </div>
        <Link
          href="/farms"
          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm shrink-0 transition-colors"
        >
          {language === 'te' ? '+ పొలం జోడించండి' : language === 'hi' ? '+ खेत जोड़ें' : '+ Add Farm'}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white text-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
      {/* Farm Location Header Bar */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {farm?.name}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-xs font-medium text-slate-600">
                {farm?.locality}, {farm?.district}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => farm && loadWeatherForFarm(farm)}
          disabled={loading}
          aria-label="Refresh weather data"
          className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors border border-slate-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && !weather ? (
        <div className="py-6 flex items-center justify-center gap-2 text-slate-500 text-xs font-medium">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
          <span>{t.wizard.weatherChecking}</span>
        </div>
      ) : weather ? (
        <div className="space-y-4">
          {/* Main Temp & Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
            {/* Primary Temp Indicator */}
            <div className="sm:col-span-1 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
                {weather.temperature}°C
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {weather.weatherCondition}
              </span>
            </div>

            {/* Environmental Metric Cards */}
            <div className="sm:col-span-3 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                  <Droplets className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{t.weatherCard.humidity}</span>
                </div>
                <p className="text-base font-bold text-slate-900 mt-1">
                  {weather.humidity}%
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                  <CloudRain className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{t.weatherCard.rainProb}</span>
                </div>
                <p className="text-base font-bold text-slate-900 mt-1">
                  {weather.rainProbability}%
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                  <Wind className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{t.weatherCard.wind}</span>
                </div>
                <p className="text-base font-bold text-slate-900 mt-1">
                  {weather.windSpeed} km/h
                </p>
              </div>
            </div>
          </div>

          {/* Stale Cache Notice */}
          {notice && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          {/* Weather Impact Advice */}
          {weather.warning && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <span className="font-semibold text-slate-900">{t.weatherCard.weatherImpactTitle}: </span>
                {weather.warning}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500 border border-slate-200">
          {t.weatherCard.tempUnavailable}
        </div>
      )}
    </div>
  );
}
