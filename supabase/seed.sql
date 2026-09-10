-- ============================================================================
-- CROPSHIELD AI - SEED DATA FOR DEMO & TESTING
-- ============================================================================

-- Note: In production Supabase, UUIDs will match actual auth.users.id
-- This seed provides initial reference data for demo setups.

-- Demo Farms
-- Farm 1: Bhimavaram, West Godavari, Andhra Pradesh (Paddy Delta)
-- Farm 2: Warangal, Telangana (Chilli & Cotton Belt)
INSERT INTO public.farms (id, user_id, name, state, district, locality, latitude, longitude)
VALUES 
    ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Sri Lakshmi Paddy Farm', 'Andhra Pradesh', 'West Godavari', 'Bhimavaram', 16.5449, 81.5212),
    ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Kishan Cotton & Chilli Land', 'Telangana', 'Warangal', 'Narsampet', 17.9250, 79.8970)
ON CONFLICT (id) DO NOTHING;

-- Demo Fields
INSERT INTO public.fields (id, farm_id, user_id, name, crop_name, area_acres)
VALUES
    ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'North Paddy Plot 1', 'Rice', 2.5),
    ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'South Red Soil Plot', 'Chilli', 1.8)
ON CONFLICT (id) DO NOTHING;

-- Demo Weather Cache for Bhimavaram Farm
INSERT INTO public.weather_records (farm_id, user_id, latitude, longitude, temperature, humidity, rainfall, wind_speed, weather_condition, rain_probability, forecast_data, fetched_at)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    16.5449,
    81.5212,
    31.5,
    82.0,
    1.2,
    14.5,
    'Rain likely today',
    75.0,
    '{"forecast": "Humid conditions with afternoon showers. Fungal risk elevated."}'::jsonb,
    NOW()
);
