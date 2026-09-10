# CropShield AI — 100% Free Tier Deployment Guide

This guide walks you through deploying **CropShield AI** completely free of charge. No paid accounts, no credit cards, and no Render/Railway servers required.

### 🏗️ Architecture Summary
- **Frontend & Serverless API**: [Vercel Hobby](https://vercel.com) (Free)
- **Database & Auth & Storage**: [Supabase Free Tier](https://supabase.com) (Free PostgreSQL + Auth + Storage)
- **Weather Service**: [Open-Meteo](https://open-meteo.com) (100% Free, NO API Key needed)
- **AI Intelligence**: [Google AI Studio Gemini Flash](https://aistudio.google.com/) (Free Tier) or Offline Rule-Based Fallback
- **Source Control**: GitHub

---

## 1. Create GitHub Repository
1. Open your terminal or go to [github.com/new](https://github.com/new).
2. Create a repository named `cropshield-ai-v2`.
3. Keep it public (or private).

```bash
cd "CROP AI"
git init -b main
git add .
git commit -m "feat: cropshield-ai v2 zero-cost farmer-first platform"
git remote add origin https://github.com/Azzu1930/cropshield-ai-v2.git
git push -u origin main
```

---

## 2. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in (free GitHub sign-in).
2. Click **New project**.
3. Set:
   - **Name**: `cropshield-db`
   - **Database Password**: Choose a strong password (save it).
   - **Region**: Choose the closest region (e.g. `South Asia (Mumbai)`).
4. Click **Create new project** (takes ~60 seconds to provision).

---

## 3. Create Database Tables
1. In your Supabase project dashboard, click on the **SQL Editor** tab in the left sidebar.
2. Click **New query**.
3. Copy the entire contents of [`supabase/schema.sql`](./supabase/schema.sql) and paste it into the editor.
4. Click **Run** (green button).
5. All 11 tables (`farms`, `fields`, `weather_records`, `water_records`, `soil_reports`, `images`, `assessments`, `recommendations`, `expert_reviews`, `reports`, `notifications`) and Row Level Security (RLS) policies will be created automatically.

---

## 4. Configure Auth
1. In Supabase, go to **Authentication** -> **Providers**.
2. **Email**: Ensure Email provider is enabled. You can toggle "Confirm email" OFF for frictionless demo access if desired.
3. **Phone (Optional)**: If you want SMS login later, you can configure Twilio or MessageBird, or use demo numbers.

---

## 5. Configure Storage
1. In Supabase, go to **Storage**.
2. Ensure two public buckets exist (these were created by `schema.sql`):
   - `crop-images` (Public bucket)
   - `soil-reports` (Public bucket)
3. If they are not visible, click **New bucket**, name it `crop-images`, and toggle **Public bucket** to ON. Repeat for `soil-reports`.

---

## 6. Add Environment Variables
In your Supabase project dashboard, go to **Project Settings** -> **API**.
Copy your credentials and prepare your environment variables:

```env
# AI Intelligence Provider ('rule-based' or 'gemini')
AI_PROVIDER=rule-based
GEMINI_API_KEY=your_free_google_ai_studio_key_if_available

# Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Default Location (Andhra Pradesh Paddy Delta)
DEFAULT_LATITUDE=16.5449
DEFAULT_LONGITUDE=81.5212
```

---

## 7. Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New...** -> **Project**.
3. Import your `cropshield-ai-v2` repository.
4. Framework Preset: **Next.js**.
5. Root Directory: `./` (or directory where `package.json` is located).

---

## 8. Deploy API (Vercel Serverless Functions)
Next.js App Router route handlers (`/api/weather`, `/api/geocode`, `/api/ai/analyze`, `/api/expert-review`) are automatically packaged and deployed by Vercel as zero-cost Serverless Edge/Node functions. No separate backend server or container needed!

---

## 9. Configure CORS
By hosting both frontend and `/api/*` routes within Next.js on Vercel, requests are same-origin by default. There are zero CORS complications.

---

## 10. Configure Production URLs
1. In Vercel, navigate to your project -> **Settings** -> **Environment Variables**.
2. Add the variables from Step 6:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AI_PROVIDER`
   - `GEMINI_API_KEY` (Optional)
   - `NEXT_PUBLIC_APP_URL` = `https://your-vercel-domain.vercel.app`
3. Click **Redeploy**.

---

## 11. Test Authentication
1. Open your deployed URL.
2. The app works instantly in demo/offline mode.
3. If using Supabase Auth, verify login and session persistence in browser cookies.

---

## 12. Test Database & RLS
1. Create a new farm in the UI.
2. Verify in the Supabase Table Editor that the new record is inserted into `public.farms`.
3. Verify that Farmer A cannot query records created by Farmer B due to the RLS policy:
   ```sql
   CREATE POLICY "Farmers can only view their own farms" ON public.farms FOR SELECT USING (auth.uid() = user_id);
   ```

---

## 13. Test Image Upload & Compression
1. Click **Upload Crop Photo**.
2. Select any high-resolution phone photo (e.g. 5 MB).
3. Verify that the client canvas optimizer compresses it to < 250 KB and strips metadata before sending.
4. Try uploading a human selfie to confirm that the validator catches it and prompts: *"Human or non-crop image detected. Please upload a clear photo of your crop leaf or plant."*

---

## 14. Test Weather (Open-Meteo)
1. Navigate to the **Weather** tab or view the Home screen weather card.
2. Verify live temperature, humidity, and rain chance are displayed from Open-Meteo without any manual inputs.
3. Check that repeated requests within 30 minutes return cached data (`isCached: true`) from `weather_records`.

---

## 15. Test AI Inference & Fallback
1. Run a crop check with Rice, Brown Spots, and High Humidity.
2. Verify diagnosis indicates fungal leaf spot / blast risk and provides 3-5 clear steps.
3. Unset `GEMINI_API_KEY` to verify that `RuleBasedAIService` produces a structured preliminary assessment without crashing.

---

## 16. Test Multilingual System
1. Tap the top language button: **🌐 తెలుగు**.
2. Verify that **ALL** buttons, cards, wizard steps, crop names, symptoms, results, and recommendations switch completely to Telugu.
3. Switch to **🌐 हिन्दी** and verify complete Hindi rendering.
4. Tap **🔊 Listen** to verify Web Speech Synthesis speaks the result in the active language.

---

## 17. Test Final Production URL
1. Test your live Vercel domain from a smartphone browser.
2. Verify responsive touch targets (minimum 48px touch cards).
3. Test offline resilience and reload.
