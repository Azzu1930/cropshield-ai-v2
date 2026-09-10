'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Plus,
  CheckCircle2,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Sun,
  Droplets,
  ArrowLeft,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  getStoredFarms,
  saveStoredFarms,
  getActiveFarmId,
  setActiveFarmId,
  type FarmRecord,
} from '@/lib/farm-store';
import { LocationPicker, type SelectedLocation } from '@/components/LocationPicker';
import { getLocalizedFarmName, getLocalizedAddress } from '@/lib/i18n/location-translations';

export default function FarmsPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [farms, setFarms] = useState<FarmRecord[]>([]);
  const [activeFarmId, setActiveFarmState] = useState<string>('');
  const [isAddingFarm, setIsAddingFarm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // New Farm Form
  const [farmName, setFarmName] = useState<string>('');
  const [cropName, setCropName] = useState<string>('Rice');
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserFarms() {
      setIsLoading(true);
      let list = getStoredFarms(user?.id);
      let active = getActiveFarmId(user?.id);

      // If Supabase authenticated user, sync with Supabase
      if (isSupabaseConfigured && supabase && user) {
        try {
          const { data, error } = await supabase
            .from('farms')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            const mappedFarms: FarmRecord[] = data.map((d: any) => ({
              id: d.id,
              name: d.name,
              state: d.state,
              district: d.district,
              locality: d.locality,
              latitude: Number(d.latitude),
              longitude: Number(d.longitude),
              cropName: 'Rice',
              userId: user.id,
              createdAt: d.created_at,
            }));
            list = mappedFarms;
            saveStoredFarms(mappedFarms, user.id);
            if (!active) {
              active = mappedFarms[0].id;
              setActiveFarmId(active, user.id);
            }
          }
        } catch (sbErr) {
          console.warn('Could not sync remote farms:', sbErr);
        }
      }

      setFarms(list);
      setActiveFarmState(active || (list.length > 0 ? list[0].id : ''));
      setIsLoading(false);
    }

    loadUserFarms();
  }, [user]);

  const handleSelectActiveFarm = (id: string) => {
    setActiveFarmId(id, user?.id);
    setActiveFarmState(id);
    window.dispatchEvent(new CustomEvent('farmChanged', { detail: { farmId: id } }));
  };

  const handleDeleteFarm = (id: string) => {
    if (!confirm('Are you sure you want to delete this farm?')) return;

    const updated = farms.filter((f) => f.id !== id);
    setFarms(updated);
    saveStoredFarms(updated, user?.id);

    if (activeFarmId === id) {
      const nextId = updated.length > 0 ? updated[0].id : '';
      setActiveFarmId(nextId, user?.id);
      setActiveFarmState(nextId);
      window.dispatchEvent(new CustomEvent('farmChanged', { detail: { farmId: nextId } }));
    }

    if (isSupabaseConfigured && supabase && user) {
      supabase.from('farms').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase delete farm error:', error.message);
      });
    }
  };

  const handleSaveNewFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedLocation) {
      setFormError('Please choose your farm location using "Use My Location" or the search box.');
      return;
    }

    const newName = farmName.trim() || `${selectedLocation.locality} ${cropName} Land`;
    const newFarm: FarmRecord = {
      id: `farm-${Date.now()}`,
      name: newName,
      state: selectedLocation.state,
      district: selectedLocation.district,
      locality: selectedLocation.locality,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      cropName,
      userId: user?.id,
      createdAt: new Date().toISOString(),
    };

    // Save to Supabase if authenticated
    if (isSupabaseConfigured && supabase && user) {
      try {
        const { data: inserted, error: sbErr } = await supabase
          .from('farms')
          .insert({
            user_id: user.id,
            name: newName,
            state: selectedLocation.state,
            district: selectedLocation.district,
            locality: selectedLocation.locality,
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
          } as any)
          .select('id')
          .single();

        if (!sbErr && (inserted as any)?.id) {
          newFarm.id = (inserted as any).id;
        }
      } catch (sbInsertErr) {
        console.warn('Could not save farm to Supabase:', sbInsertErr);
      }
    }

    const updated = [...farms, newFarm];
    setFarms(updated);
    saveStoredFarms(updated, user?.id);
    handleSelectActiveFarm(newFarm.id);

    // Reset Form
    setIsAddingFarm(false);
    setFarmName('');
    setSelectedLocation(null);
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Loading Farms...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-6 animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-100">
          <MapPin className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900">
            {language === 'te'
              ? 'లాగిన్ అవ్వండి'
              : language === 'hi'
              ? 'लॉगिन आवश्यक है'
              : 'Sign In Required'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {language === 'te'
              ? 'మీ పొలాలను నిర్వహించడానికి మరియు వాతావరణాన్ని పరిశీలించడానికి దయచేసి ఖాతాలోకి లాగిన్ అవ్వండి లేదా కొత్త ఖాతా తెరవండి.'
              : language === 'hi'
              ? 'अपने खेतों को प्रबंधित करने और मौसम देखने के लिए कृपया लॉगिन करें या नया खाता बनाएं।'
              : 'Please sign in or register a free farmer account to manage your farms and field locations.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{t.nav.login}</span>
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border-2 border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.nav.register}</span>
          </Link>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.wizard.buttons.back} to Home</span>
          </Link>
        </div>
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
              <MapPin className="w-6 h-6 text-emerald-700 shrink-0" />
              <span>{t.homeCards.myFarms.title}</span>
            </h1>
            <p className="text-sm font-semibold text-emerald-800 mt-1">
              {t.homeCards.myFarms.desc}
            </p>
          </div>
        </div>

        {!isAddingFarm && (
          <button
            type="button"
            onClick={() => setIsAddingFarm(true)}
            className="px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.location.addFarmTitle}</span>
          </button>
        )}
      </div>

      {/* Add New Farm Modal / Card */}
      {isAddingFarm && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-400 shadow-xl space-y-5 animate-in slide-in-from-top-4">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-700" />
              <span>{t.location.addFarmTitle}</span>
            </h2>
            <button
              type="button"
              onClick={() => setIsAddingFarm(false)}
              className="text-xs font-bold text-gray-400 hover:text-gray-600 px-3 py-1 rounded-xl hover:bg-gray-100"
            >
              {t.common.close}
            </button>
          </div>

          <form onSubmit={handleSaveNewFarm} className="space-y-5">
            {formError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                {formError}
              </div>
            )}

            {/* Farm Name (Optional) */}
            <div>
              <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1.5">
                Farm / Field Name
              </label>
              <input
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                placeholder={t.location.farmNamePlaceholder}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-emerald-600 focus:outline-none text-base font-semibold text-gray-800"
              />
            </div>

            {/* Main Crop */}
            <div>
              <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1.5">
                Primary Crop Grown
              </label>
              <select
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-emerald-600 focus:outline-none text-base font-semibold text-gray-800 bg-white"
              >
                <option value="Rice">Rice (Paddy / వరి / धान)</option>
                <option value="Chilli">Chilli (మిరప / मिर्च)</option>
                <option value="Cotton">Cotton (పత్తి / कपास)</option>
                <option value="Tomato">Tomato (టమాట / टमाटर)</option>
                <option value="Maize">Maize (మొక్కజొన్న / मक्का)</option>
                <option value="Groundnut">Groundnut (వేరుశనగ / मूंगफली)</option>
                <option value="Mango">Mango (మామిడి / आम)</option>
                <option value="Pulses">Pulses (పప్పుదినుసులు / दालें)</option>
                <option value="Other">Other Crop</option>
              </select>
            </div>

            {/* Location Picker (Automatic GPS or Search) */}
            <div>
              <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">
                Field Location (Village / Town / Coordinates)
              </label>
              <LocationPicker
                onLocationSelected={(loc) => {
                  setSelectedLocation(loc);
                  setFormError(null);
                }}
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsAddingFarm(false)}
                className="px-5 py-2.5 rounded-2xl border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50"
              >
                {t.common.close}
              </button>
              <button
                type="submit"
                className="px-8 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md"
              >
                {t.location.saveFarm}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Farms List */}
      <div className="space-y-3.5">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider px-1">
          Your Registered Farms (Select to switch weather & checks)
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 rounded-3xl bg-white border border-gray-200 p-4 animate-pulse" />
            ))}
          </div>
        ) : farms.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white border-2 border-dashed border-emerald-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto text-3xl">
              📍
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {language === 'te' ? 'ఇంకా ఎలాంటి పొలం నమోదు కాలేదు' : language === 'hi' ? 'कोई खेत पंजीकृत नहीं है' : 'No farms registered yet'}
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
                {language === 'te'
                  ? 'మీ ఊరు లేదా పొలం లొకేషన్‌ను జోడించండి. వాతావరణం మరియు రోగనిరోధక హెచ్చరికలు మీ పొలానికి మాత్రమే వస్తాయి.'
                  : language === 'hi'
                  ? 'अपने गांव या खेत का स्थान जोड़ें। मौसम और फसल सुरक्षा सलाह आपके खेत के अनुसार मिलेगी।'
                  : 'Add your farm location using GPS or search. Weather and disease risks will be accurately tuned to your field.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingFarm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t.location.addFarmTitle}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {farms.map((f) => {
              const isActive = activeFarmId === f.id;
              return (
                <div
                  key={f.id}
                  className={`p-5 rounded-3xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isActive
                      ? 'border-emerald-600 bg-emerald-50/80 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-lg text-gray-900 leading-snug">
                          {getLocalizedFarmName(f.name, language)}
                        </h3>
                        {isActive && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-950 font-black text-[11px]">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-emerald-800 mt-0.5">
                        📍 {getLocalizedAddress(f.locality, f.district, f.state, language)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 font-mono">
                        GPS: {f.latitude.toFixed(4)}, {f.longitude.toFixed(4)} • Crop: {f.cropName || 'General'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => handleSelectActiveFarm(f.id)}
                        className="px-4 py-2 rounded-xl bg-white border border-emerald-600 text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition-colors"
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteFarm(f.id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Farm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
