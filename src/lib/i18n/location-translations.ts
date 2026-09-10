import type { SupportedLanguage } from './types';

// ---------------------------------------------------------------------------
// Comprehensive Dictionary of Indian States, Districts, Mandals, and Towns
// ---------------------------------------------------------------------------

interface LocationEntry {
  en: string;
  te: string;
  hi: string;
}

const LOCATIONS: LocationEntry[] = [
  // --- States ---
  { en: 'Andhra Pradesh', te: 'ఆంధ్ర ప్రదేశ్', hi: 'आंध्र प्रदेश' },
  { en: 'Telangana', te: 'తెలంగాణ', hi: 'तेलंगाना' },
  { en: 'Tamil Nadu', te: 'తమిళనాడు', hi: 'तमिलनाडु' },
  { en: 'Karnataka', te: 'కర్ణాటక', hi: 'कर्नाटक' },
  { en: 'Kerala', te: 'కేరళ', hi: 'केरल' },
  { en: 'Maharashtra', te: 'మహారాష్ట్ర', hi: 'महाराष्ट्र' },
  { en: 'Odisha', te: 'ఒడిశా', hi: 'ओडिशा' },
  { en: 'Gujarat', te: 'గుజరాత్', hi: 'गुजरात' },
  { en: 'Rajasthan', te: 'రాజస్థాన్', hi: 'राजस्थान' },
  { en: 'Madhya Pradesh', te: 'మధ్యప్రదేశ్', hi: 'मध्य प्रदेश' },
  { en: 'Uttar Pradesh', te: 'ఉత్తరప్రదేశ్', hi: 'उत्तर प्रदेश' },
  { en: 'Punjab', te: 'పంజాబ్', hi: 'पंजाब' },
  { en: 'Haryana', te: 'హర్యానా', hi: 'हरियाणा' },
  { en: 'Bihar', te: 'బీహార్', hi: 'बिहार' },
  { en: 'West Bengal', te: 'పశ్చిమ బెంగాల్', hi: 'पश्चिम बंगाल' },
  { en: 'Chhattisgarh', te: 'ఛత్తీస్‌గఢ్', hi: 'छत्तीसगढ़' },
  { en: 'Jharkhand', te: 'జార్ఖండ్', hi: 'झारखंड' },

  // --- Andhra Pradesh Districts & Major Cities ---
  { en: 'West Godavari', te: 'పశ్చిమ గోదావరి', hi: 'पश्चिम गोदावरी' },
  { en: 'East Godavari', te: 'తూర్పు గోదావరి', hi: 'पूर्व गोदावरी' },
  { en: 'Krishna', te: 'కృష్ణా', hi: 'कृष्णा' },
  { en: 'Guntur', te: 'గుంటూరు', hi: 'गुंटूर' },
  { en: 'Prakasam', te: 'ప్రకాశం', hi: 'प्रकाशम' },
  { en: 'Nellore', te: 'నెల్లూరు', hi: 'नेल्लोर' },
  { en: 'Sri Potti Sriramulu Nellore', te: 'శ్రీ పొట్టి శ్రీరాములు నెల్లూరు', hi: 'श्री पोट्टी श्रीरामुलु नेल्लोर' },
  { en: 'Chittoor', te: 'చిత్తూరు', hi: 'चित्तूर' },
  { en: 'Kadapa', te: 'కడప', hi: 'कडपा' },
  { en: 'YSR Kadapa', te: 'వైఎస్ఆర్ కడప', hi: 'वाईएसआर कडपा' },
  { en: 'Kurnool', te: 'కర్నూలు', hi: 'कर्नूल' },
  { en: 'Anantapur', te: 'అనంతపురం', hi: 'अनंतपुर' },
  { en: 'Visakhapatnam', te: 'విశాఖపట్నం', hi: 'विशाखापट्टनम' },
  { en: 'Vizag', te: 'వైజాగ్', hi: 'विजाग' },
  { en: 'Vizianagaram', te: 'విజయనగరం', hi: 'विजयनगरम' },
  { en: 'Srikakulam', te: 'శ్రీకాకుళం', hi: 'श्रीकाकुलम' },
  { en: 'Eluru', te: 'ఏలూరు', hi: 'एलुरु' },
  { en: 'Kakinada', te: 'కాకినాడ', hi: 'काकीनाडा' },
  { en: 'Dr. B.R. Ambedkar Konaseema', te: 'డా. బి.ఆర్. అంబేద్కర్ కోనసీమ', hi: 'डॉ. बी.आर. अंबेडकर कोनासीमा' },
  { en: 'Konaseema', te: 'కోనసీమ', hi: 'कोनासीमा' },
  { en: 'Palnadu', te: 'పల్నాడు', hi: 'पलनाडु' },
  { en: 'Bapatla', te: 'బాపట్ల', hi: 'बापटला' },
  { en: 'Nandyal', te: 'నంద్యాల', hi: 'नंद्याल' },
  { en: 'Tirupati', te: 'తిరుపతి', hi: 'तिरुपति' },
  { en: 'Alluri Sitharama Raju', te: 'అల్లూరి సీతారామరాజు', hi: 'अल्लूरी सीताराम राजू' },
  { en: 'Parvathipuram Manyam', te: 'పార్వతీపురం మన్యం', hi: 'पार्वतीपुरम मान्यम' },
  { en: 'Anakapalli', te: 'అనకాపల్లి', hi: 'अनकापल्ली' },
  { en: 'Sri Sathya Sai', te: 'శ్రీ సత్యసాయి', hi: 'श्री सत्य साई' },
  { en: 'Annamayya', te: 'అన్నమయ్య', hi: 'अन्नमय्या' },
  { en: 'NTR', te: 'ఎన్టీఆర్', hi: 'एनटीआर' },

  // --- Andhra Pradesh Towns & Localities ---
  { en: 'Sitarampuram', te: 'సీతారాంపురం', hi: 'सीतारामपुरम' },
  { en: 'Seetharampuram', te: 'సీతారాంపురం', hi: 'सीतारामपुरम' },
  { en: 'Bhimavaram', te: 'భీమవరం', hi: 'भीमवरम' },
  { en: 'Tadepalligudem', te: 'తాడేపల్లిగూడెం', hi: 'ताडेपल्लिगुडेम' },
  { en: 'Tanuku', te: 'తణుకు', hi: 'तणुकु' },
  { en: 'Palakollu', te: 'పాలకొల్లు', hi: 'पालकोल्लु' },
  { en: 'Narsapur', te: 'నరసాపురం', hi: 'नरसपुरम' },
  { en: 'Narasapuram', te: 'నరసాపురం', hi: 'नरसपुरम' },
  { en: 'Jangareddigudem', te: 'జంగారెడ్డిగూడెం', hi: 'जंगारेड्डीगुडेम' },
  { en: 'Kovvur', te: 'కొవ్వూరు', hi: 'कोव्वूर' },
  { en: 'Nidadavole', te: 'నిడదవోలు', hi: 'निडदवोलु' },
  { en: 'Rajahmundry', te: 'రాజమండ్రి', hi: 'राजमुंदरी' },
  { en: 'Rajamahendravaram', te: 'రాజమహేంద్రవరం', hi: 'राजमहेंद्रवरम' },
  { en: 'Vijayawada', te: 'విజయవాడ', hi: 'विजयवाड़ा' },
  { en: 'Amaravati', te: 'అమరావతి', hi: 'अमरावती' },
  { en: 'Mangalagiri', te: 'మంగళగిరి', hi: 'मंगलगिरि' },
  { en: 'Tenali', te: 'తెనాలి', hi: 'तेनाली' },
  { en: 'Machilipatnam', te: 'మచిలీపట్నం', hi: 'मछलीपट्टनम' },
  { en: 'Gudivada', te: 'గుడివాడ', hi: 'गुडिवाडा' },
  { en: 'Ongole', te: 'ఒంగోలు', hi: 'ओंगोल' },
  { en: 'Chirala', te: 'చీరాల', hi: 'चीराला' },
  { en: 'Markapur', te: 'మార్కాపురం', hi: 'मारकापुर' },
  { en: 'Madanapalle', te: 'మదనపల్లె', hi: 'मदनपल्ले' },
  { en: 'Proddatur', te: 'ప్రొద్దుటూరు', hi: 'प्रोद्दातुर' },
  { en: 'Hindupur', te: 'హిందూపురం', hi: 'हिंदुपुर' },
  { en: 'Dharmavaram', te: 'ధర్మవరం', hi: 'धर्मावरम' },
  { en: 'Adoni', te: 'ఆదోని', hi: 'आदोनी' },
  { en: 'Yemmiganur', te: 'ఎమ్మిగనూరు', hi: 'येम्मिगनूर' },
  { en: 'Amalapuram', te: 'అమలాపురం', hi: 'अमलापुरम' },
  { en: 'Samalkot', te: 'సామర్లకోట', hi: 'सामलकोट' },
  { en: 'Samalkota', te: 'సామర్లకోట', hi: 'सामलकोट' },
  { en: 'Peddapuram', te: 'పెద్దాపురం', hi: 'पेद्दापुरम' },
  { en: 'Pithapuram', te: 'పిఠాపురం', hi: 'पिठापुरम' },
  { en: 'Tuni', te: 'తుని', hi: 'तुनी' },
  { en: 'Mandapeta', te: 'మండపేట', hi: 'मंडपेटा' },
  { en: 'Ramachandrapuram', te: 'రామచంద్రపురం', hi: 'रामचंद्रपुरम' },
  { en: 'Ravulapalem', te: 'రావులపాలెం', hi: 'रावुलापालेम' },
  { en: 'Gannavaram', te: 'గన్నవరం', hi: 'गन्नावरम' },
  { en: 'Kandukur', te: 'కందుకూరు', hi: 'कंदुकुर' },
  { en: 'Kavali', te: 'కావలి', hi: 'कावली' },
  { en: 'Gudur', te: 'గూడూరు', hi: 'गूडूर' },
  { en: 'Sullurpeta', te: 'సూళ్లూరుపేట', hi: 'सुल्लूरपेटा' },
  { en: 'Naidupeta', te: 'నాయుడుపేట', hi: 'नायडूुपेटा' },
  { en: 'Rayachoti', te: 'రాయచోటి', hi: 'रायचोटी' },
  { en: 'Pulivendula', te: 'పులివెందుల', hi: 'पुलिवेंदुला' },
  { en: 'Badvel', te: 'బద్వేల్', hi: 'बद्वेल' },
  { en: 'Jammalamadugu', te: 'జమ్మలమడుగు', hi: 'जम्मलमडुगु' },
  { en: 'Panyam', te: 'పాన్యం', hi: 'पान्याम' },
  { en: 'Dhone', te: 'డోన్', hi: 'डोन' },
  { en: 'Allagadda', te: 'ఆళ్లగడ్డ', hi: 'आल्लागड्डा' },
  { en: 'Narasaraopet', te: 'నరసరావుపేట', hi: 'नरसरावपेटा' },
  { en: 'Chilakaluripet', te: 'చిలకలూరిపేట', hi: 'चिलकलूरिपेटा' },
  { en: 'Sattenapalle', te: 'సత్తెనపల్లి', hi: 'सत्तेनापल्ली' },
  { en: 'Macherla', te: 'మాచర్ల', hi: 'माचेर्ला' },
  { en: 'Vinukonda', te: 'వినుకొండ', hi: 'विनुकोंडा' },
  { en: 'Repalle', te: 'రేపల్లె', hi: 'रेपल्ले' },

  // --- Telangana Districts & Major Towns ---
  { en: 'Hyderabad', te: 'హైదరాబాద్', hi: 'हैदराबाद' },
  { en: 'Secunderabad', te: 'సికింద్రాబాద్', hi: 'सिकंदराबाद' },
  { en: 'Rangareddy', te: 'రంగారెడ్డి', hi: 'रंगारेड्डी' },
  { en: 'Medchal-Malkajgiri', te: 'మేడ్చల్-మల్కాజిగిరి', hi: 'मेडचल-मलकाजगिरि' },
  { en: 'Sangareddy', te: 'సంగారెడ్డి', hi: 'संगारेड्डी' },
  { en: 'Mahabubnagar', te: 'మహబూబ్‌నగర్', hi: 'महबूबनगर' },
  { en: 'Nalgonda', te: 'నల్గొండ', hi: 'नलगोंडा' },
  { en: 'Suryapet', te: 'సూర్యాపేట', hi: 'सूर्यापेट' },
  { en: 'Miryalaguda', te: 'మిర్యాలగూడ', hi: 'मिर्यालगुडा' },
  { en: 'Warangal', te: 'వరంగల్', hi: 'वारंगल' },
  { en: 'Hanamkonda', te: 'హనుమకొండ', hi: 'हनुमकोंडा' },
  { en: 'Khammam', te: 'ఖమ్మం', hi: 'खम्मम' },
  { en: 'Karimnagar', te: 'కరీంనగర్', hi: 'करीमनगर' },
  { en: 'Nizamabad', te: 'నిజామాబాద్', hi: 'निजामाबाद' },
  { en: 'Adilabad', te: 'ఆదిలాబాద్', hi: 'आदिलाबाद' },
  { en: 'Siddipet', te: 'సిద్దిపేట', hi: 'सिद्दीपेट' },
  { en: 'Jangaon', te: 'జనగామ', hi: 'जनगांव' },
  { en: 'Jagtial', te: 'జగిత్యాల', hi: 'जगतियाल' },
  { en: 'Mancherial', te: 'మంచిర్యాల', hi: 'मंचेरियाल' },
  { en: 'Nirmal', te: 'నిర్మల్', hi: 'निर्मल' },
  { en: 'Kamareddy', te: 'కామారెడ్డి', hi: 'कामारेड्डी' },
  { en: 'Bodhan', te: 'బోధన్', hi: 'बोधन' },
  { en: 'Armoor', te: 'ఆర్మూర్', hi: 'आर्मूर' },
  { en: 'Gadwal', te: 'గద్వాల్', hi: 'गडवाल' },
  { en: 'Wanaparthy', te: 'వనపర్తి', hi: 'वनपर्थी' },
  { en: 'Kothagudem', te: 'కొత్తగూడెం', hi: 'कोठागुडेम' },
  { en: 'Sircilla', te: 'సిరిసిల్ల', hi: 'सिरसिल्ला' },
  { en: 'Peddapalli', te: 'పెద్దపల్లి', hi: 'पेद्दापल्ली' },
  { en: 'Medak', te: 'మెదక్', hi: 'मेदक' },
  { en: 'Vikarabad', te: 'వికారాబాద్', hi: 'विकाराबाद' },
  { en: 'Zaheerabad', te: 'జహీరాబాద్', hi: 'जहीराबाद' },
  { en: 'Tandur', te: 'తాండూరు', hi: 'तांडूर' },

  // --- Generic Place Terms ---
  { en: 'Local Area', te: 'స్థానిక ప్రాంతం', hi: 'स्थानीय क्षेत्र' },
  { en: 'Farm Location', te: 'పొలం స్థానం', hi: 'खेत का स्थान' },
  { en: 'My Farm', te: 'నా పొలం', hi: 'मेरा खेत' },
  { en: 'Select Farm', te: 'పొలాన్ని ఎంచుకోండి', hi: 'खेत चुनें' },
];

// ---------------------------------------------------------------------------
// Agricultural Farm Suffixes & Keywords
// ---------------------------------------------------------------------------
const FARM_KEYWORDS: { enRegex: RegExp; te: string; hi: string }[] = [
  { enRegex: /\b(rice|paddy)\s+(land|field)\b/gi, te: 'వరి పొలం', hi: 'धान का खेत' },
  { enRegex: /\b(groundnut|peanut)\s+(land|field)\b/gi, te: 'వేరుశనగ చేను', hi: 'मूंगफली का खेत' },
  { enRegex: /\b(cotton)\s+(land|field)\b/gi, te: 'పత్తి చేను', hi: 'कपास का खेत' },
  { enRegex: /\b(chilli|chili)\s+(land|field)\b/gi, te: 'మిర్చి తోట', hi: 'मिर्च का खेत' },
  { enRegex: /\b(tomato)\s+(land|field)\b/gi, te: 'టమోటా తోట', hi: 'टमाटर का खेत' },
  { enRegex: /\b(maize|corn)\s+(land|field)\b/gi, te: 'మొక్కజొన్న చేను', hi: 'मक्के का खेत' },
  { enRegex: /\b(wheat)\s+(land|field)\b/gi, te: 'గోధుమ చేను', hi: 'गेहूं का खेत' },
  { enRegex: /\b(sugarcane)\s+(land|field)\b/gi, te: 'చెరకు తోట', hi: 'गन्ने का खेत' },
  { enRegex: /\b(vegetable|veggie)\s+(land|field|garden)\b/gi, te: 'కూరగాయల తోట', hi: 'सब्जी का खेत' },
  { enRegex: /\b(rice|paddy)\b/gi, te: 'వరి', hi: 'धान' },
  { enRegex: /\b(groundnut|peanut)\b/gi, te: 'వేరుశనగ', hi: 'मूंगफली' },
  { enRegex: /\b(cotton)\b/gi, te: 'పత్తి', hi: 'कपास' },
  { enRegex: /\b(chilli|chili)\b/gi, te: 'మిర్చి', hi: 'मिर्च' },
  { enRegex: /\b(tomato)\b/gi, te: 'టమోటా', hi: 'टमाटर' },
  { enRegex: /\b(maize|corn)\b/gi, te: 'మొక్కజొన్న', hi: 'मक्का' },
  { enRegex: /\b(land|field)\b/gi, te: 'పొలం', hi: 'खेत' },
  { enRegex: /\b(farm)\b/gi, te: 'తోట', hi: 'फार्म' },
  { enRegex: /\b(garden)\b/gi, te: 'తోట', hi: 'बगीचा' },
];

// Common town suffixes for intelligent phonetic transliteration
const TOWN_SUFFIX_RULES: { enRegex: RegExp; te: string; hi: string }[] = [
  { enRegex: /puram$/i, te: 'పురం', hi: 'पुरम' },
  { enRegex: /palle$/i, te: 'పల్లె', hi: 'पल्ले' },
  { enRegex: /palli$/i, te: 'పల్లి', hi: 'पल्ली' },
  { enRegex: /gudem$/i, te: 'గూడెం', hi: 'गुडेम' },
  { enRegex: /varam$/i, te: 'వరం', hi: 'वरम' },
  { enRegex: /cheruvu$/i, te: 'చెరువు', hi: 'चेरुवू' },
  { enRegex: /konda$/i, te: 'కొండ', hi: 'कोंडा' },
  { enRegex: /kota$/i, te: 'కోట', hi: 'कोटा' },
  { enRegex: /padu$/i, te: 'పాడు', hi: 'पाडु' },
  { enRegex: /peta$/i, te: 'పేట', hi: 'पेटा' },
  { enRegex: /pet$/i, te: 'పేట', hi: 'पेट' },
  { enRegex: /nagar$/i, te: 'నగర్', hi: 'नगर' },
  { enRegex: /vada$/i, te: 'వాడ', hi: 'वाडा' },
  { enRegex: /wada$/i, te: 'వాడ', hi: 'वाडा' },
  { enRegex: /patnam$/i, te: 'పట్నం', hi: 'पट्टनम' },
  { enRegex: /giri$/i, te: 'గిరి', hi: 'गिरि' },
  { enRegex: /palem$/i, te: 'పాలెం', hi: 'पालेम' },
  { enRegex: /colony$/i, te: 'కాలనీ', hi: 'कॉलोनी' },
  { enRegex: /road$/i, te: 'రోడ్', hi: 'रोड' },
  { enRegex: /uru$/i, te: 'ఊరు', hi: 'ऊर' },
  { enRegex: /ur$/i, te: 'ఊరు', hi: 'ऊर' },
];

/**
 * Translates an individual place name (locality, district, or state) into the target language.
 */
export function getLocalizedLocation(text: string | null | undefined, lang: SupportedLanguage): string {
  if (!text || !text.trim()) return '';
  const clean = text.trim();

  // If already in target language (Telugu/Hindi script) or lang is English
  if (lang === 'en') return clean;
  if (lang === 'te' && /[\u0C00-\u0C7F]/.test(clean)) return clean;
  if (lang === 'hi' && /[\u0900-\u097F]/.test(clean)) return clean;

  const cleanLower = clean.toLowerCase();

  // 1. Direct dictionary match
  const matched = LOCATIONS.find((loc) => loc.en.toLowerCase() === cleanLower);
  if (matched) {
    return lang === 'te' ? matched.te : matched.hi;
  }

  // 2. Partial / Compound phrase matching (e.g., "West Godavari District" or "Sitarampuram Village")
  for (const loc of LOCATIONS) {
    if (cleanLower.includes(loc.en.toLowerCase())) {
      let result = clean;
      const targetStr = lang === 'te' ? loc.te : loc.hi;
      result = result.replace(new RegExp(loc.en, 'gi'), targetStr);
      // Clean up common English suffixes if present
      if (lang === 'te') {
        result = result
          .replace(/\bDistrict\b/gi, 'జిల్లా')
          .replace(/\bVillage\b/gi, 'గ్రామం')
          .replace(/\bMandal\b/gi, 'మండలం')
          .replace(/\bTown\b/gi, 'పట్టణం');
      } else {
        result = result
          .replace(/\bDistrict\b/gi, 'जिला')
          .replace(/\bVillage\b/gi, 'गाँव')
          .replace(/\bMandal\b/gi, 'मंडल')
          .replace(/\bTown\b/gi, 'कस्बा');
      }
      return result.trim();
    }
  }

  // 3. Fallback to town suffix transliteration (e.g. "Kondapuram" -> "కొండపురం")
  for (const rule of TOWN_SUFFIX_RULES) {
    if (rule.enRegex.test(clean)) {
      const prefix = clean.replace(rule.enRegex, '');
      const locPrefixMatch = LOCATIONS.find((loc) => loc.en.toLowerCase() === prefix.toLowerCase());
      if (locPrefixMatch) {
        return lang === 'te'
          ? `${locPrefixMatch.te}${rule.te}`
          : `${locPrefixMatch.hi}${rule.hi}`;
      }
    }
  }

  return clean;
}

/**
 * Translates a complete farm name like "SITARAMPURAM RICE LAND" into "సీతారాంపురం వరి పొలం" / "सीतारामपुरम धान का खेत".
 */
export function getLocalizedFarmName(farmName: string | null | undefined, lang: SupportedLanguage): string {
  if (!farmName || !farmName.trim()) return '';
  const clean = farmName.trim();

  if (lang === 'en') return clean;
  if (lang === 'te' && /[\u0C00-\u0C7F]/.test(clean)) return clean;
  if (lang === 'hi' && /[\u0900-\u097F]/.test(clean)) return clean;

  let result = clean;

  // 1. First replace location name inside the farm name
  for (const loc of LOCATIONS) {
    const locRegex = new RegExp(`\\b${loc.en}\\b`, 'gi');
    if (locRegex.test(result)) {
      result = result.replace(locRegex, lang === 'te' ? loc.te : loc.hi);
    }
  }

  // 2. Replace agricultural farm keywords (e.g. "RICE LAND" -> "వరి పొలం", "FIELD" -> "చేను")
  for (const kw of FARM_KEYWORDS) {
    if (kw.enRegex.test(result)) {
      result = result.replace(kw.enRegex, lang === 'te' ? kw.te : kw.hi);
    }
  }

  return result.trim();
}

/**
 * Formats and localizes a full geographic address e.g. "Sitarampuram, West Godavari"
 */
export function getLocalizedAddress(
  locality?: string | null,
  district?: string | null,
  state?: string | null,
  lang: SupportedLanguage = 'en'
): string {
  const parts: string[] = [];

  if (locality) {
    parts.push(getLocalizedLocation(locality, lang));
  }
  if (district) {
    parts.push(getLocalizedLocation(district, lang));
  }
  if (state) {
    parts.push(getLocalizedLocation(state, lang));
  }

  return parts.filter(Boolean).join(', ');
}
