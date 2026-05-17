import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { reportAPI, patientAPI } from "../services/api";
import RiskGraph from "../components/RiskGraph";
import { useUser } from "../context/UserContext";
import {
  AlertTriangle,
  Bot,
  HeartPulse,
  History,
  PawPrint,
  RefreshCcw,
  TrendingUp,
  Activity,
  Moon,
  Footprints,
  FileDown,
  CalendarRange,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import KidsBuddyWidget from "../components/KidsBuddyWidget";
import { exportPatientProfileToPdf } from "../utils/pdfExport";

import { useT, pickLang, useLanguage } from "../context/LanguageContext";
import { mrDashboard } from "../locales/mr";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

function UserDashboard() {

  const { language } = useLanguage();
  const { user } = useUser();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [latestReport, setLatestReport] = useState(null);
  const [allReports, setAllReports] = useState([]);
  const [progression, setProgression] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [prof, reports, prog] = await Promise.all([
          patientAPI.getProfile(),
          reportAPI.getAll(),
          patientAPI.getRiskProgression().catch(() => null),
        ]);
        setProfile(prof.data || prof.patient || prof);
        const list = reports.reports || reports.data || reports || [];
        const sorted = [...list].sort(
          (a, b) => new Date(b.reportDate) - new Date(a.reportDate)
        );
        setAllReports(sorted);
        setLatestReport(sorted[0] || null);
        setProgression(prog?.data || prog || null);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const riskScore =
    location.state?.riskScore ??
    (progression?.hasData
      ? Math.round(parseFloat(progression.averageRiskScore))
      : null) ??
    latestReport?.diabeticRiskScore ??
    profile?.diabeticScore ??
    "--";

  const riskLevel =
    location.state?.riskLevel ??
    (progression?.hasData ? progression.currentRiskLevel : null) ??
    latestReport?.riskLevel ??
    null;

  const trendChange = progression?.hasData
    ? `${progression.percentageChange >= 0 ? "+" : ""}${progression.percentageChange}%`
    : null;

  const displayName = profile?.name || user?.name || "User";
  const patientId = profile?._id || user?.id || "—";

  const translations = {

    en: {

      welcome: "Welcome Back",
      subtitle: "Your AI health companion is monitoring your progress",

      risk: "Diabetes Risk",
      medium: "Medium Risk",

      severity: "Severity Level",
      stage: "Stage 2 Warning",

      confidence: "AI Confidence",
      accuracy: "Prediction Accuracy",

      summary: "AI Health Summary",
      monthlySummary: "30-Day Health Summary",
      latestSummary: "Latest Report Summary",
      monthlyHint: "Combined overview from all reports in the last 30 days",
      latestHint: "From your most recent health test",
      exportProfile: "Export Full Profile PDF",
      noMonthly: "Complete a health test to build your 30-day summary.",
      noLatest: "No recent report yet.",

      summaryText:
        "Glucose fluctuations, reduced activity, and irregular sleep patterns indicate possible diabetes risk progression.",

      test: "Test Again",
      chatbot: "AI Chatbot",
      buddy: "Kids Buddy",
      reports: "Past Reports",

      testDesc: "Retake AI assessment",
      chatbotDesc: "Ask health questions",
      buddyDesc: "Talk with AI pet friend",
      nutrifinder: "NutriFinder",
      nutrifinderDesc: "Scan meals & nutrition",
      reportsDesc: "View scan history",

      progress: "Health Progress",

      increase: "Risk Increasing",

      recommendations: "Recommendations",

      rec1: "Increase water intake",
      rec2: "Reduce sugary drinks",
      rec3: "Sleep before 10 PM",
      rec4: "30 min outdoor activity",

      activity: "Activity",
      sleep: "Sleep",
      glucose: "Glucose",

      buddyTitle: "Kids Buddy",

      buddyText:
        "Hey Ahmed 🌟 Great job today! Let's drink more water and take a short evening walk together.",

      talk: "Talk To Buddy",
    },

    hi: {

      welcome: "वापसी पर स्वागत है",
      subtitle: "आपका AI हेल्थ साथी आपकी प्रगति की निगरानी कर रहा है",

      risk: "डायबिटीज जोखिम",
      medium: "मध्यम जोखिम",

      severity: "गंभीरता स्तर",
      stage: "स्टेज 2 चेतावनी",

      confidence: "AI विश्वास",
      accuracy: "पूर्वानुमान सटीकता",

      summary: "AI स्वास्थ्य सारांश",
      monthlySummary: "30-दिन का स्वास्थ्य सारांश",
      latestSummary: "नवीनतम रिपोर्ट सारांश",
      monthlyHint: "पिछले 30 दिन की सभी रिपोर्टों का संयुक्त अवलोकन",
      latestHint: "आपके सबसे हाल के स्वास्थ्य परीक्षण से",
      exportProfile: "पूर्ण प्रोफाइल PDF निर्यात",
      noMonthly: "30-दिन का सारांश बनाने के लिए स्वास्थ्य परीक्षण करें।",
      noLatest: "अभी कोई हाल की रिपोर्ट नहीं।",

      summaryText:
        "ग्लूकोज में उतार-चढ़ाव, कम गतिविधि और अनियमित नींद डायबिटीज जोखिम बढ़ने का संकेत देती है।",

      test: "फिर से टेस्ट करें",
      chatbot: "AI चैटबॉट",
      buddy: "किड्स बडी",
      reports: "पुरानी रिपोर्ट",

      testDesc: "AI मूल्यांकन दोबारा करें",
      chatbotDesc: "स्वास्थ्य प्रश्न पूछें",
      buddyDesc: "AI पालतू मित्र से बात करें",
      nutrifinder: "NutriFinder",
      nutrifinderDesc: "भोजन स्कैन और पोषण",
      reportsDesc: "पुरानी स्कैन रिपोर्ट देखें",

      progress: "स्वास्थ्य प्रगति",

      increase: "जोखिम बढ़ रहा है",

      recommendations: "सुझाव",

      rec1: "पानी ज्यादा पिएं",
      rec2: "मीठे पेय कम करें",
      rec3: "रात 10 बजे से पहले सोएं",
      rec4: "30 मिनट आउटडोर गतिविधि",

      activity: "गतिविधि",
      sleep: "नींद",
      glucose: "ग्लूकोज",

      buddyTitle: "किड्स बडी",

      buddyText:
        "हे अहमद 🌟 आज आपने बहुत अच्छा किया! चलो ज्यादा पानी पीते हैं और शाम को थोड़ी वॉक करते हैं।",

      talk: "बडी से बात करें",
    },
    mr: mrDashboard,
  };

  const t = useT(translations);

  const monthlySummary =
    profile?.monthlyHealthSummary || t.noMonthly;
  const latestSummary =
    profile?.latestHealthSummary ||
    latestReport?.healthSummary ||
    t.noLatest;

  const handleExportProfile = () => {
    if (!profile) return;
    exportPatientProfileToPdf(profile, allReports);
  };
  const aiConfidence = latestReport?.aiConfidence ?? 85;
  const recommendations =
    progression?.recommendations?.length > 0
      ? progression.recommendations.map((r) => r.message).slice(0, 4)
      : latestReport?.recommendation
      ? latestReport.recommendation.split(/[.;]\s+/).filter(Boolean).slice(0, 4)
      : [t.rec1, t.rec2, t.rec3, t.rec4];
  const progressData = (
    progression?.reportTimeline?.length
      ? progression.reportTimeline
      : allReports
  ).map((r) => ({
    date: new Date(r.date || r.reportDate).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    }),
    score: `${r.riskScore ?? r.diabeticRiskScore ?? 0}%`,
    level: r.riskLevel,
  }));
  const riskRingColor =
    riskLevel === "low"
      ? "border-green-400"
      : riskLevel === "high"
      ? "border-red-400"
      : "border-yellow-400";
  const riskTextColor =
    riskLevel === "low"
      ? "text-green-500"
      : riskLevel === "high"
      ? "text-red-500"
      : "text-yellow-500";

  const riskLabel =
    riskLevel === "low"
      ? pickLang("Low Risk", "कम जोखिम", mrDashboard.lowRisk, language)
      : riskLevel === "high"
      ? pickLang("High Risk", "उच्च जोखिम", mrDashboard.highRisk, language)
      : riskLevel === "medium"
      ? t.medium
      : pickLang("No data yet", "अद्याप डेटा नहीं", mrDashboard.noData, language);

  const actionCards = [
    {
      title: t.test,
      desc: t.testDesc,
      icon: <RefreshCcw className="w-8 h-8" />,
      color: "from-blue-500 to-cyan-500",
      link :"/test"
    },

    {
      title: t.chatbot,
      desc: t.chatbotDesc,
      icon: <Bot className="w-8 h-8" />,
      color: "from-purple-500 to-pink-500",
      link:"/chatbot"
    },

    {
      title: t.buddy,
      desc: t.buddyDesc,
      icon: <PawPrint className="w-8 h-8" />,
      color: "from-pink-500 to-rose-500",
      link:"/kidbuddy"
    },

    {
      title: t.nutrifinder,
      desc: t.nutrifinderDesc,
      icon: <UtensilsCrossed className="w-8 h-8" />,
      color: "from-lime-500 to-green-600",
      link: "/nutrifinder",
    },

    {
      title: t.reports,
      desc: t.reportsDesc,
      icon: <History className="w-8 h-8" />,
      color: "from-green-500 to-emerald-500",
      link : "/history"
    },
    {
      title: pickLang("Profile", "प्रोफाइल", mrDashboard.profile, language),
      desc: pickLang("Edit your health info", "अपनी जानकारी संपादित करें", mrDashboard.profileDesc, language),
      icon: <HeartPulse className="w-8 h-8" />,
      color: "from-indigo-500 to-blue-500",
      link: "/profile",
    },
  ];

  return (

    <div className="page-shell px-3 py-6 sm:px-6 md:px-12 md:py-12 pt-20 sm:pt-24 max-w-7xl mx-auto w-full">
        <Navbar/>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg mt-4 sm:mt-6 border border-white/50 ">

        <div className="flex flex-col md:flex-row justify-between items-center">

          <div>

            <h1 className="text-4xl font-bold text-gray-800">
              {t.welcome}, {displayName} 👋
            </h1>

            <p className="text-gray-500 mt-2 text-lg">
              {t.subtitle}
            </p>

          </div>

          <div className="w-full sm:w-auto shrink-0 flex flex-col gap-2 mt-4 sm:mt-0">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl shadow-lg font-semibold text-sm sm:text-base text-center">
              Patient ID : {String(patientId).slice(-8).toUpperCase()}
            </div>
            <button
              type="button"
              onClick={handleExportProfile}
              className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 px-4 py-2.5 rounded-2xl shadow-sm font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              <FileDown className="w-4 h-4 shrink-0" />
              {t.exportProfile}
            </button>
          </div>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">

        {/* Risk */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">

          <div className="flex items-center justify-between">

            <h2 className="text-xl font-bold text-gray-800">
              {t.risk}
            </h2>

            <HeartPulse className="text-red-500 w-8 h-8" />

          </div>

          <div className="flex justify-center mt-8">

            <div className="relative w-44 h-44">

              <div className="absolute inset-0 rounded-full border-[16px] border-gray-100"></div>

              <div className={`absolute inset-0 rounded-full border-[16px] ${riskRingColor} border-t-transparent rotate-45`}></div>

              <div className="absolute inset-0 flex flex-col items-center justify-center">

                <h1 className={`text-5xl font-bold ${riskTextColor}`}>
                  {riskScore === "--" ? "--" : `${riskScore}%`}
                </h1>

                <p className="text-gray-500 mt-2">
                  {riskLabel}
                </p>

              </div>
            </div>
          </div>
        </div>

        {/* Severity */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">

          <div className="flex items-center justify-between">

            <h2 className="text-xl font-bold text-gray-800">
              {t.severity}
            </h2>

            <AlertTriangle className="text-orange-500 w-8 h-8" />

          </div>

          <div className="mt-10">

            <div className="bg-orange-100 text-orange-700 text-center py-4 rounded-2xl font-bold text-2xl capitalize">
              {riskLevel || "No data yet"}
            </div>

            <div className="mt-8">

              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Progression</span>
                <span>{riskScore === "--" ? "--" : `${riskScore}%`}</span>
              </div>

              <div className="bg-gray-200 h-4 rounded-full overflow-hidden">

                <div
                  className="bg-gradient-to-r from-orange-400 to-red-500 h-full rounded-full"
                  style={{ width: riskScore === "--" ? "0%" : `${Math.min(100, Number(riskScore))}%` }}
                ></div>

              </div>
            </div>
          </div>
        </div>

        {/* AI Confidence */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">

          <div className="flex items-center justify-between">

            <h2 className="text-xl font-bold text-gray-800">
              {t.confidence}
            </h2>

            <Bot className="text-purple-500 w-8 h-8" />

          </div>

          <div className="text-center mt-12">

            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              80%
            </h1>

            <p className="text-gray-500 mt-3">
              {t.accuracy}
            </p>

          </div>
        </div>
      </div>

      <div className="mt-8">
        <RiskGraph
          timeline={progression?.reportTimeline || []}
          averageRisk={progression?.averageRiskScore}
          trendDirection={progression?.trendDirection}
          currentRisk={progression?.currentRiskScore}
        />
      </div>

      {/* Health Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8 border border-gray-100">
          <div className="flex items-start gap-3">
            <CalendarRange className="w-7 h-7 text-blue-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800">{t.monthlySummary}</h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">{t.monthlyHint}</p>
            </div>
          </div>
          <p className="text-gray-600 mt-4 text-sm sm:text-base leading-relaxed">{monthlySummary}</p>
          {profile?.monthlySummaryUpdatedAt && (
            <p className="text-xs text-gray-400 mt-3">
              Updated {new Date(profile.monthlySummaryUpdatedAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8 border border-gray-100">
          <div className="flex items-start gap-3">
            <Sparkles className="w-7 h-7 text-purple-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800">{t.latestSummary}</h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">{t.latestHint}</p>
            </div>
          </div>
          <p className="text-gray-600 mt-4 text-sm sm:text-base leading-relaxed">{latestSummary}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8 mt-6 sm:mt-8 border border-gray-100">

        <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
          {t.summary}
        </h2>

        {progressData.length > 0 ? (
        <div className="mt-6 sm:mt-10 flex items-end gap-2 sm:gap-3 h-40 sm:h-52 overflow-x-auto pb-2">
          {progressData.map((item, i) => {
            const h = Math.max(20, (parseInt(item.score, 10) / 100) * 200);
            const color =
              item.level === "low" ? "bg-green-400" : item.level === "medium" ? "bg-yellow-400" : "bg-red-400";
            return (
              <div key={i} className="flex flex-col items-center flex-1 min-w-[2.5rem]">
                <div className={`${color} w-full max-w-14 rounded-t-3xl`} style={{ height: `${h}px` }} />
                <span className="text-xs text-gray-500 mt-2 whitespace-nowrap">{item.date}</span>
              </div>
            );
          })}
        </div>
        ) : (
          <p className="text-gray-500 mt-4 text-sm">{t.noLatest}</p>
        )}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-4 sm:gap-6 mt-6 sm:mt-8">

        {actionCards.map((card, index) => (

          <Link to={card.link}
            key={index}
            className={`bg-gradient-to-r ${card.color} text-white p-5 sm:p-6 rounded-2xl shadow-lg hover:scale-[1.02] sm:hover:scale-[1.03] transition-all duration-300 cursor-pointer block border border-white/20`}
          >

            <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center">
              {card.icon}
            </div>

            <h2 className="text-2xl font-bold mt-6">
              {card.title}
            </h2>

            <p className="mt-2 opacity-90">
              {card.desc}
            </p>

          </Link>
        ))}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">

        {/* Progress */}
        <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">

          <h2 className="text-2xl font-bold text-gray-800">
            {t.progress}
          </h2>

          <div className="space-y-5 mt-8">

            {(progressData.length > 0 ? progressData : [{ date: "—", score: "No tests yet", level: "low" }]).map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl"
              >
                <span className="font-medium">{item.date}</span>
                <span className={`font-bold ${item.level === "low" ? "text-green-500" : item.level === "medium" ? "text-yellow-500" : "text-red-500"}`}>
                  {item.score}
                </span>
              </div>
            ))}
          </div>

          {trendChange && (
          <div className="mt-6 flex items-center gap-2 font-semibold">
            <TrendingUp className="w-5 h-5" />
            <span
              className={
                progression?.trendDirection === "decreasing"
                  ? "text-green-600"
                  : progression?.trendDirection === "increasing"
                  ? "text-red-600"
                  : "text-yellow-600"
              }
            >
              {progression?.trendDirection === "decreasing"
                ? pickLang("Risk decreasing", "जोखिम घट रहा है", mrDashboard.riskDecreasing, language)
                : progression?.trendDirection === "increasing"
                ? t.increase
                : pickLang("Risk stable", "जोखिम स्थिर", mrDashboard.riskStable, language)}{" "}
              {trendChange}
            </span>
          </div>
          )}
        </div>

        <KidsBuddyWidget
          displayName={displayName}
          riskLevel={riskLevel}
          sleepHours={latestReport?.sleepHours}
          trendDirection={progression?.trendDirection}
          recommendation={latestReport?.recommendation}
          talkLabel={t.talk}
          title={t.buddyTitle}
          subtitle={pickLang(
            "Your friendly health pet",
            "आपका दोस्ताना स्वास्थ्य पालतू",
            "तुमचा आरोग्य मित्र",
            language
          )}
        />
      </div>

      {/* Recommendation Cards */}
      <div className="bg-white rounded-3xl shadow-lg p-8 mt-8 border border-gray-100">

        <h2 className="text-2xl font-bold text-gray-800">
          {t.recommendations}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6 sm:mt-8">
          {recommendations.map((rec, i) => {
            const icons = [
              <Activity className="text-blue-500 w-8 h-8 mb-4" key="a" />,
              <HeartPulse className="text-pink-500 w-8 h-8 mb-4" key="h" />,
              <Moon className="text-purple-500 w-8 h-8 mb-4" key="m" />,
              <Footprints className="text-green-500 w-8 h-8 mb-4" key="f" />,
            ];
            const bgs = ["bg-blue-50", "bg-pink-50", "bg-purple-50", "bg-green-50"];
            return (
              <div key={i} className={`${bgs[i % 4]} p-5 rounded-2xl`}>
                {icons[i % 4]}
                <p className="font-semibold text-gray-700">{rec}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
