'use client';

import React, { useState } from 'react';
import { MapPin, Search, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface SelectedLocation {
  state: string;
  district: string;
  locality: string;
  latitude: number;
  longitude: number;
  displayName?: string;
}

interface LocationPickerProps {
  onLocationSelected: (loc: SelectedLocation) => void;
  initialLocation?: SelectedLocation | null;
}

export function LocationPicker({ onLocationSelected, initialLocation }: LocationPickerProps) {
  const { t } = useLanguage();
  const [selectedLoc, setSelectedLoc] = useState<SelectedLocation | null>(initialLocation || null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SelectedLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Option A: Use Current Location
  const handleUseMyLocation = () => {
    setErrorMsg(null);
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        try {
          // Call our server geocode route
          const res = await fetch(`/api/geocode?action=reverse&lat=${lat}&lon=${lon}`);
          const data = await res.json();

          const loc: SelectedLocation = {
            state: data.state || 'Andhra Pradesh',
            district: data.district || 'West Godavari',
            locality: data.locality || 'Bhimavaram',
            latitude: lat,
            longitude: lon,
            displayName: data.displayName,
          };

          setSelectedLoc(loc);
          onLocationSelected(loc);
        } catch (err) {
          console.error('Reverse geocode error:', err);
          // Fallback location with detected lat/lon
          const fallbackLoc: SelectedLocation = {
            state: 'Andhra Pradesh',
            district: 'Local District',
            locality: 'My Farm Location',
            latitude: lat,
            longitude: lon,
          };
          setSelectedLoc(fallbackLoc);
          onLocationSelected(fallbackLoc);
        } finally {
          setIsDetecting(false);
        }
      },
      (err) => {
        setIsDetecting(false);
        console.warn('Geolocation permission error:', err);
        setErrorMsg('Could not detect location. Please use the search box below.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Option B: Search Location
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/geocode?action=search&q=${encodeURIComponent(searchQuery)}`);
      const list = await res.json();

      if (Array.isArray(list) && list.length > 0) {
        setSearchResults(list);
      } else {
        setSearchResults([]);
        setErrorMsg('No locations found. Try searching for your district or nearest town.');
      }
    } catch (err) {
      console.error('Search location error:', err);
      setErrorMsg('Search failed. Please check internet connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (item: SelectedLocation) => {
    setSelectedLoc(item);
    onLocationSelected(item);
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <div className="space-y-4">
      {/* Option A: Big Touch "Use My Location" Button */}
      <div>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isDetecting}
          className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-extrabold text-base sm:text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 border-2 border-emerald-400/40 disabled:opacity-75"
        >
          {isDetecting ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-white" />
              <span>{t.location.detectingLocation}</span>
            </>
          ) : (
            <>
              <MapPin className="w-6 h-6 text-white shrink-0" />
              <span>{t.location.useMyLocation}</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-3 my-2">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">OR</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Option B: Simple Search Input */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">
          {t.location.searchLocation}
        </label>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.location.searchPlaceholder}
              className="w-full pl-4 pr-10 py-3 rounded-2xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-none text-gray-900 text-sm font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="px-5 py-3 rounded-2xl bg-emerald-800 text-white font-bold text-sm hover:bg-emerald-900 transition-colors flex items-center gap-1.5 disabled:opacity-50 shrink-0"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Search</span>
          </button>
        </form>

        {/* Quick Example Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span className="text-xs text-gray-400 font-medium">Try:</span>
          {['Bhimavaram', 'Amalapuram', 'Vijayawada', 'Warangal'].map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setSearchQuery(ex);
              }}
              className="text-xs px-2.5 py-1 rounded-full bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 text-gray-600 font-semibold transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>

        {/* Search Results Dropdown List */}
        {searchResults.length > 0 && (
          <div className="mt-2 bg-white border-2 border-emerald-200 rounded-2xl shadow-lg divide-y divide-gray-100 overflow-hidden">
            {searchResults.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSearchResult(item)}
                className="w-full text-left p-3.5 hover:bg-emerald-50 transition-colors flex items-start gap-2.5"
              >
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {item.locality || item.district || 'Village/Town'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.district ? `${item.district}, ` : ''}{item.state}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-700 font-medium">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Selected Location Card */}
      {selectedLoc && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                {t.location.locationDetected}
              </p>
              <p className="text-base font-extrabold text-emerald-950">
                {selectedLoc.locality}, {selectedLoc.district}
              </p>
              <p className="text-xs text-emerald-700 font-medium">
                {selectedLoc.state}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
