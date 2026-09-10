import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/ai';
import { getServerSupabase } from '@/lib/supabase/server';
import type { CropAnalysisParams } from '@/lib/ai/ai-service.interface';
import type { SupportedLanguage } from '@/lib/i18n/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cropName,
      symptoms = [],
      waterLevel = 'normal',
      waterAmount = '',
      hasSoilReport = false,
      soilData,
      weatherData,
      farmLocation,
      imageDataUrl,
      previousAssessment,
      language = 'en',
      farmId,
      userId,
      affectedArea,
      durationDays,
      previousCrop,
    } = body;

    if (!cropName) {
      return NextResponse.json({ error: 'Crop name is required.' }, { status: 400 });
    }

    // Pre-AI Image check: If client-side or base64 flag indicates human/selfie or invalid photo
    if (
      body.isInvalidHumanPhoto ||
      (body.imageValidation && body.imageValidation.isValid === false)
    ) {
      return NextResponse.json(
        {
          error: 'crop_not_detected',
          message:
            language === 'te'
              ? 'పంట గుర్తించబడలేదు. మనిషి, చిత్రం లేదా ఇతర వస్తువుల ఫోటోలు అంగీకరించబడవు. దయచేసి పంట ఆకు లేదా చెట్టు ఫోటో తీయండి.'
              : language === 'hi'
              ? 'फसल नहीं पहचानी गई। इंसान, चित्र या अन्य वस्तु की फोटो अमान्य है। कृपया फसल के पत्ते या पौधे की साफ फोटो लें।'
              : 'Crop not detected. Person, drawing, or non-crop image detected. Please upload a clear photo of your crop leaf or plant.',
        },
        { status: 400 }
      );
    }

    const aiService = getAIService();

    const analysisParams: CropAnalysisParams = {
      cropName,
      symptoms,
      waterLevel,
      waterAmount,
      hasSoilReport,
      soilData,
      weatherData,
      farmLocation,
      imageDataUrl,
      imageValidation: body.imageValidation,
      previousAssessment,
      language: (language as SupportedLanguage) || 'en',
      affectedArea,
      durationDays,
      previousCrop,
    };

    // Perform analysis through AIService (Gemini or RuleBased fallback)
    const result = await aiService.analyzeCrop(analysisParams);

    // Strict Gatekeeper: If AI determined this is not a crop/plant, reject with 400 Bad Request
    if (result.isCropDetected === false || result.possibleIssue === 'CROP_NOT_DETECTED') {
      return NextResponse.json(
        {
          error: 'crop_not_detected',
          message:
            language === 'te'
              ? 'పంట గుర్తించబడలేదు. దయచేసి మీ పంట ఆకు లేదా పైరు ఫోటో తీయండి. ఇతర ఫోటోలు అంగీకరించబడవు.'
              : language === 'hi'
              ? 'फसल नहीं पहचानी गई। कृपया अपनी फसल के पत्ते या पौधे की साफ फोटो लें।'
              : 'Crop not detected. The uploaded photo does not appear to be an agricultural crop or plant. Please upload a clear photo of your crop leaf or plant.',
        },
        { status: 400 }
      );
    }

    // Save to Supabase if configured and authenticated
    const supabase = getServerSupabase();
    let savedId: string | null = null;

    if (supabase && farmId && farmId !== 'default' && !farmId.startsWith('farm-')) {
      try {
        const { data: inserted, error: insertErr } = await supabase
          .from('assessments')
          .insert({
            farm_id: farmId,
            ...(userId && !userId.startsWith('farmer-') ? { user_id: userId } : {}),
            crop_name: cropName,
            symptoms: symptoms as any,
            water_level: waterLevel,
            has_soil_report: hasSoilReport,
            weather_snapshot: weatherData || {},
            possible_issue: result.possibleIssue,
            issue_category: result.issueCategory,
            seriousness: result.seriousness,
            confidence_level: result.confidenceLevel,
            confidence_score: result.confidenceScore,
            explanation: result.explanation,
            why_reasons: result.whyReasons as any,
            actions: result.actions as any,
            previous_comparison: result.previousComparison as any,
            is_preliminary: result.isPreliminary,
            ai_provider: result.aiProvider,
            language: result.language,
          } as any)
          .select('id')
          .single();

        if (!insertErr && inserted) {
          savedId = (inserted as any)?.id || null;

          // Also insert recommendations
          if (result.actions && result.actions.length > 0) {
            const recInserts = result.actions.map((act: string, idx: number) => ({
              assessment_id: savedId,
              action_text: act,
              priority: idx + 1,
            }));
            await supabase.from('recommendations').insert(recInserts as any);
          }
        }
      } catch (dbErr) {
        console.warn('Could not persist assessment to Supabase:', dbErr);
      }
    }

    return NextResponse.json({
      id: savedId || `eval-${Date.now()}`,
      ...result,
      createdAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('AI analyze route error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze crop.',
        message: 'Analysis service encountered an unexpected error.',
      },
      { status: 500 }
    );
  }
}
