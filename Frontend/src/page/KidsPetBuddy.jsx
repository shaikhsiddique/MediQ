import React, { useState, useRef, useEffect } from "react";
import {
  PawPrint,
  ArrowRight,
  RotateCcw,
  FileText,
  X,
  CheckCircle,
  Loader2,
  Send,
  Star,
  Sparkles,
  Home,
} from "lucide-react";
import { useT, useLanguage, pickLang } from "../context/LanguageContext";
import { mrKidsBuddy } from "../locales/mr";
import { Link } from "react-router-dom";
import { reportAPI } from "../services/api";
import LanguageThemeControls from "../components/LanguageThemeControls";
import Navbar from "../components/Navbar";
import {
  getStoredMascot,
  setStoredMascot,
  mascotMediaUrl,
  answerTypeToEmotion,
  resolveQuizEmotion,
} from "../utils/kidsBuddyMascot";

const QUESTION_KEYS = [
  "water",
  "exercise",
  "healthyFood",
  "sleep",
  "sugar",
  "screenTime",
  "fruitsVeggies",
  "outdoorPlay",
  "hygiene",
  "mood",
];

const QUESTION_META = {
  water: { emoji: "💧", color: "from-sky-400 to-blue-500" },
  exercise: { emoji: "🏃", color: "from-orange-400 to-amber-500" },
  healthyFood: { emoji: "🥗", color: "from-green-400 to-emerald-500" },
  sleep: { emoji: "😴", color: "from-indigo-400 to-purple-500" },
  sugar: { emoji: "🍎", color: "from-pink-400 to-rose-500" },
  screenTime: { emoji: "📵", color: "from-violet-400 to-purple-500" },
  fruitsVeggies: { emoji: "🥕", color: "from-lime-400 to-green-500" },
  outdoorPlay: { emoji: "🌳", color: "from-teal-400 to-cyan-500" },
  hygiene: { emoji: "🪥", color: "from-cyan-400 to-blue-500" },
  mood: { emoji: "😊", color: "from-yellow-400 to-orange-400" },
};

const MAX_POINTS_PER_Q = 2;
const MAX_SCORE = QUESTION_KEYS.length * MAX_POINTS_PER_Q;

const FLOATING_ITEMS = ["⭐", "🌈", "🎈", "✨", "🐾", "💫"];

function FloatingDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {FLOATING_ITEMS.map((item, i) => (
        <span
          key={i}
          className="absolute text-2xl sm:text-3xl opacity-40 animate-bounce"
          style={{
            left: `${8 + i * 15}%`,
            top: `${10 + (i % 3) * 28}%`,
            animationDelay: `${i * 0.35}s`,
            animationDuration: `${2.2 + i * 0.2}s`,
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function ConfettiBurst({ active }) {
  if (!active) return null;
  const pieces = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden>
      {pieces.map((i) => (
        <span
          key={i}
          className="absolute text-xl animate-ping"
          style={{
            left: `${(i * 17) % 100}%`,
            top: `${(i * 13) % 60}%`,
            animationDelay: `${i * 0.08}s`,
            animationDuration: "1.2s",
          }}
        >
          {["🎉", "⭐", "🌟", "✨", "🎊"][i % 5]}
        </span>
      ))}
    </div>
  );
}

function BuddySpeech({ children, mood = "thinking" }) {
  const tailColor =
    mood === "happy"
      ? "border-green-200"
      : mood === "sad"
      ? "border-amber-200"
      : "border-blue-200";

  return (
    <div
      className={`relative mx-auto max-w-md bg-white dark:bg-slate-800 border-2 ${tailColor} rounded-3xl px-5 py-4 shadow-lg`}
    >
      <p className="text-base sm:text-lg font-semibold text-gray-800 dark:text-slate-100 leading-relaxed">
        {children}
      </p>
      <div
        className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[14px] border-l-transparent border-r-transparent ${
          mood === "happy"
            ? "border-t-green-200"
            : mood === "sad"
            ? "border-t-amber-200"
            : "border-t-blue-200"
        }`}
      />
    </div>
  );
}

function BuddyMascot({ mascot, state, className, alt = "Buddy" }) {
  const [ext, setExt] = useState("gif");
  const src = mascotMediaUrl(mascot, state, ext);

  const handleError = () => {
    if (ext === "gif") setExt("mp4");
  };

  if (ext === "mp4") {
    return (
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className={className}
        onError={() => setExt("emoji")}
      />
    );
  }

  if (ext === "emoji") {
    return (
      <span
        className={`${className} flex items-center justify-center text-7xl`}
        role="img"
        aria-label={alt}
      >
        {mascot === "cat" ? "🐱" : "🐶"}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}

function ProgressStars({ current, total, score }) {
  return (
    <div className="w-full max-w-md mx-auto space-y-3">
      <div className="flex justify-center gap-1 flex-wrap">
        {Array.from({ length: total }, (_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${
              i < current
                ? "fill-yellow-400 text-yellow-400 scale-110"
                : i === current
                ? "fill-yellow-200 text-yellow-500 animate-pulse"
                : "text-gray-300 dark:text-slate-600"
            }`}
          />
        ))}
      </div>
      <div className="h-3 bg-white/60 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-pink-400 via-yellow-400 to-green-400 transition-all duration-500 rounded-full"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
      <p className="text-center text-sm font-bold text-purple-700 dark:text-purple-300">
        ⭐ {score} {pickLang("stars so far!", "स्टार अब तक!", "पर्यंत तारे!", "stars")}
      </p>
    </div>
  );
}

function KidsPetBuddy() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Buddy the Health Pup",
      subtitle: "A super-fun wellness adventure! Answer honestly — Buddy cheers every step!",
      howToPlay: "Tap an answer, collect stars, and become a Health Hero!",
      start: "Let's Play!",
      restart: "Play Again",
      dashboard: "Back to Dashboard",
      complete: "You Did It!",
      scoreText: "Buddy says you're",
      excellent: "A Health Superstar!",
      good: "Doing Great — Keep Going!",
      average: "Good Start — Level Up Tomorrow!",
      needsLove: "Buddy believes in you — let's try one healthy habit tomorrow!",
      yes: "Yes!",
      no: "Not yet",
      little: "A little",
      happy: "Buddy is doing a happy dance!",
      sad: "Buddy still believes in you!",
      thinking: "Buddy is ready — let's go!",
      sendReport: "Save My Adventure",
      reportTitle: "My Buddy Health Adventure",
      reportIntro: "Here's your awesome health journey today:",
      tipsTitle: "Buddy's Power-Up Tips",
      close: "Close",
      reportSent: "Adventure saved! Check your dashboard.",
      reportError: "Oops! Could not save. Try again.",
      saving: "Saving your adventure...",
      viewDashboard: "See Dashboard",
      questionLabel: "Question",
      of: "of",
      pickAnswer: "Pick your answer:",
      starsPopup: "You earned",
      star: "star",
      stars: "stars",
      tipWater: "Drink water like a superhero — 6–8 glasses a day!",
      tipMove: "Dance, jump, or play tag for 30 fun minutes!",
      tipSleep: "Cozy sleep helps you grow strong and think clearly!",
      tipScreen: "Swap 15 minutes of screen time for outdoor play!",
      water: "Did you drink enough water today?",
      exercise: "Did you play or move your body for at least 30 minutes?",
      healthyFood: "Did you eat healthy meals (not too much junk food)?",
      sleep: "Did you sleep well last night (about 8–10 hours)?",
      sugar: "Did you skip too much candy, soda, or sugary snacks?",
      screenTime: "Did you keep screen time (TV, tablet, phone) in check?",
      fruitsVeggies: "Did you eat fruits or vegetables today?",
      outdoorPlay: "Did you play outside or breathe fresh air?",
      hygiene: "Did you brush your teeth and wash your hands well?",
      mood: "Did you feel happy and energetic for most of the day?",
    },
    mr: { ...mrKidsBuddy },
    hi: {
      title: "बडी हेल्थ पप",
      subtitle: "सुपर-फन वेलनेस एडवेंचर! सच बताएं — बडी हर कदम पर ताली बजाता है!",
      howToPlay: "जवाब चुनें, स्टार इकट्ठा करें, हेल्थ हीरो बनें!",
      start: "चलो खेलें!",
      restart: "फिर से खेलें",
      dashboard: "डैशबोर्ड पर जाएं",
      complete: "आपने कर दिया!",
      scoreText: "बडी कहता है आप",
      excellent: "हेल्थ सुपरस्टार!",
      good: "बहुत बढ़िया — जारी रखें!",
      average: "अच्छी शुरुआत — कल और मजबूत!",
      needsLove: "बडी को भरोसा है — कल एक स्वस्थ आदत आज़माएं!",
      yes: "हाँ!",
      no: "अभी नहीं",
      little: "थोड़ा",
      happy: "बडी खुशी से नाच रहा है!",
      sad: "बडी अभी भी आप पर भरोसा करता है!",
      thinking: "बडी तैयार है — चलो!",
      sendReport: "मेरा एडवेंचर सेव करें",
      reportTitle: "बडी के साथ मेरा हेल्थ एडवेंचर",
      reportIntro: "आज की आपकी शानदार यात्रा:",
      tipsTitle: "बडी के पावर-अप टिप्स",
      close: "बंद करें",
      reportSent: "सेव हो गया! डैशबोर्ड देखें।",
      reportError: "सेव नहीं हुआ। फिर कोशिश करें।",
      saving: "सेव हो रहा है...",
      viewDashboard: "डैशबोर्ड देखें",
      questionLabel: "सवाल",
      of: "में से",
      pickAnswer: "अपना जवाब चुनें:",
      starsPopup: "आपने कमाए",
      star: "स्टार",
      stars: "स्टार",
      tipWater: "सुपरहीरो की तरह पानी पिएं!",
      tipMove: "30 मिनट नाचें, कूदें या खेलें!",
      tipSleep: "अच्छी नींद से दिमाग मजबूत!",
      tipScreen: "स्क्रीन की जगह बाहर खेलें!",
      water: "क्या आपने आज पर्याप्त पानी पिया?",
      exercise: "क्या आपने 30 मिनट खेला या हिले?",
      healthyFood: "क्या आपने स्वस्थ खाना खाया?",
      sleep: "क्या आपने अच्छी नींद ली (8–10 घंटे)?",
      sugar: "क्या आपने ज्यादा मीठा कम खाया?",
      screenTime: "क्या स्क्रीन टाइम कम रखा?",
      fruitsVeggies: "क्या फल या सब्जी खाई?",
      outdoorPlay: "क्या बाहर खेला या ताजी हवा ली?",
      hygiene: "क्या दांत ब्रश और हाथ धोए?",
      mood: "क्या आप खुश और energetic थे?",
    },
  };

  const feedbackEn = {
    water: { yes: "Splash! Hydration hero!", little: "One more glass tomorrow — you got this!", no: "Water power-up tomorrow — Buddy's cheering!" },
    exercise: { yes: "Zoom! Activity champion!", little: "Nice moves — 10 more minutes tomorrow!", no: "Let's wiggle and play tomorrow!" },
    healthyFood: { yes: "Yum! Strong-body fuel!", little: "One more healthy bite next time!", no: "Try a colorful fruit tomorrow!" },
    sleep: { yes: "Zzz-power unlocked!", little: "Almost — cozy bed helps a lot!", no: "Earlier bedtime adventure tonight?" },
    sugar: { yes: "Sweet control superstar!", little: "Less sugar step by step — smart!", no: "Teeth and tummy will thank you tomorrow!" },
    screenTime: { yes: "Screen balance pro!", little: "Tiny less screen time tomorrow!", no: "More play, less scroll — deal?" },
    fruitsVeggies: { yes: "Rainbow food power!", little: "Add one more color tomorrow!", no: "Pick a fun fruit tomorrow!" },
    outdoorPlay: { yes: "Fresh air explorer!", little: "Short outdoor quest tomorrow!", no: "5 minutes outside counts — try it!" },
    hygiene: { yes: "Sparkle clean champion!", little: "Brush party tonight too!", no: "Small clean habits = big wins!" },
    mood: { yes: "Happy heart energy!", little: "Talk to someone you trust if needed!", no: "Tomorrow is a brand-new adventure!" },
  };

  const feedbackHi = {
    water: { yes: "शाबाश! पानी हीरो!", little: "कल एक गिलास और!", no: "कल पानी पावर-अप!" },
    exercise: { yes: "वाह! चैंपियन!", little: "कल 10 मिनट और!", no: "कल खेलते हैं!" },
    healthyFood: { yes: "यम! मजबूत शरीर!", little: "अगली बार एक और बाइट!", no: "कल रंगीन फल!" },
    sleep: { yes: "नींद पावर!", little: "थोड़ी और नींद!", no: "आज जल्दी सोएं!" },
    sugar: { yes: "मीठा कंट्रोल!", little: "धीरे-धीरे कम!", no: "कल कम मीठा!" },
    screenTime: { yes: "स्क्रीन प्रो!", little: "थोड़ा कम कल!", no: "ज्यादा खेल!" },
    fruitsVeggies: { yes: "रंगीन फूड!", little: "एक रंग और!", no: "कल एक फल!" },
    outdoorPlay: { yes: "ताजी हवा!", little: "थोड़ी देर बाहर!", no: "5 मिनट बाहर!" },
    hygiene: { yes: "चमकदार साफ!", little: "आज रात ब्रश!", no: "छोटी आदत, बड़ी जीत!" },
    mood: { yes: "खुश दिल!", little: "बात करें अगर उदास!", no: "कल नया एडवेंचर!" },
  };

  const feedbackMr = {
    water: { yes: "छान! पाणी हीरो!", little: "उद्या आणखी एक ग्लास!", no: "उद्या पाणी पावर-अप!" },
    exercise: { yes: "वाह! चॅम्पियन!", little: "उद्या 10 मिनिट अधिक!", no: "उद्या खेळूया!" },
    healthyFood: { yes: "यम! मजबूत शरीर!", little: "पुढच्या वेळी आणखी एक!", no: "उद्या फळ!" },
    sleep: { yes: "झोप पावर!", little: "थोडी अधिक झोप!", no: "लवकर झोपा!" },
    sugar: { yes: "गोड कंट्रोल!", little: "हळूहळू कमी!", no: "उद्या कमी गोड!" },
    screenTime: { yes: "स्क्रीन प्रो!", little: "उद्या थोडी कमी!", no: "जास्त खेळ!" },
    fruitsVeggies: { yes: "रंगीत अन्न!", little: "एक रंग अधिक!", no: "उद्या फळ!" },
    outdoorPlay: { yes: "ताजी हवा!", little: "थोडा वेळ बाहेर!", no: "5 मिनिट बाहेर!" },
    hygiene: { yes: "चमकदार स्वच्छ!", little: "आज रात्री ब्रश!", no: "लहान सवय, मोठी जिंक!" },
    mood: { yes: "आनंदी मन!", little: "उदास वाटल्यास बोला!", no: "उद्या नवा साहस!" },
  };

  const t = useT(translations);
  const feedbackMap =
    language === "hi" ? feedbackHi : language === "mr" ? feedbackMr : feedbackEn;

  const questions = QUESTION_KEYS.map((key) => ({
    key,
    text: t[key],
    ...QUESTION_META[key],
  }));

  const getFeedback = (key, answerType) =>
    feedbackMap[key]?.[answerType] || pickLang("Keep going!", "जारी रखें!", "पुढे चला!", language);

  const [mascot, setMascot] = useState(getStoredMascot);

  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [emotion, setEmotion] = useState("thinking");
  const [answersHistory, setAnswersHistory] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [answering, setAnswering] = useState(false);
  const [lastPoints, setLastPoints] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const timeoutRef = useRef(null);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const handleAnswer = (type) => {
    if (answering) return;

    const points = type === "yes" ? 2 : type === "little" ? 1 : 0;
    setEmotion(answerTypeToEmotion(type));
    setLastPoints(points);

    const q = questions[currentQuestion];
    const newAnswer = {
      questionKey: q.key,
      question: q.text,
      answerType: type,
      points,
      feedback: getFeedback(q.key, type),
    };

    setScore((s) => s + points);
    setAnswersHistory((prev) => [...prev, newAnswer]);
    setFeedbackMessage(newAnswer.feedback);
    setAnswering(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setFeedbackMessage("");
      setLastPoints(null);
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion((p) => p + 1);
        setEmotion("thinking");
        setAnswering(false);
      } else {
        setCompleted(true);
        setEmotion(
          resolveQuizEmotion({
            completed: true,
            score: score + points,
            maxScore: MAX_SCORE,
          })
        );
        setAnswering(false);
      }
    }, 2200);
  };

  const restartGame = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStarted(false);
    setCurrentQuestion(0);
    setScore(0);
    setCompleted(false);
    setEmotion("thinking");
    setAnswersHistory([]);
    setFeedbackMessage("");
    setAnswering(false);
    setLastPoints(null);
    setShowReportModal(false);
    setSubmitSuccess(false);
    setSubmitError("");
    setSubmitting(false);
  };

  const getResult = () => {
    if (score >= 16)
      return { text: t.excellent, color: "text-green-600", emoji: "🌟", bg: "from-green-400 to-emerald-500" };
    if (score >= 10)
      return { text: t.good, color: "text-blue-600", emoji: "💪", bg: "from-blue-400 to-cyan-500" };
    if (score >= 6)
      return { text: t.average, color: "text-amber-600", emoji: "😊", bg: "from-amber-400 to-yellow-500" };
    return {
      text: t.needsLove || t.bad,
      color: "text-purple-600",
      emoji: "💜",
      bg: "from-purple-400 to-pink-500",
    };
  };

  const result = getResult();
  const percent = Math.round((score / MAX_SCORE) * 100);
  const currentQ = questions[currentQuestion];

  const buildReportPayload = () => ({
    answers: answersHistory,
    totalScore: score,
    maxScore: MAX_SCORE,
    language,
  });

  const generateReportText = () => {
    const date = new Date().toLocaleDateString();
    let report = `${t.reportTitle}\n📅 ${date}\n\n${t.reportIntro}\n\n`;
    answersHistory.forEach((ans, idx) => {
      const answerText =
        ans.answerType === "yes" ? t.yes : ans.answerType === "little" ? t.little : t.no;
      report += `${idx + 1}. ${ans.question}\n   → ${answerText}\n   💬 ${ans.feedback}\n\n`;
    });
    report += `🏆 ${score}/${MAX_SCORE} (${percent}%)\n✨ ${result.text} ${result.emoji}\n`;
    return report;
  };

  const handleSendReport = async () => {
    setShowReportModal(true);
    setSubmitSuccess(false);
    setSubmitError("");
    setSubmitting(true);
    try {
      await reportAPI.submitKidsBuddy(buildReportPayload());
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(err.message || t.reportError);
    } finally {
      setSubmitting(false);
    }
  };

  const powerTips = [t.tipWater, t.tipMove, t.tipSleep, t.tipScreen];

  const answerOptions = [
    {
      type: "yes",
      label: t.yes,
      emoji: "🎉",
      className:
        "bg-gradient-to-br from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700 shadow-green-200",
    },
    {
      type: "little",
      label: t.little,
      emoji: "🌟",
      className:
        "bg-gradient-to-br from-amber-300 to-orange-400 hover:from-amber-400 hover:to-orange-500 shadow-amber-200",
    },
    {
      type: "no",
      label: t.no,
      emoji: "🤗",
      className:
        "bg-gradient-to-br from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 shadow-purple-200",
    },
  ];

  const ReportModal = () => {
    if (!showReportModal) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-purple-200 dark:border-purple-800">
          <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 p-5 flex justify-between items-center text-white rounded-t-2xl">
            <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6" />
              {t.reportTitle}
            </h3>
            <button
              type="button"
              onClick={() => setShowReportModal(false)}
              className="p-2 hover:bg-white/20 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-5 sm:p-6">
            {submitting && (
              <div className="flex items-center gap-3 text-purple-600 mb-4 font-medium">
                <Loader2 className="w-5 h-5 animate-spin" />
                {t.saving}
              </div>
            )}
            {submitSuccess && (
              <div className="flex items-center gap-2 text-green-600 mb-4 font-semibold bg-green-50 dark:bg-green-950/40 p-3 rounded-2xl">
                <CheckCircle className="w-5 h-5 shrink-0" />
                {t.reportSent}
              </div>
            )}
            {submitError && (
              <p className="text-red-600 mb-4 bg-red-50 p-3 rounded-2xl text-sm">{submitError}</p>
            )}
            <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-slate-200 bg-purple-50 dark:bg-slate-900 p-4 rounded-2xl text-sm border border-purple-100">
              {generateReportText()}
            </pre>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              {submitSuccess && (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 bg-green-500 text-white px-5 py-2.5 rounded-full font-bold"
                >
                  {t.viewDashboard}
                </Link>
              )}
              {!submitSuccess && !submitting && (
                <button
                  type="button"
                  onClick={handleSendReport}
                  className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-full font-bold"
                >
                  <Send className="w-5 h-5" />
                  Retry
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="bg-gray-200 dark:bg-slate-700 px-5 py-2.5 rounded-full font-bold"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-shell-kids min-h-screen relative pt-16 sm:pt-20 pb-8 px-3 sm:px-4">
      <Navbar />
      <ConfettiBurst active={completed} />
      <FloatingDecor />
      <LanguageThemeControls className="absolute top-20 right-3 sm:right-4 z-20" />

      <div className="relative z-10 w-full max-w-3xl mx-auto">
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-white dark:border-slate-600">
          {/* Header */}
          <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 p-6 sm:p-8 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
            <div className="relative flex justify-center">
              <div className="bg-white/25 p-4 sm:p-5 rounded-full ring-4 ring-white/40 animate-pulse">
                <PawPrint className="w-12 h-12 sm:w-14 sm:h-14" />
              </div>
            </div>
            <h1 className="relative text-2xl sm:text-4xl font-black mt-4 tracking-tight">
              {t.title} 🐶
            </h1>
            <p className="relative mt-2 text-sm sm:text-lg opacity-95 max-w-lg mx-auto">
              {t.subtitle}
            </p>
            <p className="relative mt-3 inline-flex items-center gap-1 bg-white/20 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              {questions.length} {pickLang("fun questions", "मजेदार सवाल", "मजेशीर प्रश्न", language)}
            </p>
          </div>

          <label className="relative -mt-2 mb-2 mx-auto flex w-fit items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-semibold text-white">
            <PawPrint className="w-4 h-4" />
            <select
              value={mascot}
              onChange={(e) => {
                const next = e.target.value === "cat" ? "cat" : "dog";
                setStoredMascot(next);
                setMascot(next);
              }}
              className="bg-transparent outline-none cursor-pointer"
              aria-label="Choose mascot"
            >
              <option value="dog" className="text-gray-900">Dog</option>
              <option value="cat" className="text-gray-900">Cat</option>
            </select>
          </label>

          {/* Intro */}
          {!started && !completed && (
            <div className="p-6 sm:p-10 text-center">
              <div className="relative inline-block">
                <BuddyMascot
                  mascot={mascot}
                  state="thinking"
                  className="w-48 h-48 sm:w-64 sm:h-64 object-cover mx-auto rounded-3xl shadow-xl ring-4 ring-purple-200"
                />
                <span className="absolute -top-2 -right-2 text-4xl animate-bounce">👋</span>
              </div>
              <BuddySpeech mood="thinking">
                {t.thinking} {t.howToPlay}
              </BuddySpeech>
              <button
                type="button"
                onClick={() => setStarted(true)}
                className="mt-8 w-full sm:w-auto bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white px-10 py-4 rounded-full text-lg sm:text-xl font-black shadow-xl hover:scale-105 active:scale-95 transition-transform"
              >
                🎮 {t.start}
              </button>
              <Link
                to="/dashboard"
                className="mt-4 inline-flex items-center gap-2 text-purple-600 dark:text-purple-300 font-semibold text-sm hover:underline"
              >
                <Home className="w-4 h-4" />
                {t.dashboard}
              </Link>
            </div>
          )}

          {/* Quiz */}
          {started && !completed && currentQ && (
            <div className="p-5 sm:p-8">
              <ProgressStars
                current={currentQuestion}
                total={questions.length}
                score={score}
              />

              <div className="mt-6 flex justify-center">
                <BuddyMascot
                  mascot={mascot}
                  state={emotion}
                  className="w-40 h-40 sm:w-52 sm:h-52 object-cover rounded-3xl shadow-lg ring-4 ring-white"
                />
              </div>

              <p className="text-center text-sm font-bold text-purple-600 dark:text-purple-300 mt-3">
                {emotion === "happy" ? t.happy : emotion === "sad" ? t.sad : t.thinking}
              </p>

              {feedbackMessage && (
                <div className="mt-4 animate-in fade-in">
                  <BuddySpeech mood={emotion === "happy" ? "happy" : "sad"}>
                    {feedbackMessage}
                  </BuddySpeech>
                  {lastPoints != null && lastPoints > 0 && (
                    <p className="text-center mt-3 text-lg font-black text-yellow-600 animate-bounce">
                      +{lastPoints} ⭐ {t.starsPopup}!
                    </p>
                  )}
                </div>
              )}

              <div
                className={`mt-8 rounded-3xl p-5 sm:p-6 bg-gradient-to-br ${currentQ.color} text-white shadow-lg`}
              >
                <p className="text-xs sm:text-sm font-bold uppercase tracking-wider opacity-90">
                  {t.questionLabel} {currentQuestion + 1} {t.of} {questions.length}
                </p>
                <p className="mt-3 text-4xl">{currentQ.emoji}</p>
                <h2 className="mt-2 text-xl sm:text-2xl font-black leading-snug">
                  {currentQ.text}
                </h2>
              </div>

              <p className="text-center text-gray-600 dark:text-slate-300 font-semibold mt-6 text-sm">
                {t.pickAnswer}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
                {answerOptions.map(({ type, label, emoji, className }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleAnswer(type)}
                    disabled={answering}
                    className={`${className} text-white py-4 sm:py-5 px-4 rounded-2xl sm:rounded-3xl text-lg font-black shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 flex flex-col items-center gap-1`}
                  >
                    <span className="text-3xl">{emoji}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {completed && (
            <div className="p-6 sm:p-10 text-center">
              <BuddyMascot
                mascot={mascot}
                state={resolveQuizEmotion({
                  completed: true,
                  score,
                  maxScore: MAX_SCORE,
                })}
                className="w-48 h-48 sm:w-64 sm:h-64 object-cover mx-auto rounded-3xl shadow-xl ring-4 ring-yellow-300"
              />
              <h2 className="text-3xl sm:text-4xl font-black text-gray-800 dark:text-white mt-6">
                {t.complete} 🎊
              </h2>

              <div
                className={`inline-block mt-4 px-8 py-4 rounded-3xl bg-gradient-to-r ${result.bg} text-white shadow-xl`}
              >
                <p className="text-4xl sm:text-5xl font-black">
                  {score}/{MAX_SCORE}
                </p>
                <p className="text-sm opacity-90 mt-1">{percent}%</p>
              </div>

              <p className="mt-4 text-lg text-gray-600 dark:text-slate-300">{t.scoreText}</p>
              <p className={`text-2xl sm:text-3xl font-black ${result.color}`}>
                {result.text} {result.emoji}
              </p>

              <div className="mt-8 text-left max-w-md mx-auto">
                <h3 className="font-black text-purple-700 dark:text-purple-300 flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5" />
                  {t.tipsTitle}
                </h3>
                <ul className="space-y-2">
                  {powerTips.map((tip, i) => (
                    <li
                      key={i}
                      className="bg-purple-50 dark:bg-slate-900/50 text-gray-700 dark:text-slate-200 px-4 py-3 rounded-2xl text-sm font-medium border border-purple-100 dark:border-slate-700"
                    >
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 mt-10">
                <button
                  type="button"
                  onClick={restartGame}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3.5 rounded-full text-base font-black shadow-lg hover:scale-105 transition-transform"
                >
                  <RotateCcw className="w-5 h-5" />
                  {t.restart}
                </button>
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3.5 rounded-full text-base font-black shadow-lg hover:scale-105 transition-transform"
                >
                  <ArrowRight className="w-5 h-5" />
                  {t.dashboard}
                </Link>
                <button
                  type="button"
                  onClick={handleSendReport}
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3.5 rounded-full text-base font-black shadow-lg hover:scale-105 transition-transform disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                  {submitting ? t.saving : t.sendReport}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <ReportModal />
    </div>
  );
}

export default KidsPetBuddy;
