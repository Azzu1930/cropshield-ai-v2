// Automated Acceptance Verification Test Suite for CropShield AI v2
import { fetchLiveWeather, mapWmoCodeToCondition, evaluateWeatherWarning } from '../src/lib/weather/open-meteo';
import { RuleBasedAIService } from '../src/lib/ai/rule-based-service';
import { dictionaries, getTranslation } from '../src/lib/i18n';

async function runAcceptanceTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING CROPSHIELD AI ACCEPTANCE TEST SUITE (v2)');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: any) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`, detail || '');
      failed++;
    }
  }

  // TEST 1 & 2: Automatic Weather Fetching via Open-Meteo
  try {
    console.log('--- Testing Weather API Integration (Open-Meteo) ---');
    const weather = await fetchLiveWeather(16.5449, 81.5212, 'te'); // Bhimavaram, AP in Telugu
    assert(typeof weather.temperature === 'number', 'TEST 2.1: Temperature retrieved from Open-Meteo');
    assert(typeof weather.humidity === 'number', 'TEST 2.2: Humidity retrieved from Open-Meteo');
    assert(typeof weather.weatherCondition === 'string' && weather.weatherCondition.length > 0, 'TEST 2.3: Weather condition localized');
    assert(Array.isArray(weather.forecast) && weather.forecast.length > 0, 'TEST 2.4: 5-Day forecast retrieved');
  } catch (err) {
    assert(false, 'TEST 2: Live Weather fetching failed', err);
  }

  // TEST 3: Weather Condition Translation
  const teCond = mapWmoCodeToCondition(61, 'te');
  const hiCond = mapWmoCodeToCondition(61, 'hi');
  const enCond = mapWmoCodeToCondition(61, 'en');
  assert(teCond.includes('వర్షం'), 'TEST 3.1: WMO Rain code translated to Telugu');
  assert(hiCond.includes('बारिश'), 'TEST 3.2: WMO Rain code translated to Hindi');
  assert(enCond.includes('Rain'), 'TEST 3.3: WMO Rain code translated to English');

  // TEST 4 & 5: Weather Evidence Affects AI Analysis
  console.log('\n--- Testing AI Agronomic Engine (RuleBased & Fallback) ---');
  const aiService = new RuleBasedAIService();

  // Test Fungal blast/brown spot with high humidity
  const fungalResult = await aiService.analyzeCrop({
    cropName: 'Rice',
    symptoms: ['brownSpots'],
    waterLevel: 'more',
    hasSoilReport: false,
    weatherData: {
      temperature: 31,
      humidity: 84, // High humidity
      rainfall: 2.0,
      windSpeed: 12,
      weatherCondition: 'Rain likely',
      rainProbability: 75,
    },
    language: 'te',
  });
  assert(fungalResult.issueCategory === 'fungal', 'TEST 4.1: High humidity + brown spots classified as fungal');
  assert(fungalResult.actions.length >= 3 && fungalResult.actions.length <= 5, 'TEST 4.2: 3-5 simple action steps generated');
  assert(fungalResult.whyReasons.some(r => r.includes('తేమ') || r.includes('మచ్చ')), 'TEST 4.3: Why explanation includes weather humidity evidence in Telugu');

  // Test Insect Pest with warm temperature in Hindi
  const pestResult = await aiService.analyzeCrop({
    cropName: 'Chilli',
    symptoms: ['insects'],
    waterLevel: 'normal',
    hasSoilReport: false,
    weatherData: {
      temperature: 34,
      humidity: 55,
      rainfall: 0,
      windSpeed: 8,
      weatherCondition: 'Clear',
      rainProbability: 10,
    },
    language: 'hi',
  });
  assert(pestResult.issueCategory === 'pest', 'TEST 4.4: Insects symptom classified as pest infestation');
  assert(pestResult.possibleIssue.includes('कीट') || pestResult.possibleIssue.includes('कीड़ों'), 'TEST 4.5: Output generated in Hindi');

  // Test Water Stress
  const waterStressResult = await aiService.analyzeCrop({
    cropName: 'Tomato',
    symptoms: ['yellowLeaves'],
    waterLevel: 'less',
    hasSoilReport: false,
    language: 'en',
  });
  assert(waterStressResult.issueCategory === 'water_stress', 'TEST 6.1: Yellow leaves + less water classified as moisture stress');

  // Test Automatic History Comparison
  const comparedResult = await aiService.analyzeCrop({
    cropName: 'Rice',
    symptoms: [],
    waterLevel: 'normal',
    hasSoilReport: false,
    previousAssessment: {
      possibleIssue: 'Fungal Blight',
      seriousness: 'HIGH',
      date: '2026-09-07',
    },
    language: 'en',
  });
  assert(comparedResult.previousComparison?.status === 'better', 'TEST 9.1: Automatic comparison detects improvement from previous HIGH risk');

  // TEST 11: Multilingual Dictionary Coverage
  console.log('\n--- Testing Trilingual Localization Parity ---');
  assert(Boolean(dictionaries.en.homeCards.checkCrop.title), 'TEST 11.1: English home cards complete');
  assert(Boolean(dictionaries.te.homeCards.checkCrop.title), 'TEST 11.2: Telugu home cards complete');
  assert(Boolean(dictionaries.hi.homeCards.checkCrop.title), 'TEST 11.3: Hindi home cards complete');
  assert(dictionaries.te.wizard.step1Title === 'మీరు ఏ పంటను తనిఖీ చేయాలనుకుంటున్నారు?', 'TEST 11.4: Wizard Step 1 Telugu verified');

  console.log('\n====================================================');
  console.log(`📊 SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAcceptanceTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
