'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sun,
  Droplets,
  CloudRain,
  Wind,
  MapPin,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth';
import { getActiveFarm, type FarmRecord } from '@/lib/farm-store';
import type { WeatherData } from '@/lib/supabase/database.types';
import { getLocalizedFarmName, getLocalizedAddress } from '@/lib/i18n/location-translations';

export default function WeatherPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [farm, setFarm] = useState<FarmRecord | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadWeather = async (activeFarm: FarmRecord) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/weather?farmId=${encodeURIComponent(activeFarm.id)}&lat=${activeFarm.latitude}&lon=${activeFarm.longitude}&lang=${language}`
      );
      const data = await res.json();
      if (data.weatherAvailable !== false) {
        setWeather(data);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const active = getActiveFarm(user?.id);
    setFarm(active);
    if (active) {
      loadWeather(active);
    } else {
      setLoading(false);
    }
  }, [user, language]);

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
              <span>☀️</span> {t.homeCards.weather.title}
            </h1>
            <p className="text-sm font-semibold text-emerald-800 mt-0.5">
              📍 {farm ? `${getLocalizedFarmName(farm.name, language)} (${getLocalizedAddress(farm.locality, farm.district, undefined, language)})` : (language === 'te' ? 'పొలం స్థానం' : language === 'hi' ? 'खेत का स्थान' : 'Farm Location')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => farm && loadWeather(farm)}
          disabled={loading}
          className="p-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Main Big Weather Card */}
      {weather && (
        <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-emerald-200 uppercase tracking-wide">
                Live Farm Temperature
              </p>
              <div className="flex items-start gap-1">
                <span className="text-6xl sm:text-7xl font-black">{weather.temperature}°</span>
                <span className="text-2xl font-bold text-emerald-200 mt-2">C</span>
              </div>
              <p className="text-xl font-bold text-emerald-100 mt-1">
                {weather.weatherCondition}
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 sm:text-right">
              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                <p className="text-xs text-emerald-200 font-medium">Humidity</p>
                <p className="text-lg font-black text-white mt-0.5 flex items-center sm:justify-end gap-1">
                  <Droplets className="w-4 h-4 text-cyan-300" />
                  <span>{weather.humidity}%</span>
                </p>
              </div>

              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                <p className="text-xs text-emerald-200 font-medium">Rain Chance</p>
                <p className="text-lg font-black text-white mt-0.5 flex items-center sm:justify-end gap-1">
                  <CloudRain className="w-4 h-4 text-blue-300" />
                  <span>{weather.rainProbability}%</span>
                </p>
              </div>

              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                <p className="text-xs text-emerald-200 font-medium">Wind Speed</p>
                <p className="text-lg font-black text-white mt-0.5 flex items-center sm:justify-end gap-1">
                  <Wind className="w-4 h-4 text-teal-300" />
                  <span>{weather.windSpeed} km/h</span>
                </p>
              </div>

              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                <p className="text-xs text-emerald-200 font-medium">Rainfall</p>
                <p className="text-lg font-black text-white mt-0.5 sm:justify-end">
                  {weather.rainfall} mm
                </p>
              </div>
            </div>
          </div>

          {/* Agronomic Warning */}
          {weather.warning && (
            <div className="p-4 rounded-2xl bg-amber-400/20 border border-amber-300/40 text-amber-100 flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-sm text-white">
                  Agricultural Weather Alert
                </p>
                <p className="text-xs text-amber-100 mt-1 leading-relaxed">
                  {weather.warning}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5-Day Simple Forecast */}
      {weather?.forecast && weather.forecast.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border-2 border-emerald-200 shadow-md space-y-4">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-700" />
            <span>5-Day Farmer Forecast</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {weather.forecast.map((fc, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-emerald-100 bg-emerald-50/40 text-center flex flex-col items-center justify-between gap-1.5"
              >
                <p className="text-xs font-bold text-gray-500">{fc.day}</p>
                <p className="text-sm font-semibold text-gray-800 truncate max-w-full">
                  {fc.condition}
                </p>
                <p className="text-base font-black text-emerald-950">
                  {fc.tempMax}° / <span className="text-xs text-gray-400 font-normal">{fc.tempMin}°</span>
                </p>
                <span className="text-[11px] font-bold text-blue-700 flex items-center gap-0.5">
                  <CloudRain className="w-3 h-3" /> {fc.rainProb}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
