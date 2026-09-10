export interface ParsedSpeechData {
  crop?: string;
  symptoms: string[];
  affectedArea?: string;
  durationDays?: string;
  waterLevel?: 'less' | 'normal' | 'more';
  previousCrop?: string;
  rawTranscript: string;
  summaryFeedback: string;
}

/**
 * Intelligent agricultural speech command parser.
 * Extracts crop name, symptoms, affected area %, duration in days,
 * watering level, and crop rotation history from voice input across
 * English, Telugu, and Hindi.
 */
export function parseAgriculturalSpeech(
  transcript: string,
  lang: 'en' | 'te' | 'hi' = 'en'
): ParsedSpeechData {
  const text = (transcript || '').toLowerCase().trim();
  const result: ParsedSpeechData = {
    symptoms: [],
    rawTranscript: transcript,
    summaryFeedback: '',
  };

  // 1. CROP IDENTIFICATION
  if (
    text.includes('groundnut') ||
    text.includes('peanut') ||
    text.includes('వేరుశనగ') ||
    text.includes('పల్లీ') ||
    text.includes('పల్లీలు') ||
    text.includes('మూంగఫలీ') ||
    text.includes('मूंगफली')
  ) {
    result.crop = 'Groundnut';
  } else if (
    text.includes('rice') ||
    text.includes('paddy') ||
    text.includes('వరి') ||
    text.includes('ధాన్యం') ||
    text.includes('వడ్లు') ||
    text.includes('धान') ||
    text.includes('चावल')
  ) {
    result.crop = 'Rice';
  } else if (
    text.includes('tomato') ||
    text.includes('tomatoes') ||
    text.includes('టమాట') ||
    text.includes('టమోటా') ||
    text.includes('టమాటో') ||
    text.includes('टमाटर')
  ) {
    result.crop = 'Tomato';
  } else if (
    text.includes('chilli') ||
    text.includes('chili') ||
    text.includes('chillies') ||
    text.includes('మిరప') ||
    text.includes('మిర్చి') ||
    text.includes('పచ్చిమిర్చి') ||
    text.includes('मिर्च') ||
    text.includes('मिर्ची')
  ) {
    result.crop = 'Chilli';
  } else if (
    text.includes('cotton') ||
    text.includes('పత్తి') ||
    text.includes('ప్రత్తి') ||
    text.includes('कपास')
  ) {
    result.crop = 'Cotton';
  } else if (
    text.includes('maize') ||
    text.includes('corn') ||
    text.includes('మొక్కజొన్న') ||
    text.includes('మక్క') ||
    text.includes('मक्का') ||
    text.includes('भुट्टा')
  ) {
    result.crop = 'Maize';
  }

  // 2. SYMPTOMS PARSING
  // Pod Rot / Black spots on pods
  if (
    text.includes('pod rot') ||
    text.includes('black spot') ||
    text.includes('pod spot') ||
    text.includes('rot on pod') ||
    text.includes('నల్ల మచ్చ') ||
    text.includes('నల్లటి మచ్చ') ||
    text.includes('కాయలు కుళ్ళ') ||
    text.includes('కుళ్ళు') ||
    text.includes('काले धब्बे') ||
    text.includes('फली सड़न') ||
    text.includes('सड़न')
  ) {
    result.symptoms.push('podRot');
  }

  // Brown Spots / General Spots
  if (
    text.includes('brown spot') ||
    text.includes('leaf spot') ||
    text.includes('spots') ||
    text.includes('గోధుమ మచ్చ') ||
    text.includes('మచ్చలు') ||
    text.includes('పొడలు') ||
    text.includes('धब्बे') ||
    text.includes('भूरे धब्बे')
  ) {
    if (!result.symptoms.includes('brownSpots')) {
      result.symptoms.push('brownSpots');
    }
  }

  // Yellow Leaves
  if (
    text.includes('yellow') ||
    text.includes('yellowing') ||
    text.includes('పసుపు') ||
    text.includes('పచ్చగా') ||
    text.includes('పీలా') ||
    text.includes('पीली') ||
    text.includes('पीलापन')
  ) {
    result.symptoms.push('yellowLeaves');
  }

  // Insects / Pests
  if (
    text.includes('insect') ||
    text.includes('pest') ||
    text.includes('bug') ||
    text.includes('caterpillar') ||
    text.includes('worm') ||
    text.includes('పురుగు') ||
    text.includes('కీటక') ||
    text.includes('దోమ') ||
    text.includes('कीड़े') ||
    text.includes('कीट') ||
    text.includes('इल्ली')
  ) {
    result.symptoms.push('insects');
  }

  // Drying / Scorching
  if (
    text.includes('dry') ||
    text.includes('drying') ||
    text.includes('scorch') ||
    text.includes('burn') ||
    text.includes('ఎండి') ||
    text.includes('మాడి') ||
    text.includes('ఎండ') ||
    text.includes('सूख') ||
    text.includes('झुलस')
  ) {
    result.symptoms.push('drying');
  }

  // Wilting
  if (
    text.includes('wilt') ||
    text.includes('wilting') ||
    text.includes('droop') ||
    text.includes('వడలి') ||
    text.includes('వాలి') ||
    text.includes('మ్రగ్గి') ||
    text.includes('मुरझा')
  ) {
    result.symptoms.push('wilting');
  }

  // Poor Growth / Stunted
  if (
    text.includes('poor growth') ||
    text.includes('stunt') ||
    text.includes('not growing') ||
    text.includes('slow growth') ||
    text.includes('ఎదుగుదల') ||
    text.includes('ఎదగడం లేదు') ||
    text.includes('పెరగడం లేదు') ||
    text.includes('बढ़वार') ||
    text.includes('वृद्धि नहीं') ||
    text.includes('कमजोर')
  ) {
    result.symptoms.push('poorGrowth');
  }

  // 3. AFFECTED AREA
  if (
    text.includes('> 50') ||
    text.includes('more than 50') ||
    text.includes('whole field') ||
    text.includes('entire field') ||
    text.includes('severe') ||
    text.includes('all over') ||
    text.includes('మొత్తం పొలం') ||
    text.includes('50 శాతం కంటే ఎక్కువ') ||
    text.includes('ఎక్కువ భాగం') ||
    text.includes('पूरा खेत') ||
    text.includes('50 प्रतिशत से अधिक') ||
    text.includes('बहुत ज्यादा')
  ) {
    result.affectedArea = '> 50%';
  } else if (
    text.includes('25% - 50%') ||
    text.includes('25 to 50') ||
    text.includes('half') ||
    text.includes('30%') ||
    text.includes('40%') ||
    text.includes('50%') ||
    text.includes('సగం') ||
    text.includes('25 నుండి 50') ||
    text.includes('आधा खेत') ||
    text.includes('25 से 50')
  ) {
    result.affectedArea = '25% - 50%';
  } else if (
    text.includes('10% - 25%') ||
    text.includes('10 to 25') ||
    text.includes('quarter') ||
    text.includes('15%') ||
    text.includes('20%') ||
    text.includes('25%') ||
    text.includes('10 నుండి 25') ||
    text.includes('పావు వంతు') ||
    text.includes('కొంచెం వ్యాపించింది') ||
    text.includes('10 से 25')
  ) {
    result.affectedArea = '10% - 25%';
  } else if (
    text.includes('< 10%') ||
    text.includes('less than 10') ||
    text.includes('isolated') ||
    text.includes('few plants') ||
    text.includes('5%') ||
    text.includes('కొద్దిగా') ||
    text.includes('కొద్ది చోట్ల') ||
    text.includes('10 శాతం కంటే తక్కువ') ||
    text.includes('10 प्रतिशत से कम') ||
    text.includes('कुछ ही पौधे')
  ) {
    result.affectedArea = '< 10%';
  }

  // 4. DURATION (DAYS ONWARDS)
  if (
    text.includes('more than 14') ||
    text.includes('more than two weeks') ||
    text.includes('15 days') ||
    text.includes('20 days') ||
    text.includes('month') ||
    text.includes('long time') ||
    text.includes('రెండు వారాలకు పైగా') ||
    text.includes('చాలా రోజుల నుండి') ||
    text.includes('15 రోజులు') ||
    text.includes('నెల') ||
    text.includes('दो सप्ताह से अधिक') ||
    text.includes('काफी दिनों से') ||
    text.includes('15 दिन से')
  ) {
    result.durationDays = '> 14 days';
  } else if (
    text.includes('8 to 14') ||
    text.includes('8 - 14') ||
    text.includes('two weeks') ||
    text.includes('2 weeks') ||
    text.includes('10 days') ||
    text.includes('12 days') ||
    text.includes('రెండు వారాలు') ||
    text.includes('8 నుండి 14') ||
    text.includes('పది రోజులు') ||
    text.includes('दो हफ्ते') ||
    text.includes('8 से 14 दिन') ||
    text.includes('10 दिन')
  ) {
    result.durationDays = '8 - 14 days';
  } else if (
    text.includes('4 to 7') ||
    text.includes('4 - 7') ||
    text.includes('a week') ||
    text.includes('one week') ||
    text.includes('5 days') ||
    text.includes('6 days') ||
    text.includes('past week') ||
    text.includes('వారం రోజులు') ||
    text.includes('వారం') ||
    text.includes('4 నుండి 7') ||
    text.includes('ఐదు రోజులు') ||
    text.includes('एक हफ्ता') ||
    text.includes('4 से 7 दिन') ||
    text.includes('पाँच दिन')
  ) {
    result.durationDays = '4 - 7 days';
  } else if (
    text.includes('1 to 3') ||
    text.includes('1 - 3') ||
    text.includes('yesterday') ||
    text.includes('2 days') ||
    text.includes('3 days') ||
    text.includes('just started') ||
    text.includes('recent') ||
    text.includes('ఇప్పుడే') ||
    text.includes('రెండు రోజులు') ||
    text.includes('మూడు రోజులు') ||
    text.includes('నిన్న') ||
    text.includes('1 నుండి 3') ||
    text.includes('1 से 3 दिन') ||
    text.includes('कल से') ||
    text.includes('अभी शुरू')
  ) {
    result.durationDays = '1 - 3 days';
  }

  // 5. WATER LEVEL
  if (
    text.includes('less water') ||
    text.includes('not enough water') ||
    text.includes('dry') ||
    text.includes('drought') ||
    text.includes('deficit') ||
    text.includes('తక్కువ నీరు') ||
    text.includes('నీరు తక్కువ') ||
    text.includes('కరువు') ||
    text.includes('कम पानी') ||
    text.includes('सूखा')
  ) {
    result.waterLevel = 'less';
  } else if (
    text.includes('more water') ||
    text.includes('too much water') ||
    text.includes('heavy water') ||
    text.includes('flooded') ||
    text.includes('rain') ||
    text.includes('excess') ||
    text.includes('ఎక్కువ నీరు') ||
    text.includes('ఎక్కువ తేమ') ||
    text.includes('ముంపు') ||
    text.includes('జాలు') ||
    text.includes('ज्यादा पानी') ||
    text.includes('अधिक पानी') ||
    text.includes('बाढ़')
  ) {
    result.waterLevel = 'more';
  } else if (
    text.includes('normal water') ||
    text.includes('regular water') ||
    text.includes('adequate') ||
    text.includes('సాధారణ నీరు') ||
    text.includes('సరిపడా నీరు') ||
    text.includes('सामान्य पानी')
  ) {
    result.waterLevel = 'normal';
  }

  // 6. PREVIOUS CROP
  if (
    text.includes('previous crop groundnut') ||
    text.includes('previous crop pulses') ||
    text.includes('previous pulses') ||
    text.includes('gram') ||
    text.includes('soybean') ||
    text.includes('గతంలో పప్పు') ||
    text.includes('క్రితం పంట వేరుశనగ') ||
    text.includes('శనగ') ||
    text.includes('సోయా') ||
    text.includes('पिछली फसल मूंगफली') ||
    text.includes('पिछली फसल दाल') ||
    text.includes('चना')
  ) {
    result.previousCrop = 'Groundnut / Pulses (Gram, Soy)';
  } else if (
    text.includes('previous crop paddy') ||
    text.includes('previous crop rice') ||
    text.includes('గతంలో వరి') ||
    text.includes('క్రితం పంట వరి') ||
    text.includes('पिछली फसल धान') ||
    text.includes('पिछली फसल चावल')
  ) {
    result.previousCrop = 'Paddy / Rice';
  } else if (
    text.includes('previous crop cotton') ||
    text.includes('గతంలో పత్తి') ||
    text.includes('క్రితం పంట పత్తి') ||
    text.includes('पिछली फसल कपास')
  ) {
    result.previousCrop = 'Cotton';
  } else if (
    text.includes('previous crop maize') ||
    text.includes('previous crop corn') ||
    text.includes('millet') ||
    text.includes('గతంలో మొక్కజొన్న') ||
    text.includes('జొన్న') ||
    text.includes('पिछली फसल मक्का') ||
    text.includes('ज्वार')
  ) {
    result.previousCrop = 'Maize / Millets';
  } else if (
    text.includes('previous crop vegetable') ||
    text.includes('గతంలో కూరగాయలు') ||
    text.includes('पिछली फसल सब्जी')
  ) {
    result.previousCrop = 'Vegetables (Chilli, Tomato)';
  } else if (
    text.includes('fallow') ||
    text.includes('barren') ||
    text.includes('virgin land') ||
    text.includes('బీడు') ||
    text.includes('మొదటిసారి') ||
    text.includes('खाली खेत') ||
    text.includes('पहली बार')
  ) {
    result.previousCrop = 'Left Fallow / First time';
  }

  // Generate spoken feedback summary
  const summaryParts: string[] = [];
  if (result.crop) summaryParts.push(result.crop);
  if (result.symptoms.length > 0) summaryParts.push(result.symptoms.join(', '));
  if (result.affectedArea) summaryParts.push(`Area: ${result.affectedArea}`);
  if (result.durationDays) summaryParts.push(`Duration: ${result.durationDays}`);

  if (lang === 'te') {
    result.summaryFeedback = summaryParts.length > 0
      ? `${result.crop ? `పంట: ${result.crop}` : ''} వివరాలు నమోదయ్యాయి. దయచేసి ఇప్పుడు పంట ఫోటోను తీయండి లేదా అప్‌లోడ్ చేయండి.`
      : 'మీ మాటలను విన్నాము. దయచేసి పంట పేరు మరియు లక్షణాలను మళ్లీ చెప్పండి.';
  } else if (lang === 'hi') {
    result.summaryFeedback = summaryParts.length > 0
      ? `${result.crop ? `फसल: ${result.crop}` : ''} जानकारी दर्ज कर ली गई है। अब कृपया अपनी फसल की फोटो अपलोड करें।`
      : 'आपकी आवाज सुनी गई। कृपया फसल और समस्या दोबारा बोलें।';
  } else {
    result.summaryFeedback = summaryParts.length > 0
      ? `Recorded: ${summaryParts.join(' | ')}. Please take or upload a photo of your crop.`
      : 'Voice detected. Please speak your crop name, symptoms, or affected area.';
  }

  return result;
}
