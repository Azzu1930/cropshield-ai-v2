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
        affectedArea,
        durationDays,
        previousCrop,
      } = params;

      const detectedCrop = params.imageValidation?.detectedCrop;
      const effectiveCrop = detectedCrop || cropName;
      const effectiveSymptoms = Array.from(
        new Set([...symptoms, ...(params.imageValidation?.detectedSymptoms || [])])
      );

      const langName = language === 'te' ? 'Telugu' : language === 'hi' ? 'Hindi' : 'English';

      const prompt = `You are CropShield AI, an elite agronomist and crop disease pathologist specializing in Indian agriculture (ICAR/KVK standards).
Analyze the multi-evidence agricultural data and the provided crop photo (which can be a leaf, plant, branch, fruit, pod, seed, grain, or tuber).

TARGET LANGUAGE: ${langName}
CRITICAL ACCURACY & CROP VALIDATION RULES:
0. STRICT CROP IMAGE GATEKEEPER:
   First, inspect the uploaded photo. Check whether it contains an actual, authentic agricultural crop, field plant, leaf, flower, fruit, pod, seed, grain, tuber, root, or farm vegetation.
   - Note: Groundnut pods/peanuts in shells, cotton bolls, potatoes, cereals, and dry legume pods are valid agricultural produce!
   If the image is a person, human selfie, face, anime, cartoon, comic, fictional character, drawing, sketch, illustration, graphic, artwork, meme, vehicle, indoor room, furniture, pet, animal, computer or mobile screen, document, graph paper, or ANY random non-agricultural object or image:
   YOU MUST RETURN:
   {
     "isCropDetected": false,
     "possibleIssue": "CROP_NOT_DETECTED",
     "issueCategory": "unknown",
     "seriousness": "LOW",
     "confidenceLevel": "LOW",
     "confidenceScore": 0.0,
     "explanation": "No agricultural crop or plant was detected in this photo. Please upload a clear photo of your crop leaf or plant.",
     "whyReasons": ["The uploaded image does not contain an agricultural crop, leaf, or farm plant."],
     "actions": []
   }
   Do NOT provide any crop diagnosis, diseases, or remedies for non-crop images. Under NO circumstance should you diagnose an anime, cartoon, drawing, person, or non-plant image as a crop!

1. Only if the photo is an actual crop, plant, leaf, fruit, or pod, proceed with detailed diagnosis:
   Examine the photo carefully (look for circular lesions, target-like rings, pustules, chlorosis, vein clearing, curling, insect bites, or dark fungal rot spots on pods or fruits).
   Note: Visual analysis suggests this crop is: "${effectiveCrop}". If the image depicts a different crop from "${cropName}", diagnose the actual crop shown in the image!
2. The diagnosis ("possibleIssue") and 4 action steps MUST be strictly specific to the crop: "${effectiveCrop}".
   - For Tomato: Distinguish between Anthracnose & Fruit Rot (Colletotrichum sunken circular dark rot spots on fruits), Early Blight (Alternaria on leaves), Late Blight, Tomato Leaf Curl Virus, Fruit Borer, or Blossom End Rot. If fruit has dark rot spots, prescribe Azoxystrobin (1 ml/L) or Difenoconazole (1 ml/L), Mancozeb (2.5 g/L), and fruit burial hygiene.
   - For Groundnut / Peanut: Distinguish between Pod Rot / Black Pod Spots (Rhizoctonia/Aspergillus/Pythium), Tikka Leaf Spot (Cercospora with yellow halo), Collar Rot (Sclerotium rolfsii), Rust (Puccinia arachidis), or Sucking pests. If pods have dark spots/lesions, diagnose Groundnut Pod Rot and prescribe Gypsum (200-250 kg/acre), Trichoderma viride enriched FYM, and Tebuconazole (1.5 ml/L) or Carbendazim+Mancozeb.
   - For Rice: Distinguish between Blast, Brown Spot, BLB, Stem Borer, or BPH.
   - For Chilli: Distinguish between Thrips/Mite Leaf Curl, Anthracnose Dieback & Fruit Rot, or Powdery Mildew.
   - For Cotton: Distinguish between Pink Bollworm, Leaf Reddening, or Angular Leaf Spot.
   - For Maize: Distinguish between Fall Armyworm, Turcicum Blight, or Nitrogen deficiency.
3. INCORPORATE FIELD IMPACT & ROTATION EVIDENCE:
   - Area affected: ${affectedArea || 'Localized (< 10%)'} -> If > 50%, advise urgent whole-field emergency treatment. If < 10%, recommend targeted spot application.
   - Duration of issue: ${durationDays || 'Recent (1 - 3 days)'} -> If > 14 days, prescribe systemic curative fungicides. If 1-3 days, prescribe contact/biological preventive measures.
   - Previous crop on this land: ${previousCrop || 'None'} -> If previous crop was Groundnut or Pulses, warn about soil-borne inoculum carryover and advise crop rotation.
4. NEVER return generic identical advice! Provide specific chemical/organic names with exact dosages (e.g. Gypsum @ 200kg/acre, Neem oil 5ml/L, Mancozeb 2.5g/L, Tebuconazole 1.5ml/L).
5. All text fields MUST be ENTIRELY in ${langName} using respectful, empathetic words that rural farmers easily grasp.

EVIDENCE COLLECTED:
- Crop: ${effectiveCrop}
- Observed symptoms: ${effectiveSymptoms.join(', ') || 'General check'}
- Area of field affected: ${affectedArea || 'Unspecified'}
- Duration of symptoms: ${durationDays || 'Unspecified'}
- Previous crop grown: ${previousCrop || 'Unspecified'}
- Irrigation / Water given: ${waterLevel} ${waterAmount ? `(${waterAmount})` : ''}
- Weather context: Temperature ${weatherData?.temperature ?? 30}°C, Humidity ${weatherData?.humidity ?? 70}%, Rain Probability ${weatherData?.rainProbability ?? 20}%, Condition: ${weatherData?.weatherCondition ?? 'Clear'}
- Farm Location: ${farmLocation?.locality || ''}, ${farmLocation?.district || ''}, ${farmLocation?.state || ''}
${hasSoilReport ? `- Soil Data: pH ${soilData?.ph || 'N/A'}` : ''}
${previousAssessment ? `- Previous assessment: ${previousAssessment.possibleIssue} (${previousAssessment.seriousness}) on ${previousAssessment.date}` : ''}

Respond ONLY with a valid JSON object matching this schema:
{
  "isCropDetected": true,
  "possibleIssue": "Crop-specific diagnostic headline in ${langName}",
  "issueCategory": "fungal" | "bacterial" | "viral" | "pest" | "nutrient" | "water_stress" | "healthy" | "unknown",
  "seriousness": "LOW" | "MEDIUM" | "HIGH",
  "confidenceLevel": "LOW" | "MEDIUM" | "HIGH",
  "confidenceScore": 0.88,
  "explanation": "2 simple sentences in ${langName} explaining what is observed in this ${cropName} photo, field spread (${affectedArea || ''}), and weather",
  "whyReasons": [
    "Visual evidence from photo for ${cropName} in ${langName}",
    "Field impact and duration correlation in ${langName}",
    "Biological reason and crop rotation risk in ${langName}"
  ],
  "actions": [
    "Specific immediate curative/preventive step 1 with dosage in ${langName}",
    "Specific chemical/organic remedy with exact dosage in ${langName}",
    "Field hygiene, gypsum/soil treatment, or moisture management step in ${langName}",
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
        isCropDetected: parsed.isCropDetected !== false && parsed.possibleIssue !== 'CROP_NOT_DETECTED',
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
