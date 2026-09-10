import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'reverse'; // 'reverse' or 'search'
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const q = searchParams.get('q');

    const headers = {
      'User-Agent': 'CropShield-AI/2.0 (Farmer-Decision-Support; contact@cropshield.org)',
      'Accept': 'application/json',
    };

    if (action === 'reverse' && lat && lon) {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
      const res = await fetch(url, { headers });
      if (!res.ok) {
        return NextResponse.json({
          state: 'Andhra Pradesh',
          district: 'West Godavari',
          locality: 'Bhimavaram',
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
        });
      }

      const data = await res.json();
      const addr = data.address || {};
      const state = addr.state || addr.region || 'Andhra Pradesh';
      const district = addr.state_district || addr.county || addr.district || 'West Godavari';
      const locality = addr.village || addr.town || addr.city || addr.suburb || addr.hamlet || 'Local Area';

      return NextResponse.json({
        state,
        district,
        locality,
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        displayName: data.display_name,
      });
    }

    if (action === 'search' && q) {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&countrycodes=in&limit=5`;
      const res = await fetch(url, { headers });
      if (!res.ok) {
        return NextResponse.json([]);
      }

      const list = await res.json();
      const results = (list || []).map((item: any) => {
        const addr = item.address || {};
        const state = addr.state || addr.region || '';
        const district = addr.state_district || addr.county || addr.district || '';
        const locality = addr.village || addr.town || addr.city || addr.suburb || item.name || '';

        return {
          displayName: item.display_name,
          state,
          district,
          locality,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
        };
      });

      return NextResponse.json(results);
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error: any) {
    console.error('Geocode route error:', error);
    return NextResponse.json(
      {
        state: 'Andhra Pradesh',
        district: 'West Godavari',
        locality: 'Bhimavaram',
        latitude: 16.5449,
        longitude: 81.5212,
      },
      { status: 200 }
    );
  }
}
