-- ============================================================================
-- CROPSHIELD AI - SUPABASE POSTGRESQL SCHEMA WITH ROW LEVEL SECURITY (RLS)
-- Multi-tenant, Farmer-First, Zero-Cost Agricultural Decision Platform
-- Idempotent script: Safe to run multiple times without errors
-- ============================================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. FARMS TABLE
-- Stores farm details, location, coordinates (auto-detected via GPS or search)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    locality TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_farms_user_id ON public.farms(user_id);
CREATE INDEX IF NOT EXISTS idx_farms_coordinates ON public.farms(latitude, longitude);

ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Farmers can only view their own farms" ON public.farms;
CREATE POLICY "Farmers can only view their own farms"
    ON public.farms FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can insert their own farms" ON public.farms;
CREATE POLICY "Farmers can insert their own farms"
    ON public.farms FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can update their own farms" ON public.farms;
CREATE POLICY "Farmers can update their own farms"
    ON public.farms FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can delete their own farms" ON public.farms;
CREATE POLICY "Farmers can delete their own farms"
    ON public.farms FOR DELETE
    USING (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 2. FIELDS TABLE
-- Specific plots/fields within a farm for crop rotations & history tracking
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    crop_name TEXT NOT NULL,
    area_acres NUMERIC(5, 2) DEFAULT 1.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_fields_farm_id ON public.fields(farm_id);
CREATE INDEX IF NOT EXISTS idx_fields_user_id ON public.fields(user_id);

ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Farmers can only view their own fields" ON public.fields;
CREATE POLICY "Farmers can only view their own fields"
    ON public.fields FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can insert their own fields" ON public.fields;
CREATE POLICY "Farmers can insert their own fields"
    ON public.fields FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can update their own fields" ON public.fields;
CREATE POLICY "Farmers can update their own fields"
    ON public.fields FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can delete their own fields" ON public.fields;
CREATE POLICY "Farmers can delete their own fields"
    ON public.fields FOR DELETE
    USING (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 3. WEATHER_RECORDS TABLE
-- Cache for Open-Meteo weather snapshots to prevent excessive API calls
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.weather_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    temperature NUMERIC(5, 2) NOT NULL,
    humidity NUMERIC(5, 2) NOT NULL,
    rainfall NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    wind_speed NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    weather_condition TEXT NOT NULL,
    rain_probability NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    forecast_data JSONB DEFAULT '{}'::jsonb,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_weather_farm_id ON public.weather_records(farm_id);
CREATE INDEX IF NOT EXISTS idx_weather_fetched_at ON public.weather_records(fetched_at DESC);

ALTER TABLE public.weather_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Farmers can view their own weather records" ON public.weather_records;
CREATE POLICY "Farmers can view their own weather records"
    ON public.weather_records FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can insert weather records" ON public.weather_records;
CREATE POLICY "Farmers can insert weather records"
    ON public.weather_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can update their own weather records" ON public.weather_records;
CREATE POLICY "Farmers can update their own weather records"
    ON public.weather_records FOR UPDATE
    USING (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 4. WATER_RECORDS TABLE
-- Simple water observations (less, normal, more, or exact quantity)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.water_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    field_id UUID REFERENCES public.fields(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    water_level TEXT NOT NULL CHECK (water_level IN ('less', 'normal', 'more')),
    quantity_amount TEXT,
    notes TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_water_farm_id ON public.water_records(farm_id);
CREATE INDEX IF NOT EXISTS idx_water_user_id ON public.water_records(user_id);

ALTER TABLE public.water_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Farmers can view their own water records" ON public.water_records;
CREATE POLICY "Farmers can view their own water records"
    ON public.water_records FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can insert their own water records" ON public.water_records;
CREATE POLICY "Farmers can insert their own water records"
    ON public.water_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 5. SOIL_REPORTS TABLE
-- Optional soil test parameters and uploaded reports
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.soil_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_url TEXT,
    ph NUMERIC(4, 2),
    nitrogen NUMERIC(6, 2),
    phosphorus NUMERIC(6, 2),
    potassium NUMERIC(6, 2),
    organic_matter NUMERIC(4, 2),
    summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_soil_farm_id ON public.soil_reports(farm_id);
CREATE INDEX IF NOT EXISTS idx_soil_user_id ON public.soil_reports(user_id);

ALTER TABLE public.soil_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Farmers can view their own soil reports" ON public.soil_reports;
CREATE POLICY "Farmers can view their own soil reports"
    ON public.soil_reports FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can insert their own soil reports" ON public.soil_reports;
CREATE POLICY "Farmers can insert their own soil reports"
    ON public.soil_reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 6. IMAGES TABLE
-- Metadata for compressed and validated crop photos
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    file_size INTEGER,
    mime_type TEXT DEFAULT 'image/jpeg',
    is_valid_crop BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_images_user_id ON public.images(user_id);

ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Farmers can view their own uploaded images" ON public.images;
CREATE POLICY "Farmers can view their own uploaded images"
    ON public.images FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can insert images" ON public.images;
CREATE POLICY "Farmers can insert images"
    ON public.images FOR INSERT
    WITH CHECK (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 7. ASSESSMENTS TABLE
-- The central crop-health diagnosis with weather, water, soil & comparison evidence
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    field_id UUID REFERENCES public.fields(id) ON DELETE SET NULL,
    image_id UUID REFERENCES public.images(id) ON DELETE SET NULL,
    image_url TEXT,
    crop_name TEXT NOT NULL,
    symptoms JSONB NOT NULL DEFAULT '[]'::jsonb,
    water_level TEXT NOT NULL DEFAULT 'normal',
    has_soil_report BOOLEAN NOT NULL DEFAULT false,
    weather_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    possible_issue TEXT NOT NULL,
    issue_category TEXT NOT NULL DEFAULT 'general',
    seriousness TEXT NOT NULL CHECK (seriousness IN ('LOW', 'MEDIUM', 'HIGH')),
    confidence_level TEXT NOT NULL CHECK (confidence_level IN ('LOW', 'MEDIUM', 'HIGH')),
    confidence_score NUMERIC(4, 2) DEFAULT 0.85,
    explanation TEXT NOT NULL,
    why_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
    actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    previous_comparison JSONB DEFAULT NULL,
    is_preliminary BOOLEAN NOT NULL DEFAULT false,
    ai_provider TEXT NOT NULL DEFAULT 'rule-based',
    language TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_farm_id ON public.assessments(farm_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON public.assessments(created_at DESC);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Farmers can view their own assessments" ON public.assessments;
CREATE POLICY "Farmers can view their own assessments"
    ON public.assessments FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can insert their own assessments" ON public.assessments;
CREATE POLICY "Farmers can insert their own assessments"
    ON public.assessments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can delete their own assessments" ON public.assessments;
CREATE POLICY "Farmers can delete their own assessments"
    ON public.assessments FOR DELETE
    USING (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 8. RECOMMENDATIONS TABLE
-- 3-5 prioritized farmer action steps associated with each assessment
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_text TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 1,
    category TEXT DEFAULT 'field_care',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_recs_assessment_id ON public.recommendations(assessment_id);
CREATE INDEX IF NOT EXISTS idx_recs_user_id ON public.recommendations(user_id);

ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Farmers can view their own recommendations" ON public.recommendations;
CREATE POLICY "Farmers can view their own recommendations"
    ON public.recommendations FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can insert their own recommendations" ON public.recommendations;
CREATE POLICY "Farmers can insert their own recommendations"
    ON public.recommendations FOR INSERT
    WITH CHECK (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 9. EXPERT_REVIEWS TABLE
-- Requests submitted by farmers to Krishi Vigyan Kendra / agricultural officers
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expert_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'completed')),
    farmer_notes TEXT,
    expert_name TEXT,
    expert_notes TEXT,
    expert_recommendations JSONB DEFAULT '[]'::jsonb,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_expert_user_id ON public.expert_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_expert_assessment_id ON public.expert_reviews(assessment_id);
CREATE INDEX IF NOT EXISTS idx_expert_status ON public.expert_reviews(status);

ALTER TABLE public.expert_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Farmers can view their own expert review requests" ON public.expert_reviews;
CREATE POLICY "Farmers can view their own expert review requests"
    ON public.expert_reviews FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can request an expert review" ON public.expert_reviews;
CREATE POLICY "Farmers can request an expert review"
    ON public.expert_reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 10. REPORTS TABLE
-- Generated farmer-friendly summaries and download links
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    download_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Farmers can view their own reports" ON public.reports;
CREATE POLICY "Farmers can view their own reports"
    ON public.reports FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can insert their reports" ON public.reports;
CREATE POLICY "Farmers can insert their reports"
    ON public.reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 11. NOTIFICATIONS TABLE
-- Real-time agricultural alerts (weather warnings, check-in reminders)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Farmers can view their own notifications" ON public.notifications;
CREATE POLICY "Farmers can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can update their notifications" ON public.notifications;
CREATE POLICY "Farmers can update their notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);


-- ============================================================================
-- STORAGE BUCKETS CONFIGURATION (Supabase Storage)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('crop-images', 'crop-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('soil-reports', 'soil-reports', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS:
DROP POLICY IF EXISTS "Public read for crop images" ON storage.objects;
CREATE POLICY "Public read for crop images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'crop-images');

DROP POLICY IF EXISTS "Authenticated users can upload crop images" ON storage.objects;
CREATE POLICY "Authenticated users can upload crop images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'crop-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public read for soil reports" ON storage.objects;
CREATE POLICY "Public read for soil reports"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'soil-reports');

DROP POLICY IF EXISTS "Authenticated users can upload soil reports" ON storage.objects;
CREATE POLICY "Authenticated users can upload soil reports"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'soil-reports' AND auth.role() = 'authenticated');
