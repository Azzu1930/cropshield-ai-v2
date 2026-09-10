export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      farms: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          state: string;
          district: string;
          locality: string;
          latitude: number;
          longitude: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          state: string;
          district: string;
          locality: string;
          latitude: number;
          longitude: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          state?: string;
          district?: string;
          locality?: string;
          latitude?: number;
          longitude?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      fields: {
        Row: {
          id: string;
          farm_id: string;
          user_id: string;
          name: string;
          crop_name: string;
          area_acres: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          farm_id: string;
          user_id: string;
          name: string;
          crop_name: string;
          area_acres?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          farm_id?: string;
          user_id?: string;
          name?: string;
          crop_name?: string;
          area_acres?: number | null;
          created_at?: string;
        };
      };
      weather_records: {
        Row: {
          id: string;
          farm_id: string;
          user_id: string;
          latitude: number;
          longitude: number;
          temperature: number;
          humidity: number;
          rainfall: number;
          wind_speed: number;
          weather_condition: string;
          rain_probability: number;
          forecast_data: Json | null;
          fetched_at: string;
        };
        Insert: {
          id?: string;
          farm_id: string;
          user_id: string;
          latitude: number;
          longitude: number;
          temperature: number;
          humidity: number;
          rainfall?: number;
          wind_speed?: number;
          weather_condition: string;
          rain_probability?: number;
          forecast_data?: Json | null;
          fetched_at?: string;
        };
        Update: {
          id?: string;
          farm_id?: string;
          user_id?: string;
          latitude?: number;
          longitude?: number;
          temperature?: number;
          humidity?: number;
          rainfall?: number;
          wind_speed?: number;
          weather_condition?: string;
          rain_probability?: number;
          forecast_data?: Json | null;
          fetched_at?: string;
        };
      };
      assessments: {
        Row: {
          id: string;
          user_id: string;
          farm_id: string;
          field_id: string | null;
          image_id: string | null;
          image_url: string | null;
          crop_name: string;
          symptoms: string[];
          water_level: 'less' | 'normal' | 'more';
          has_soil_report: boolean;
          weather_snapshot: Json;
          possible_issue: string;
          issue_category: string;
          seriousness: 'LOW' | 'MEDIUM' | 'HIGH';
          confidence_level: 'LOW' | 'MEDIUM' | 'HIGH';
          confidence_score: number;
          explanation: string;
          why_reasons: string[];
          actions: string[];
          previous_comparison: Json | null;
          is_preliminary: boolean;
          ai_provider: string;
          language: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          farm_id: string;
          field_id?: string | null;
          image_id?: string | null;
          image_url?: string | null;
          crop_name: string;
          symptoms?: string[];
          water_level?: 'less' | 'normal' | 'more';
          has_soil_report?: boolean;
          weather_snapshot?: Json;
          possible_issue: string;
          issue_category?: string;
          seriousness: 'LOW' | 'MEDIUM' | 'HIGH';
          confidence_level: 'LOW' | 'MEDIUM' | 'HIGH';
          confidence_score?: number;
          explanation: string;
          why_reasons?: string[];
          actions?: string[];
          previous_comparison?: Json | null;
          is_preliminary?: boolean;
          ai_provider?: string;
          language?: string;
          created_at?: string;
        };
      };
      expert_reviews: {
        Row: {
          id: string;
          assessment_id: string;
          user_id: string;
          status: 'pending' | 'in_review' | 'completed';
          farmer_notes: string | null;
          expert_name: string | null;
          expert_notes: string | null;
          expert_recommendations: Json | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          user_id: string;
          status?: 'pending' | 'in_review' | 'completed';
          farmer_notes?: string | null;
          expert_name?: string | null;
          expert_notes?: string | null;
          expert_recommendations?: Json | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

export interface FarmLocation {
  state: string;
  district: string;
  locality: string;
  latitude: number;
  longitude: number;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  weatherCondition: string;
  rainProbability: number;
  warning?: string | null;
  forecast: {
    day: string;
    tempMax: number;
    tempMin: number;
    rainProb: number;
    condition: string;
  }[];
  fetchedAt: string;
  isCached?: boolean;
}
