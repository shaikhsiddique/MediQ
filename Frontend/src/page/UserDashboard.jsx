import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { reportAPI, patientAPI } from "../services/api";
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
} from "lucide-react";

import { useLanguage } from "../context/LanguageContext";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

function UserDashboard() {

  const { language } = useLanguage();
  const { user } = useUser();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [latestReport, setLatestReport] = useState(null);
  const [allReports, setAllReports] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [prof, reports] = await Promise.all([
          patientAPI.getProfile(),
          reportAPI.getAll(),
        ]);
        setProfile(prof.patient || prof);
        const list = reports.reports || reports || [];
        const sorted = [...list].sort(
          (a, b) => new Date(b.reportDate) - new Date(a.reportDate)
        );
        setAllReports(sorted);
        setLatestReport(sorted[0] || null);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const riskScore =
    location.state?.riskScore ??
    latestReport?.diabeticRiskScore ??
    profile?.diabeticScore ??
    "--";

  const riskLevel =
    location.state?.riskLevel ??
    latestReport?.riskLevel ??
    null;

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

      summaryText:
        "Glucose fluctuations, reduced activity, and irregular sleep patterns indicate possible diabetes risk progression.",

      test: "Test Again",
      chatbot: "AI Chatbot",
      buddy: "Kids Buddy",
      reports: "Past Reports",

      testDesc: "Retake AI assessment",
      chatbotDesc: "Ask health questions",
      buddyDesc: "Talk with AI pet friend",
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

      buddyTitle: "Buddy AI",

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

      summaryText:
        "ग्लूकोज में उतार-चढ़ाव, कम गतिविधि और अनियमित नींद डायबिटीज जोखिम बढ़ने का संकेत देती है।",

      test: "फिर से टेस्ट करें",
      chatbot: "AI चैटबॉट",
      buddy: "किड्स बडी",
      reports: "पुरानी रिपोर्ट",

      testDesc: "AI मूल्यांकन दोबारा करें",
      chatbotDesc: "स्वास्थ्य प्रश्न पूछें",
      buddyDesc: "AI पालतू मित्र से बात करें",
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

      buddyTitle: "बडी AI",

      buddyText:
        "हे अहमद 🌟 आज आपने बहुत अच्छा किया! चलो ज्यादा पानी पीते हैं और शाम को थोड़ी वॉक करते हैं।",

      talk: "बडी से बात करें",
    },
  };

  const t = translations[language];

  const aiSummary =
    latestReport?.healthSummary ||
    profile?.healthSummary ||
    t.summaryText;
  const aiConfidence = latestReport?.aiConfidence ?? 85;
  const recommendations = latestReport?.recommendation
    ? latestReport.recommendation.split(/[.;]\s+/).filter(Boolean).slice(0, 4)
    : [t.rec1, t.rec2, t.rec3, t.rec4];
  const progressData = allReports.slice(0, 5).map((r) => ({
    date: new Date(r.reportDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    score: `${r.diabeticRiskScore ?? 0}%`,
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
      ? (language === "hi" ? "कम जोखिम" : "Low Risk")
      : riskLevel === "high"
      ? (language === "hi" ? "उच्च जोखिम" : "High Risk")
      : riskLevel === "medium"
      ? t.medium
      : "No data yet";

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
      title: t.reports,
      desc: t.reportsDesc,
      icon: <History className="w-8 h-8" />,
      color: "from-green-500 to-emerald-500",
      link : "/history"
    },
    {
      title: language === "hi" ? "प्रोफाइल" : "Profile",
      desc: language === "hi" ? "अपनी जानकारी संपादित करें" : "Edit your health info",
      icon: <HeartPulse className="w-8 h-8" />,
      color: "from-indigo-500 to-blue-500",
      link: "/profile",
    },
  ];

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-12 my-12">
        <Navbar/>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg p-6 border border-white/50">

        <div className="flex flex-col md:flex-row justify-between items-center">

          <div>

            <h1 className="text-4xl font-bold text-gray-800">
              {t.welcome}, {displayName} 👋
            </h1>

            <p className="text-gray-500 mt-2 text-lg">
              {t.subtitle}
            </p>

          </div>

          <div className="mt-6 md:mt-0">

            <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-2xl shadow-lg font-semibold">
              Patient ID : {String(patientId).slice(-8).toUpperCase()}
            </div>

          </div>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid lg:grid-cols-3 gap-6 mt-8">

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
              {aiConfidence}%
            </h1>

            <p className="text-gray-500 mt-3">
              {t.accuracy}
            </p>

          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-white rounded-3xl shadow-lg p-8 mt-8 border border-gray-100">

        <h2 className="text-2xl font-bold text-gray-800">
          {t.summary}
        </h2>

        <p className="text-gray-600 mt-4 text-lg leading-relaxed">
          {aiSummary}
        </p>

        {progressData.length > 0 && (
        <div className="mt-10 flex items-end gap-3 h-52">
          {progressData.map((item, i) => {
            const h = Math.max(20, (parseInt(item.score, 10) / 100) * 200);
            const color =
              item.level === "low" ? "bg-green-400" : item.level === "medium" ? "bg-yellow-400" : "bg-red-400";
            return (
              <div key={i} className="flex flex-col items-center flex-1">
                <div className={`${color} w-full max-w-14 rounded-t-3xl`} style={{ height: `${h}px` }}></div>
                <span className="text-xs text-gray-500 mt-2">{item.date}</span>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">

        {actionCards.map((card, index) => (

          <Link to={card.link}
            key={index}
            className={`bg-gradient-to-r ${card.color} text-white p-6 rounded-3xl shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer`}
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
      <div className="grid lg:grid-cols-2 gap-6 mt-8">

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

          <div className="mt-6 flex items-center gap-2 text-red-600 font-semibold">

            <TrendingUp className="w-5 h-5" />

            {t.increase} +8%

          </div>
        </div>

        {/* Buddy */}
        <div className="bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 rounded-3xl shadow-lg p-6">

          <div className="flex items-center gap-5">

            <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center shadow-lg text-5xl">
              🐼
            </div>

            <div>

              <h2 className="text-3xl font-bold text-gray-800">
                {t.buddyTitle}
              </h2>

              <p className="text-gray-600 mt-1">
                Your friendly health pet
              </p>

            </div>
          </div>

          <div className="bg-white mt-8 rounded-3xl p-6 shadow-sm">

            <p className="text-lg text-gray-700 leading-relaxed">
              Hey {displayName.split(" ")[0]} 🌟 {latestReport?.recommendation?.split(".")[0] || t.buddyText}
            </p>

          </div>

          <Link to="/kidbuddy" className="mt-8 block w-full text-center bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 rounded-2xl text-lg font-semibold hover:shadow-xl transition-all">
            {t.talk}
          </Link>
        </div>
      </div>

      {/* Recommendation Cards */}
      <div className="bg-white rounded-3xl shadow-lg p-8 mt-8 border border-gray-100">

        <h2 className="text-2xl font-bold text-gray-800">
          {t.recommendations}
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
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
