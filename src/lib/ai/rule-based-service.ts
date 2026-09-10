import type { AIService, CropAnalysisParams, CropAnalysisResult, SoilReportParams, SoilAnalysisResult } from './ai-service.interface';
import type { SupportedLanguage } from '../i18n/types';

export class RuleBasedAIService implements AIService {
  async validateImage(imageDataUrl: string): Promise<{ isValid: boolean; reason?: string; message: string }> {
    if (!imageDataUrl || imageDataUrl.length < 500) {
      return { isValid: false, reason: 'corrupt', message: 'Image data is missing or corrupted.' };
    }
    return { isValid: true, message: 'Image accepted' };
  }

  async analyzeCrop(params: CropAnalysisParams): Promise<CropAnalysisResult> {
    const {
      cropName,
      symptoms = [],
      waterLevel,
      weatherData,
      farmLocation,
      previousAssessment,
      language = 'en',
    } = params;

    const hasBrownSpots = symptoms.includes('brownSpots') || symptoms.some(s => s.toLowerCase().includes('spot') || s.toLowerCase().includes('మచ్చ') || s.toLowerCase().includes('धब्बे'));
    const hasYellowLeaves = symptoms.includes('yellowLeaves') || symptoms.some(s => s.toLowerCase().includes('yellow') || s.toLowerCase().includes('పసుపు') || s.toLowerCase().includes('पीले'));
    const hasInsects = symptoms.includes('insects') || symptoms.some(s => s.toLowerCase().includes('insect') || s.toLowerCase().includes('పురుగు') || s.toLowerCase().includes('कीड़े'));
    const hasDrying = symptoms.includes('drying') || symptoms.some(s => s.toLowerCase().includes('dry') || s.toLowerCase().includes('ఎండి') || s.toLowerCase().includes('सूख'));
    const hasWilting = symptoms.includes('wilting') || symptoms.some(s => s.toLowerCase().includes('wilt') || s.toLowerCase().includes('వడలి') || s.toLowerCase().includes('मुरझा'));
    const hasPoorGrowth = symptoms.includes('poorGrowth') || symptoms.some(s => s.toLowerCase().includes('growth') || s.toLowerCase().includes('ఎదుగుదల') || s.toLowerCase().includes('बढ़वार'));

    const humidity = weatherData?.humidity ?? 70;
    const temp = weatherData?.temperature ?? 30;
    const rainProb = weatherData?.rainProbability ?? 20;

    let possibleIssue = '';
    let issueCategory: CropAnalysisResult['issueCategory'] = 'general' as any;
    let seriousness: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'HIGH';
    let confidenceScore = 0.85;
    let explanation = '';
    const whyReasons: string[] = [];
    const actions: string[] = [];

    // Weather impact evidence
    const isHighHumidity = humidity >= 78;
    const isWarm = temp >= 27 && temp <= 35;
    const isRainy = rainProb >= 60;

    // Decision Logic based on Crop + Symptoms + Weather + Water
    if (hasInsects) {
      seriousness = 'MEDIUM';
      issueCategory = 'pest';
      confidenceLevel = 'HIGH';
      confidenceScore = 0.88;

      if (language === 'te') {
        possibleIssue = `${cropName} పంటలో పురుగుల ఉధృతి లేదా రసం పీల్చే పురుగుల దాడి`;
        explanation = 'పంట ఆకులపై పురుగులు మరియు రంధ్రాలు లేదా గీతలు గమనించబడ్డాయి. ఇది పైరు ఎదుగుదలను దెబ్బతీస్తుంది.';
        whyReasons.push('మీరు పేర్కొన్న లక్షణాలలో పురుగులు లేదా కీటకాల ఉనికి కనిపించింది.');
        if (temp > 32) whyReasons.push(`మీ పొలంలో ఉష్ణోగ్రత ${temp}°C ఉండటం వల్ల పురుగుల సంతతి వేగంగా పెరుగుతుంది.`);
        actions.push('బాధిత ఆకులను గమనించి, ప్రారంభ దశలో ఉంటే తీసివేసి నాశనం చేయండి.');
        actions.push('వేప నూనె (నీమ్ ఆయిల్ 5 మి.లీ/లీటరు నీటికి) సాయంత్రం వేళల్లో పిచికారీ చేయండి.');
        actions.push('ఎల్లో స్టిక్కీ ట్రాప్స్ (పసుపు రంగు జిగురు అట్టలు) ఎకరాకు 10 ఏర్పాటు చేయండి.');
        actions.push('సమస్య ఎక్కువగా ఉంటే సమీపంలోని వ్యవసాయ అధికారి లేదా KVK నిపుణులను సంప్రదించండి.');
      } else if (language === 'hi') {
        possibleIssue = `${cropName} में कीट या रस चूसक कीड़ों का प्रकोप`;
        explanation = 'फसल की पत्तियों पर कीड़ों के लक्षण व छेद देखे गए हैं। यह पौधे की बढ़वार को रोक सकता है।';
        whyReasons.push('आपने कीटों या सुंडी की मौजूदगी के लक्षण दर्ज किए हैं।');
        if (temp > 32) whyReasons.push(`खेत का तापमान ${temp}°C होने से कीट तेजी से पनप सकते हैं।`);
        actions.push('प्रभावित पत्तों को छांटकर नष्ट कर दें।');
        actions.push('नीम के तेल (5 मिली प्रति लीटर पानी) का शाम के समय छिड़काव करें।');
        actions.push('खेत में पीले चिपचिपे कार्ड (येलो स्टिकी ट्रैप) लगाएं।');
        actions.push('यदि प्रकोप बढ़े तो स्थानीय कृषि विशेषज्ञ से संपर्क करें।');
      } else {
        possibleIssue = `Insect Pest Infestation on ${cropName}`;
        explanation = 'Visible signs of insect activity or leaf damage were noted. Pests can severely retard vegetative growth if unchecked.';
        whyReasons.push('Insect or pest damage was reported in field symptoms.');
        if (temp > 32) whyReasons.push(`Field temperature (${temp}°C) accelerates pest reproductive cycles.`);
        actions.push('Inspect affected leaves today and manually destroy early egg masses or caterpillars.');
        actions.push('Apply organic Neem oil spray (5ml per litre of water) during evening hours.');
        actions.push('Erect 8-10 yellow sticky traps per acre to monitor sucking pests.');
        actions.push('Consult an agricultural extension officer if pest counts increase.');
      }
    } else if (hasBrownSpots && (isHighHumidity || waterLevel === 'more')) {
      seriousness = 'MEDIUM';
      issueCategory = 'fungal';
      confidenceLevel = 'HIGH';
      confidenceScore = 0.90;

      if (language === 'te') {
        possibleIssue = `${cropName} పంటలో శిలీంధ్ర తెగులు (ఆకుమచ్చ లేదా బ్లైట్ తెగులు)`;
        explanation = 'ఆకులపై గోధుమ రంగు మచ్చలు మరియు అధిక గాలి తేమ శిలీంధ్ర వ్యాధి వ్యాప్తికి అనుకూలంగా ఉన్నాయి.';
        whyReasons.push('పంట ఆకులపై గోధుమ రంగు మచ్చలు గమనించబడ్డాయి.');
        whyReasons.push(`మీ పొలంలో గాలిలో తేమ ${humidity}% ఎక్కువగా ఉంది, ఇది శిలీంధ్రం వ్యాపించడానికి దోహదం చేస్తుంది.`);
        if (waterLevel === 'more') whyReasons.push('మీరు సాధారణం కంటే ఎక్కువ నీరు అందించడం వల్ల కూడా తేమ పెరిగింది.');
        actions.push('బాధిత ఆకులను తొలగించి పొలం బయట వేయండి.');
        actions.push('పొలంలో నీరు నిల్వ ఉండకుండా తక్షణమే అదనపు నీటిని బయటకు తీయండి.');
        actions.push('వర్షం సూచన ఉంటే రసాయన స్ప్రేలను వాయిదా వేయండి.');
        actions.push('3 రోజుల తర్వాత మళ్లీ ఒక కొత్త ఫోటో తీసి పరిశీలించండి.');
      } else if (language === 'hi') {
        possibleIssue = `${cropName} में फफूंद जनित पत्ता धब्बा या झुलसा (Blight)`;
        explanation = 'पत्तियों पर भूरे धब्बे और हवा में अत्यधिक नमी फंगल संक्रमण के प्रसार को बढ़ावा दे रहे हैं।';
        whyReasons.push('फसल के पत्तों पर भूरे धब्बे दर्ज किए गए हैं।');
        whyReasons.push(`खेत में हवा की नमी ${humidity}% अधिक है, जिससे फफूंद तेजी से फैलती है।`);
        if (waterLevel === 'more') whyReasons.push('सामान्य से अधिक सिंचाई करने से नमी और बढ़ गई है।');
        actions.push('संक्रमित पत्तों को तुरंत हटा दें।');
        actions.push('खेत से अतिरिक्त पानी की निकासी सुनिश्चित करें।');
        actions.push('बारिश की संभावना होने पर तुरंत छिड़काव न करें।');
        actions.push('3 दिन बाद दोबारा नई फोटो लेकर स्थिति जांचें।');
      } else {
        possibleIssue = `Fungal Leaf Spot or Blight on ${cropName}`;
        explanation = 'Brown spots correlated with high environmental humidity indicate fungal pathogen proliferation.';
        whyReasons.push('Brown spots observed on crop leaves.');
        whyReasons.push(`Farm humidity is high at ${humidity}%, creating ideal conditions for fungal spore germination.`);
        if (waterLevel === 'more') whyReasons.push('Excess irrigation reported, maintaining wet micro-climate.');
        actions.push('Check affected leaves today and prune heavily spotted foliage.');
        actions.push('Avoid unnecessary watering and drain any standing water.');
        actions.push('Monitor the crop closely after rainfall.');
        actions.push('Upload another photo in 3 days to track recovery.');
      }
    } else if (hasYellowLeaves && waterLevel === 'less') {
      seriousness = 'LOW';
      issueCategory = 'water_stress';
      confidenceLevel = 'HIGH';
      confidenceScore = 0.86;

      if (language === 'te') {
        possibleIssue = `${cropName} పంటకు నీటి కొరత (తేమ ఒత్తిడి)`;
        explanation = 'ఆకులు పసుపు రంగులోకి మారడం మరియు తక్కువ నీటి తడులు ఇవ్వడం వల్ల పంట నీటి ఎద్దడిని ఎదుర్కొంటోంది.';
        whyReasons.push('ఆకులు పసుపు రంగులోకి మారడం గుర్తించబడింది.');
        whyReasons.push('మీరు సాధారణం కంటే తక్కువ నీరు ఇచ్చినట్లు తెలిపారు.');
        if (temp >= 33) whyReasons.push(`పొలంలో ఉష్ణోగ్రత ${temp}°C ఎక్కువగా ఉండటం వల్ల నేల త్వరగా ఎండిపోతుంది.`);
        actions.push('సాయంత్రం లేదా ఉదయం వేళల్లో నేలకు సరిపడా తేలికపాటి తడి ఇవ్వండి.');
        actions.push('ఎండ తీవ్రంగా ఉన్న మధ్యాహ్న సమయాల్లో నీరు పెట్టవద్దు.');
        actions.push('చెట్ల మొదళ్ల వద్ద తేమ నిలిచి ఉండేలా ఆకుల మల్చింగ్ చేయండి.');
        actions.push('నీరు పెట్టిన 2 రోజుల తర్వాత ఆకుల రంగును గమనించండి.');
      } else if (language === 'hi') {
        possibleIssue = `${cropName} में पानी की कमी (नमी का तनाव)`;
        explanation = 'पत्तियों का पीला पड़ना और कम सिंचाई संकेत देते हैं कि फसल पानी की कमी से जूझ रही है।';
        whyReasons.push('पत्तियों में पीलापन देखा गया है।');
        whyReasons.push('आपने सामान्य से कम पानी देने की जानकारी दी है।');
        if (temp >= 33) whyReasons.push(`तापमान ${temp}°C होने से मिट्टी में नमी तेजी से घट रही है।`);
        actions.push('शाम या सुबह के समय हल्की सिंचाई तुरंत करें।');
        actions.push('दोपहर की तेज धूप में सिंचाई करने से बचें।');
        actions.push('नमी संरक्षण के लिए पौधों के पास मल्चिंग करें।');
        actions.push('सिंचाई के 2 दिन बाद दोबारा पत्ते की स्थिति जांचें।');
      } else {
        possibleIssue = `Moisture Stress & Under-Irrigation on ${cropName}`;
        explanation = 'Yellowing of lower leaves along with lower water frequency indicates acute soil moisture deficit.';
        whyReasons.push('Yellowing leaves reported on the crop.');
        whyReasons.push('Irrigation was noted as less than usual.');
        if (temp >= 33) whyReasons.push(`Warm temperature (${temp}°C) accelerates evapotranspiration.`);
        actions.push('Provide light irrigation during cooler evening hours.');
        actions.push('Avoid watering in peak afternoon sunlight.');
        actions.push('Conserve moisture by maintaining soil mulch around crop roots.');
        actions.push('Observe leaf turgor and color 48 hours after watering.');
      }
    } else if (hasWilting && waterLevel === 'more') {
      seriousness = 'HIGH';
      issueCategory = 'fungal';
      confidenceLevel = 'HIGH';
      confidenceScore = 0.89;

      if (language === 'te') {
        possibleIssue = `${cropName} పంటలో వేరుకుళ్లు లేదా నీటి నిల్వ వల్ల వడలడం (Root Rot / Waterlogging)`;
        explanation = 'ఎక్కువ నీరు ఇవ్వడం వల్ల వేర్లకు గాలి అందక మొక్కలు వడలిపోతున్నాయి. ఇది వేరుకుళ్లు తెగులుకు దారితీయవచ్చు.';
        whyReasons.push('మొక్క వడలిపోవడం గమనించబడింది.');
        whyReasons.push('సాధారణం కంటే ఎక్కువ నీరు పెట్టడం వల్ల వేర్ల వద్ద తడి నిల్వ ఉంది.');
        actions.push('తక్షణమే నీటి తడులు ఆపివేయండి.');
        actions.push('మడిలో నిలిచిన నీటిని కాలువల ద్వారా బయటకు పంపండి.');
        actions.push('మట్టి ఆరే వరకు ఎలాంటి ఎరువులు లేదా రసాయనాలు వేయకండి.');
        actions.push('సమస్య తగ్గకపోతే తక్షణమే వ్యవసాయ నిపుణుడిని సంప్రదించండి.');
      } else if (language === 'hi') {
        possibleIssue = `${cropName} में जड़ गलन या जलभराव से मुरझाना (Root Rot / Waterlogging)`;
        explanation = 'अत्यधिक पानी देने से जड़ों को ऑक्सीजन नहीं मिल रही है, जिससे पौधे मुरझा रहे हैं।';
        whyReasons.push('पौधे के मुरझाने के लक्षण मिले हैं।');
        whyReasons.push('सामान्य से अधिक पानी दिया गया है जिससे जलभराव हुआ है।');
        actions.push('तुरंत सिंचाई रोक दें।');
        actions.push('खेत में जमा पानी को तुरंत बाहर निकालें।');
        actions.push('मिट्टी सूखने तक कोई भी उर्वरक न डालें।');
        actions.push('यदि सुधार न हो तो तुरंत विशेषज्ञ की सलाह लें।');
      } else {
        possibleIssue = `Root Rot or Waterlogging-Induced Wilt on ${cropName}`;
        explanation = 'Wilting occurring under saturated soil indicates root asphyxiation or fungal root rot.';
        whyReasons.push('Crop wilting observed.');
        whyReasons.push('Excess irrigation reported, causing oxygen starvation at root zones.');
        actions.push('Cease irrigation immediately.');
        actions.push('Ensure complete surface drainage from root zones.');
        actions.push('Withhold fertilizers until the soil surface dries.');
        actions.push('Request an expert review if wilting persists beyond 48 hours.');
      }
    } else {
      // Default balanced assessment
      seriousness = 'LOW';
      issueCategory = 'general';
      confidenceLevel = 'MEDIUM';
      confidenceScore = 0.78;

      if (language === 'te') {
        possibleIssue = `${cropName} పంట సాధారణ స్థితిలో ఉంది — ప్రారంభ జాగ్రత్తలు అవసరం`;
        explanation = 'పంటలో పెద్దగా ప్రమాదకరమైన తెగుళ్లు కనిపించలేదు. సాధారణ నిర్వహణ పాటిస్తే సరిపోతుంది.';
        whyReasons.push('తీవ్రమైన తెగులు లక్షణాలు ఏవీ నమోదు కాలేదు.');
        whyReasons.push(`మీ పొలం వద్ద వాతావరణం (${temp}°C, తేమ ${humidity}%) ప్రస్తుతం సాధారణంగా ఉంది.`);
        actions.push('పొలాన్ని క్రమం తప్పకుండా పరిశీలించండి.');
        actions.push('సరిపడా నీటి తడులను సమయానికి అందించండి.');
        actions.push('3 రోజుల తర్వాత మార్పులు కనిపిస్తే మరో ఫోటో తీసి తనిఖీ చేయండి.');
      } else if (language === 'hi') {
        possibleIssue = `${cropName} सामान्य स्थिति में — नियमित देखभाल आवश्यक`;
        explanation = 'फसल में कोई गंभीर बीमारी के लक्षण नहीं दिखे हैं। सामान्य देखरेख पर्याप्त है।';
        whyReasons.push('कोई गंभीर बीमारी के लक्षण नहीं मिले हैं।');
        whyReasons.push(`खेत का मौसम (${temp}°C, नमी ${humidity}%) वर्तमान में अनुकूल है।`);
        actions.push('नियमित रूप से खेत का निरीक्षण करते रहें।');
        actions.push('समय पर आवश्यकतानुसार संतुलित सिंचाई करें।');
        actions.push('3 दिन बाद स्थिति पर नजर रखने के लिए नई फोटो लें।');
      } else {
        possibleIssue = `${cropName} In Stable Condition — Routine Monitoring Advised`;
        explanation = 'No severe pathological symptoms were identified. Standard agronomic management is recommended.';
        whyReasons.push('No acute disease symptoms reported.');
        whyReasons.push(`Current farm weather (${temp}°C, ${humidity}% humidity) is within manageable range.`);
        actions.push('Continue routine field scouting every 2 to 3 days.');
        actions.push('Maintain regular balanced irrigation schedule.');
        actions.push('Re-check with a new photo if unexpected spots or wilting appear.');
      }
    }

    // Historical comparison calculation
    let previousComparison: CropAnalysisResult['previousComparison'] = undefined;
    if (previousAssessment) {
      const prevSeriousness = previousAssessment.seriousness;
      let status: 'better' | 'same' | 'needs_attention' = 'same';
      let compExp = '';

      if (prevSeriousness === 'HIGH' && seriousness !== 'HIGH') {
        status = 'better';
        compExp = language === 'te'
          ? 'గత తనిఖీలో తీవ్రమైన ప్రమాదం ఉంది, ప్రస్తుతం పరిస్థితి మెరుగైంది.'
          : language === 'hi'
          ? 'पिछली जांच में उच्च जोखिम था, वर्तमान में स्थिति में सुधार हुआ है।'
          : 'Risk has decreased compared to your previous assessment.';
      } else if (prevSeriousness === 'LOW' && (seriousness === 'MEDIUM' || seriousness === 'HIGH')) {
        status = 'needs_attention';
        compExp = language === 'te'
          ? 'గత తనిఖీ కంటే ప్రమాద స్థాయి పెరిగింది, జాగ్రత్తలు పాటించండి.'
          : language === 'hi'
          ? 'पिछली जांच की तुलना में जोखिम बढ़ा है, सावधानी बरतें।'
          : 'Risk level has increased since your last inspection; requires attention.';
      } else {
        status = 'same';
        compExp = language === 'te'
          ? 'గత తనిఖీతో పోల్చితే పరిస్థితి స్థిరంగా ఉంది.'
          : language === 'hi'
          ? 'पिछली जांच की तुलना में स्थिति स्थिर है।'
          : 'Crop condition is steady compared to previous inspection.';
      }

      previousComparison = { status, explanation: compExp };
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
    const { ph = 6.8, language = 'en' } = params;
    let phAssessment = '';
    const recs: string[] = [];

    if (ph < 6.0) {
      phAssessment = language === 'te'
        ? `ఆమ్ల నేల (pH ${ph}): నేలలో ఆమ్లత్వం ఎక్కువ.`
        : language === 'hi'
        ? `अम्लीय मिट्टी (pH ${ph}): मिट्टी में अम्लीयता अधिक है।`
        : `Acidic Soil (pH ${ph}): High acidity detected.`;
      recs.push(language === 'te' ? 'ఎకరానికి 200 కేజీల వ్యవసాయ సున్నం (లైమ్) వేయండి.' : language === 'hi' ? '200 किग्रा कृषि चूना प्रति एकड़ मिलाएं।' : 'Apply 200 kg agricultural lime per acre.');
    } else if (ph > 7.8) {
      phAssessment = language === 'te'
        ? `క్షార నేల (pH ${ph}): నేలలో సున్నం/క్షారత్వం ఎక్కువ.`
        : language === 'hi'
        ? `क्षारीय मिट्टी (pH ${ph}): मिट्टी में क्षारीयता अधिक है।`
        : `Alkaline Soil (pH ${ph}): High alkalinity detected.`;
      recs.push(language === 'te' ? 'ఎకరానికి 100 కేజీల జిప్సం వేసి నీరు పెట్టండి.' : language === 'hi' ? '100 किग्रा जिप्सम प्रति एकड़ डालें।' : 'Apply 100 kg agricultural gypsum per acre.');
    } else {
      phAssessment = language === 'te'
        ? `అనుకూలమైన నేల (pH ${ph}): పంటలకు చాలా అనువైనది.`
        : language === 'hi'
        ? `अनुकूल मिट्टी (pH ${ph}): फसल के लिए बिल्कुल उपयुक्त।`
        : `Optimal Soil pH (${ph}): Favorable nutrient uptake.`;
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
    return text;
  }
}
