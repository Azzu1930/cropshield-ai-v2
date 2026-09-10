# CropShield AI — Intelligent Crop Health & Decision Support Platform (v2)

> **Empowering farmers with low digital literacy through intelligent, zero-cost, multi-evidence crop protection.**  
> *Smarter Insights. Healthier Crops. Zero Manual Weather Guesswork.*

---

## 🌟 What is CropShield AI?

CropShield AI is an evidence-based crop health decision-support system designed from the ground up for farmers who may not be comfortable with complex computers, English, or technical jargon.

Instead of dumping misleading confidence percentages or confusing meteorological charts onto the farmer, CropShield AI automatically correlates **farm location**, **live weather**, **watering history**, and **crop leaf photos** into a clear, prioritized 3-5 step action plan.

---

## 🚀 Key Architectural Pillars

### 1. Automatic Weather Detection (Zero Manual Input)
- **📍 Use My Location**: One-tap browser geolocation reverse-geocodes coordinates into State, District, and Village via OpenStreetMap Nominatim.
- **Search Village/Town**: Instant search for villages (e.g. *Bhimavaram*, *Amalapuram*, *Vijayawada*, *Warangal*) with automatic coordinate retrieval.
- **Free Open-Meteo API**: Live temperature, humidity, rainfall, wind speed, and rain probability retrieved server-side. Zero API keys, zero cost.
- **Weather Cache**: Persisted in `weather_records` table to eliminate redundant satellite queries within a 30-minute window.
- **Graceful Failure**: If the weather satellite is temporarily unreachable, the app seamlessly uses cached data or continues with remaining observations without crashing.

### 2. Multi-Farm Independence
- Each farm has independent coordinates and independent weather snapshots.
- Switching between *Farm A (Andhra Pradesh)* and *Farm B (Telangana)* updates live weather and diagnosis context automatically.

### 3. Weather-as-Evidence Intelligence
- Weather is not a decorative dashboard card; it is evidence fed into the analysis engine.
- High humidity (>80%) + warm temperature (28–34°C) automatically elevates fungal risk factors (blast, blight, downy mildew).
- High temperature + low humidity alerts for drought stress and spider mite infestations.

### 4. Farmer-First Simple Touch UI
- Designed for low-literacy users: **Icon + Text on every single button** (e.g. `📷 Upload Crop Photo`, `🌱 Check My Crop`).
- **8 Large Primary Home Cards** (min 56px touch height):
  1. 🌱 **Check My Crop**
  2. 📷 **Upload Crop Photo**
  3. 🌾 **My Farms**
  4. 💧 **Water**
  5. 🧪 **Soil Test**
  6. ☀️ **Weather**
  7. 📋 **My Reports**
  8. 👨🌾 **Ask Expert**

### 5. 7-Step Step-by-Step Crop Analysis Flow
1. **Step 1**: "What crop do you want to check?" (Rice 🌾, Maize 🌽, Tomato 🍅, Chilli 🌶️, Groundnut 🥜, Cotton ⚪, Other 🌿)
2. **Step 2**: "Take or upload a photo" (📷 Take Photo [with camera `capture`], 📁 Choose Photo) with live preview.
3. **Step 3**: "What's wrong with the crop?" (Yellow leaves 🟡, Brown spots 🟤, Insects 🐛, Drying 🍂, Wilting 💧, Poor growth 🌱, I don't know ❓).
4. **Step 4**: "How much water did you give?" (💧 Less than usual, 💧 Normal, 💧 More than usual, optional exact amount).
5. **Step 5**: "Do you have a soil test?" (YES / NO — never forced).
6. **Step 6**: "Automatic Weather" (Shows detected weather for selected farm automatically).
7. **Step 7**: "Checking your crop..." (Animated 7-step checklist before showing result).

### 6. Simple Result Page & "Why?" Explanation
- **🌱 Your Crop Health** headline
- **Seriousness Level**: 🟢 Low Risk, 🟡 Medium Risk, 🔴 High Risk (clearly color-coded with text and pulse indicator).
- **3–5 Clear Actions**: Concise, immediate actions (pruning, irrigation pause, organic neem spray, post-rain monitoring).
- **"Why did we give this advice?"**: Explains the connection between photo spots, farm humidity, recent watering, and past checks.
- **Simplified Confidence**: 🟢 High / 🟡 Medium / 🔴 Low (no complex raw decimals).
- **👨🌾 Ask an Agricultural Expert**: One-click request saved for Krishi Vigyan Kendra (KVK) review.

### 7. Full Trilingual Support (English, Telugu తెలుగు, Hindi हिन्दी)
- Persistent language switcher: `🌐 తెలుగు` / `English` / `हिन्दी`.
- **100% of all UI strings**, forms, buttons, crop names, symptoms, weather conditions, action steps, disclaimers, and audio narrations switch language.
- AI diagnosis is generated directly in the selected language.

### 8. Voice-Friendly UI (🔊 Listen)
- Free browser Web Speech API (`window.speechSynthesis`) integration.
- Reads out the diagnosis and 3-5 action steps in Telugu (`te-IN`), Hindi (`hi-IN`), or English (`en-IN`).

### 9. Zero-Cost Free Deployment Architecture
- **Frontend & Serverless API**: Vercel Hobby (Free)
- **Database**: Supabase PostgreSQL (Free)
- **Auth**: Supabase Auth (Free)
- **Storage**: Supabase Storage with client-side canvas compression (Free)
- **Weather**: Open-Meteo (100% Free, NO API key)
- **AI**: Configurable `AIService` supporting Google Gemini Flash Free Tier or Rule-Based Fallback.

---

## 📋 Acceptance Test Matrix (All 14 Tests)

| Test # | Description | Expected Behavior | Verification Status |
| :--- | :--- | :--- | :---: |
| **TEST 1** | Farmer creates farm via "Use My Location" | Coordinates detected via GPS & reverse-geocoded to state/district | ✅ Verified |
| **TEST 2** | Automatic Weather Fetching | Weather pulled from Open-Meteo via farm coordinates; no manual inputs | ✅ Verified |
| **TEST 3** | Farmer changes active farm | Weather updates dynamically to match selected farm's coordinates | ✅ Verified |
| **TEST 4** | Farmer uploads human selfie | Validator rejects image with prompt: *"Please upload a clear crop photo"* | ✅ Verified |
| **TEST 5** | Farmer uploads crop photo | Image validated, compressed to <250KB, analyzed | ✅ Verified |
| **TEST 6** | Farmer changes water level | Water stress / root rot diagnostic evidence adjusts recommendations | ✅ Verified |
| **TEST 7** | Farmer provides soil pH | Soil acidity/alkalinity evaluated with lime/gypsum advice | ✅ Verified |
| **TEST 8** | High humidity weather detected | Fungal blast/blight risk elevated in diagnosis & advice | ✅ Verified |
| **TEST 9** | Farmer performs multiple checks | Checks saved in history with dates and status badges | ✅ Verified |
| **TEST 10** | Two farmers login | Supabase Row Level Security (RLS) ensures complete data isolation | ✅ Verified |
| **TEST 11** | Language switched to Telugu (తెలుగు) | 100% of UI, labels, symptoms, and AI advice switch to Telugu | ✅ Verified |
| **TEST 12** | Weather API unreachable | App gracefully shows latest cached data or continues without crash | ✅ Verified |
| **TEST 13** | AI API unavailable / quota reached | Fallback engine generates structured preliminary assessment | ✅ Verified |
| **TEST 14** | Expert review requested | Request saved with status `pending`, clearly distinct from AI result | ✅ Verified |

---

## 🛠️ Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open your browser
http://localhost:3000
```
