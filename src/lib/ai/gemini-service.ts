import type { AIService, CropAnalysisParams, CropAnalysisResult, SoilReportParams, SoilAnalysisResult } from './ai-service.interface';
import { RuleBasedAIService } from './rule-based-service';
import type { SupportedLanguage } from '../i18n/types';

export class GeminiAIService implements AIService {
  private fallbackService = new RuleBasedAIService();
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
  }

  async validateImage(imageDataUrl: string): Promise<{ isValid: boolean; reason?: string; message: string }> {
    return this.fallbackService.validateImage(imageDataUrl);
  }

  async analyzeCrop(params: CropAnalysisParams): Promise<CropAnalysisResult> {
    if (!this.apiKey) {
      console.warn('[GeminiAIService] No GEMINI_API_KEY provided; falling back to RuleBasedAIService.');
      return this.fallbackService.analyzeCrop(params);
    }

    try {
      const {
        cropName,
        symptoms = [],
        waterLevel,
        waterAmount,
        hasSoilReport,
        soilData,
        weatherData,
        farmLocation,
        imageDataUrl,
        previousAssessment,
        language = 'en',
      } = params;

      const langName = language === 'te' ? 'Telugu' : language === 'hi' ? 'Hindi' : 'English';

      const prompt = `You are CropShield AI, an elite agronomist and crop disease pathologist specializing in Indian agriculture (ICAR/KVK standards).
Analyze the multi-evidence agricultural data and the provided crop leaf image.

TARGET LANGUAGE: ${langName}
CRITICAL ACCURACY & DIVERSITY RULES:
1. Examine the uploaded photo carefully (look for circular lesions, target-like concentric rings, pustules, chlorosis, vein clearing, curling, insect bites, or healthy turgor).
2. The diagnosis ("possibleIssue") and 4 action steps MUST be strictly specific to the crop: "${cropName}".
   - For Tomato: Distinguish between Early Blight (Alternaria), Late Blight, Tomato Leaf Curl Virus, Fruit Borer, or Blossom End Rot.
   - For Rice: Distinguish between Blast, Brown Spot, BLB, Stem Borer, or BPH.
   - For Chilli: Distinguish between Thrips/Mite Leaf Curl, Anthracnose Dieback, or Powdery Mildew.
   - For Cotton: Distinguish between Pink Bollworm, Leaf Reddening, or Angular Leaf Spot.
   - For Maize: Distinguish between Fall Armyworm, Turcicum Blight, or Nitrogen deficiency.
3. NEVER return generic identical advice! Provide specific remedy prescriptions (e.g. Neem oil 5ml/L, Mancozeb 2.5g/L, blue traps for thrips, AWD drainage for rice).
4. All text fields MUST be ENTIRELY in ${langName} using respectful, empathetic words that rural farmers easily grasp.

EVIDENCE COLLECTED:
- Crop: ${cropName}
- Observed symptoms: ${symptoms.join(', ') || 'General check'}
- Irrigation / Water given: ${waterLevel} ${waterAmount ? `(${waterAmount})` : ''}
- Weather context: Temperature ${weatherData?.temperature ?? 30}°C, Humidity ${weatherData?.humidity ?? 70}%, Rain Probability ${weatherData?.rainProbability ?? 20}%, Condition: ${weatherData?.weatherCondition ?? 'Clear'}
- Farm Location: ${farmLocation?.locality || ''}, ${farmLocation?.district || ''}, ${farmLocation?.state || ''}
${hasSoilReport ? `- Soil Data: pH ${soilData?.ph || 'N/A'}` : ''}
${previousAssessment ? `- Previous assessment: ${previousAssessment.possibleIssue} (${previousAssessment.seriousness}) on ${previousAssessment.date}` : ''}

Respond ONLY with a valid JSON object matching this schema:
{
  "possibleIssue": "Crop-specific diagnostic headline in ${langName}",
  "issueCategory": "fungal" | "bacterial" | "viral" | "pest" | "nutrient" | "water_stress" | "healthy" | "unknown",
  "seriousness": "LOW" | "MEDIUM" | "HIGH",
  "confidenceLevel": "LOW" | "MEDIUM" | "HIGH",
  "confidenceScore": 0.88,
  "explanation": "2 simple sentences in ${langName} explaining what is observed in this ${cropName} photo and weather",
  "whyReasons": [
    "Visual evidence from photo for ${cropName} in ${langName}",
    "Weather/humidity/irrigation correlation in ${langName}",
    "Biological reason in ${langName}"
  ],
  "actions": [
    "Specific immediate curative/preventive step 1 in ${langName}",
    "Specific chemical/organic remedy with dosage in ${langName}",
    "Field hygiene / moisture management step in ${langName}",
    "Follow-up instruction in ${langName}"
  ],
  "previousComparison": {
    "status": "better" | "same" | "needs_attention",
    "explanation": "Short sentence in ${langName} comparing with previous check"
  }
}`;

      const contents: any[] = [];
      const parts: any[] = [{ text: prompt }];

      if (imageDataUrl && imageDataUrl.startsWith('data:image/')) {
        const matches = imageDataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          parts.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2],
            },
          });
        }
      }

      contents.push({ role: 'user', parts });

      // Call Gemini 1.5 Flash (free tier on Google AI Studio)
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        console.warn(`[GeminiAIService] API error: ${response.status}. Falling back to RuleBasedAIService.`);
        return this.fallbackService.analyzeCrop(params);
      }

      const resultData = await response.json();
      const rawText = resultData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        return this.fallbackService.analyzeCrop(params);
      }

      const parsed = JSON.parse(rawText);

      return {
        possibleIssue: parsed.possibleIssue || `${cropName} Check`,
        issueCategory: parsed.issueCategory || 'general',
        seriousness: parsed.seriousness || 'LOW',
        confidenceLevel: parsed.confidenceLevel || 'HIGH',
        confidenceScore: parsed.confidenceScore || 0.85,
        explanation: parsed.explanation || '',
        whyReasons: parsed.whyReasons || [],
        actions: parsed.actions || [],
        previousComparison: parsed.previousComparison,
        isPreliminary: false,
        aiProvider: 'gemini-1.5-flash',
        language,
      };
    } catch (err) {
      console.warn('[GeminiAIService] Exception during inference. Falling back to RuleBasedAIService.', err);
      return this.fallbackService.analyzeCrop(params);
    }
  }

  async analyzeSoilReport(params: SoilReportParams): Promise<SoilAnalysisResult> {
    return this.fallbackService.analyzeSoilReport(params);
  }

  async generateRecommendations(issue: string, cropName: string, weather: any, language: SupportedLanguage): Promise<string[]> {
    return this.fallbackService.generateRecommendations(issue, cropName, weather, language);
  }

  async translateContent(text: string, targetLang: SupportedLanguage): Promise<string> {
    return this.fallbackService.translateContent(text, targetLang);
  }
}
