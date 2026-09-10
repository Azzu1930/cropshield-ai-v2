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
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  getStoredFarms,
  saveStoredFarms,
  getActiveFarmId,
  setActiveFarmId,
  type FarmRecord,
} from '@/lib/farm-store';
import { LocationPicker, type SelectedLocation } from '@/components/LocationPicker';

export default function FarmsPage() {
  const { t, language } = useLanguage();
  const [farms, setFarms] = useState<FarmRecord[]>([]);
  const [activeFarmId, setActiveFarmState] = useState<string>('');
  const [isAddingFarm, setIsAddingFarm] = useState<boolean>(false);

  // New Farm Form
  const [farmName, setFarmName] = useState<string>('');
  const [cropName, setCropName] = useState<string>('Rice');
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const list = getStoredFarms();
    const active = getActiveFarmId();
    setFarms(list);
    setActiveFarmState(active);
  }, []);

  const handleSelectActiveFarm = (id: string) => {
    setActiveFarmId(id);
    setActiveFarmState(id);
    window.dispatchEvent(new CustomEvent('farmChanged', { detail: { farmId: id } }));
  };

  const handleDeleteFarm = (id: string) => {
    if (farms.length <= 1) {
      alert('You must have at least one farm location.');
      return;
    }
    const updated = farms.filter((f) => f.id !== id);
    setFarms(updated);
    saveStoredFarms(updated);

    if (activeFarmId === id) {
      const nextId = updated[0].id;
      setActiveFarmId(nextId);
      setActiveFarmState(nextId);
      window.dispatchEvent(new CustomEvent('farmChanged', { detail: { farmId: nextId } }));
    }
  };

  const handleSaveNewFarm = (e: React.FormEvent) => {
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
      createdAt: new Date().toISOString(),
    };

    const updated = [...farms, newFarm];
    setFarms(updated);
    saveStoredFarms(updated);
    handleSelectActiveFarm(newFarm.id);

    // Reset Form
    setIsAddingFarm(false);
    setFarmName('');
    setSelectedLocation(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in pb-16">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-emerald-100 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
            <span>🌾</span> {t.homeCards.myFarms.title}
          </h1>
          <p className="text-sm font-semibold text-emerald-800 mt-1">
            {t.homeCards.myFarms.desc}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingFarm(!isAddingFarm)}
          className="px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isAddingFarm ? t.common.close : t.location.addFarmTitle}</span>
        </button>
      </div>

      {/* Add Farm Form Modal/Card */}
      {isAddingFarm && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-300 shadow-xl space-y-5 animate-in slide-in-from-top-3">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-emerald-600" />
            <span>{t.location.addFarmTitle}</span>
          </h2>

          <form onSubmit={handleSaveNewFarm} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                {t.location.farmNamePlaceholder}
              </label>
              <input
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                placeholder="e.g. Sri Lakshmi Paddy Field"
                className="w-full p-3.5 rounded-2xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-none text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Primary Crop Planted
              </label>
              <select
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full p-3.5 rounded-2xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-none text-sm font-semibold bg-white"
              >
                <option value="Rice">🌾 Rice / Paddy</option>
                <option value="Maize">🌽 Maize</option>
                <option value="Tomato">🍅 Tomato</option>
                <option value="Chilli">🌶️ Chilli</option>
                <option value="Groundnut">🥜 Groundnut</option>
                <option value="Cotton">⚪ Cotton</option>
                <option value="Other">🌿 Other Crop</option>
              </select>
            </div>

            {/* Location Picker (Use My Location or Search) */}
            <div className="pt-2">
              <LocationPicker onLocationSelected={setSelectedLocation} />
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-bold">
                {formError}
              </div>
            )}

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddingFarm(false)}
                className="px-6 py-3 rounded-2xl border-2 border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50"
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
                        {f.name}
                      </h3>
                      {isActive && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-950 font-black text-[11px]">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-emerald-800 mt-0.5">
                      📍 {f.locality}, {f.district} ({f.state})
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
                  {farms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteFarm(f.id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Farm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
