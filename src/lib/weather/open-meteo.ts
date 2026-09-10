import type { WeatherData } from '../supabase/database.types';

// WMO Weather interpretation codes mapping
export function mapWmoCodeToCondition(code: number, lang: 'en' | 'te' | 'hi' = 'en'): string {
  switch (code) {
    case 0:
      return lang === 'te' ? 'నిర్మలమైన ఆకాశం ☀️' : lang === 'hi' ? 'साफ आसमान ☀️' : 'Clear Sky ☀️';
    case 1:
    case 2:
      return lang === 'te' ? 'పాక్షికంగా మేఘావృతం ⛅' : lang === 'hi' ? 'आंशिक बादल ⛅' : 'Partly Cloudy ⛅';
    case 3:
      return lang === 'te' ? 'దట్టమైన మేఘాలు ☁️' : lang === 'hi' ? 'घने बादल ☁️' : 'Overcast ☁️';
    case 45:
    case 48:
      return lang === 'te' ? 'మంచు 🌫️' : lang === 'hi' ? 'कोहरा 🌫️' : 'Foggy 🌫️';
    case 51:
    case 53:
    case 55:
      return lang === 'te' ? 'తేలికపాటి జల్లులు 🌦️' : lang === 'hi' ? 'हल्की बूंदाबांदी 🌦️' : 'Drizzle 🌦️';
    case 61:
    case 63:
      return lang === 'te' ? 'వర్షం 🌧️' : lang === 'hi' ? 'बारिश 🌧️' : 'Rain 🌧️';
    case 65:
      return lang === 'te' ? 'భారీ వర్షం 🌧️' : lang === 'hi' ? 'भारी बारिश 🌧️' : 'Heavy Rain 🌧️';
    case 80:
    case 81:
    case 82:
      return lang === 'te' ? 'వర్షపు జల్లులు 🌧️' : lang === 'hi' ? 'वर्षा की फुहारें 🌧️' : 'Rain Showers 🌧️';
    case 95:
    case 96:
    case 99:
      return lang === 'te' ? 'ఉరుములతో కూడిన వర్షం ⛈️' : lang === 'hi' ? 'गरज के साथ बारिश ⛈️' : 'Thunderstorm ⛈️';
    default:
      return lang === 'te' ? 'సాధారణ వాతావరణం 🌤️' : lang === 'hi' ? 'सामान्य मौसम 🌤️' : 'Fair Weather 🌤️';
  }
}

export function evaluateWeatherWarning(
  temp: number,
  humidity: number,
  rainProb: number,
  windSpeed: number,
  lang: 'en' | 'te' | 'hi' = 'en'
): string | null {
  if (humidity >= 80 && temp >= 28 && temp <= 35) {
    return lang === 'te'
      ? 'అధిక తేమ & ఉష్ణోగ్రత: శిలీంధ్ర తెగుళ్లు (బ్లాస్ట్, బ్లైట్) వ్యాపించే ప్రమాదం ఉంది.'
      : lang === 'hi'
      ? 'उच्च आर्द्रता और तापमान: फंगल रोगों (ब्लास्ट, ब्लाइट) का खतरा अधिक है।'
      : 'High humidity & warmth: Elevated fungal disease risk (blast, blight, mildew).';
  }
  if (rainProb >= 70) {
    return lang === 'te'
      ? 'వర్షం పడే అవకాశం ఎక్కువ: రసాయన స్ప్రేలను వాయిదా వేయండి, పొలంలో నీటి నిల్వను నివారించండి.'
      : lang === 'hi'
      ? 'बारिश की भारी संभावना: कीटनाशक छिड़काव रोकें, जलभराव से बचें।'
      : 'Heavy rain expected: Postpone foliar spraying; ensure proper drainage.';
  }
  if (temp >= 38) {
    return lang === 'te'
      ? 'తీవ్రమైన ఎండ & ఉష్ణోగ్రత: తేమ కొరత రాకుండా సాయంత్రం వేళల్లో నీటి తడులు ఇవ్వండి.'
      : lang === 'hi'
      ? 'अत्यधिक गर्मी: नमी बनाए रखने के लिए शाम को हल्की सिंचाई करें।'
      : 'Severe heat: Irrigate during evening hours to prevent acute moisture stress.';
  }
  if (windSpeed >= 35) {
    return lang === 'te'
      ? 'బలమైన ఈదురు గాలులు: స్ప్రే చేయడం ఆపండి, పొడవైన పైర్లకు ఊతం ఇవ్వండి.'
      : lang === 'hi'
      ? 'तेज हवाएं: कीटनाशक छिड़काव न करें, पौधों को सहारा दें।'
      : 'High winds: Avoid spraying chemicals; protect lodging-sensitive crops.';
  }
  return null;
}

export async function fetchLiveWeather(lat: number, lon: number, lang: 'en' | 'te' | 'hi' = 'en'): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&timezone=auto`;

  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'CropShield-AI/2.0 (Farmer-Decision-Support)'
    },
    next: { revalidate: 1800 } // Next.js cache 30 mins
  });

  if (!res.ok) {
    throw new Error(`Open-Meteo API returned status ${res.status}`);
  }

  const data = await res.json();
  const current = data.current || {};
  const daily = data.daily || {};

  const temp = Math.round((current.temperature_2m ?? 30) * 10) / 10;
  const humidity = Math.round((current.relative_humidity_2m ?? 70) * 10) / 10;
  const rainfall = Math.round((current.rain ?? current.precipitation ?? 0) * 10) / 10;
  const windSpeed = Math.round((current.wind_speed_10m ?? 10) * 10) / 10;
  const weatherCode = current.weather_code ?? 0;
  const condition = mapWmoCodeToCondition(weatherCode, lang);
  const rainProb = daily.precipitation_probability_max?.[0] ?? (rainfall > 0 ? 80 : 20);

  const forecast = (daily.time || []).slice(0, 5).map((dateStr: string, idx: number) => {
    const d = new Date(dateStr);
    const dayName = d.toLocaleDateString(lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'short' });
    return {
      day: dayName,
      tempMax: Math.round(daily.temperature_2m_max?.[idx] ?? temp),
      tempMin: Math.round(daily.temperature_2m_min?.[idx] ?? (temp - 6)),
      rainProb: daily.precipitation_probability_max?.[idx] ?? 0,
      condition: mapWmoCodeToCondition(daily.weather_code?.[idx] ?? 0, lang)
    };
  });

  const warning = evaluateWeatherWarning(temp, humidity, rainProb, windSpeed, lang);

  return {
    temperature: temp,
    humidity,
    rainfall,
    windSpeed,
    weatherCondition: condition,
    rainProbability: rainProb,
    warning,
    forecast,
    fetchedAt: new Date().toISOString(),
    isCached: false,
  };
}
