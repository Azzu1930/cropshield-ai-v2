'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sprout,
  ShieldCheck,
  ArrowRight,
  LogIn,
  UserPlus,
  Sun,
  UserCheck,
  Lock,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { WeatherCard } from '@/components/WeatherCard';
import { HomeCards } from '@/components/HomeCards';
import { ExpertReviewTracker } from '@/components/ExpertReviewTracker';
import { RecentChecksSection } from '@/components/RecentChecksSection';

export default function HomePage() {
  const { t, language } = useLanguage();
  const { user, isLoading } = useAuth();

  // Loading skeleton while checking session
  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Loading Portal...</span>
      </div>
    );
  }

  // =========================================================================
  // 1. PUBLIC LANDING PAGE (Visible before Register & Login)
  // =========================================================================
  if (!user) {
    return (
      <div className="space-y-10 sm:space-y-14 animate-in fade-in pb-16">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-5 pt-4 sm:pt-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>
              {language === 'te'
                ? 'భారతీయ రైతుల కోసం అధికారిక AI సలహా కేంద్రం'
                : language === 'hi'
                ? 'भारतीय किसानों हेतु आधिकारिक AI सलाहकार पोर्टल'
                : 'National Farmer AI Advisory & Disease Protection'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {language === 'te'
              ? 'స్మార్ట్ పంట రక్షణ & ప్రత్యక్ష వ్యవసాయ సలహాలు'
              : language === 'hi'
              ? 'सटीक फसल सुरक्षा एवं विशेषज्ञ कृषि सलाह'
              : 'Smarter Crop Health & Direct Agritech Advisory'}
          </h1>

          <p className="text-sm sm:text-lg font-medium text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {language === 'te'
              ? 'పంట ఆకుల తెగుళ్ల తక్షణ గుర్తింపు, ఆటోమేటిక్ వాతావరణ హెచ్చరికలు మరియు KVK వ్యవసాయ శాస్త్రవేత్తల సిఫార్సులను పొందండి. ప్రారంభించడానికి మీ ఖాతాలోకి ప్రవేశించండి.'
              : language === 'hi'
              ? 'फसल के पत्तों की बीमारियों की त्वरित पहचान, स्वचालित मौसम जोखिम अलर्ट और कृषि वैज्ञानिकों की सीधी सलाह पाएं। शुरू करने के लिए अपना खाता बनाएं।'
              : 'Instant crop disease identification, automated GPS-based weather risk monitoring, and direct agricultural scientist guidance. Create a free account or login to access your portal.'}
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-base shadow-md flex items-center justify-center gap-2.5 transition-all"
            >
              <UserPlus className="w-5 h-5" />
              <span>
                {language === 'te'
                  ? 'రైతు ఉచిత రిజిస్ట్రేషన్'
                  : language === 'hi'
                  ? 'किसान निःशुल्क पंजीकरण'
                  : 'Register Free Farmer Account'}
              </span>
              <ArrowRight className="w-4 h-4 text-emerald-200" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-800 font-extrabold text-base shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              <LogIn className="w-5 h-5 text-slate-600" />
              <span>
                {language === 'te'
                  ? 'రైతు లాగిన్'
                  : language === 'hi'
                  ? 'किसान लॉगिन'
                  : 'Farmer Login'}
              </span>
            </Link>
          </div>
        </section>

        {/* Portal Access Requirement Notice Card */}
        <div className="max-w-2xl mx-auto p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5 text-slate-700 shadow-xs">
          <Lock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm font-medium leading-relaxed">
            <strong className="font-bold text-slate-900 block mb-0.5">
              {language === 'te' ? 'రైతు ఖాతా తప్పనిసరి' : language === 'hi' ? 'किसान खाता आवश्यक है' : 'Farmer Registration Required'}
            </strong>
            {language === 'te'
              ? 'మీ పొలం చిరునామా, పంట తనిఖీ చరిత్ర మరియు వ్యక్తిగత వాతావరణ వివరాలను భద్రపరచుకోవడానికి, రిజిస్ట్రేషన్ మరియు లాగిన్ అయిన తర్వాత మాత్రమే పోర్టల్ సేవలు అందుబాటులో ఉంటాయి.'
              : language === 'hi'
              ? 'आपके खेत का स्थान, पिछली फसल जांच का इतिहास और व्यक्तिगत मौसम डेटा सुरक्षित रखने के लिए पोर्टल की सेवाएं लॉगिन के बाद ही उपलब्ध होंगी।'
              : 'To keep your farm locations, past crop assessments, and localized weather insights private and secure, portal operations are unlocked only after you register and log in.'}
          </div>
        </div>

        {/* What You Get After Register & Login (Feature Grid) */}
        <section className="space-y-4">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              {language === 'te'
                ? 'లాగిన్ అయిన తర్వాత లభించే ముఖ్య సేవలు'
                : language === 'hi'
                ? 'लॉगिन के बाद उपलब्ध मुख्य सेवाएं'
                : 'Core Features Unlocked After Login'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              {language === 'te'
                ? 'భారతీయ వ్యవసాయ నిబంధనల ప్రకారం రూపొందించబడిన విశ్వసనీయ సేవలు'
                : language === 'hi'
                ? 'भारतीय कृषि मानकों के अनुसार प्रमाणित विश्वसनीय सेवाएं'
                : 'Reliable agritech modules built to ICAR & KVK standards'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Feature 1 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Sprout className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">
                {language === 'te' ? 'పంట తెగుళ్ల స్కానర్' : language === 'hi' ? 'फसल रोग स्कैनर' : 'Visual Leaf Disease AI'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {language === 'te'
                  ? 'ఆకు ఫోటో తీసి అప్‌లోడ్ చేస్తే తక్షణమే తెగులు పేరు మరియు ICAR గుర్తింపు పొందిన మందుల మోతాదును తెలుసుకోండి.'
                  : language === 'hi'
                  ? 'पत्ते की फोटो अपलोड करें और तुरंत रोग का नाम व अनुशंसित दवा की सटीक खुराक जानें।'
                  : 'Upload crop leaf photos to detect Rice Blast, Tomato Blight, Bollworm, and more with exact chemical/organic dosages.'}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">
                {language === 'te' ? 'ఆటోమేటిక్ వాతావరణం' : language === 'hi' ? 'स्वचालित मौसम ट्रैकिंग' : 'Auto Weather Detection'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {language === 'te'
                  ? 'మీ పొలం లొకేషన్ ఆధారంగా ఉష్ణోగ్రత, గాలిలో తేమ మరియు వర్ష సూచనను ఎలాంటి టైపింగ్ లేకుండా స్వయంచాలకంగా పొందుతుంది.'
                  : language === 'hi'
                  ? 'खेत के जीपीएस से तापमान, आर्द्रता और बारिश की संभावना बिना किसी मैन्युअल इनपुट के सीधे ट्रैक होती है।'
                  : 'Zero manual typing. Localized temperature, humidity, and rain probabilities automatically detected from your farm GPS.'}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">
                {language === 'te' ? 'వ్యవసాయ అధికారి సమీక్ష' : language === 'hi' ? 'कृषि वैज्ञानिक समीक्षा' : 'KVK Scientist Review'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {language === 'te'
                  ? 'కష్టమైన తెగుళ్లకు KVK వ్యవసాయ శాస్త్రవేత్తల అభిప్రాయం కోరండి మరియు స్థితిని ప్రత్యక్షంగా ట్రాక్ చేయండి.'
                  : language === 'hi'
                  ? 'जटिल समस्याओं के लिए कृषि विज्ञान केंद्र के विशेषज्ञों से दूसरी राय लें और स्थिति ट्रैक करें।'
                  : 'Escalate complex crop issues for second opinions from agricultural scientists with live review status tracking.'}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">
                {language === 'te' ? 'వ్యక్తిగత పొలం రికార్డులు' : language === 'hi' ? 'निजी खेत रिकॉर्ड' : 'Private Farm Ledger'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {language === 'te'
                  ? 'మీ మునుపటి పంట తనిఖీలు, పొలాలు మరియు నీటి పారుదల రికార్డులు పూర్తిగా మీ ఖాతాలోనే భద్రంగా ఉంటాయి.'
                  : language === 'hi'
                  ? 'आपके पिछले फसल रिकॉर्ड, खेत का विवरण केवल आपके खाते में पूरी गोपनीयता के साथ सुरक्षित रहते हैं।'
                  : 'Strict account-level data privacy. Your farms, diagnoses, and soil test records are never mixed with other users.'}
              </p>
            </div>
          </div>
        </section>

        {/* 3 Simple Steps Section */}
        <section className="p-6 sm:p-8 rounded-3xl bg-emerald-50/60 border border-emerald-200 space-y-6">
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-lg sm:text-xl font-black text-emerald-950">
              {language === 'te' ? 'ప్రారంభించడానికి 3 సులువైన దశలు' : language === 'hi' ? 'शुरू करने के 3 आसान कदम' : '3 Simple Steps to Start'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-emerald-100 space-y-2">
              <span className="w-7 h-7 rounded-full bg-emerald-700 text-white font-black text-xs flex items-center justify-center">1</span>
              <h4 className="font-bold text-sm text-slate-900">
                {language === 'te' ? 'ఖాతా తెరవండి' : language === 'hi' ? 'खाता बनाएं' : 'Register Account'}
              </h4>
              <p className="text-xs text-slate-600 font-medium">
                {language === 'te' ? 'మీ మొబైల్ నంబర్ లేదా ఈమెయిల్ తో 30 సెకన్లలో నమోదు చేసుకోండి.' : language === 'hi' ? 'अपने मोबाइल नंबर या ईमेल से 30 सेकंड में रजिस्टर करें।' : 'Sign up free with your phone number or email.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-emerald-100 space-y-2">
              <span className="w-7 h-7 rounded-full bg-emerald-700 text-white font-black text-xs flex items-center justify-center">2</span>
              <h4 className="font-bold text-sm text-slate-900">
                {language === 'te' ? 'పొలం లొకేషన్ జోడించండి' : language === 'hi' ? 'खेत का स्थान जोड़ें' : 'Add Farm Location'}
              </h4>
              <p className="text-xs text-slate-600 font-medium">
                {language === 'te' ? 'ఒక్క క్లిక్ తో లొకేషన్ గుర్తించి వాతావరణ హెచ్చరికలు ప్రారంభించండి.' : language === 'hi' ? 'एक क्लिक में जीपीएस से खेत जोड़ें और मौसम अलर्ट पाएं।' : 'Auto-detect coordinates with 1-click GPS or village search.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-emerald-100 space-y-2">
              <span className="w-7 h-7 rounded-full bg-emerald-700 text-white font-black text-xs flex items-center justify-center">3</span>
              <h4 className="font-bold text-sm text-slate-900">
                {language === 'te' ? 'పంట ఆరోగ్యం తనిఖీ చేయండి' : language === 'hi' ? 'फसल जांचें' : 'Check Crop Health'}
              </h4>
              <p className="text-xs text-slate-600 font-medium">
                {language === 'te' ? 'ఆకు ఫోటో తీసి ఖచ్చితమైన పరిష్కారం మరియు మందుల వివరాలు పొందండి.' : language === 'hi' ? 'पत्ते की फोटो लेकर तुरंत सटीक समाधान प्राप्त करें।' : 'Snap a leaf photo for instant remedy and treatment advice.'}
              </p>
            </div>
          </div>
        </section>

        {/* Ready to start CTA box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white text-center space-y-4">
          <h3 className="text-xl sm:text-2xl font-black">
            {language === 'te'
              ? 'మీ పంట దిగుబడిని కాపాడుకోవడానికి సిద్ధంగా ఉన్నారా?'
              : language === 'hi'
              ? 'अपनी फसल की पैदावार बढ़ाने के लिए तैयार हैं?'
              : 'Ready to Protect Your Crops & Maximize Yield?'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            {language === 'te'
              ? 'ఈరోజే నమోదు చేసుకోండి. కేవలం కొన్ని సెకన్లలో మీ వ్యక్తిగత వ్యవసాయ పోర్టల్ సిద్ధమవుతుంది.'
              : language === 'hi'
              ? 'आज ही रजिस्टर करें और कुछ ही सेकंड में अपना व्यक्तिगत पोर्टल शुरू करें।'
              : 'Register your free account today and access your personalized farm portal.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm transition-colors"
            >
              {language === 'te' ? 'ఇప్పుడే రిజిస్టర్ అవ్వండి' : language === 'hi' ? 'अभी रजिस्टर करें' : 'Register Free Account'}
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-colors border border-slate-700"
            >
              {language === 'te' ? 'ఖాతా ఉందా? లాగిన్' : language === 'hi' ? 'पहले से खाता है? लॉगिन' : 'Already have an account? Sign In'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. AUTHENTICATED FARMER PORTAL DASHBOARD (Visible AFTER Register & Login)
  // =========================================================================
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in">
      {/* Institutional Portal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {language === 'te'
                ? 'పంట రక్షణ & వ్యవసాయ సలహా కేంద్రం'
                : language === 'hi'
                ? 'फसल सुरक्षा एवं कृषि सलाहकार पोर्टल'
                : 'National Crop Health & Advisory Portal'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
            {t.tagline}
          </p>
        </div>

        <Link
          href="/check-crop"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-sm transition-colors shrink-0"
        >
          <Sprout className="w-4 h-4 text-white" />
          <span>{t.homeCards.checkCrop.title}</span>
          <ArrowRight className="w-4 h-4 text-emerald-200" />
        </Link>
      </div>

      {/* Account Status / Active Farmer Profile Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
            {user.name?.charAt(0).toUpperCase() || 'F'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{user.name}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                {language === 'te' ? 'రైతు ఖాతా' : language === 'hi' ? 'किसान खाता' : 'Farmer Account'}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {user.phone ? `+91 ${user.phone}` : user.email || 'Registered User'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Link
            href="/history"
            className="text-emerald-800 hover:text-emerald-950 underline underline-offset-4"
          >
            {t.homeCards.myReports.title}
          </Link>
          <span className="text-slate-300">•</span>
          <Link
            href="/farms"
            className="text-emerald-800 hover:text-emerald-950 underline underline-offset-4"
          >
            {t.homeCards.myFarms.title}
          </Link>
        </div>
      </div>

      {/* 1. Live Weather Card (Auto-detected per Farm, no manual typing) */}
      <section aria-label="Farm Weather">
        <WeatherCard />
      </section>

      {/* 2. Primary Agritech Modules */}
      <section aria-label="Agricultural Operations" className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">
          {language === 'te'
            ? 'ప్రధాన సేవలు'
            : language === 'hi'
            ? 'मुख्य सेवाएं'
            : 'Core Operations'}
        </h2>
        <HomeCards />
      </section>

      {/* 3. Live Agricultural Scientist / Expert Review Tracker */}
      <ExpertReviewTracker />

      {/* 4. Recent Crop Checks & Previously Checked History */}
      <RecentChecksSection />

      {/* 5. Advisory Disclaimer */}
      <footer className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 flex items-start gap-3 shadow-sm">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-normal">
          {t.common.disclaimer}
        </p>
      </footer>
    </div>
  );
}
