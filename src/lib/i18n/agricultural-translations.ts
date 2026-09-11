import type { SupportedLanguage } from './types';
import type { CropAnalysisResult } from '../ai/ai-service.interface';

// ---------------------------------------------------------------------------
// 1. ACTION STEPS TRANSLATION DICTIONARY
// Bidirectional mapping between English, Telugu, and Hindi
// ---------------------------------------------------------------------------
interface LocalizedItem {
  en: string;
  te: string;
  hi: string;
  keywords?: string[];
}

const ACTION_DICTIONARY: LocalizedItem[] = [
  // Groundnut / Peanut
  {
    en: 'Apply Agricultural Gypsum @ 200–250 kg/acre at pegging/pod formation to harden pod shells.',
    te: 'ఎకరాకు 200 నుండి 250 కిలోల వ్యవసాయ జిప్సం వేయండి (ఇది కాయ పెంకును గట్టిపరచి ఫంగస్ చొరబడకుండా చేస్తుంది).',
    hi: 'प्रति एकड़ 200-250 किग्रा कृषि जिप्सम डालें, जो फलियों के छिलके को मजबूत बनाता है।',
    keywords: ['gypsum', 'pegging', 'pod shells', 'జిప్సం', 'పెంకు', 'जिप्सम', 'छिलके'],
  },
  {
    en: 'Soil application of Trichoderma viride (@ 1–2 kg mixed in 100 kg well-decomposed FYM/acre).',
    te: 'ఎకరాకు 1-2 కిలోల ట్రైకోడెర్మా విరిడేను 100 కిలోల మాగిన పశువుల ఎరువుతో కలిపి నేలలో వేయండి.',
    hi: 'ट्राइकोडर्मा विरिडी (1-2 किग्रा को 100 किग्रा सड़ी गोबर खाद में मिलाकर) जड़ों के पास डालें।',
    keywords: ['trichoderma', 'fym', 'ట్రైకోడెర్మా', 'పశువుల ఎరువు', 'ट्राइकोडर्मा', 'गोबर खाद'],
  },
  {
    en: 'Foliar/soil-drench spray of Tebuconazole 25.9% EC @ 1.5 ml/L or Carbendazim + Mancozeb (Saaf) @ 2 g/L.',
    te: 'టెబుకోనజోల్ 25.9% EC (1.5 మి.లీ/లీ) లేదా కార్బండజిమ్ + మాంకోజెబ్ (2 గ్రా/లీ) మొక్కల మొదళ్లు మరియు నేల తడిసేలా పిచికారీ చేయండి.',
    hi: 'टेबुकोनाजोल 25.9% EC (1.5 मिली/लीटर) या मैंकोजेब + कार्बेन्डाजिम (2 ग्राम/लीटर) का छिड़काव करें।',
    keywords: ['tebuconazole', 'carbendazim', 'mancozeb', 'saaf', 'టెబుకోనజోల్', 'కార్బండజిమ్', 'टेबुकोनाजोल', 'कार्बेन्डाजिम'],
  },
  {
    en: 'Ensure furrow drainage to avoid standing water, and cure harvested pods below 8% moisture to prevent aflatoxin.',
    te: 'పొలంలో నీరు నిల్వ ఉండకుండా చూడండి మరియు కోత తర్వాత కాయలను తేమ 8% కంటే తగ్గేలా ఆరబెట్టండి.',
    hi: 'खेत में पानी का ठहराव रोकें और कटाई के बाद फलियों को अच्छी तरह धूप में सुखाएं।',
    keywords: ['furrow drainage', 'standing water', 'aflatoxin', 'నీరు నిల్వ', 'ఆరబెట్టండి', 'ठहराव रोकें', 'सुखाएं'],
  },
  {
    en: 'Apply Mancozeb (2.5g/L) or Hexaconazole 5% SC (2ml/L) spray.',
    te: 'మాంకోజెబ్ (2.5 గ్రా/లీ) లేదా హెక్సాకోనజోల్ (2 మి.లీ/లీ) పిచికారీ చేయండి.',
    hi: 'मैंकोजेब (2.5 ग्राम/लीटर) या हेक्साकोनाजोल (2 मिली/लीटर) का छिड़काव करें।',
    keywords: ['mancozeb', 'hexaconazole', 'మాంకోజెబ్', 'హెక్సాకోనజోల్', 'हेक्साकोनाजोल'],
  },
  {
    en: 'Prune and destroy severely infected older groundnut leaves.',
    te: 'బాధిత పాత ఆకులను తీసివేసి నాశనం చేయండి.',
    hi: 'गंभीर रूप से प्रभावित पुरानी पत्तियों को नष्ट करें।',
    keywords: ['destroy older', 'పాత ఆకులను', 'पुरानी पत्तियों'],
  },
  {
    en: 'Maintain open canopy spacing to reduce in-canopy humidity.',
    te: 'గాలి వెలుతురు సోకేలా జాగ్రత్త తీసుకోండి.',
    hi: 'हवा और धूप के लिए उचित दूरी बनाए रखें।',
    keywords: ['canopy spacing', 'గాలి వెలుతురు', 'हवा और धूप'],
  },
  {
    en: 'Repeat spray in 10-12 days if spots continue expanding.',
    te: '10 రోజుల వ్యవధిలో అవసరమైతే మళ్లీ పిచికారీ చేయండి.',
    hi: 'आवश्यकता पड़ने पर 10 दिनों के अंतराल पर दोबारा छिड़काव करें।',
    keywords: ['repeat spray', '10 రోజుల', '10 दिनों'],
  },
  {
    en: 'Drench root zone with Copper Oxychloride (3g/L) or Carbendazim (1g/L).',
    te: 'కాపర్ ఆక్సిక్లోరైడ్ (3 గ్రా/లీ) లేదా కార్బండజిమ్ (1 గ్రా/లీ) మొదళ్ల వద్ద తడపండి.',
    hi: 'कॉपर ऑक्सीक्लोराइड (3 ग्राम/लीटर) या कार्बेन्डाजिम (1 ग्राम/लीटर) से जड़ों को भिगोएं।',
    keywords: ['copper oxychloride', 'drench root', 'మొదళ్ల వద్ద తడపండి', 'जड़ों को भिगोएं'],
  },
  {
    en: 'Seed treat next sowing with Thiram or Captan @ 3g/kg seed.',
    te: 'కాప్టాన్ లేదా థైరామ్ (3 గ్రా/కేజీ) తో విత్తన శుద్ధి చేయండి.',
    hi: 'थीरम या कैप्टन (3 ग्राम/किग्रा) से बीज उपचार करें।',
    keywords: ['thiram', 'captan', 'విత్తన శుద్ధి', 'बीज उपचार'],
  },
  {
    en: 'Apply Gypsum (200 kg/acre) during pod formation to promote bold grain filling.',
    te: 'కాయలు గట్టిపడటానికి జిప్సం (ఎకరాకు 200 కిలోలు) వేయండి మరియు తగినంత తేమ ఉండేలా చూడండి.',
    hi: 'फलियों के विकास के लिए 200 किग्रा जिप्सम प्रति एकड़ डालें और पर्याप्त नमी बनाए रखें।',
    keywords: ['bold grain filling', 'జిప్సం', 'జిప్సమ్', 'जिप्सम'],
  },
  {
    en: 'Maintain uniform soil moisture; avoid extreme wetting and drying cycles.',
    te: 'నేలలో తేమ సమతుల్యంగా ఉండేలా క్రమం తప్పకుండా నీటి తడులు ఇవ్వండి.',
    hi: 'मिट्टी में नमी का संतुलन बनाए रखें, ज्यादा सूखा न पड़ने दें।',
    keywords: ['uniform soil moisture', 'తేమ సమతుల్యంగా', 'नमी का संतुलन'],
  },

  // Tomato Fruit Rot / Anthracnose
  {
    en: 'Foliar spray Azoxystrobin 23% SC @ 1 ml/L or Difenoconazole 25% EC @ 1 ml/L targeting fruit clusters.',
    te: 'అజోక్సిస్ట్రోబిన్ 23% SC (@ 1 మి.లీ/లీ) లేదా డైఫెనోకోనజోల్ 25% EC (@ 1 మి.లీ/లీ) కాయల గుత్తులు తడిసేలా పిచికారీ చేయండి.',
    hi: 'एजोक्सीस्ट्रोबिन 23% SC (1 मिली/लीटर) या डाइफेनोकोनाजोल (1 मिली/लीटर) का छिड़काव करें।',
    keywords: ['azoxystrobin', 'difenoconazole', 'అజోక్సిస్ట్రోబిన్', 'డైఫెనోకోనజోల్', 'एजोक्सीस्ट्रोबिन', 'fruit clusters'],
  },
  {
    en: 'Apply Mancozeb 75% WP @ 2.5 g/L as a protective broad-spectrum fungicide.',
    te: 'రక్షణగా మాంకోజెబ్ 75% WP (@ 2.5 గ్రా/లీ) నీటికి కలిపి పిచికారీ చేయండి.',
    hi: 'सुरक्षात्मक फफूंदनाशक मैंकोजेब 75% WP (2.5 ग्राम/लीटर) का तुरंत छिड़काव करें।',
    keywords: ['mancozeb 75%', 'మాంకోజెబ్ 75%', 'मैंकोजेब 75%'],
  },
  {
    en: 'Pick and safely bury severely spotted or decaying fruits to prevent fungal spore dispersal.',
    te: 'మచ్చలు పడి కుళ్ళిన కాయలను వెంటనే ఏరివేసి దూరంగా భూమిలో పూడ్చిపెట్టండి.',
    hi: 'संक्रमित व सड़े हुए फलों को तुरंत तोड़कर जमीन में दबा दें ताकि रोग अन्य फलों में न फैले।',
    keywords: ['safely bury', 'decaying fruits', 'భూమిలో పూడ్చిపెట్టండి', 'जमीन में दबा दें'],
  },
  {
    en: 'Stake vines and avoid overhead watering to prevent soil splash onto tomato fruits.',
    te: 'మొక్కలకు కట్టెల ఆధారం (Staking) ఇచ్చి కాయలు నేలను తాకకుండా చూడండి; పైనుండి నీరు చిమ్మవద్దు.',
    hi: 'पौधों को डंडियों का सहारा दें और ऊपर से पानी छिड़कने से बचें।',
    keywords: ['stake vines', 'overhead watering', 'కట్టెల ఆధారం', 'डंडियों का सहारा'],
  },

  // Multi-evidence enrichment actions
  {
    en: 'Perform immediate whole-field curative spray to arrest widespread yield loss.',
    te: 'మొత్తం పొలం అంతటా తక్షణమే అత్యవసర పిచికారీ చేసి పంట నష్టాన్ని నివారించండి.',
    hi: 'पूरे खेत में तुरंत आपातकालीन सुरक्षात्मक छिड़काव करें।',
    keywords: ['whole-field', 'widespread', 'మొత్తం పొలం', 'అత్యవసర పిచికారీ', 'पूरे खेत', 'आपातकालीन'],
  },
  {
    en: 'Targeted spot-spraying on affected patches is sufficient without blanket field application.',
    te: 'సమస్య ఉన్న ప్రదేశాలలో మాత్రమే మందు పిచికారీ చేస్తే సరిపోతుంది.',
    hi: 'केवल प्रभावित पौधों और स्थानों पर ही लक्षित छिड़काव करें।',
    keywords: ['targeted spot-spraying', 'spot-spraying', 'affected patches', 'సమస్య ఉన్న ప్రదేశాలలో మాత్రమే', 'केवल प्रभावित पौधों'],
  },
  {
    en: 'Use systemic curative fungicides rather than contact sprays for deep tissue translocation.',
    te: 'సాధారణ స్పర్శ మందుల కంటే అంతర్వాహిక (సిస్టమిక్) శిలీంధ్ర నాశినులను మాత్రమే వాడండి.',
    hi: 'गहरे उपचार के लिए अंतर्प्रवाही (सिस्टमिक) कवकनाशी का ही उपयोग करें।',
    keywords: ['systemic curative', 'translocation', 'సిస్టమిక్', 'అంతర్వాహిక', 'सिस्टमिक', 'अंतर्प्रवाही'],
  },
  {
    en: 'Rotate field with non-host cereal crops (Sorghum, Pearl Millet, Maize) next season to break pathogen survival.',
    te: 'తదుపరి పంటగా జొన్న, మొక్కజొన్న లేదా రాగులను పంట మార్పిడిగా వేసి నేల వ్యాధులను అరికట్టండి.',
    hi: 'अगले सीजन में ज्वार, मक्का या बाजरा की फसल चक्र अपनाकर मिट्टी जनित रोगों को तोड़ें।',
    keywords: ['rotate field', 'sorghum', 'pearl millet', 'పంట మార్పిడిగా', 'జొన్న', 'फसल चक्र', 'ज्वार'],
  },

  // Tomato
  {
    en: 'Prune and safely destroy lower leaves with concentric spotting.',
    te: 'కింది వరుసలోని మచ్చలు ఉన్న పాత ఆకులను వెంటనే తుంచి నాశనం చేయండి.',
    hi: 'संक्रमित निचली पत्तियों को काटकर खेत से दूर नष्ट करें।',
    keywords: ['concentric spotting', 'lower leaves', 'కింది వరుసలోని', 'निचली पत्तियों'],
  },
  {
    en: 'Apply protective Mancozeb (2.5g/L) or Copper Oxychloride (3g/L) spray.',
    te: 'మాంకోజెబ్ (Mancozeb 2.5 గ్రా/లీ) లేదా కాపర్ ఆక్సిక్లోరైడ్ (3 గ్రా/లీ) పిచికారీ చేయండి.',
    hi: 'मैंकोजेब (2.5 ग्राम प्रति लीटर) या कॉपर ऑक्सीक्लोराइड का छिड़काव करें।',
    keywords: ['mancozeb', 'copper oxychloride', '2.5g/l'],
  },
  {
    en: 'Trellis / stake tomato plants to prevent soil-splash onto foliage.',
    te: 'మొక్కలకు కట్టెల ఆధారం (Staking) ఇచ్చి ఆకులు నేలను తాకకుండా నిలబెట్టండి.',
    hi: 'पौधों को डंडियों से सहारा दें ताकि पत्तियां गीली मिट्टी के संपर्क में न आएं।',
    keywords: ['trellis', 'stake', 'కట్టెల ఆధారం', 'डंडियों से सहारा'],
  },
  {
    en: 'Water strictly at base furrow level without wetting foliage.',
    te: 'కాలువల ద్వారా నీరు పెట్టండి, ఆకులపై నేరుగా నీరు చిమ్మవద్దు.',
    hi: 'केवल जड़ के पास पानी दें, पत्तियों को गीला न करें।',
    keywords: ['base furrow', 'wetting foliage', 'కాలువల ద్వారా', 'पत्तियों को गीला'],
  },
  {
    en: 'Rogue out and bury severely stunted viral-infected plants.',
    te: 'తీవ్రంగా ముడుచుకుపోయిన వైరస్ సోకిన మొక్కలను పీకి పొలం బయట కాల్చివేయండి.',
    hi: 'गंभीर रूप से ग्रसित पौधों को उखाड़कर नष्ट करें।',
    keywords: ['rogue out', 'viral-infected', 'పీకి పొలం బయట', 'उखाड़कर नष्ट'],
  },
  {
    en: 'Install 12-15 yellow sticky traps per acre to trap vector whiteflies.',
    te: 'తెల్లదోమల నివారణకు ఎల్లో స్టిక్కీ ట్రాప్స్ (పసుపు జిగురు అట్టలు) ఎకరాకు 15 అమర్చండి.',
    hi: 'खेत में 15 पीले चिपचिपे कार्ड (येलो स्टिकी ट्रैप) प्रति एकड़ लगाएं।',
    keywords: ['yellow sticky traps', 'పసుపు జిగురు అట్టలు', 'पीले चिपचिपे कार्ड'],
  },
  {
    en: 'Spray Neem seed kernel extract (5%) or Diafenthiuron during evening hours.',
    te: 'వేప నూనె (10,000 PPM @ 2 మి.లీ/లీ) లేదా డైఫెన్‌థియురాన్ పిచికారీ చేయండి.',
    hi: 'नीम तेल (5 मिली प्रति लीटर) या अनुशंसित कीटनाशक का छिड़काव करें।',
    keywords: ['diafenthiuron', 'neem seed', 'వేప నూనె', 'नीम तेल'],
  },
  {
    en: 'Erect barrier crops of maize or sorghum along field borders.',
    te: 'పొలం చుట్టూ జొన్న లేదా మొక్కజొన్నను సరిహద్దు రక్షణ పంటగా వేయండి.',
    hi: 'खेत के चारों ओर मक्का या ज्वार की सुरक्षात्मक कतारें लगाएं।',
    keywords: ['barrier crops', 'field borders', 'సరిహద్దు రక్షణ', 'सुरक्षात्मक कतारें'],
  },
  {
    en: 'Apply Calcium Nitrate (2g/L) foliar spray to prevent blossom-end rot.',
    te: 'కాయ తొడిమ కుళ్లు (Blossom End Rot) నివారించడానికి కాల్షియం నైట్రేట్ (2 గ్రా/లీ) పిచికారీ చేయండి.',
    hi: 'ब्लॉसम एंड रॉट से बचाव के लिए कैल्शियम नाइट्रेट (2 ग्राम/लीटर) का छिड़काव करें।',
    keywords: ['calcium nitrate', 'blossom-end rot', 'కాల్షియం నైట్రేట్', 'कैल्शियम नाइट्रेट'],
  },
  {
    en: 'Earth up soil along planting ridges to support root development.',
    te: 'పొలంలో కలుపు లేకుండా మొదళ్ల వద్ద మట్టిని ఎగదోయండి.',
    hi: 'पौधों के तने के पास मिट्टी चढ़ाएं (Earthing up)।',
    keywords: ['earth up soil', 'planting ridges', 'మట్టిని ఎగదోయండి', 'मिट्टी चढ़ाएं'],
  },

  // Rice / Paddy
  {
    en: 'Spray Tricyclazole 75% WP @ 0.6g/L immediately to arrest blast progression.',
    te: 'ట్రైసైక్లాజోల్ 75% WP (Tricyclazole @ 0.6 గ్రా/లీ) పిచికారీ చేయండి.',
    hi: 'ट्राइसाइक्लाजोल 75% WP (0.6 ग्राम प्रति लीटर) का छिड़काव करें।',
    keywords: ['tricyclazole', 'ట్రైసైక్లాజోల్', 'ट्राइसाइक्लाजोल'],
  },
  {
    en: 'Temporarily suspend top-dressing of nitrogen (urea) fertilizers.',
    te: 'నత్రజని (యూరియా) ఎరువుల వాడకాన్ని తాత్కాలికంగా ఆపివేయండి.',
    hi: 'यूरिया खाद का प्रयोग तुरंत रोकें, क्योंकि अधिक नाइट्रोजन से रोग बढ़ता है।',
    keywords: ['suspend top-dressing', 'nitrogen', 'urea', 'నత్రజని', 'యూరియా', 'यूरिया'],
  },
  {
    en: 'Maintain shallow standing water (2-3 cm) in paddy basin.',
    te: 'చేలో నీరు నిలకడగా ఉండేలా పారకపు యాజమాన్యం చేపట్టండి.',
    hi: 'खेत में 2-3 सेमी पानी का स्तर बनाए रखें ताकि कवक बीजाणु जड़ न पकड़ें।',
    keywords: ['standing water', 'paddy basin', 'చేలో నీరు', 'पानी का स्तर'],
  },
  {
    en: 'Apply Cartap Hydrochloride 4G @ 8 kg/acre in standing water for stem borer.',
    te: 'ఎకరాకు కార్టాప్ హైడ్రోక్లోరైడ్ 4G గుళికలు (8 కేజీలు) చేలో చల్లండి.',
    hi: 'तने में छेदक कीट के लिए 8 किग्रा करटाप हाइड्रोक्लोराइड 4G प्रति एकड़ डालें।',
    keywords: ['cartap hydrochloride', 'stem borer', 'కార్టాప్', 'करटाप'],
  },

  // Chilli
  {
    en: 'Spray Azoxystrobin + Difenoconazole @ 1 ml/L or Copper Oxychloride @ 3 g/L.',
    te: 'అజోక్సిస్ట్రోబిన్ + డైఫెనోకోనజోల్ (1 మి.లీ/లీ) లేదా కాపర్ ఆక్సిక్లోరైడ్ (3 గ్రా/లీ) పిచికారీ చేయండి.',
    hi: 'एजॉक्सीस्ट्रोबिन + डाइफेनोकोनाजोल (1 मिली/लीटर) का छिड़काव करें।',
    keywords: ['azoxystrobin', 'difenoconazole', 'అజోక్సిస్ట్రోబిన్', 'एजॉक्सीस्ट्रोबिन'],
  },
  {
    en: 'Prune dried twigs 2 inches below infection point and destroy them.',
    te: 'ఎండిపోయిన కొమ్మలను 2 అంగుళాలు క్రింది వరకు కత్తిరించి నాశనం చేయండి.',
    hi: 'सूखी और काली पड़ी शाखाओं को स्वस्थ भाग से 2 सेमी नीचे से काटकर नष्ट करें।',
    keywords: ['prune dried twigs', 'కొమ్మలను', 'కత్తిరించి', 'शाखाओं को काटकर'],
  },

  // Cotton
  {
    en: 'Install 8-10 Gossyplure pheromone traps per acre to monitor moth catch.',
    te: 'ఎకరాకు 8 నుండి 10 లింగాకర్షక బుట్టలు (Pheromone traps) అమర్చండి.',
    hi: 'प्रति एकड़ 8-10 फेरोमोन ट्रैप (गुलाबी सुंडी के लिए) लगाएं।',
    keywords: ['pheromone traps', 'gossyplure', 'లింగాకర్షక బుట్టలు', 'फेरोमोन ट्रैप'],
  },
  {
    en: 'Apply Emamectin Benzoate 5% SG @ 0.4g/L during early square/boll stage.',
    te: 'ఎమామెక్టిన్ బెంజోయేట్ 5% SG (0.5 గ్రా/లీ) లేదా ప్రొఫెనోఫాస్ (2 మి.లీ/లీ) పిచికారీ చేయండి.',
    hi: 'इमामेक्टिन बेंजोएट 5% SG (0.5 ग्राम/लीटर) या प्रोफेनोफॉस का छिड़काव करें।',
    keywords: ['emamectin', 'benzoate', 'ఎమామెక్టిన్', 'इमामेक्टिन'],
  },

  // Maize
  {
    en: 'Direct spray into the plant whorls with Chlorantraniliprole 18.5% SC @ 0.4 ml/L.',
    te: 'క్లోరాంట్రానిలిప్రోల్ 18.5% SC (0.4 మి.లీ/లీ) మొక్క సుడులలో పడేలా పిచికారీ చేయండి.',
    hi: 'क्लोरांट्रानिलीप्रोल 18.5% SC (0.4 मिली/लीटर) का छिड़काव सीधे पोंगे (Whorl) में करें।',
    keywords: ['chlorantraniliprole', 'plant whorls', 'సుడులలో', 'क्लोरांट्रानिलीप्रोल'],
  },
  {
    en: 'Place 5 FAW pheromone traps per acre and crush egg masses found on leaves.',
    te: 'ఎకరాకు 5 లింగాకర్షక బుట్టలు మరియు కత్తెర పురుగు గుడ్లను గుర్తించి నలిపివేయండి.',
    hi: 'खेत में 5 फेरोमोन ट्रैप लगाएं और पत्तों पर अंडों के समूह को नष्ट करें।',
    keywords: ['egg masses', 'faw', 'కత్తెర పురుగు గుడ్లను', 'अंडों के समूह'],
  },

  // General & Standard Follow-ups
  {
    en: 'Apply Neem oil (5ml/L) with mild surfactant as early protection.',
    te: 'సహజ నివారణగా వేప నూనె (5 మి.లీ/లీ) పిచికారీ చేయండి.',
    hi: 'नीम तेल (5 मिली प्रति लीटर) का छिड़काव करें।',
    keywords: ['neem oil', 'వేప నూనె', 'नीम तेल'],
  },
  {
    en: 'Prune affected leaves and keep field perimeter weed-free.',
    te: 'బాధిత ఆకులు లేదా కొమ్మలను తీసివేసి పొలం శుభ్రంగా ఉంచండి.',
    hi: 'रोगग्रस्त पत्तियों को हटाकर खेत को साफ रखें।',
    keywords: ['weed-free', 'prune affected', 'పొలం శుభ్రంగా', 'खेत को साफ'],
  },
  {
    en: 'Upload another photo in 3 days to re-verify response to treatment.',
    te: 'చికిత్స ప్రభావాన్ని తెలుసుకోవడానికి 3 రోజుల తర్వాత మళ్లీ ఒక ఫోటో తీసి పరిశీలించండి.',
    hi: 'उपचार के असर की जांच के लिए 3 दिन बाद फिर से फोटो अपलोड करें।',
    keywords: ['3 days', '3 రోజుల', '3 दिन'],
  },
  {
    en: 'Consult nearest Krishi Vigyan Kendra (KVK) if symptoms escalate.',
    te: 'సమస్య ఎక్కువైతే సమీపంలోని కృషి విజ్ఞాన కేంద్రం (KVK) శాస్త్రవేత్తలను సంప్రదించండి.',
    hi: 'समस्या बढ़ने पर नजदीकी कृषि विज्ञान केंद्र (KVK) से संपर्क करें।',
    keywords: ['kvk', 'krishi vigyan kendra', 'కృషి విజ్ఞాన కేంద్రం', 'कृषि विज्ञान केंद्र'],
  },
];

// ---------------------------------------------------------------------------
// 2. DIAGNOSTIC TITLE & EXPLANATION DICTIONARY
// ---------------------------------------------------------------------------
const DIAGNOSIS_DICTIONARY: LocalizedItem[] = [
  // Groundnut
  {
    en: 'Groundnut Pod Rot & Fungal Shell Decay (Rhizoctonia / Aspergillus / Pythium)',
    te: 'వేరుశనగలో కాయ కుళ్ళు తెగులు మరియు నల్ల మచ్చలు (Groundnut Pod Rot & Decay)',
    hi: 'मूंगफली में फली सड़न एवं कवक जनित काले धब्बे (Groundnut Pod Rot & Decay)',
    keywords: ['pod rot', 'shell decay', 'కాయ కుళ్ళు', 'फली सड़न'],
  },
  {
    en: 'Blackened necrotic lesions and shell decay on groundnut pods caused by soil-borne fungal pathogens under humid conditions.',
    te: 'కాయలపై నల్లటి మచ్చలు ఏర్పడి కాయ కుళ్ళిపోవడం నేలలోని శిలీంధ్రం (Rhizoctonia / Aspergillus / Pythium) మరియు అధిక తేమ వల్ల జరుగుతోంది.',
    hi: 'फलियों पर काले धब्बे और सड़न मिट्टी जनित फंगस (राइजोक्टोनिया / एस्परजिलस) और अधिक नमी के कारण फैल रही है।',
    keywords: ['blackened necrotic', 'shell decay', 'కాయలపై నల్లటి మచ్చలు', 'काले धब्बे'],
  },
  {
    en: 'Groundnut Tikka Leaf Spot (Cercospora arachidicola)',
    te: 'వేరుశనగలో తిక్కా ఆకుమచ్చ తెగులు (Tikka Leaf Spot)',
    hi: 'मूंगफली में टिक्का पत्ता धब्बा रोग (Tikka Disease)',
    keywords: ['tikka', 'తిక్కా', 'टिक्का'],
  },
  {
    en: 'Groundnut Collar Rot & Stem Blight (Sclerotium rolfsii)',
    te: 'వేరుశనగలో మొదలు కుళ్ళు లేదా కాండం కుళ్ళు తెగులు (Collar Rot)',
    hi: 'मूंगफली में कॉलर रॉट एवं तना सड़न (Collar Rot)',
    keywords: ['collar rot', 'మొదలు కుళ్ళు', 'कॉलर रॉट'],
  },
  {
    en: 'Groundnut Crop in Good Condition — Pod Filling Care',
    te: 'వేరుశనగ పంట సాధారణంగా బాగుంది — కాయ ఊరే దశ జాగ్రత్తలు',
    hi: 'मूंगफली की फसल सामान्य स्थिति में — दाना भराव प्रबंधन',
    keywords: ['good condition', 'pod filling', 'కాయ ఊరే దశ', 'दाना भराव'],
  },

  // Tomato
  {
    en: 'Tomato Anthracnose & Fruit Rot (Colletotrichum coccodes)',
    te: 'టమాటలో కాయ కుళ్లు మరియు ఆంత్రాక్నోస్ తెగులు (Fruit Rot & Anthracnose)',
    hi: 'टमाटर में फल सड़न एवं एन्थ्रेक्नोज रोग (Fruit Rot & Anthracnose)',
    keywords: ['fruit rot', 'anthracnose', 'కాయ కుళ్లు', 'ఆంత్రాక్నోస్', 'फल सड़न', 'एन्थ्रेक्नोज', 'colletotrichum'],
  },
  {
    en: 'Sunken water-soaked lesions and circular dark necrotic rot spots detected on tomato fruits.',
    te: 'టమాట కాయలపై గుండ్రటి నల్లటి గుంతల వంటి మచ్చలు మరియు కుళ్లు వ్యాప్తి చెందుతోంది.',
    hi: 'टमाटर के फलों पर गोल काले धंसे हुए धब्बे और फंगस का गंभीर संक्रमण देखा गया है।',
    keywords: ['sunken water-soaked', 'గుంతల వంటి మచ్చలు', 'काले धंसे हुए धब्बे', 'rot spots detected on tomato'],
  },
  {
    en: 'Early Blight (Alternaria solani) on Tomato',
    te: 'టమాటలో ఆల్టర్నేరియా ఆకుమచ్చ లేదా ఎర్లీ బ్లైట్ తెగులు (Early Blight)',
    hi: 'टमाटर में अगेती झुलसा या अल्टरनेरिया पत्ता धब्बा (Early Blight)',
    keywords: ['early blight', 'ఎర్లీ బ్లైట్', 'अगेती झुलसा'],
  },
  {
    en: 'Concentric ring brown spots on lower leaves accelerated by humid microclimate indicate Alternaria blight.',
    te: 'కింది ఆకులపై గోధుమ రంగు వలయాల (కాన్సెం్రిక్ రింగులు) మచ్చలు మరియు అధిక తేమ వల్ల శిలీంధ్రం వ్యాప్తి చెందుతోంది.',
    hi: 'निचली पत्तियों पर गोल भूरे छल्लेदार धब्बे और उच्च आर्द्रता के कारण फंगस का प्रसार हो रहा है।',
    keywords: ['concentric ring', 'కింది ఆకులపై గోధుమ', 'छल्लेदार धब्बे'],
  },
  {
    en: 'Tomato Leaf Curl Virus (TLCV) & Whitefly Infestation',
    te: 'టమాటలో ఆకుముడత వైరస్ (Leaf Curl Virus) మరియు తెల్లదోమ ఉధృతి',
    hi: 'टमाटर में पर्ण कुंचन विषाणु (Leaf Curl Virus) एवं सफेद मक्खी का प्रकोप',
    keywords: ['leaf curl virus', 'ఆకుముడత వైరస్', 'पर्ण कुंचन'],
  },
  {
    en: 'Tomato Crop in Good Health — Fruit Setting & Nutrition Plan',
    te: 'టమాట పంట సంతృప్తికరంగా ఉంది — కాయ ఎదుగుదల మరియు పోషక నిర్వహణ',
    hi: 'टमाटर की फसल स्वस्थ स्थिति में — फल विकास एवं पोषण प्रबंधन',
    keywords: ['fruit setting', 'పోషక నిర్వహణ', 'पोषण प्रबंधन'],
  },

  // Rice
  {
    en: 'Blast & Brown Spot Complex in Rice (Magnaporthe oryzae)',
    te: 'వరిలో అగ్గి తెగులు (బ్లాస్ట్ / Blast) లేదా గోధుమ ఆకుమచ్చ తెగులు',
    hi: 'धान में ब्लास्ट (झोंका) या भूरा पत्ता धब्बा रोग',
    keywords: ['blast', 'brown spot', 'అగ్గి తెగులు', 'ब्लास्ट'],
  },
  {
    en: 'Rice Yellow Stem Borer & Dead Heart Symptoms',
    te: 'వరిలో కాండం తొలుచు పురుగు (Stem Borer) ఉధృతి',
    hi: 'धान में तना छेदक कीट (Yellow Stem Borer) का प्रकोप',
    keywords: ['stem borer', 'dead heart', 'కాండం తొలుచు', 'तना छेदक'],
  },
  {
    en: 'Rice Crop in Good Condition — Tillering & Panicle Care',
    te: 'వరి చేను ఆరోగ్యంగా ఉంది — పిలకలు మరియు చిరుపొట్ట దశ సంరక్షణ',
    hi: 'धान की फसल स्वस्थ स्थिति में — कल्ले एवं बालियां प्रबंधन',
    keywords: ['tillering', 'panicle', 'పిలకలు', 'कल्ले'],
  },

  // Chilli
  {
    en: 'Chilli Leaf Curl & Sucking Pest Complex (Thrips & Mites)',
    te: 'మిరపలో బొబ్బర లేదా ఆకుముడత (నల్లి మరియు తామర పురుగుల ఉధృతి)',
    hi: 'मिर्च में मरोड़िया रोग या पर्ण कुंचन (थ्रिप्स एवं माइट्स का प्रकोप)',
    keywords: ['chilli leaf curl', 'మిరపలో బొబ్బర', 'मरोड़िया रोग'],
  },
  {
    en: 'Chilli Anthracnose & Die-back (Colletotrichum capsici)',
    te: 'మిరపలో కొమ్మకుళ్ళు లేదా కాయకుళ్ళు తెగులు (Anthracnose / Die-back)',
    hi: 'मिर्च में फल सड़न या श्यामवर्ण रोग (Anthracnose)',
    keywords: ['anthracnose', 'die-back', 'కొమ్మకుళ్ళు', 'फल सड़न'],
  },

  // Cotton
  {
    en: 'Pink Bollworm & Internal Boll Rot in Cotton',
    te: 'పత్తిలో గులాబీ రంగు కాయతొలుచు పురుగు (Pink Bollworm) ఉధృతి',
    hi: 'कपास में गुलाबी सुंडी (Pink Bollworm) का प्रकोप',
    keywords: ['pink bollworm', 'గులాబీ రంగు', 'गुलाबी सुंडी'],
  },

  // Maize
  {
    en: 'Spodoptera frugiperda (Fall Armyworm) Infestation in Maize',
    te: 'మొక్కజొన్నలో కత్తెర పురుగు (Fall Armyworm) దాడి',
    hi: 'मक्का में फॉल आर्मीवर्म (सैनिक कीट) का प्रकोप',
    keywords: ['fall armyworm', 'కత్తెర పురుగు', 'फॉल आर्मीवर्म'],
  },

  // Non-crop Gatekeeper
  {
    en: 'Crop Not Detected',
    te: 'పంట గుర్తించబడలేదు',
    hi: 'फसल नहीं पहचानी गई',
    keywords: ['crop not detected', 'పంట గుర్తించబడలేదు', 'फसल नहीं पहचानी गई'],
  },
  {
    en: 'The uploaded photo does not appear to be an agricultural crop or plant. Please upload a clear photo of your crop leaf or plant.',
    te: 'మీరు అప్‌లోడ్ చేసిన చిత్రంలో వ్యవసాయ పంట లేదా ఆకు గుర్తించబడలేదు. దయచేసి పంట ఆకు లేదా చెట్టు యొక్క స్పష్టమైన ఫోటోను అప్‌లోడ్ చేయండి.',
    hi: 'अपलोड की गई फोटो में कृषि फसल या पत्ता नहीं मिला। कृपया अपनी फसल के पत्ते या पौधे की साफ फोटो लें।',
    keywords: ['uploaded photo does not appear', 'వ్యవసాయ పంట లేదా ఆకు గుర్తించబడలేదు'],
  },
];

// ---------------------------------------------------------------------------
// 3. WHY REASONS TRANSLATION DICTIONARY
// ---------------------------------------------------------------------------
const WHY_REASONS_DICTIONARY: LocalizedItem[] = [
  {
    en: 'Distinct black necrotic fungal spots and shell discoloration observed on groundnut pods.',
    te: 'వేరుశనగ కాయలు మరియు పెంకులపై నల్లటి ఫంగస్ మచ్చలు స్పష్టంగా గుర్తించబడ్డాయి.',
    hi: 'मूंगफली की फलियों पर काले फंगल धब्बे और छिलके का क्षरण देखा गया है।',
    keywords: ['black necrotic fungal spots', 'నల్లటి ఫంగస్ మచ్చలు', 'काले फंगल धब्बे'],
  },
  {
    en: 'Target-like sunken dark necrotic lesions observed directly on developing tomato fruit surface.',
    te: 'కాయలపై నీటి మచ్చలు, గుంతల వంటి నల్లటి శిలీంధ్ర మచ్చలు స్పష్టంగా గమనించబడ్డాయి.',
    hi: 'फलों की सतह पर पानीदार धंसे हुए गहरे काले घाव और धब्बे पाए गए हैं।',
    keywords: ['sunken dark necrotic', 'developing tomato fruit', 'గుంతల వంటి నల్లటి', 'धंसे हुए गहरे काले घाव'],
  },
  {
    en: 'High ambient humidity accelerates Colletotrichum fungal mycelium expansion on fruits.',
    te: 'గాలిలో అధిక తేమ కాయలపై శిలీంధ్రం వేగంగా విస్తరించడానికి కారణమవుతోంది.',
    hi: 'हवा में अधिक नमी से फल सड़न फंगस तेजी से बढ़ती है।',
    keywords: ['colletotrichum fungal mycelium', 'శిలీంధ్రం వేగంగా విస్తరించడానికి', 'फल सड़न फंगस तेजी से बढ़ती है'],
  },
  {
    en: 'Target-like concentric ring brown lesions observed on foliage.',
    te: 'టమాట ఆకులపై నిర్దిష్ట వలయాకారపు గోధుమ మచ్చలు కనిపించాయి.',
    hi: 'पत्तियों पर संकेन्द्री छल्ले (Target spots) के लक्षण दिखाई दिए हैं।',
    keywords: ['target-like concentric', 'వలయాకారపు గోధుమ', 'संकेन्द्री छल्ले'],
  },
  {
    en: 'Spindle-shaped diamond lesions with grey centres observed on foliage.',
    te: 'ఆకులపై మధ్యలో బూడిద రంగు, అంచున గోధుమ రంగు ఉన్న కండె ఆకారపు మచ్చలు గమనించబడ్డాయి.',
    hi: 'पत्तियों पर मध्य में धूसर और किनारों पर भूरे रंग के आंख के आकार के धब्बे दिखे हैं।',
    keywords: ['spindle-shaped', 'diamond lesions', 'కండె ఆకారపు', 'आंख के आकार'],
  },
  {
    en: 'Puckered, curled leaves with stunted apical growth.',
    te: 'ఆకులు చిన్నవిగా మారి పైకి ముడుచుకుపోవడం మరియు పసుపు రంగులోకి మారడం గమనించబడింది.',
    hi: 'पत्तियों में ऊपर की ओर सिकुड़न और पीलापन देखा गया है।',
    keywords: ['puckered', 'curled leaves', 'పైకి ముడుచుకుపోవడం', 'सिकुड़न और पीलापन'],
  },
  {
    en: 'Circular dark brown spots with distinct chlorotic halos on foliage.',
    te: 'ఆకులపై తిక్కా తెగులు నిర్దిష్ట గోధుమ మచ్చలు మరియు పసుపు అంచులు కనిపించాయి.',
    hi: 'पत्तियों पर टिक्का रोग के विशिष्ट लक्षण देखे गए हैं।',
    keywords: ['chlorotic halos', 'తిక్కా తెగులు', 'टिक्का रोग'],
  },
  {
    en: 'Early localized onset (< 10% area) detected.',
    te: 'సమస్య ప్రారంభ దశలోనే (10% లోపు) గుర్తించబడింది.',
    hi: 'समस्या शुरुआती स्तर (10% से कम) पर ही पहचानी गई है।',
    keywords: ['10%', 'localized onset', '10% లోపు', '10% से कम'],
  },
  {
    en: 'Over 50% of the field area is affected, requiring urgent whole-field intervention.',
    te: 'పొలంలో 50% కంటే ఎక్కువ పంటకు తెగులు వ్యాపించినందున అత్యవసర సమగ్ర చర్యలు అవసరం.',
    hi: 'खेत में 50% से अधिक फसल प्रभावित होने के कारण आपातकालीन उपचार आवश्यक है।',
    keywords: ['50%', 'whole-field intervention', '50% కంటే ఎక్కువ', '50% से अधिक'],
  },
  {
    en: 'Symptoms have persisted for over 14 days, establishing deep mycelial infection.',
    te: 'సమస్య 14 రోజులకు పైగా ఉండటం వల్ల వ్యాధి కణజాలంలోకి పాతుకుపోయింది.',
    hi: 'समस्या 14 दिनों से अधिक समय से बनी हुई है, जिससे फंगस गहराई में फैल चुकी है।',
    keywords: ['14 days', '14 రోజులకు పైగా', '14 दिनों से अधिक'],
  },
  {
    en: 'Previous cultivation of legumes/groundnut carries high risk of soil-borne fungal inoculum buildup.',
    te: 'గతంలో కూడా పప్పు దినుసులు/వేరుశనగ వేయడం వల్ల నేలలో ఫంగస్ అవశేషాలు ఎక్కువగా మిగిలి ఉన్నాయి.',
    hi: 'पिछली बार भी दलहन/मूंगफली बोने से मिट्टी में फंगल अवशेषों का संचय अधिक है।',
    keywords: ['previous cultivation', 'legumes', 'పప్పు దినుసులు', 'दलहन'],
  },
  {
    en: 'High soil moisture and ambient humidity promote subterranean fungal proliferation.',
    te: 'నేలలో తేమ మరియు వాతావరణంలో తేమ ఎక్కువగా ఉండటం నేలలోని శిలీంధ్రాల వ్యాప్తికి దోహదపడుతోంది.',
    hi: 'खेत में नमी और हवा में आर्द्रता फफूंद प्रसार के अनुकूल है।',
    keywords: ['soil moisture', 'ambient humidity', 'నేలలో తేమ', 'हवा में आर्द्रता'],
  },
  {
    en: 'High ambient humidity creates favourable conditions for fungal sporulation.',
    te: 'వాతావరణంలో గాలి తేమ ఎక్కువగా ఉండటం శిలీంధ్ర బీజోత్పత్తికి కారణమవుతోంది.',
    hi: 'हवा में नमी होने से कवक बीजाणु तेजी से फैल रहे हैं।',
    keywords: ['ambient humidity', 'sporulation', 'గాలి తేమ', 'कवक बीजाणु'],
  },
];

// Helper: Normalize strings for matching
function normalizeText(str: string): string {
  return (str || '')
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Find closest match in a list of LocalizedItems
function matchItem(text: string, list: LocalizedItem[]): LocalizedItem | null {
  if (!text) return null;
  const norm = normalizeText(text);

  // 1. Exact or near-exact match on en, te, or hi
  for (const item of list) {
    if (
      normalizeText(item.en) === norm ||
      normalizeText(item.te) === norm ||
      normalizeText(item.hi) === norm
    ) {
      return item;
    }
  }

  // 2. Contains match
  for (const item of list) {
    const enNorm = normalizeText(item.en);
    const teNorm = normalizeText(item.te);
    const hiNorm = normalizeText(item.hi);

    if (
      (enNorm.length > 15 && (norm.includes(enNorm) || enNorm.includes(norm))) ||
      (teNorm.length > 15 && (norm.includes(teNorm) || teNorm.includes(norm))) ||
      (hiNorm.length > 15 && (norm.includes(hiNorm) || hiNorm.includes(norm)))
    ) {
      return item;
    }
  }

  // 3. Keyword-based matching
  let bestItem: LocalizedItem | null = null;
  let maxScore = 0;

  for (const item of list) {
    if (!item.keywords) continue;
    let score = 0;
    for (const kw of item.keywords) {
      if (norm.includes(kw.toLowerCase())) {
        score++;
      }
    }
    if (score > maxScore && score >= 2) {
      maxScore = score;
      bestItem = item;
    }
  }

  return bestItem;
}

/**
 * Translates a single action string into the target language.
 */
export function translateActionText(text: string, targetLang: SupportedLanguage): string {
  if (!text) return '';
  if (targetLang === 'en' && /^[A-Za-z0-9\s.,@%/\-–()+]+$/.test(text)) {
    // Already in English
    return text;
  }

  const matched = matchItem(text, ACTION_DICTIONARY);
  if (matched) {
    return matched[targetLang] || matched.en;
  }

  // Fallback: Check for key agricultural keywords and transform if possible
  const lower = text.toLowerCase();
  if (targetLang === 'te') {
    if (lower.includes('gypsum') || lower.includes('जिप्सम')) {
      return 'ఎకరాకు 200 నుండి 250 కిలోల వ్యవసాయ జిప్సం వేయండి (ఇది కాయ పెంకును గట్టిపరచి ఫంగస్ చొరబడకుండా చేస్తుంది).';
    }
    if (lower.includes('trichoderma') || lower.includes('ट्राइकोडर्मा')) {
      return 'ఎకరాకు 1-2 కిలోల ట్రైకోడెర్మా విరిడేను 100 కిలోల మాగిన పశువుల ఎరువుతో కలిపి నేలలో వేయండి.';
    }
    if (lower.includes('tebuconazole') || lower.includes('mancozeb') || lower.includes('saaf')) {
      return 'టెబుకోనజోల్ 25.9% EC (1.5 మి.లీ/లీ) లేదా కార్బండజిమ్ + మాంకోజెబ్ (2 గ్రా/లీ) మొక్కల మొదళ్లు మరియు నేల తడిసేలా పిచికారీ చేయండి.';
    }
    if (lower.includes('drainage') || lower.includes('standing water') || lower.includes('aflatoxin')) {
      return 'పొలంలో నీరు నిల్వ ఉండకుండా చూడండి మరియు కోత తర్వాత కాయలను తేమ 8% కంటే తగ్గేలా ఆరబెట్టండి.';
    }
    if (lower.includes('spot-spraying') || lower.includes('affected patches')) {
      return 'సమస్య ఉన్న ప్రదేశాలలో మాత్రమే మందు పిచికారీ చేస్తే సరిపోతుంది.';
    }
  } else if (targetLang === 'hi') {
    if (lower.includes('gypsum') || lower.includes('జిప్సం')) {
      return 'प्रति एकड़ 200-250 किग्रा कृषि जिप्सम डालें, जो फलियों के छिलके को मजबूत बनाता है।';
    }
    if (lower.includes('trichoderma') || lower.includes('ట్రైకోడెర్మా')) {
      return 'ट्राइकोडर्मा विरिडी (1-2 किग्रा को 100 किग्रा सड़ी गोबर खाद में मिलाकर) जड़ों के पास डालें।';
    }
    if (lower.includes('tebuconazole') || lower.includes('mancozeb') || lower.includes('saaf')) {
      return 'टेबुकोनाजोल 25.9% EC (1.5 मिली/लीटर) या मैंकोजेब + कार्बेन्डाजिम (2 ग्राम/लीटर) का छिड़काव करें।';
    }
    if (lower.includes('drainage') || lower.includes('standing water') || lower.includes('aflatoxin')) {
      return 'खेत में पानी का ठहराव रोकें और कटाई के बाद फलियों को अच्छी तरह धूप में सुखाएं।';
    }
    if (lower.includes('spot-spraying') || lower.includes('affected patches')) {
      return 'केवल प्रभावित पौधों और स्थानों पर ही लक्षित छिड़काव करें।';
    }
  }

  return text;
}

/**
 * Translates a diagnosis headline into the target language.
 */
export function translatePossibleIssue(text: string, targetLang: SupportedLanguage): string {
  if (!text) return '';
  const matched = matchItem(text, DIAGNOSIS_DICTIONARY);
  if (matched) {
    return matched[targetLang] || matched.en;
  }
  return text;
}

/**
 * Translates an explanation into the target language.
 */
export function translateExplanation(text: string, targetLang: SupportedLanguage): string {
  if (!text) return '';
  const matched = matchItem(text, DIAGNOSIS_DICTIONARY);
  if (matched) {
    return matched[targetLang] || matched.en;
  }
  return text;
}

/**
 * Translates a why-reason string into the target language.
 */
export function translateWhyReasonText(text: string, targetLang: SupportedLanguage): string {
  if (!text) return '';

  // Extract humidity percentage if present, e.g. "humidity (72%)" or "తేమ 72%"
  const humidityMatch = text.match(/(\d{1,3})%/);
  const humidityVal = humidityMatch ? humidityMatch[1] : '70';

  const matched = matchItem(text, WHY_REASONS_DICTIONARY);
  if (matched) {
    let res = matched[targetLang] || matched.en;
    if (humidityMatch && res.includes('తేమ') && !res.includes(`${humidityVal}%`)) {
      res = res.replace(/తేమ/, `తేమ ${humidityVal}%`);
    } else if (humidityMatch && res.includes('नमी') && !res.includes(`${humidityVal}%`)) {
      res = res.replace(/नमी/, `${humidityVal}% नमी`);
    }
    return res;
  }

  // Fallback for common humidity / weather lines
  if (text.toLowerCase().includes('humidity') || text.includes('తేమ') || text.includes('आर्द्रता') || text.includes('नमी')) {
    if (targetLang === 'te') {
      return `వాతావరణంలో గాలి తేమ ${humidityVal}% ఎక్కువగా ఉండటం నేలలోని శిలీంధ్రాల వ్యాప్తికి దోహదపడుతోంది.`;
    }
    if (targetLang === 'hi') {
      return `खेत में नमी और हवा में ${humidityVal}% आर्द्रता फफूंद प्रसार के अनुकूल है।`;
    }
    return `High soil moisture and ambient humidity (${humidityVal}%) promote fungal proliferation.`;
  }

  return text;
}

/**
 * Returns fully localized result fields matching the user's selected language.
 * Guarantees that actions, whyReasons, possibleIssue, and explanation update
 * instantly when the farmer toggles English, Telugu, or Hindi.
 */
export function getLocalizedResultContent(
  result: CropAnalysisResult,
  targetLang: SupportedLanguage
): {
  possibleIssue: string;
  explanation: string;
  whyReasons: string[];
  actions: string[];
  previousComparison?: {
    status: 'better' | 'same' | 'needs_attention';
    explanation: string;
  };
} {
  if (!result) {
    return {
      possibleIssue: '',
      explanation: '',
      whyReasons: [],
      actions: [],
    };
  }

  // 1. Direct translation hit if pre-generated by rule-based service
  if (result.translations && result.translations[targetLang]) {
    const t = result.translations[targetLang]!;
    return {
      possibleIssue: t.possibleIssue || result.possibleIssue,
      explanation: t.explanation || result.explanation,
      whyReasons: t.whyReasons && t.whyReasons.length > 0 ? t.whyReasons : result.whyReasons,
      actions: t.actions && t.actions.length > 0 ? t.actions : result.actions,
      previousComparison: t.previousComparison || result.previousComparison,
    };
  }

  // 2. If result language already matches target language, return as-is
  if (result.language === targetLang) {
    return {
      possibleIssue: result.possibleIssue,
      explanation: result.explanation,
      whyReasons: result.whyReasons,
      actions: result.actions,
      previousComparison: result.previousComparison,
    };
  }

  // 3. Fallback: Dynamic mapping through agricultural translation dictionary
  const localizedIssue = translatePossibleIssue(result.possibleIssue, targetLang);
  const localizedExplanation = translateExplanation(result.explanation, targetLang);
  const localizedActions = (result.actions || []).map((action) =>
    translateActionText(action, targetLang)
  );
  const localizedWhyReasons = (result.whyReasons || []).map((reason) =>
    translateWhyReasonText(reason, targetLang)
  );

  let localizedComparison = result.previousComparison;
  if (result.previousComparison) {
    const status = result.previousComparison.status;
    let compExpl = result.previousComparison.explanation;
    if (targetLang === 'te') {
      compExpl =
        status === 'better'
          ? 'గత తనిఖీతో పోలిస్తే పంట ఆరోగ్యం గణనీయంగా మెరుగైంది.'
          : status === 'needs_attention'
          ? 'గత తనిఖీ కంటే సమస్య తీవ్రమైంది. వెంటనే నివారణ చర్యలు చేపట్టండి.'
          : 'పంట స్థితి గత పరిశీలన మాదిరిగానే స్థిరంగా ఉంది.';
    } else if (targetLang === 'hi') {
      compExpl =
        status === 'better'
          ? 'पिछली जांच की तुलना में फसल का स्वास्थ्य सुधरा है।'
          : status === 'needs_attention'
          ? 'पिछली जांच से समस्या बढ़ी है। तुरंत उपचार करें।'
          : 'फसल की स्थिति पिछली जांच जैसी ही बनी हुई है।';
    } else {
      compExpl =
        status === 'better'
          ? 'Crop condition has noticeably improved since previous check.'
          : status === 'needs_attention'
          ? 'Condition requires immediate attention compared to previous check.'
          : 'Crop health condition remains consistent with previous check.';
    }
    localizedComparison = { status, explanation: compExpl };
  }

  return {
    possibleIssue: localizedIssue,
    explanation: localizedExplanation,
    whyReasons: localizedWhyReasons,
    actions: localizedActions,
    previousComparison: localizedComparison,
  };
}

/**
 * Returns localized name for common crops in Telugu, Hindi, or English.
 */
export function getLocalizedCropName(crop: string | null | undefined, lang: SupportedLanguage = 'en'): string {
  if (!crop) return '';
  const c = crop.toLowerCase();

  if (c.includes('groundnut') || c.includes('peanut') || c.includes('వేరుశనగ') || c.includes('మూంగఫలీ')) {
    return lang === 'te' ? 'వేరుశనగ' : lang === 'hi' ? 'मूंगफली' : 'Groundnut';
  }
  if (c.includes('tomato') || c.includes('టమాట') || c.includes('టమోటా') || c.includes('टमाटर')) {
    return lang === 'te' ? 'టమోటా' : lang === 'hi' ? 'टमाटर' : 'Tomato';
  }
  if (c.includes('rice') || c.includes('paddy') || c.includes('వరి') || c.includes('ధాన')) {
    return lang === 'te' ? 'వరి' : lang === 'hi' ? 'धान' : 'Rice';
  }
  if (c.includes('chilli') || c.includes('chili') || c.includes('మిరప') || c.includes('మిర్చి') || c.includes('మిర్చ')) {
    return lang === 'te' ? 'మిర్చి' : lang === 'hi' ? 'मिर्च' : 'Chilli';
  }
  if (c.includes('cotton') || c.includes('పత్తి') || c.includes('కపాస')) {
    return lang === 'te' ? 'పత్తి' : lang === 'hi' ? 'कपास' : 'Cotton';
  }
  if (c.includes('maize') || c.includes('corn') || c.includes('మొక్కజొన్న') || c.includes('మక్కా')) {
    return lang === 'te' ? 'మొక్కజొన్న' : lang === 'hi' ? 'मक्का' : 'Maize';
  }
  if (c.includes('wheat') || c.includes('గోధుమ') || c.includes('గేహం')) {
    return lang === 'te' ? 'గోధుమ' : lang === 'hi' ? 'गेहूं' : 'Wheat';
  }
  return crop;
}

