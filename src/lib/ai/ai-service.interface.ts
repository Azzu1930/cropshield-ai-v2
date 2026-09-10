import type { SupportedLanguage } from '../i18n/types';

export interface CropAnalysisParams {
  cropName: string;
  symptoms: string[];
  waterLevel: 'less' | 'normal' | 'more';
  waterAmount?: string;
  hasSoilReport: boolean;
  soilData?: {
    ph?: number;
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
  };
  weatherData?: {
    temperature: number;
    humidity: number;
    rainfall: number;
    windSpeed: number;
    weatherCondition: string;
    rainProbability: number;
  };
  farmLocation?: {
    state: string;
    district: string;
    locality: string;
  };
  imageDataUrl?: string;
  previousAssessment?: {
    possibleIssue: string;
    seriousness: 'LOW' | 'MEDIUM' | 'HIGH';
    date: string;
  };
  language: SupportedLanguage;
}

export interface CropAnalysisResult {
  possibleIssue: string;
  issueCategory: 'fungal' | 'bacterial' | 'viral' | 'pest' | 'nutrient' | 'water_stress' | 'healthy' | 'general' | 'unknown';
  seriousness: 'LOW' | 'MEDIUM' | 'HIGH';
  confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  confidenceScore: number;
  explanation: string;
  whyReasons: string[];
  actions: string[];
  previousComparison?: {
    status: 'better' | 'same' | 'needs_attention';
    explanation: string;
  };
  isPreliminary: boolean;
  aiProvider: string;
  language: SupportedLanguage;
}

export interface SoilReportParams {
  ph?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  cropName: string;
  language: SupportedLanguage;
}

export interface SoilAnalysisResult {
  fertilityStatus: string;
  recommendations: string[];
  phAssessment: string;
}

export interface AIService {
  analyzeCrop(params: CropAnalysisParams): Promise<CropAnalysisResult>;
  validateImage(imageDataUrl: string): Promise<{ isValid: boolean; reason?: string; message: string }>;
  analyzeSoilReport(params: SoilReportParams): Promise<SoilAnalysisResult>;
  generateRecommendations(issue: string, cropName: string, weather: any, language: SupportedLanguage): Promise<string[]>;
  translateContent(text: string, targetLang: SupportedLanguage): Promise<string>;
}
