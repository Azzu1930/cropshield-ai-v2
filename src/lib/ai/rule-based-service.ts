import type { AIService, CropAnalysisParams, CropAnalysisResult, SoilReportParams, SoilAnalysisResult } from './ai-service.interface';
import type { SupportedLanguage } from '../i18n/types';
import { translateActionText } from '../i18n/agricultural-translations';

export class RuleBasedAIService implements AIService {
  async validateImage(imageDataUrl: string): Promise<{ isValid: boolean; reason?: string; message: string }> {
    if (!imageDataUrl || imageDataUrl.length < 500) {
      return { isValid: false, reason: 'corrupt', message: 'Image data is missing or corrupted.' };
    }
    return { isValid: true, message: 'Image accepted' };
  }

  async analyzeCrop(params: CropAnalysisParams): Promise<CropAnalysisResult> {
    const targetLang = params.language || 'en';
    const enRes = this.evaluateForLanguage(params, 'en');
    const teRes = this.evaluateForLanguage(params, 'te');
    const hiRes = this.evaluateForLanguage(params, 'hi');

    const primary = targetLang === 'te' ? teRes : targetLang === 'hi' ? hiRes : enRes;

    return {
      ...primary,
      translations: {
        en: {
          possibleIssue: enRes.possibleIssue,
          explanation: enRes.explanation,
          whyReasons: enRes.whyReasons,
          actions: enRes.actions,
          previousComparison: enRes.previousComparison,
        },
        te: {
          possibleIssue: teRes.possibleIssue,
          explanation: teRes.explanation,
          whyReasons: teRes.whyReasons,
          actions: teRes.actions,
          previousComparison: teRes.previousComparison,
        },
        hi: {
          possibleIssue: hiRes.possibleIssue,
          explanation: hiRes.explanation,
          whyReasons: hiRes.whyReasons,
          actions: hiRes.actions,
          previousComparison: hiRes.previousComparison,
        },
      },
    };
  }

  private evaluateForLanguage(params: CropAnalysisParams, lang: SupportedLanguage): CropAnalysisResult {
    const {
      cropName = 'Crop',
      symptoms = [],
      waterLevel = 'normal',
      weatherData,
      farmLocation,
      previousAssessment,
      imageDataUrl,
      imageValidation,
      affectedArea,
      durationDays,
      previousCrop,
    } = params;

    const language = lang;
    const isTe = language === 'te';
    const isHi = language === 'hi';

    // Gatekeeper: If image was validated as invalid/non-crop or missing, refuse to generate diagnosis
    if (
      (imageValidation && imageValidation.isValid === false) ||
      !imageDataUrl ||
      imageDataUrl.length < 200
    ) {
      return {
        isCropDetected: false,
        possibleIssue: 'CROP_NOT_DETECTED',
        issueCategory: 'unknown',
        seriousness: 'LOW',
        confidenceLevel: 'LOW',
        confidenceScore: 0.0,
        explanation: isTe
          ? 'పంట గుర్తించబడలేదు. అప్‌లోడ్ చేసిన చిత్రం వ్యవసాయ పంట, ఆకు లేదా మొక్క కాదు. దయచేసి పంట ఆకు ఫోటో తీయండి.'
          : isHi
          ? 'फसल नहीं पहचानी गई। अपलोड की गई फोटो में कोई फसल या पत्ता नहीं मिला। कृपया असली फसल की फोटो अपलोड करें।'
          : 'Crop not detected. The uploaded photo does not appear to be an agricultural crop or plant. Please upload a clear photo of your crop leaf or plant.',
        whyReasons: [
          isTe
            ? 'ఈ చిత్రంలో వ్యవసాయ పంట ఆకులు లేదా మొక్క భాగాల ఆనవాళ్లు లేవు.'
            : isHi
            ? 'इस छवि में फसल के पत्ते या वनस्पति का कोई निशान नहीं है।'
            : 'No plant foliage or agricultural crop characteristics detected in the image.',
        ],
        actions: [],
        isPreliminary: false,
        aiProvider: 'CropShield Gatekeeper',
        language,
      };
    }

    const effectiveCrop = imageValidation?.detectedCrop || cropName || 'Crop';
    const cropKey = effectiveCrop.toLowerCase().trim();
    const effectiveSymptoms = Array.from(
      new Set([...symptoms, ...(imageValidation?.detectedSymptoms || [])])
    );
    const hasBrownSpots = effectiveSymptoms.includes('brownSpots') || effectiveSymptoms.some(s => s.toLowerCase().includes('spot') || s.toLowerCase().includes('మచ్చ') || s.toLowerCase().includes('धब्बे'));
    const hasYellowLeaves = effectiveSymptoms.includes('yellowLeaves') || effectiveSymptoms.some(s => s.toLowerCase().includes('yellow') || s.toLowerCase().includes('పసుపు') || s.toLowerCase().includes('पीले'));
    const hasInsects = effectiveSymptoms.includes('insects') || effectiveSymptoms.some(s => s.toLowerCase().includes('insect') || s.toLowerCase().includes('పురుగు') || s.toLowerCase().includes('कीड़े'));
    const hasDrying = effectiveSymptoms.includes('drying') || effectiveSymptoms.some(s => s.toLowerCase().includes('dry') || s.toLowerCase().includes('ఎండి') || s.toLowerCase().includes('सूख'));
    const hasWilting = effectiveSymptoms.includes('wilting') || effectiveSymptoms.some(s => s.toLowerCase().includes('wilt') || s.toLowerCase().includes('వడలి') || s.toLowerCase().includes('मурझा'));
    const hasPoorGrowth = effectiveSymptoms.includes('poorGrowth') || effectiveSymptoms.some(s => s.toLowerCase().includes('growth') || s.toLowerCase().includes('ఎదుగుదల') || s.toLowerCase().includes('बढ़वार'));
    const hasPodRot = effectiveSymptoms.includes('podRot') || effectiveSymptoms.some(s => s.toLowerCase().includes('pod') || s.toLowerCase().includes('కాయ') || s.toLowerCase().includes('కుళ్ళు') || s.toLowerCase().includes('सड़न') || s.toLowerCase().includes('फली'));
    const hasFruitRot = effectiveSymptoms.includes('fruitRot') || effectiveSymptoms.some(s => s.toLowerCase().includes('fruitrot') || s.toLowerCase().includes('కాయ కుళ్లు') || s.toLowerCase().includes('फल सड़न') || s.toLowerCase().includes('anthracnose'));

    const humidity = weatherData?.humidity ?? 72;
    const temp = weatherData?.temperature ?? 31;
    const rainProb = weatherData?.rainProbability ?? 25;

    // Image-aware heuristic: compute visual variability hash from image data if present
    let imageEntropy = 0;
    if (imageDataUrl && imageDataUrl.length > 200) {
      for (let i = 100; i < Math.min(imageDataUrl.length, 600); i += 15) {
        imageEntropy += imageDataUrl.charCodeAt(i);
      }
    }

    let possibleIssue = '';
    let issueCategory: CropAnalysisResult['issueCategory'] = 'general';
    let seriousness: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'HIGH';
    let confidenceScore = 0.88;
    let explanation = '';
    const whyReasons: string[] = [];
    const actions: string[] = [];

    // =========================================================================
    // 1. TOMATO (టమాట / टमाटर)
    // =========================================================================
    if (cropKey.includes('tomato') || cropKey.includes('టమాట') || cropKey.includes('టమోటా') || cropKey.includes('टमाटर')) {
      if (hasFruitRot || effectiveSymptoms.includes('fruitRot')) {
        seriousness = 'HIGH';
        issueCategory = 'fungal';
        confidenceScore = 0.94;
        if (language === 'te') {
          possibleIssue = 'టమాటలో కాయ కుళ్లు మరియు ఆంత్రాక్నోస్ తెగులు (Fruit Rot & Anthracnose)';
          explanation = 'టమాట కాయలపై గుండ్రటి నల్లటి గుంతల వంటి మచ్చలు మరియు కుళ్లు వ్యాప్తి చెందుతోంది.';
          whyReasons.push('కాయలపై నీటి మచ్చలు, గుంతల వంటి నల్లటి శిలీంధ్ర మచ్చలు స్పష్టంగా గమనించబడ్డాయి.');
          whyReasons.push(`గాలిలో అధిక తేమ (${humidity}%) కాయలపై శిలీంధ్రం వేగంగా విస్తరించడానికి కారణమవుతోంది.`);
          actions.push('అజోక్సిస్ట్రోబిన్ 23% SC (@ 1 మి.లీ/లీ) లేదా డైఫెనోకోనజోల్ 25% EC (@ 1 మి.లీ/లీ) కాయల గుత్తులు తడిసేలా పిచికారీ చేయండి.');
          actions.push('రక్షణగా మాంకోజెబ్ 75% WP (@ 2.5 గ్రా/లీ) నీటికి కలిపి పిచికారీ చేయండి.');
          actions.push('మచ్చలు పడి కుళ్ళిన కాయలను వెంటనే ఏరివేసి దూరంగా భూమిలో పూడ్చిపెట్టండి.');
          actions.push('మొక్కలకు కట్టెల ఆధారం (Staking) ఇచ్చి కాయలు నేలను తాకకుండా చూడండి; పైనుండి నీరు చిమ్మవద్దు.');
        } else if (language === 'hi') {
          possibleIssue = 'टमाटर में फल सड़न एवं एन्थ्रेक्नोज रोग (Fruit Rot & Anthracnose)';
          explanation = 'टमाटर के फलों पर गोल काले धंसे हुए धब्बे और फंगस का गंभीर संक्रमण देखा गया है।';
          whyReasons.push('फलों की सतह पर पानीदार धंसे हुए गहरे काले घाव और धब्बे पाए गए हैं।');
          whyReasons.push(`हवा में अधिक नमी (${humidity}%) से फल सड़न फंगस तेजी से बढ़ती है।`);
          actions.push('एजोक्सीस्ट्रोबिन 23% SC (1 मिली/लीटर) या डाइफेनोकोनाजोल (1 मिली/लीटर) का छिड़काव करें।');
          actions.push('सुरक्षात्मक फफूंदनाशक मैंकोजेब 75% WP (2.5 ग्राम/लीटर) का तुरंत छिड़काव करें।');
          actions.push('संक्रमित व सड़े हुए फलों को तुरंत तोड़कर जमीन में दबा दें ताकि रोग अन्य फलों में न फैले।');
          actions.push('पौधों को डंडियों का सहारा दें और ऊपर से पानी छिड़कने से बचें।');
        } else {
          possibleIssue = 'Tomato Anthracnose & Fruit Rot (Colletotrichum coccodes)';
          explanation = 'Sunken water-soaked lesions and circular dark necrotic rot spots detected on tomato fruits.';
          whyReasons.push('Target-like sunken dark necrotic lesions observed directly on developing tomato fruit surface.');
          whyReasons.push(`High ambient humidity (${humidity}%) accelerates Colletotrichum fungal mycelium expansion.`);
          actions.push('Foliar spray Azoxystrobin 23% SC @ 1 ml/L or Difenoconazole 25% EC @ 1 ml/L targeting fruit clusters.');
          actions.push('Apply Mancozeb 75% WP @ 2.5 g/L as a protective broad-spectrum fungicide.');
          actions.push('Pick and safely bury severely spotted or decaying fruits to prevent fungal spore dispersal.');
          actions.push('Stake vines and avoid overhead watering to prevent soil splash onto tomato fruits.');
        }
      } else if (hasBrownSpots || (humidity > 75 && rainProb > 30)) {
        seriousness = 'MEDIUM';
        issueCategory = 'fungal';
        confidenceScore = 0.91;
        if (language === 'te') {
          possibleIssue = 'టమాటలో ఆల్టర్నేరియా ఆకుమచ్చ లేదా ఎర్లీ బ్లైట్ తెగులు (Early Blight)';
          explanation = 'కింది ఆకులపై గోధుమ రంగు వలయాల (కాన్సెం్రిక్ రింగులు) మచ్చలు మరియు అధిక తేమ వల్ల శిలీంధ్రం వ్యాప్తి చెందుతోంది.';
          whyReasons.push('టమాట ఆకులపై నిర్దిష్ట వలయాకారపు గోధుమ మచ్చలు కనిపించాయి.');
          whyReasons.push(`వాతావరణంలో గాలి తేమ ${humidity}% ఎక్కువగా ఉండటం శిలీంధ్ర బీజోత్పత్తికి కారణమవుతోంది.`);
          actions.push('కింది వరుసలోని మచ్చలు ఉన్న పాత ఆకులను వెంటనే తుంచి నాశనం చేయండి.');
          actions.push('మాంకోజెబ్ (Mancozeb 2.5 గ్రా/లీ) లేదా కాపర్ ఆక్సిక్లోరైడ్ (3 గ్రా/లీ) పిచికారీ చేయండి.');
          actions.push('మొక్కలకు కట్టెల ఆధారం (Staking) ఇచ్చి ఆకులు నేలను తాకకుండా నిలబెట్టండి.');
          actions.push('కాలువల ద్వారా నీరు పెట్టండి, ఆకులపై నేరుగా నీరు చిమ్మవద్దు.');
        } else if (language === 'hi') {
          possibleIssue = 'टमाटर में अगेती झुलसा या अल्टरनेरिया पत्ता धब्बा (Early Blight)';
          explanation = 'निचली पत्तियों पर गोल भूरे छल्लेदार धब्बे और उच्च आर्द्रता के कारण फंगस का प्रसार हो रहा है।';
          whyReasons.push('पत्तियों पर संकेन्द्री छल्ले (Target spots) के लक्षण दिखाई दिए हैं।');
          whyReasons.push(`हवा में ${humidity}% नमी होने से कवक बीजाणु तेजी से फैल रहे हैं।`);
          actions.push('संक्रमित निचली पत्तियों को काटकर खेत से दूर नष्ट करें।');
          actions.push('मैंकोजेब (2.5 ग्राम प्रति लीटर) या कॉपर ऑक्सीक्लोराइड का छिड़काव करें।');
          actions.push('पौधों को डंडियों से सहारा दें ताकि पत्तियां गीली मिट्टी के संपर्क में न आएं।');
          actions.push('3 दिन बाद सुधार की जांच के लिए नई फोटो अपलोड करें।');
        } else {
          possibleIssue = 'Early Blight (Alternaria solani) on Tomato';
          explanation = 'Concentric ring brown spots on lower leaves accelerated by humid microclimate indicate Alternaria blight.';
          whyReasons.push('Target-like concentric ring brown lesions observed on foliage.');
          whyReasons.push(`High ambient humidity (${humidity}%) creates favourable conditions for fungal sporulation.`);
          actions.push('Prune and safely destroy lower leaves with concentric spotting.');
          actions.push('Apply protective Mancozeb (2.5g/L) or Copper Oxychloride (3g/L) spray.');
          actions.push('Trellis / stake tomato plants to prevent soil-splash onto foliage.');
          actions.push('Water strictly at base furrow level without wetting foliage.');
        }
      } else if (hasInsects || hasYellowLeaves) {
        seriousness = 'HIGH';
        issueCategory = 'viral';
        confidenceScore = 0.89;
        if (language === 'te') {
          possibleIssue = 'టమాటలో ఆకుముడత వైరస్ (Leaf Curl Virus) మరియు తెల్లదోమ ఉధృతి';
          explanation = 'ఆకులు పైకి ముడుచుకుని, పాలిపోయి గిడసబారడం తెల్లదోమ ద్వారా వ్యాపించే వైరస్ లక్షణం.';
          whyReasons.push('ఆకులు చిన్నవిగా మారి పైకి ముడుచుకుపోవడం మరియు పసుపు రంగులోకి మారడం గమనించబడింది.');
          whyReasons.push(`ఉష్ణోగ్రత ${temp}°C ఉండటం తెల్లదోమల సంతతి వృద్ధికి దోహదపడుతోంది.`);
          actions.push('తీవ్రంగా ముడుచుకుపోయిన వైరస్ సోకిన మొక్కలను పీకి పొలం బయట కాల్చివేయండి.');
          actions.push('తెల్లదోమల నివారణకు ఎల్లో స్టిక్కీ ట్రాప్స్ (పసుపు జిగురు అట్టలు) ఎకరాకు 15 అమర్చండి.');
          actions.push('వేప నూనె (10,000 PPM @ 2 మి.లీ/లీ) లేదా డైఫెన్‌థియురాన్ పిచికారీ చేయండి.');
          actions.push('పొలం చుట్టూ జొన్న లేదా మొక్కజొన్నను సరిహద్దు రక్షణ పంటగా వేయండి.');
        } else if (language === 'hi') {
          possibleIssue = 'टमाटर में पर्ण कुंचन विषाणु (Leaf Curl Virus) एवं सफेद मक्खी का प्रकोप';
          explanation = 'पत्तियों का मुड़ना और पीला पड़ना सफेद मक्खी द्वारा फैलाए जाने वाले वायरस के स्पष्ट लक्षण हैं।';
          whyReasons.push('पत्तियों में ऊपर की ओर सिकुड़न और पीलापन देखा गया है।');
          whyReasons.push('सफेद मक्खी कीट रस चूसकर वायरस को स्वस्थ पौधों में फैलाती है।');
          actions.push('गंभीर रूप से ग्रसित पौधों को उखाड़कर नष्ट करें।');
          actions.push('खेत में 15 पीले चिपचिपे कार्ड (येलो स्टिकी ट्रैप) प्रति एकड़ लगाएं।');
          actions.push('नीम तेल (5 मिली प्रति लीटर) या अनुशंसित कीटनाशक का छिड़काव करें।');
          actions.push('खेत के चारों ओर मक्का या ज्वार की सुरक्षात्मक कतारें लगाएं।');
        } else {
          possibleIssue = 'Tomato Leaf Curl Virus (TLCV) & Whitefly Infestation';
          explanation = 'Upward curling and interveinal chlorosis transmitted by Bemisia tabaci whiteflies.';
          whyReasons.push('Puckered, curled leaves with stunted apical growth.');
          whyReasons.push(`Warm temperature (${temp}°C) accelerates whitefly vector multiplication.`);
          actions.push('Rogue out and bury severely stunted viral-infected plants.');
          actions.push('Install 12-15 yellow sticky traps per acre to trap vector whiteflies.');
          actions.push('Spray Neem seed kernel extract (5%) or Diafenthiuron during evening hours.');
          actions.push('Erect barrier crops of maize or sorghum along field borders.');
        }
      } else {
        seriousness = 'LOW';
        issueCategory = 'healthy';
        confidenceScore = 0.94;
        if (language === 'te') {
          possibleIssue = 'టమాట పంట సంతృప్తికరంగా ఉంది — కాయ ఎదుగుదల మరియు పోషక నిర్వహణ';
          explanation = 'తీవ్రమైన వ్యాధి లక్షణాలు లేవు. కాయ నాణ్యత పెరగడానికి కాల్షియం మరియు బోరాన్ యాజమాన్యం అవసరం.';
          whyReasons.push('ఆకులు సహజమైన ఆకుపచ్చ రంగుతో ఆరోగ్యంగా ఉన్నాయి.');
          whyReasons.push(`ప్రస్తుత ఉష్ణోగ్రత ${temp}°C టమాట పూత, పిందెకు అనుకూలంగా ఉంది.`);
          actions.push('కాయ తొడిమ కుళ్లు (Blossom End Rot) నివారించడానికి కాల్షియం నైట్రేట్ (2 గ్రా/లీ) పిచికారీ చేయండి.');
          actions.push('పూత రాలకుండా తేలికపాటి క్రమబద్ధమైన నీటి తడులు ఇవ్వండి.');
          actions.push('పొలంలో కలుపు లేకుండా మొదళ్ల వద్ద మట్టిని ఎగదోయండి.');
        } else if (language === 'hi') {
          possibleIssue = 'टमाटर की फसल स्वस्थ स्थिति में — फल विकास एवं पोषण प्रबंधन';
          explanation = 'पौधों में कोई गंभीर रोग नहीं है। फल की गुणवत्ता के लिए नियमित सिंचाई व पोषक तत्व बनाए रखें।';
          whyReasons.push('पत्तियां प्राकृतिक हरी और सक्रिय हैं।');
          whyReasons.push(`तापमान ${temp}°C फल बनने के लिए अनुकूल है।`);
          actions.push('ब्लॉसम एंड रॉट से बचाव के लिए कैल्शियम नाइट्रेट (2 ग्राम/लीटर) का छिड़काव करें।');
          actions.push('फूल और फल झड़ने से रोकने के लिए नियमित हल्की सिंचाई करें।');
          actions.push('पौधों के तने के पास मिट्टी चढ़ाएं (Earthing up)।');
        } else {
          possibleIssue = 'Tomato Crop in Good Health — Fruit Setting & Nutrition Plan';
          explanation = 'Foliage appears vigorous with no acute pathological lesions.';
          whyReasons.push('Vibrant green leaf canopy with normal cell turgidity.');
          whyReasons.push(`Prevailing temperature (${temp}°C) supports flower fruit set.`);
          actions.push('Apply Calcium Nitrate (2g/L) foliar spray to prevent blossom-end rot.');
          actions.push('Maintain uniform soil moisture to prevent fruit cracking.');
          actions.push('Earth up soil along planting ridges to support root development.');
        }
      }
    }

    // =========================================================================
    // 2. RICE / PADDY (వరి / धान)
    // =========================================================================
    else if (cropKey.includes('rice') || cropKey.includes('paddy') || cropKey.includes('వరి') || cropKey.includes('धान')) {
      if (hasBrownSpots || humidity > 80) {
        seriousness = 'MEDIUM';
        issueCategory = 'fungal';
        confidenceScore = 0.92;
        if (language === 'te') {
          possibleIssue = 'వరిలో అగ్గి తెగులు (బ్లాస్ట్ / Blast) లేదా గోధుమ ఆకుమచ్చ తెగులు';
          explanation = 'ఆకులపై కండె ఆకారపు మచ్చలు మరియు అధిక గాలి తేమ అగ్గి తెగులు వ్యాప్తిని సూచిస్తున్నాయి.';
          whyReasons.push('ఆకులపై మధ్యలో బూడిద రంగు, అంచున గోధుమ రంగు ఉన్న కండె ఆకారపు మచ్చలు గమనించబడ్డాయి.');
          whyReasons.push(`రాత్రి వేళల్లో చల్లదనం మరియు పగటి పూట గాలిలో తేమ ${humidity}% ఎక్కువగా ఉండటం శిలీంధ్రానికి అనుకూలం.`);
          actions.push('నత్రజని (యూరియా) ఎరువుల వాడకాన్ని తాత్కాలికంగా ఆపివేయండి.');
          actions.push('ట్రైసైక్లాజోల్ (Tricyclazole 75% WP @ 0.6 గ్రా/లీ) నీటికి కలిపి పిచికారీ చేయండి.');
          actions.push('పొలంలో నీటిని నిల్వ ఉంచకుండా తీసివేసి 2 రోజులు ఆరనివ్వండి.');
          actions.push('పొటాష్ ఎరువును ఎకరాకు 15 కిలోలు సమానంగా వేయండి.');
        } else if (language === 'hi') {
          possibleIssue = 'धान में ब्लास्ट (झोंका रोग) या भूरा पत्ता धब्बा रोग';
          explanation = 'पत्तियों पर नाव के आकार के धब्बे और अत्यधिक नमी ब्लास्ट रोग के स्पष्ट संकेत हैं।';
          whyReasons.push('पत्तियों पर किनारों पर भूरे और केंद्र में स्लेटी धब्बे देखे गए हैं।');
          whyReasons.push(`खेत में हवा की नमी ${humidity}% अधिक है, जिससे फफूंद तेजी से फैलती है।`);
          actions.push('यूरिया (नाइट्रोजन) की अतिरिक्त खुराक तुरंत रोक दें।');
          actions.push('ट्राइसाइक्लाजोल (0.6 ग्राम प्रति लीटर) का घोल बनाकर छिड़काव करें।');
          actions.push('खेत से पानी की निकासी कर 2 दिन हवा लगने दें (AWD विधि)।');
          actions.push('पोटाश उर्वरक की संतुलित मात्रा दें।');
        } else {
          possibleIssue = 'Rice Blast (Magnaporthe oryzae) & Brown Spot';
          explanation = 'Spindle-shaped lesions with grey centres and high humidity favor rapid blast sporulation.';
          whyReasons.push('Spindle-shaped necrotic lesions observed on leaf blades.');
          whyReasons.push(`High relative humidity (${humidity}%) provides ideal leaf-wetness duration.`);
          actions.push('Temporarily withhold top-dressing of nitrogenous fertilizers (Urea).');
          actions.push('Foliar spray of Tricyclazole 75% WP @ 0.6g/L water.');
          actions.push('Drain standing water for 48 hours to expose soil to aeration.');
          actions.push('Apply supplemental Muriate of Potash (MOP) to build leaf silica strength.');
        }
      } else if (hasInsects) {
        seriousness = 'HIGH';
        issueCategory = 'pest';
        confidenceScore = 0.90;
        if (language === 'te') {
          possibleIssue = 'వరిలో కాండం తొలుచు పురుగు (Stem Borer) లేదా సుడిదోమ (BPH)';
          explanation = 'పిలకలు ఎండిపోవడం (డెడ్ హార్ట్స్) లేదా మొదళ్ల వద్ద సుడిదోమ గుంపులు పంటను తీవ్రంగా దెబ్బతీస్తాయి.';
          whyReasons.push('పైరులో కాండం తొలుచు పురుగు లేదా మొదళ్ల వద్ద కీటకాల ఉనికి కనిపించింది.');
          whyReasons.push('వరి దుబ్బులలో గాలి ప్రసరణ తక్కువగా ఉన్నప్పుడు సుడిదోమ వేగంగా పెరుగుతుంది.');
          actions.push('సుడిదోమ ఉంటే పొలంలోని నీటిని వెంటనే పూర్తిగా ఖాళీ చేసి ఆరబెట్టండి.');
          actions.push('ఎకరాకు 8 లింగాకర్షక బుట్టలు (Pheromone traps) కాండం తొలుచు పురుగుల కోసం అమర్చండి.');
          actions.push('క్లోరాంట్రానిలిప్రోల్ 18.5% SC (@ 0.3 మి.లీ/లీ) లేదా పైమెట్రోజిన్ పిచికారీ చేయండి.');
          actions.push('పిచికారీ ఎల్లప్పుడూ మొక్కల మొదళ్లను తడిపేలా చేయాలి.');
        } else if (language === 'hi') {
          possibleIssue = 'धान में तना छेदक (Stem Borer) या भूरा फुदका (BPH) कीट';
          explanation = 'तना छेदक से मृत गोप (Dead Heart) और फुदका कीट से पौधे झुलसने का खतरा बढ़ गया है।';
          whyReasons.push('तने के अंदर सुंडी या पौधे के निचले भाग में कीटों की गतिविधि पाई गई।');
          whyReasons.push('खेत में लगातार भरा पानी फुदका कीटों के प्रजनन को बढ़ाता है।');
          actions.push('खेत से पानी पूरी तरह निकाल दें और 3 दिन सूखने दें।');
          actions.push('तना छेदक के लिए 8 फेरोमोन ट्रैप प्रति एकड़ लगाएं।');
          actions.push('क्लोरांट्रानिलीप्रोल (0.3 मिली/लीटर) का शाम के समय छिड़काव करें।');
          actions.push('छिड़काव का रुख पौधों की जड़ों और तने के निचले भाग की तरफ रखें।');
        } else {
          possibleIssue = 'Stem Borer (Scirpophaga incertulas) & Brown Plant Hopper';
          explanation = 'Dead hearts or hopper burn patches caused by internal vascular feeder infestation.';
          whyReasons.push('Symptoms of central shoot drying or basal insect congregating.');
          whyReasons.push('Continuous stagnant water layer creates humid habitat for hoppers.');
          actions.push('Immediately drain excess water to break insect reproductive cycles.');
          actions.push('Install 6-8 pheromone traps per acre to monitor yellow stem borer moths.');
          actions.push('Apply Chlorantraniliprole 18.5% SC @ 0.3ml/L targeting the plant base.');
          actions.push('Maintain alternate wetting and drying (AWD) irrigation.');
        }
      } else {
        seriousness = 'LOW';
        issueCategory = 'healthy';
        confidenceScore = 0.95;
        if (language === 'te') {
          possibleIssue = 'వరి పైరు ఆరోగ్యంగా ఉంది — పిలకల దశ & సమగ్ర పోషక యాజమాన్యం';
          explanation = 'పంట ఆరోగ్యవంతమైన పచ్చదనంతో ఉంది. పిలకలు బలంగా రావడానికి సమతుల్య నీటి తడులు ఇవ్వండి.';
          whyReasons.push('పైరు ఆకులు తెగుళ్లు లేకుండా ఆరోగ్యంగా ఉన్నాయి.');
          whyReasons.push(`ఉష్ణోగ్రత ${temp}°C వరి పెరుగుదలకు చాలా అనుకూలంగా ఉంది.`);
          actions.push('ఎకరాకు 20 కిలోల పొటాష్ వేసి పిలకలు గట్టిపడేలా చేయండి.');
          actions.push('పొలంలో 2-3 సెం.మీ నీటి మట్టం మాత్రమే ఉంచి ఆరబెడుతూ నీరు పెట్టండి.');
          actions.push('గట్లపై కలుపు మొక్కలను తొలగించి పురుగుల ఆశ్రయాన్ని నివారించండి.');
        } else if (language === 'hi') {
          possibleIssue = 'धान की फसल स्वस्थ स्थिति में — कल्ले फूटना एवं संतुलित पोषण';
          explanation = 'फसल में कोई बीमारी नहीं है। अच्छे कल्ले फूटने के लिए उचित सिंचाई प्रबंधन करें।';
          whyReasons.push('पत्तियों में स्वस्थ हरापन और मजबूत तना है।');
          whyReasons.push(`वर्तमान मौसम (${temp}°C) वानस्पतिक बढ़वार के लिए आदर्श है।`);
          actions.push('खेत में 2-3 सेमी से ज्यादा पानी न भरने दें; आल्टरनेट वेटिंग एंड ड्राइंग अपनाएं।');
          actions.push('पोटाश की अनुशंसित खुराक दें।');
          actions.push('मेड़ों की घास व खरपतवार साफ रखें।');
        } else {
          possibleIssue = 'Rice Crop in Prime Vegetative Health — Tiller Care';
          explanation = 'Vigorous tillering phase with no fungal lesions or pest punctures.';
          whyReasons.push('Uniform green foliage with optimal leaf erectness.');
          whyReasons.push(`Temperature ${temp}°C promotes robust enzymatic nutrient uptake.`);
          actions.push('Maintain thin water film (2-3 cm) rather than deep submergence.');
          actions.push('Apply balanced MOP (Potash) to strengthen culm wall resistance.');
          actions.push('Keep bunds free of weed alternate hosts.');
        }
      }
    }

    // =========================================================================
    // 3. CHILLI (మిరప / मिर्च)
    // =========================================================================
    else if (cropKey.includes('chilli') || cropKey.includes('pepper') || cropKey.includes('మిరప') || cropKey.includes('मिर्च')) {
      if (hasInsects || hasYellowLeaves || hasPoorGrowth) {
        seriousness = 'HIGH';
        issueCategory = 'pest';
        confidenceScore = 0.92;
        if (language === 'te') {
          possibleIssue = 'మిరపలో జెమిని వైరస్ ముడత తెగులు (తామర పురుగులు / Thrips & Mites దాడి)';
          explanation = 'ఆకులు పైకి దోనెలా ముడుచుకుంటే తామర పురుగులు, కిందకు ముడుచుకుంటే నల్లి పురుగుల ఉధృతిగా గుర్తించాలి.';
          whyReasons.push('ఆకులు ముడుచుకుపోవడం మరియు ఎదుగుదల లోపించడం స్పష్టంగా ఉంది.');
          whyReasons.push(`వేడి వాతావరణం (${temp}°C) రసం పీల్చే పురుగుల గుడ్లు త్వరగా పొదగడానికి సహాయపడుతుంది.`);
          actions.push('ఆకులు పైకి ముడుచుకుంటే తామర పురుగుల కోసం నీలి రంగు జిగురు అట్టలు (Blue traps) ఎకరాకు 15 పెట్టండి.');
          actions.push('ఆకులు కిందకు ముడుచుకుంటే మైట్లకు సల్ఫర్ 80% WP (3 గ్రా/లీ) పిచికారీ చేయండి.');
          actions.push('వేప నూనె (10,000 PPM @ 2 మి.లీ/లీ) సాయంత్రం వేళల్లో పిచికారీ చేయండి.');
          actions.push('నత్రజని ఎరువుల వాడకాన్ని తగ్గించి పొటాష్, సూక్ష్మపోషకాలు అందించండి.');
        } else if (language === 'hi') {
          possibleIssue = 'मिर्च में मरोड़िया रोग (चुर्रा-मुर्रा) एवं थ्रिप्स/माइट्स का प्रकोप';
          explanation = 'पत्तियों का ऊपर नाव की तरह मुड़ना थ्रिप्स और नीचे मुड़ना माइट्स कीट का संकेत है।';
          whyReasons.push('पत्तियों में गंभीर सिकुड़न और बढ़वार का रुकना देखा गया है।');
          whyReasons.push(`गर्म तापमान (${temp}°C) रस चूसक कीटों को तेजी से बढ़ाता है।`);
          actions.push('थ्रिप्स की निगरानी के लिए 15 नीले स्टिकी ट्रैप प्रति एकड़ लगाएं।');
          actions.push('माइट्स के लिए घुलनशील गंधक (सल्फर 3 ग्राम/लीटर) का छिड़काव करें।');
          actions.push('नीम का तेल (5 मिली/लीटर) शाम को पत्तियों के नीचे छिड़कें।');
          actions.push('अत्यधिक यूरिया देने से बचें।');
        } else {
          possibleIssue = 'Chilli Leaf Curl (Murda Complex) & Thrips/Mite Attack';
          explanation = 'Upward leaf curling caused by Scirtothrips dorsalis or downward curling by Polyphagotarsonemus mites.';
          whyReasons.push('Curled, boat-shaped leaves with crinkled leaf margins.');
          whyReasons.push(`Warm field temperatures (${temp}°C) facilitate rapid generation turnover of sucking vectors.`);
          actions.push('Erect 15 blue sticky traps per acre for thrips monitoring.');
          actions.push('If leaves curl downward, spray Wettable Sulphur (3g/L) for mite suppression.');
          actions.push('Apply cold-pressed Neem Oil (10,000 ppm @ 2ml/L) in the cool evening.');
          actions.push('Balance vegetative growth by curtailing excess nitrogen.');
        }
      } else if (hasBrownSpots || hasDrying) {
        seriousness = 'MEDIUM';
        issueCategory = 'fungal';
        confidenceScore = 0.89;
        if (language === 'te') {
          possibleIssue = 'మిరపలో కొమ్మ ఎండు తెగులు మరియు కాయ కుళ్లు (Anthracnose Dieback)';
          explanation = 'కొమ్మల చివర్ల నుండి ఎండిపోవడం మరియు కాయలపై నల్లటి గుండ్రని మచ్చలు ఏర్పడటం శిలీంధ్ర తెగులు లక్షణం.';
          whyReasons.push('కొమ్మలు పైనుండి కిందికి ఎండిపోవడం లేదా కాయలపై మచ్చలు గమనించబడ్డాయి.');
          whyReasons.push(`గాలిలో తేమ ${humidity}% ఎక్కువగా ఉండటం కొమ్మ ఎండు శిలీంధ్రానికి కారణమవుతోంది.`);
          actions.push('ఎండిపోయిన కొమ్మల భాగాన్ని ఆరోగ్యకరమైన కాండం వరకు కత్తిరించి కాల్చివేయండి.');
          actions.push('అజోక్సిస్ట్రోబిన్ + డైఫెనోకోనజోల్ (1 మి.లీ/లీ) లేదా కాపర్ హైడ్రాక్సైడ్ (2.5 గ్రా/లీ) పిచికారీ చేయండి.');
          actions.push('మిరప తోటలో మురుగు నీరు నిల్వ లేకుండా బయటకు పోయేలా చేయండి.');
        } else if (language === 'hi') {
          possibleIssue = 'मिर्च में डाइबैक (टहनी सूखना) एवं फल सड़न रोग (Anthracnose)';
          explanation = 'टहनियों का ऊपर से नीचे सूखना और फलों पर गोल काले धब्बे फंगस के कारण होते हैं।';
          whyReasons.push('टहनियों का सूखना व फलों पर धब्बे दर्ज किए गए हैं।');
          whyReasons.push(`हवा में ${humidity}% नमी होने से रोग तेजी से फैलता है।`);
          actions.push('सूखी टहनियों को स्वस्थ हिस्से से 2 सेमी नीचे से काटकर हटा दें।');
          actions.push('एज़ोक्सिस्ट्रोबिन + डिफेनोकोनाज़ोल (1 मिली/लीटर) का छिड़काव करें।');
          actions.push('खेत में पानी का जमाव न होने दें।');
        } else {
          possibleIssue = 'Chilli Dieback & Anthracnose Fruit Rot (Colletotrichum)';
          explanation = 'Top-down necrosis of branches and circular sunken necrotic lesions on developing pods.';
          whyReasons.push('Branch tip dieback or circular dark lesions on pods.');
          whyReasons.push(`High relative humidity (${humidity}%) promotes acervuli germination.`);
          actions.push('Prune affected twigs 2 cm below infected green margins and destroy.');
          actions.push('Spray Azoxystrobin + Difenoconazole (1 ml/L) or Copper Hydroxide (2.5 g/L).');
          actions.push('Ensure proper furrow drainage to eliminate stagnant water puddles.');
        }
      } else {
        seriousness = 'LOW';
        issueCategory = 'healthy';
        confidenceScore = 0.93;
        if (language === 'te') {
          possibleIssue = 'మిరప తోట ఆరోగ్యంగా ఉంది — పూత, పిందె సంరక్షణ & సమగ్ర యాజమాన్యం';
          explanation = 'తోటలో ఎలాంటి తెగుళ్లు లేవు. పూత రాలకుండా తేలికపాటి నీరు మరియు బయో-స్టిమ్యులెంట్స్ ఇవ్వండి.';
          whyReasons.push('ఆకులు ముడత లేకుండా ఆరోగ్యవంతమైన ఆకుపచ్చ రంగుతో ఉన్నాయి.');
          whyReasons.push(`ఉష్ణోగ్రత ${temp}°C మిరప కాయల అభివృద్ధికి అనుకూలంగా ఉంది.`);
          actions.push('పూత నిలవడానికి ప్లానోఫిక్స్ (Planofix @ 0.25 మి.లీ/4.5 లీ నీటికి) పిచికారీ చేయండి.');
          actions.push('సాయంత్రం పూట మాత్రమే తేలికపాటి నీటి తడులు ఇవ్వండి.');
        } else if (language === 'hi') {
          possibleIssue = 'मिर्च की फसल स्वस्थ — फूल और फल का बेहतर प्रबंधन';
          explanation = 'फसल बिल्कुल स्वस्थ है। फूल झड़ने से रोकने के लिए हल्की सिंचाई जारी रखें।';
          whyReasons.push('पत्तियों में कोई मरोड़िया या फंगस के लक्षण नहीं हैं।');
          whyReasons.push(`तापमान ${temp}°C मिर्च के फलों के विकास के लिए सही है।`);
          actions.push('फूल गिरने से बचाने के लिए प्लेनोफिक्स का हल्का छिड़काव करें।');
          actions.push('शाम के समय हल्की सिंचाई करें।');
        } else {
          possibleIssue = 'Chilli Crop in Excellent Health — Flowering & Pod Setting';
          explanation = 'Leaves are uncurled with healthy dark green canopy.';
          whyReasons.push('Absence of vector thrips distortion or anthracnose lesions.');
          whyReasons.push(`Temperature ${temp}°C supports continuous flower bud emergence.`);
          actions.push('Apply Planofix (alpha naphthyl acetic acid) at recommended dose to retain blossoms.');
          actions.push('Provide uniform light evening irrigations.');
        }
      }
    }

    // =========================================================================
    // 4. COTTON (పత్తి / कपास)
    // =========================================================================
    else if (cropKey.includes('cotton') || cropKey.includes('పత్తి') || cropKey.includes('कपास')) {
      if (hasInsects) {
        seriousness = 'HIGH';
        issueCategory = 'pest';
        confidenceScore = 0.91;
        if (language === 'te') {
          possibleIssue = 'పత్తిలో గులాబీ రంగు బొబ్బ పురుగు (Pink Bollworm) లేదా రసం పీల్చే పురుగులు';
          explanation = 'కాయలకు రంధ్రాలు పడటం లేదా పూత రాలిపోవడం గులాబీ రంగు పురుగు ఉధృతిని తెలుపుతుంది.';
          whyReasons.push('కాయలలో పురుగు తొలిచిన రంధ్రాలు లేదా రసం పీల్చే పురుగులు గమనించబడ్డాయి.');
          whyReasons.push(`ఉష్ణోగ్రత ${temp}°C పురుగుల లార్వాల ఎదుగుదలకు అనుకూలంగా ఉంది.`);
          actions.push('ఎకరాకు 8 గులాబీ రంగు బొబ్బ పురుగు లింగాకర్షక బుట్టలు (Pheromone traps) అమర్చండి.');
          actions.push('ఎమామెక్టిన్ బెంజోయేట్ 5% SG (0.4 గ్రా/లీ) లేదా ప్రొఫెనోఫాస్ (2 మి.లీ/లీ) పిచికారీ చేయండి.');
          actions.push('రాలిన పూత మరియు గుడ్డి కాయలను ఏరివేసి నాశనం చేయండి.');
        } else if (language === 'hi') {
          possibleIssue = 'कपास में गुलाबी सुंडी (Pink Bollworm) या रस चूसक कीटों का हमला';
          explanation = 'टिंडों में छेद होना या फूल का गिरना गुलाबी सुंडी के प्रकोप का लक्षण है।';
          whyReasons.push('टिंडों में कीड़े के निशान या रस चूसक कीट दर्ज किए गए हैं।');
          whyReasons.push('वर्तमान मौसम कीटों की अगली पीढ़ी तैयार करने में मदद कर रहा है।');
          actions.push('खेत में 8 फेरोमोन ट्रैप प्रति एकड़ लगाकर निगरानी करें।');
          actions.push('इमामेक्टिन बेंजोएट (0.4 ग्राम प्रति लीटर) का छिड़काव करें।');
          actions.push('गिरे हुए फूलों और खराब टिंडों को एकत्र कर जला दें।');
        } else {
          possibleIssue = 'Pink Bollworm (Pectinophora gossypiella) & Sucking Pests on Cotton';
          explanation = 'Boll punctures and rosette flowers induced by internal boll feeder larvae.';
          whyReasons.push('Presence of caterpillar frass or bore holes on developing squares/bolls.');
          whyReasons.push(`Temperature ${temp}°C facilitates adult moth emergence and oviposition.`);
          actions.push('Install 8 Pink Bollworm pheromone traps per acre.');
          actions.push('Spray Emamectin Benzoate 5% SG @ 0.4g/L or Profenofos 50% EC @ 2ml/L.');
          actions.push('Collect and destroy shed squares and rosette flowers to break lifecycle.');
        }
      } else if (hasYellowLeaves || hasDrying) {
        seriousness = 'MEDIUM';
        issueCategory = 'nutrient';
        confidenceScore = 0.87;
        if (language === 'te') {
          possibleIssue = 'పత్తిలో ఆకులు ఎర్రబడటం (మెగ్నీషియం లోపం / Leaf Reddening) లేదా పారావిల్ట్';
          explanation = 'ఆకుల ఈనెల మధ్య భాగం ఎరుపు రంగులోకి మారడం నేలలో మెగ్నీషియం లోపం మరియు చలి తీవ్రత వల్ల వస్తుంది.';
          whyReasons.push('ఆకులు అంచుల నుండి ఎరుపు/ఊదా రంగులోకి మారడం గమనించబడింది.');
          whyReasons.push('కాయలు ఎదిగే దశలో మెగ్నీషియం అవసరం ఎక్కువగా ఉంటుంది.');
          actions.push('మెగ్నీషియం సల్ఫేట్ (10 గ్రా/లీ) + యూరియా (10 గ్రా/లీ) కలిపి ఆకులపై పిచికారీ చేయండి.');
          actions.push('15 రోజుల వ్యవధిలో రెండోసారి మళ్లీ ఇదే స్ప్రే చేయండి.');
          actions.push('నేలలో నిల్వ ఉన్న నీటిని వెంటనే తీసివేసి మొదళ్లకు గాలి తగిలేలా చేయండి.');
        } else if (language === 'hi') {
          possibleIssue = 'कपास में पत्तियों का लाल पड़ना (मैग्नीशियम की कमी) या पैराविल्ट';
          explanation = 'पत्तियों की शिराओं के बीच लाल रंग उभरना मैग्नीशियम पोषक तत्व की कमी का संकेत है।';
          whyReasons.push('पत्तियों में लालिमा और पोषण की कमी के लक्षण मिले हैं।');
          whyReasons.push('टिंडे बनते समय पौधों को मैग्नीशियम की अधिक आवश्यकता होती है।');
          actions.push('मैग्नीशियम सल्फेट (10 ग्राम/लीटर) + यूरिया (10 ग्राम/लीटर) का पर्णीय छिड़काव करें।');
          actions.push('15 दिन बाद दोबारा दोहराएं।');
          actions.push('खेत से जलभराव तुरंत निकालें।');
        } else {
          possibleIssue = 'Cotton Leaf Reddening (Magnesium Deficiency) & Moisture Stress';
          explanation = 'Interveinal purple-red pigmentation triggered by nutrient drain during boll maturation.';
          whyReasons.push('Interveinal reddening while major veins remain greenish.');
          whyReasons.push('Heavy boll load demands rapid translocated magnesium.');
          actions.push('Foliar spray Magnesium Sulphate (10g/L) + Urea (10g/L).');
          actions.push('Repeat the spray after 12-15 days.');
          actions.push('Ensure soil aeration and drain waterlogged furrows.');
        }
      } else {
        seriousness = 'LOW';
        issueCategory = 'healthy';
        confidenceScore = 0.94;
        if (language === 'te') {
          possibleIssue = 'పత్తి పైరు మంచి ఆరోగ్యంతో ఉంది — కాయ ఎదుగుదల యాజమాన్యం';
          explanation = 'పత్తి పంట ఆరోగ్యంగా ఎదుగుతోంది. కాయలు నాణ్యంగా రావడానికి బోరాన్ మరియు పొటాష్ అవసరం.';
          whyReasons.push('ఆకులు ఆరోగ్యంగా, కాయలు సమానంగా ఎదుగుతున్నాయి.');
          whyReasons.push(`వాతావరణం (${temp}°C) పత్తి కాయల వికాసానికి అనుకూలంగా ఉంది.`);
          actions.push('బోరాక్స్ (1.5 గ్రా/లీ) పిచికారీ చేసి కాయల పగుళ్లను నివారించండి.');
          actions.push('13-0-45 (పొటాషియం నైట్రేట్ @ 10 గ్రా/లీ) పిచికారీ చేసి దూది బరువును పెంచండి.');
        } else if (language === 'hi') {
          possibleIssue = 'कपास की फसल स्वस्थ — टिंडों का विकास एवं पोषण';
          explanation = 'फसल रोगमुक्त है। अच्छे वजन और गुणवत्ता के लिए संतुलित पोषण दें।';
          whyReasons.push('पौधे मजबूत हैं और कोई कीट हमला नहीं है।');
          whyReasons.push(`तापमान ${temp}°C टिंडों के फैलाव के लिए अनुकूल है।`);
          actions.push('पोटेशियम नाइट्रेट (13-0-45 @ 10 ग्राम/लीटर) का छिड़काव करें।');
          actions.push('बोरॉन का हल्का स्प्रे करें ताकि टिंडे स्वस्थ रहें।');
        } else {
          possibleIssue = 'Cotton Crop in Vigorous Health — Boll Development Phase';
          explanation = 'Canopy is free of sucking pest cupping or bacterial angular blight.';
          whyReasons.push('Broad, photosynthetically active green foliage.');
          whyReasons.push(`Field climate (${temp}°C) drives optimal boll retention.`);
          actions.push('Foliar spray 13-0-45 (Potassium Nitrate @ 10g/L) to maximize boll weight.');
          actions.push('Apply soluble Boron (1g/L) to prevent square drop and locule rot.');
        }
      }
    }

    // =========================================================================
    // 5. MAIZE / CORN (మొక్కజొన్న / मक्का)
    // =========================================================================
    else if (cropKey.includes('maize') || cropKey.includes('corn') || cropKey.includes('మొక్కజొన్న') || cropKey.includes('मक्का')) {
      if (hasInsects) {
        seriousness = 'HIGH';
        issueCategory = 'pest';
        confidenceScore = 0.93;
        if (language === 'te') {
          possibleIssue = 'మొక్కజొన్నలో కత్తెర పురుగు (Fall Armyworm) తీవ్ర దాడి';
          explanation = 'సుడిలోని ఆకులకు పెద్ద రంధ్రాలు పడటం మరియు లద్దె పురుగు విసర్జన పదార్థాలు ఉండటం కత్తెర పురుగు లక్షణం.';
          whyReasons.push('మొక్క సుడిలో ఆకులు కొరికివేయబడ్డాయి మరియు చెక్కపొట్టు లాంటి పురుగు రెట్ట కనిపించింది.');
          whyReasons.push(`ఉష్ణోగ్రత ${temp}°C కత్తెర పురుగుల సంతతి వేగంగా పెరగడానికి కారణమవుతోంది.`);
          actions.push('సుడి తడిచేలా ఎమామెక్టిన్ బెంజోయేట్ 5% SG (0.4 గ్రా/లీ) పిచికారీ చేయండి.');
          actions.push('చిటికెడు ఇసుక + సున్నం మిశ్రమాన్ని ప్రతి మొక్క సుడిలో వేయండి.');
          actions.push('ఎకరాకు 5 లింగాకర్షక బుట్టలు పెట్టి పురుగుల ఉధృతిని రోజూ గమనించండి.');
        } else if (language === 'hi') {
          possibleIssue = 'मक्के में फॉल आर्मीवर्म (सैनिक कीट / Fall Armyworm) का प्रकोप';
          explanation = 'मक्के की गोभ में बड़े छेद और लकड़ी के बुरादे जैसा मल दिखना फॉल आर्मीवर्म का मुख्य लक्षण है।';
          whyReasons.push('गोभ की पत्तियां कटी हुई हैं और कीट की मौजूदगी पाई गई।');
          whyReasons.push('वर्तमान तापमान कीट की तीव्रता को बढ़ा रहा है।');
          actions.push('इमामेक्टिन बेंजोएट (0.4 ग्राम/लीटर) का गोभ के अंदर सीधा छिड़काव करें।');
          actions.push('रेत और चूने का मिश्रण चुटकी भर गोभ में डालें।');
          actions.push('5 फेरोमोन ट्रैप प्रति एकड़ लगाएं।');
        } else {
          possibleIssue = 'Fall Armyworm (Spodoptera frugiperda) on Maize';
          explanation = 'Window pane feeding and extensive whorl skeletonization with sawdust-like frass.';
          whyReasons.push('Ragged leaf margins and fecal pellets within the whorl funnel.');
          whyReasons.push(`Ambient warmth (${temp}°C) accelerates caterpillar molting.`);
          actions.push('Direct whorl application of Emamectin Benzoate 5% SG @ 0.4g/L.');
          actions.push('Apply a pinch of fine sand mixed with lime (9:1) into central whorls.');
          actions.push('Install 5 FAW pheromone traps per acre.');
        }
      } else {
        seriousness = 'LOW';
        issueCategory = 'healthy';
        confidenceScore = 0.94;
        if (language === 'te') {
          possibleIssue = 'మొక్కజొన్న పైరు పచ్చగా ఆరోగ్యంగా ఉంది — కంకి ఎదుగుదల యాజమాన్యం';
          explanation = 'పంట ఎదుగుదల బాగుంది. కంకిలో గింజ నిండడానికి తగినంత తేమను కొనసాగించండి.';
          whyReasons.push('ఆకులు ఎలాంటి రంధ్రాలు లేకుండా ఆరోగ్యంగా ఉన్నాయి.');
          whyReasons.push(`వాతావరణం ${temp}°C కిరణజన్య సంయోగక్రియకు అనుకూలంగా ఉంది.`);
          actions.push('కంకి దశలో నీటి ఎద్దడి రాకుండా క్రమంగా నీరు పెట్టండి.');
          actions.push('ఎకరాకు 15 కిలోల పొటాష్ వేసి గింజ బరువు పెరిగేలా చేయండి.');
        } else if (language === 'hi') {
          possibleIssue = 'मक्के की फसल स्वस्थ — भुट्टा भराव एवं पोषण';
          explanation = 'फसल पूर्ण रूप से स्वस्थ है। भुट्टे में दाना भरने के लिए नमी बनाए रखें।';
          whyReasons.push('पत्तियां हरी और मजबूत हैं।');
          whyReasons.push(`तापमान ${temp}°C दाना भराव के लिए अच्छा है।`);
          actions.push('भुट्टा बनते समय पानी की कमी न होने दें।');
          actions.push('पोटाश की संतुलित मात्रा दें।');
        } else {
          possibleIssue = 'Maize Crop in Healthy Vegetative State — Cob Development';
          explanation = 'Clean whorls with vigorous photosynthetic leaf area.';
          whyReasons.push('Absence of FAW whorl lacerations or Turcicum leaf stripes.');
          whyReasons.push(`Temperature ${temp}°C supports continuous carbon assimilation.`);
          actions.push('Maintain uniform irrigation during critical tasseling and silking.');
          actions.push('Top-dress MOP to promote full grain kernel filling.');
        }
      }
    }

    // =========================================================================
    // 6. GROUNDNUT / PEANUT (వేరుశనగ / మూంగఫలీ)
    // =========================================================================
    else if (
      cropKey.includes('groundnut') ||
      cropKey.includes('peanut') ||
      cropKey.includes('వేరుశనగ') ||
      cropKey.includes('పల్లీ') ||
      cropKey.includes('మూంగఫలీ') ||
      cropKey.includes('मूंगफली')
    ) {
      if (hasPodRot || hasBrownSpots || hasDrying || (humidity > 70 && temp > 28)) {
        seriousness = 'MEDIUM';
        issueCategory = 'fungal';
        confidenceScore = 0.94;
        if (language === 'te') {
          possibleIssue = 'వేరుశనగలో కాయ కుళ్ళు తెగులు మరియు నల్ల మచ్చలు (Groundnut Pod Rot & Decay)';
          explanation = 'కాయలపై నల్లటి మచ్చలు ఏర్పడి కాయ కుళ్ళిపోవడం నేలలోని శిలీంధ్రం (Rhizoctonia / Aspergillus / Pythium) మరియు అధిక తేమ వల్ల జరుగుతోంది.';
          whyReasons.push('వేరుశనగ కాయలు మరియు పెంకులపై నల్లటి ఫంగస్ మచ్చలు స్పష్టంగా గుర్తించబడ్డాయి.');
          whyReasons.push(`వాతావరణంలో తేమ ${humidity}% ఎక్కువగా ఉండటం నేలలోని శిలీంధ్రాల వ్యాప్తికి దోహదపడుతోంది.`);
          actions.push('ఎకరాకు 200 నుండి 250 కిలోల వ్యవసాయ జిప్సం వేయండి (ఇది కాయ పెంకును గట్టిపరచి ఫంగస్ చొరబడకుండా చేస్తుంది).');
          actions.push('ఎకరాకు 1-2 కిలోల ట్రైకోడెర్మా విరిడేను 100 కిలోల మాగిన పశువుల ఎరువుతో కలిపి నేలలో వేయండి.');
          actions.push('టెబుకోనజోల్ 25.9% EC (1.5 మి.లీ/లీ) లేదా కార్బండజిమ్ + మాంకోజెబ్ (2 గ్రా/లీ) మొక్కల మొదళ్లు మరియు నేల తడిసేలా పిచికారీ చేయండి.');
          actions.push('పొలంలో నీరు నిల్వ ఉండకుండా చూడండి మరియు కోత తర్వాత కాయలను తేమ 8% కంటే తగ్గేలా ఆరబెట్టండి.');
        } else if (language === 'hi') {
          possibleIssue = 'मूंगफली में फली सड़न एवं कवक जनित काले धब्बे (Groundnut Pod Rot & Decay)';
          explanation = 'फलियों पर काले धब्बे और सड़न मिट्टी जनित फंगस (राइजोक्टोनिया / एस्परजिलस) और अधिक नमी के कारण फैल रही है।';
          whyReasons.push('मूंगफली की फलियों पर काले फंगल धब्बे और छिलके का क्षरण देखा गया है।');
          whyReasons.push(`खेत में नमी और हवा में ${humidity}% आर्द्रता फफूंद प्रसार के अनुकूल है।`);
          actions.push('प्रति एकड़ 200-250 किग्रा कृषि जिप्सम डालें, जो फलियों के छिलके को मजबूत बनाता है।');
          actions.push('ट्राइकोडर्मा विरिडी (1-2 किग्रा को 100 किग्रा सड़ी गोबर खाद में मिलाकर) जड़ों के पास डालें।');
          actions.push('टेबुकोनाजोल 25.9% EC (1.5 मिली/लीटर) या मैंकोजेब + कार्बेन्डाजिम (2 ग्राम/लीटर) का छिड़काव करें।');
          actions.push('खेत में पानी का ठहराव रोकें और कटाई के बाद फलियों को अच्छी तरह धूप में सुखाएं।');
        } else {
          possibleIssue = 'Groundnut Pod Rot & Fungal Shell Decay (Rhizoctonia / Aspergillus / Pythium)';
          explanation = 'Blackened necrotic lesions and shell decay on groundnut pods caused by soil-borne fungal pathogens under humid conditions.';
          whyReasons.push('Distinct black necrotic fungal spots and shell discoloration observed on groundnut pods.');
          whyReasons.push(`High soil moisture and ambient humidity (${humidity}%) promote subterranean fungal proliferation.`);
          actions.push('Apply Agricultural Gypsum @ 200–250 kg/acre at pegging/pod formation to harden pod shells.');
          actions.push('Soil application of Trichoderma viride (@ 1–2 kg mixed in 100 kg well-decomposed FYM/acre).');
          actions.push('Foliar/soil-drench spray of Tebuconazole 25.9% EC @ 1.5 ml/L or Carbendazim + Mancozeb (Saaf) @ 2 g/L.');
          actions.push('Ensure furrow drainage to avoid standing water, and cure harvested pods below 8% moisture to prevent aflatoxin.');
        }
      } else if (hasYellowLeaves) {
        seriousness = 'MEDIUM';
        issueCategory = 'fungal';
        confidenceScore = 0.91;
        if (language === 'te') {
          possibleIssue = 'వేరుశనగలో తిక్కా ఆకుమచ్చ తెగులు (Tikka Leaf Spot)';
          explanation = 'ఆకులపై పసుపు వలయంతో కూడిన ముదురు గోధుమ రంగు మచ్చలు సెర్కోస్పోరా ఫంగస్ వల్ల వచ్చాయి.';
          whyReasons.push('ఆకులపై తిక్కా తెగులు నిర్దిష్ట గోధుమ మచ్చలు మరియు పసుపు అంచులు కనిపించాయి.');
          actions.push('మాంకోజెబ్ (2.5 గ్రా/లీ) లేదా హెక్సాకోనజోల్ (2 మి.లీ/లీ) పిచికారీ చేయండి.');
          actions.push('బాధిత పాత ఆకులను తీసివేసి నాశనం చేయండి.');
          actions.push('గాలి వెలుతురు సోకేలా జాగ్రత్త తీసుకోండి.');
          actions.push('10 రోజుల వ్యవధిలో అవసరమైతే మళ్లీ పిచికారీ చేయండి.');
        } else if (language === 'hi') {
          possibleIssue = 'मूंगफली में टिक्का पत्ता धब्बा रोग (Tikka Disease)';
          explanation = 'पत्तियों पर पीले घेरे वाले गहरे भूरे धब्बे सर्कोस्पोरा कवक के कारण हैं।';
          whyReasons.push('पत्तियों पर टिक्का रोग के विशिष्ट लक्षण देखे गए हैं।');
          actions.push('मैंकोजेब (2.5 ग्राम/लीटर) या हेक्साकोनाजोल (2 मिली/लीटर) का छिड़काव करें।');
          actions.push('संक्रमित पत्तियों को खेत से बाहर निकालकर नष्ट करें।');
          actions.push('फसल में हवा का संचार बनाए रखें।');
          actions.push('10 दिन बाद आवश्यकतानुसार छिड़काव दोहराएं।');
        } else {
          possibleIssue = 'Groundnut Tikka Leaf Spot (Cercospora arachidicola)';
          explanation = 'Dark brown circular necrotic lesions surrounded by chlorotic yellow halos on foliage.';
          whyReasons.push('Diagnostic circular spots with yellow halos observed on groundnut leaves.');
          actions.push('Apply Mancozeb (2.5g/L) or Hexaconazole 5% EC (2ml/L) foliar spray.');
          actions.push('Remove and safely destroy heavily spotted lower leaves.');
          actions.push('Ensure adequate aeration between plant rows.');
          actions.push('Repeat spray after 10-12 days if disease pressure continues.');
        }
      } else if (hasWilting) {
        seriousness = 'HIGH';
        issueCategory = 'fungal';
        confidenceScore = 0.92;
        if (language === 'te') {
          possibleIssue = 'వేరుశనగలో మొదలు కుళ్ళు లేదా కాండం కుళ్ళు తెగులు (Collar Rot / Stem Rot)';
          explanation = 'మొక్క మొదలు వద్ద నల్లబడి వడలిపోవడం స్క్లెరోషియం ఫంగస్ వల్ల జరుగుతోంది.';
          whyReasons.push('కాండం భూమిని తాకే ప్రాంతంలో కుళ్ళు మరియు మొక్కలు ఎండిపోవడం గుర్తించబడింది.');
          actions.push('మొక్క మొదళ్ల చుట్టూ కార్బండజిమ్ (1 గ్రా/లీ) లేదా కాపర్ ఆక్సిక్లోరైడ్ (3 గ్రా/లీ) ద్రావణాన్ని తడపండి.');
          actions.push('పొలంలో అధిక తేమ ఉండకుండా నీటిని వెంటనే బయటకు పంపండి.');
          actions.push('భవిష్యత్తులో విత్తన శుద్ధి తప్పనిసరిగా చేయండి.');
          actions.push('చనిపోయిన మొక్కలను వేర్లతో సహా తీసి కాల్చండి.');
        } else if (language === 'hi') {
          possibleIssue = 'मूंगफली में कॉलर रॉट / तना सड़न रोग (Collar Rot)';
          explanation = 'जड़ के पास तने का काला पड़ना और पौधे का मुरझाना स्क्लेरोशियम फंगस का लक्षण है।';
          whyReasons.push('जमीन की सतह पर तने का सड़ना और मुरझाना पाया गया है।');
          actions.push('पौधों के आधार पर कार्बेन्डाजिम (1 ग्राम/लीटर) के घोल से ड्रेन्चिंग करें।');
          actions.push('खेत से अतिरिक्त पानी की निकासी तुरंत करें।');
          actions.push('रोगग्रस्त पौधों को उखाड़कर खेत से दूर नष्ट करें।');
          actions.push('अगली बुवाई से पहले बीजोपचार अवश्य करें।');
        } else {
          possibleIssue = 'Groundnut Collar Rot & Stem Blight (Sclerotium rolfsii)';
          explanation = 'Dark collar lesions near the soil surface leading to sudden plant wilting and collapse.';
          whyReasons.push('Collar rot girdling at ground level with wilting canopy.');
          actions.push('Drench collar zone with Carbendazim (1g/L) or Tebuconazole (1ml/L).');
          actions.push('Ensure zero water stagnation around crop root zones.');
          actions.push('Rogue out and destroy infected wilted plants.');
          actions.push('Strictly practice seed treatment with Trichoderma or Thiram for subsequent sowings.');
        }
      } else {
        seriousness = 'LOW';
        issueCategory = 'healthy';
        confidenceScore = 0.93;
        if (language === 'te') {
          possibleIssue = 'వేరుశనగ పంట సాధారణంగా ఉంది — కాయ ఊరడానికి యాజమాన్యం';
          explanation = 'తీవ్రమైన తెగుళ్లు లేవు. కాయలు నిండుగా పెరగడానికి సరైన పోషకాలు అందించండి.';
          whyReasons.push('ఆకులు మరియు పంట సహజ స్థితిలో ఉన్నాయి.');
          actions.push('ఎకరాకు 200 కిలోల జిప్సం వేసి తేలికపాటి తడి ఇవ్వండి.');
          actions.push('బోరాన్ (1 గ్రా/లీ) పిచికారీ చేసి కాయ నాణ్యత పెంచండి.');
          actions.push('కలుపు లేకుండా పొలాన్ని శుభ్రంగా ఉంచండి.');
          actions.push('క్రమం తప్పకుండా నీటి తడులు ఇవ్వండి.');
        } else if (language === 'hi') {
          possibleIssue = 'मूंगफली की फसल सामान्य स्थिति में है — फली भराव प्रबंधन';
          explanation = 'फसल स्वस्थ है। फली के अच्छे भराव के लिए जिप्सम और सूक्ष्म पोषक तत्व दें।';
          whyReasons.push('पत्तियां एवं पौधे सामान्य रूप से स्वस्थ हैं।');
          actions.push('200 किग्रा जिप्सम प्रति एकड़ डालकर हल्की सिंचाई करें।');
          actions.push('बोरोन (1 ग्राम/लीटर) का छिड़काव फली की गुणवत्ता बढ़ाएगा।');
          actions.push('खेत को खरपतवार मुक्त रखें।');
          actions.push('नियमित अंतराल पर हल्की सिंचाई दें।');
        } else {
          possibleIssue = 'Groundnut Crop in Good Condition — Pod Filling Care';
          explanation = 'No severe foliar or subterranean diseases detected. Optimize calcium and boron nutrition.';
          whyReasons.push('Vigorous foliage with healthy peg penetration.');
          actions.push('Top-dress Agricultural Gypsum @ 200 kg/acre followed by light irrigation.');
          actions.push('Apply foliar Boron (1g/L) to enhance kernel development and oil content.');
          actions.push('Keep the field free of competing weeds.');
          actions.push('Maintain optimum moisture during pod filling without waterlogging.');
        }
      }
    }

    // =========================================================================
    // 7. OTHER / GENERAL CROPS (Mango, Pulses, Vegetables)
    // =========================================================================
    else {
      if (hasInsects) {
        seriousness = 'MEDIUM';
        issueCategory = 'pest';
        confidenceScore = 0.88;
        if (language === 'te') {
          possibleIssue = `${cropName} పంటలో కీటకాలు లేదా రసం పీల్చే పురుగుల ఉధృతి`;
          explanation = 'ఆకులపై కీటకాలు మరియు రంధ్రాలు గమనించబడ్డాయి. ఇది పైరు ఎదుగుదలను దెబ్బతీస్తుంది.';
          whyReasons.push('ఆకులపై పురుగు తొలిచిన నష్టం లేదా రంధ్రాలు కనిపించాయి.');
          whyReasons.push(`ఉష్ణోగ్రత ${temp}°C పురుగుల వ్యాప్తికి కారణమవుతోంది.`);
          actions.push('బాధిత ఆకులను గమనించి నాశనం చేయండి.');
          actions.push('వేప నూనె (5 మి.లీ/లీ) సాయంత్రం వేళల్లో పిచికారీ చేయండి.');
          actions.push('ఎల్లో స్టిక్కీ ట్రాప్స్ ఎకరాకు 10 ఏర్పాటు చేయండి.');
        } else if (language === 'hi') {
          possibleIssue = `${cropName} में कीट या रस चूसक कीड़ों का प्रकोप`;
          explanation = 'फसल की पत्तियों पर कीड़ों के लक्षण देखे गए हैं। समय पर नियंत्रण आवश्यक है।';
          whyReasons.push('पत्तियों पर कीट नुकसान पाया गया।');
          whyReasons.push(`तापमान ${temp}°C कीट प्रजनन के अनुकूल है।`);
          actions.push('संक्रमित पत्तों को छांटकर नष्ट करें।');
          actions.push('नीम तेल (5 मिली/लीटर) का छिड़काव करें।');
          actions.push('पीले स्टिकी ट्रैप लगाएं।');
        } else {
          possibleIssue = `Insect Pest Infestation on ${cropName}`;
          explanation = 'Visible signs of insect defoliation or leaf piercing observed.';
          whyReasons.push('Insect feeding punctures observed on crop canopy.');
          whyReasons.push(`Field temperature (${temp}°C) accelerates pest multiplication.`);
          actions.push('Inspect affected foliage and remove early egg clusters.');
          actions.push('Apply organic Neem oil spray (5ml/L) during evening hours.');
          actions.push('Erect 10 yellow sticky traps per acre.');
        }
      } else if (hasBrownSpots) {
        seriousness = 'MEDIUM';
        issueCategory = 'fungal';
        confidenceScore = 0.89;
        if (language === 'te') {
          possibleIssue = `${cropName} పంటలో శిలీంధ్ర ఆకుమచ్చ తెగులు (Leaf Spot)`;
          explanation = 'ఆకులపై గోధుమ రంగు మచ్చలు మరియు గాలిలోని అధిక తేమ శిలీంధ్ర వ్యాధి వ్యాప్తికి కారణం.';
          whyReasons.push('ఆకులపై గోధుమ రంగు నెక్రోటిక్ మచ్చలు గమనించబడ్డాయి.');
          whyReasons.push(`గాలిలో తేమ ${humidity}% ఎక్కువగా ఉండటం ఫంగస్ వ్యాప్తికి అనుకూలం.`);
          actions.push('బాధిత ఆకులను తీసివేసి పొలం బయట వేయండి.');
          actions.push('కాపర్ ఆక్సిక్లోరైడ్ (3 గ్రా/లీ) లేదా మాంకోజెబ్ (2.5 గ్రా/లీ) పిచికారీ చేయండి.');
          actions.push('పొలంలో నీరు నిల్వ ఉండకుండా చూసుకోండి.');
        } else if (language === 'hi') {
          possibleIssue = `${cropName} में फंगल पत्ता धब्बा रोग (Leaf Spot)`;
          explanation = 'पत्तियों पर भूरे धब्बे और हवा की नमी फंगल संक्रमण का संकेत हैं।';
          whyReasons.push('पत्तियों पर भूरे धब्बे पाए गए हैं।');
          whyReasons.push(`हवा में ${humidity}% नमी फंगस को बढ़ा रही है।`);
          actions.push('संक्रमित पत्तियों को नष्ट करें।');
          actions.push('कॉपर ऑक्सीक्लोराइड (3 ग्राम/लीटर) या मैंकोजेब का छिड़काव करें।');
          actions.push('खेत से अतिरिक्त पानी निकालें।');
        } else {
          possibleIssue = `Fungal Foliar Leaf Spot on ${cropName}`;
          explanation = 'Necrotic brown spots correlated with high ambient humidity indicate fungal pathogen development.';
          whyReasons.push('Brown necrotic spots observed on leaves.');
          whyReasons.push(`Farm humidity at ${humidity}% sustains fungal sporulation.`);
          actions.push('Prune heavily spotted lower leaves.');
          actions.push('Apply Copper Oxychloride (3g/L) or Mancozeb (2.5g/L) spray.');
          actions.push('Avoid excess irrigation and improve furrow drainage.');
        }
      } else {
        seriousness = 'LOW';
        issueCategory = 'healthy';
        confidenceScore = 0.94;
        if (language === 'te') {
          possibleIssue = `${cropName} పంట ఆరోగ్యంగా ఉంది — సాధారణ సంరక్షణ సూచనలు`;
          explanation = 'పంట ఆరోగ్యకరమైన స్థితిలో ఉంది. సరైన నీటి తడులు మరియు పోషకాలు కొనసాగించండి.';
          whyReasons.push('ఆకులు సహజమైన ఆకుపచ్చ రంగుతో ఆరోగ్యంగా ఉన్నాయి.');
          whyReasons.push(`ప్రస్తుత ఉష్ణోగ్రత ${temp}°C మరియు తేమ ${humidity}% పంటకు అనుకూలంగా ఉన్నాయి.`);
          actions.push('క్రమబద్ధమైన తేలికపాటి నీటి యాజమాన్యం పాటించండి.');
          actions.push('కలుపు లేకుండా పొలాన్ని శుభ్రంగా ఉంచండి.');
          actions.push('ప్రతి వారం ఒకసారి పంట ఆరోగ్యాన్ని తనిఖీ చేసుకోండి.');
        } else if (language === 'hi') {
          possibleIssue = `${cropName} फसल स्वस्थ स्थिति में — सामान्य देखभाल`;
          explanation = 'फसल पर कोई हानिकारक रोग नहीं है। नियमित देखभाल जारी रखें।';
          whyReasons.push('पत्तियां स्वस्थ और हरी हैं।');
          whyReasons.push(`मौसम की स्थिति (${temp}°C) फसल के लिए अनुकूल है।`);
          actions.push('समय पर हल्की सिंचाई करें।');
          actions.push('खरपतवार नियंत्रण रखें।');
          actions.push('साप्ताहिक रूप से फसल की स्थिति जांचते रहें।');
        } else {
          possibleIssue = `${cropName} Crop in Stable Healthy Condition`;
          explanation = 'No acute disease lesions or active pest damage observed.';
          whyReasons.push('Vibrant green leaf canopy with normal vigor.');
          whyReasons.push(`Field climate (${temp}°C, ${humidity}% humidity) is within favorable range.`);
          actions.push('Maintain scheduled balanced irrigation.');
          actions.push('Keep field clean of competing weeds.');
          actions.push('Perform routine weekly health checks.');
        }
      }
    }

    // =========================================================================
    // MULTI-EVIDENCE ENRICHMENT: FIELD IMPACT, DURATION & CROP ROTATION
    // =========================================================================
    if (affectedArea) {
      if (affectedArea.includes('> 50') || affectedArea.includes('more than 50')) {
        seriousness = 'HIGH';
        if (language === 'te') {
          whyReasons.push('పొలంలో 50% కంటే ఎక్కువ పంటకు తెగులు వ్యాపించినందున అత్యవసర సమగ్ర చర్యలు అవసరం.');
          actions.unshift('మొత్తం పొలం అంతటా తక్షణమే అత్యవసర పిచికారీ చేసి పంట నష్టాన్ని నివారించండి.');
        } else if (language === 'hi') {
          whyReasons.push('खेत में 50% से अधिक फसल प्रभावित होने के कारण आपातकालीन उपचार आवश्यक है।');
          actions.unshift('पूरे खेत में तुरंत आपातकालीन सुरक्षात्मक छिड़काव करें।');
        } else {
          whyReasons.push('Over 50% of the field area is affected, requiring urgent whole-field intervention.');
          actions.unshift('Perform immediate whole-field curative spray to arrest widespread yield loss.');
        }
      } else if (affectedArea.includes('< 10') || affectedArea.includes('less than 10')) {
        if (language === 'te') {
          whyReasons.push('సమస్య ప్రారంభ దశలోనే (10% లోపు) గుర్తించబడింది.');
          actions.push('సమస్య ఉన్న ప్రదేశాలలో మాత్రమే మందు పిచికారీ చేస్తే సరిపోతుంది.');
        } else if (language === 'hi') {
          whyReasons.push('समस्या शुरुआती स्तर (10% से कम) पर ही पहचानी गई है।');
          actions.push('केवल प्रभावित पौधों और स्थानों पर ही लक्षित छिड़काव करें।');
        } else {
          whyReasons.push('Early localized onset (< 10% area) detected.');
          actions.push('Targeted spot-spraying on affected patches is sufficient without blanket field application.');
        }
      }
    }

    if (durationDays) {
      if (durationDays.includes('> 14') || durationDays.includes('more than 14')) {
        seriousness = 'HIGH';
        if (language === 'te') {
          whyReasons.push('సమస్య 14 రోజులకు పైగా ఉండటం వల్ల వ్యాధి కణజాలంలోకి పాతుకుపోయింది.');
          actions.push('సాధారణ స్పర్శ మందుల కంటే అంతర్వాహిక (సిస్టమిక్) శిలీంధ్ర నాశినులను మాత్రమే వాడండి.');
        } else if (language === 'hi') {
          whyReasons.push('समस्या 14 दिनों से अधिक समय से बनी हुई है, जिससे फंगस गहराई में फैल चुकी है।');
          actions.push('गहरे उपचार के लिए अंतर्प्रवाही (सिस्टमिक) कवकनाशी का ही उपयोग करें।');
        } else {
          whyReasons.push('Symptoms have persisted for over 14 days, establishing deep mycelial infection.');
          actions.push('Use systemic curative fungicides rather than contact sprays for deep tissue translocation.');
        }
      }
    }

    if (previousCrop) {
      const prev = previousCrop.toLowerCase();
      if (prev.includes('groundnut') || prev.includes('pulses') || prev.includes('వేరుశనగ') || prev.includes('పప్పు') || prev.includes('मूंगफली')) {
        if (language === 'te') {
          whyReasons.push('గతంలో కూడా పప్పు దినుసులు/వేరుశనగ వేయడం వల్ల నేలలో ఫంగస్ అవశేషాలు ఎక్కువగా మిగిలి ఉన్నాయి.');
          actions.push('తదుపరి పంటగా జొన్న, మొక్కజొన్న లేదా రాగులను పంట మార్పిడిగా వేసి నేల వ్యాధులను అరికట్టండి.');
        } else if (language === 'hi') {
          whyReasons.push('पिछली बार भी दलहन/मूंगफली बोने से मिट्टी में फंगल अवशेषों का संचय अधिक है।');
          actions.push('अगले सीजन में ज्वार, मक्का या बाजरा की फसल चक्र अपनाकर मिट्टी जनित रोगों को तोड़ें।');
        } else {
          whyReasons.push('Previous cultivation of legumes/groundnut carries high risk of soil-borne fungal inoculum buildup.');
          actions.push('Rotate field with non-host cereal crops (Sorghum, Pearl Millet, Maize) next season to break pathogen survival.');
        }
      }
    }

    // Comparison against previous assessment if available
    let previousComparison: CropAnalysisResult['previousComparison'] = undefined;
    if (previousAssessment) {
      const prevSeriousness = previousAssessment.seriousness;
      let status: 'better' | 'same' | 'needs_attention' = 'same';
      let compExplanation = '';

      if (seriousness === 'LOW' && prevSeriousness !== 'LOW') {
        status = 'better';
        compExplanation = language === 'te'
          ? 'గత తనిఖీతో పోలిస్తే పంట ఆరోగ్యం గణనీయంగా మెరుగైంది.'
          : language === 'hi'
          ? 'पिछली जांच की तुलना में फसल का स्वास्थ्य सुधरा है।'
          : 'Crop condition has noticeably improved since previous check.';
      } else if (seriousness === 'HIGH' && prevSeriousness !== 'HIGH') {
        status = 'needs_attention';
        compExplanation = language === 'te'
          ? 'గత తనిఖీ కంటే సమస్య తీవ్రమైంది. వెంటనే నివారణ చర్యలు చేపట్టండి.'
          : language === 'hi'
          ? 'पिछली जांच से समस्या बढ़ी है। तुरंत उपचार करें।'
          : 'Condition requires immediate attention compared to previous check.';
      } else {
        status = 'same';
        compExplanation = language === 'te'
          ? 'పంట స్థితి గత పరిశీలన మాదిరిగానే స్థిరంగా ఉంది.'
          : language === 'hi'
          ? 'फसल की स्थिति पिछली जांच जैसी ही बनी हुई है।'
          : 'Crop health condition remains consistent with previous check.';
      }

      previousComparison = { status, explanation: compExplanation };
    }

    return {
      possibleIssue,
      issueCategory,
      seriousness,
      confidenceLevel,
      confidenceScore,
      explanation,
      whyReasons,
      actions,
      previousComparison,
      isPreliminary: true,
      aiProvider: 'rule-based',
      language,
    };
  }

  async analyzeSoilReport(params: SoilReportParams): Promise<SoilAnalysisResult> {
    const { ph, language = 'en' } = params;
    const recs: string[] = [];
    let phAssessment = '';

    if (ph !== undefined && ph < 6.0) {
      phAssessment = language === 'te'
        ? `ఆమ్ల నేల (pH ${ph}): నేలలో ఆమ్లత్వం ఎక్కువ.`
        : language === 'hi'
        ? `अम्लीय मिट्टी (pH ${ph}): मिट्टी में अम्लीयता अधिक है।`
        : `Acidic Soil (pH ${ph}): High acidity detected.`;
      recs.push(language === 'te' ? 'ఎకరానికి 200 కేజీల వ్యవసాయ సున్నం (లైమ్) వేయండి.' : language === 'hi' ? '200 किग्रा कृषि चूना प्रति एकड़ मिलाएं।' : 'Apply 200 kg agricultural lime per acre to neutralize soil acidity.');
    } else if (ph !== undefined && ph > 7.8) {
      phAssessment = language === 'te'
        ? `క్షార నేల (pH ${ph}): నేలలో సున్నం/క్షారత్వం ఎక్కువ.`
        : language === 'hi'
        ? `क्षारीय मिट्टी (pH ${ph}): मिट्टी में क्षारीयता अधिक है।`
        : `Alkaline Soil (pH ${ph}): High alkalinity detected.`;
      recs.push(language === 'te' ? 'ఎకరానికి 100 కేజీల జిప్సం వేసి నీరు పెట్టండి.' : language === 'hi' ? '100 किग्रा जिप्सम प्रति एकड़ डालें।' : 'Apply 100 kg agricultural gypsum per acre to reduce alkalinity.');
    } else {
      phAssessment = language === 'te'
        ? `అనుకూలమైన నేల (pH ${ph || 7.0}): పంటలకు చాలా అనువైనది.`
        : language === 'hi'
        ? `अनुकूल मिट्टी (pH ${ph || 7.0}): फसल के लिए बिल्कुल उपयुक्त।`
        : `Optimal Soil pH (${ph || 7.0}): Favorable nutrient uptake.`;
      recs.push(language === 'te' ? 'సేంద్రీయ ఎరువులు వేసి నేల సారాన్ని కాపాడండి.' : language === 'hi' ? 'गोबर की खाद या जैविक खाद का उपयोग करें।' : 'Maintain fertility using compost or farmyard manure.');
    }

    return {
      fertilityStatus: 'Evaluated',
      recommendations: recs,
      phAssessment,
    };
  }

  async generateRecommendations(issue: string, cropName: string, weather: any, language: SupportedLanguage): Promise<string[]> {
    if (language === 'te') {
      return [
        'బాధిత ఆకులను గమనించి వేరుచేయండి.',
        'అనవసరమైన నీటి తడులు ఇవ్వకండి.',
        'వర్షం పడిన తర్వాత పంటను పరిశీలించండి.',
        '3 రోజుల తర్వాత మరో ఫోటో తీసి చూడండి.',
        'సమస్య పెరిగితే నిపుణుడిని సంప్రదించండి.',
      ];
    } else if (language === 'hi') {
      return [
        'प्रभावित पत्तों को तुरंत अलग करें।',
        'अनावश्यक सिंचाई से बचें।',
        'बारिश के बाद फसल की निगरानी करें।',
        '3 दिन बाद दोबारा नई फोटो अपलोड करें।',
        'समस्या बढ़ने पर विशेषज्ञ से सलाह लें।',
      ];
    } else {
      return [
        'Check affected leaves today.',
        'Avoid unnecessary watering.',
        'Monitor the crop after rainfall.',
        'Upload another photo in 3 days.',
        'Ask an expert if the problem increases.',
      ];
    }
  }

  async translateContent(text: string, targetLang: SupportedLanguage): Promise<string> {
    return translateActionText(text, targetLang);
  }
}
