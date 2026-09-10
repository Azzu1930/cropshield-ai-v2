export type SupportedLanguage = 'en' | 'te' | 'hi';

export interface TranslationDictionary {
  appTitle: string;
  appSubtitle: string;
  tagline: string;
  
  // Navigation & Home
  nav: {
    home: string;
    checkCrop: string;
    farms: string;
    weather: string;
    reports: string;
    expert: string;
    history: string;
    soil: string;
    water: string;
    switchLanguage: string;
    selectFarm: string;
    listen: string;
    stopListening: string;
    login: string;
    register: string;
    logout: string;
    profile: string;
  };

  auth: {
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    phoneTab: string;
    emailTab: string;
    fullName: string;
    phoneNumber: string;
    emailAddress: string;
    password: string;
    confirmPassword: string;
    preferredLanguage: string;
    loginBtn: string;
    registerBtn: string;
    demoLoginBtn: string;
    noAccountPrompt: string;
    haveAccountPrompt: string;
    loginSuccess: string;
    registerSuccess: string;
    phoneOrEmailLabel: string;
  };

  recentChecks: {
    title: string;
    viewAll: string;
    noChecksYet: string;
  };

  // 8 Home Screen Large Cards
  homeCards: {
    checkCrop: { title: string; desc: string };
    uploadPhoto: { title: string; desc: string };
    myFarms: { title: string; desc: string };
    water: { title: string; desc: string };
    soilTest: { title: string; desc: string };
    weather: { title: string; desc: string };
    myReports: { title: string; desc: string };
    askExpert: { title: string; desc: string };
  };

  // Weather Card
  weatherCard: {
    title: string;
    farmPrefix: string;
    humidity: string;
    rainfall: string;
    wind: string;
    rainProb: string;
    weatherImpactTitle: string;
    weatherImpactDesc: string;
    seeDetails: string;
    lastUpdated: string;
    tempUnavailable: string;
    cachedNotice: string;
    rainLikelyToday: string;
  };

  // 7-Step Crop Check Wizard
  wizard: {
    step1Title: string; // What crop do you want to check?
    step2Title: string; // Take or upload a photo
    step3Title: string; // What's wrong with the crop?
    step4Title: string; // How much water did you give?
    step5Title: string; // Do you have a soil test?
    step6Title: string; // Automatic weather
    step7Title: string; // Checking your crop...

    // Step 1 Crops
    crops: {
      rice: string;
      maize: string;
      tomato: string;
      chilli: string;
      groundnut: string;
      cotton: string;
      other: string;
    };

    // Step 2 Photo
    takePhoto: string;
    choosePhoto: string;
    photoTip: string;
    rephoto: string;
    validatingPhoto: string;
    photoInvalidHuman: string;
    photoInvalidGeneral: string;
    photoCropNotDetected: string;

    // Step 3 Symptoms
    symptoms: {
      yellowLeaves: string;
      brownSpots: string;
      insects: string;
      drying: string;
      wilting: string;
      poorGrowth: string;
      podRot: string;
      dontKnow: string;
    };

    // Step 4 Field Impact & History
    fieldImpact: {
      title: string;
      subtitle: string;
      areaQuestion: string;
      durationQuestion: string;
      previousCropQuestion: string;
      areas: {
        lessThan10: string;
        from10to25: string;
        from25to50: string;
        moreThan50: string;
      };
      durations: {
        days1to3: string;
        days4to7: string;
        days8to14: string;
        moreThan14: string;
      };
      previousCrops: {
        groundnutPulses: string;
        paddyRice: string;
        cotton: string;
        maizeMillets: string;
        vegetables: string;
        fallowVirgin: string;
        other: string;
      };
    };

    // Live Voice Assistant
    voice: {
      startListening: string;
      stopListening: string;
      listeningStatus: string;
      processing: string;
      speakNow: string;
      detectedPrompt: string;
      uploadPhotoPrompt: string;
      micPermissionDenied: string;
      notSupported: string;
      clickOrSpeakHelp: string;
    };

    // Step 4 Water
    water: {
      lessThanUsual: string;
      normal: string;
      moreThanUsual: string;
      enterAmountOptional: string;
      amountPlaceholder: string;
    };

    // Step 5 Soil
    soil: {
      question: string;
      yesUpload: string;
      noContinue: string;
      phLabel: string;
    };

    // Step 6 Weather
    weatherChecking: string;
    weatherAutoDetected: string;
    yourFarm: string;
    noTypingNeeded: string;

    // Step 7 Progress
    progress: {
      checkingPhoto: string;
      checkingSymptoms: string;
      checkingWeather: string;
      checkingWater: string;
      checkingSoil: string;
      comparingHistory: string;
      preparingRecs: string;
    };

    buttons: {
      next: string;
      back: string;
      startCheck: string;
      viewResult: string;
    };
  };

  // Result Page
  result: {
    cropHealthTitle: string;
    possibleProblemTitle: string;
    howSeriousTitle: string;
    seriousness: {
      low: string;
      medium: string;
      high: string;
      healthy: string;
    };
    whatShouldIDoTitle: string;
    whyTitle: string;
    resultConfidenceTitle: string;
    confidence: {
      high: string;
      medium: string;
      low: string;
    };
    whyToggle: string;
    expertPrompt: string;
    askExpertBtn: string;
    expertSavedNotice: string;
    checkAgainNotice: string;
    listenResult: string;
    preliminaryNotice: string;
    comparedWithLast: string;
    comparisonStatus: {
      better: string;
      same: string;
      needsAttention: string;
    };
  };

  // Location & Farm Management
  location: {
    useMyLocation: string;
    detectingLocation: string;
    locationDetected: string;
    searchLocation: string;
    searchPlaceholder: string;
    addFarmTitle: string;
    farmNamePlaceholder: string;
    state: string;
    district: string;
    locality: string;
    saveFarm: string;
    selectExisting: string;
  };

  // Disclaimers & Errors
  common: {
    disclaimer: string;
    errorGeneral: string;
    offlineMode: string;
    saving: string;
    loading: string;
    close: string;
  };
}
