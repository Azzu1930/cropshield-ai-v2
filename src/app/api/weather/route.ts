import { NextRequest, NextResponse } from 'next/server';
import { fetchLiveWeather } from '@/lib/weather/open-meteo';
import { getServerSupabase } from '@/lib/supabase/server';
import type { SupportedLanguage } from '@/lib/i18n/types';

export const dynamic = 'force-dynamic';

// In-memory server-side cache for high performance & zero-cost free-tier resilience
const memoryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get('farmId') || 'default';
    const latStr = searchParams.get('lat') || process.env.DEFAULT_LATITUDE || '16.5449';
    const lonStr = searchParams.get('lon') || process.env.DEFAULT_LONGITUDE || '81.5212';
    const lang = (searchParams.get('lang') || 'en') as SupportedLanguage;

    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json({ error: 'Invalid coordinates provided.' }, { status: 400 });
    }

    const cacheKey = `${farmId}_${lat.toFixed(3)}_${lon.toFixed(3)}_${lang}`;
    const cachedEntry = memoryCache.get(cacheKey);

    // 1. Check in-memory cache
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({
        ...cachedEntry.data,
        isCached: true,
      });
    }

    // 2. Check Supabase weather_records cache if available
    const supabase = getServerSupabase();
    if (supabase && farmId && farmId !== 'default' && !farmId.startsWith('farm-')) {
      try {
        const { data: dbWeather } = await supabase
          .from('weather_records')
          .select('*')
          .eq('farm_id', farmId)
          .order('fetched_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (dbWeather) {
          const db = dbWeather as any;
          const fetchedTime = new Date(db.fetched_at).getTime();
          if (Date.now() - fetchedTime < CACHE_TTL_MS) {
            const formatted = {
              temperature: Number(db.temperature),
              humidity: Number(db.humidity),
              rainfall: Number(db.rainfall),
              windSpeed: Number(db.wind_speed),
              weatherCondition: db.weather_condition,
              rainProbability: Number(db.rain_probability),
              forecast: (db.forecast_data as any)?.forecast || [],
              fetchedAt: db.fetched_at,
              isCached: true,
            };
            memoryCache.set(cacheKey, { data: formatted, timestamp: fetchedTime });
            return NextResponse.json(formatted);
          }
        }
      } catch (err) {
        console.warn('Supabase weather query skipped:', err);
      }
    }

    // 3. Fetch live weather from Open-Meteo (100% Free, no API key needed)
    try {
      const weather = await fetchLiveWeather(lat, lon, lang);

      // Save to memory cache
      memoryCache.set(cacheKey, { data: weather, timestamp: Date.now() });

      // Save to Supabase if configured
      if (supabase && farmId && farmId !== 'default' && !farmId.startsWith('farm-')) {
        try {
          await supabase.from('weather_records').insert({
            farm_id: farmId,
            latitude: lat,
            longitude: lon,
            temperature: weather.temperature,
            humidity: weather.humidity,
            rainfall: weather.rainfall,
            wind_speed: weather.windSpeed,
            weather_condition: weather.weatherCondition,
            rain_probability: weather.rainProbability,
            forecast_data: { forecast: weather.forecast } as any,
          } as any);
        } catch (dbErr) {
          console.warn('Could not persist weather to Supabase:', dbErr);
        }
      }

      return NextResponse.json(weather);
    } catch (apiError: any) {
      console.error('[Open-Meteo Fetch Error]', apiError);

      // If live API fails, check if we have any stale cached data
      if (cachedEntry) {
        return NextResponse.json({
          ...cachedEntry.data,
          isCached: true,
          notice: 'Showing latest available weather data.',
          lastUpdated: new Date(cachedEntry.timestamp).toLocaleString(),
        });
      }

      // Graceful degradation when weather service is unreachable
      return NextResponse.json({
        weatherAvailable: false,
        temperature: null,
        humidity: null,
        rainfall: null,
        windSpeed: null,
        weatherCondition: 'Weather data temporarily unavailable',
        rainProbability: 0,
        notice: 'Weather data unavailable. Recommendations will use other available field information.',
        isCached: false,
      });
    }
  } catch (error: any) {
    console.error('Weather route error:', error);
    return NextResponse.json(
      {
        weatherAvailable: false,
        error: 'Failed to process weather request',
        notice: 'Weather information is temporarily unavailable.',
      },
      { status: 200 } // Return 200 so UI never crashes
    );
  }
}
