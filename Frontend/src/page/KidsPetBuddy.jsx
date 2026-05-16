import React, { useState, useRef } from "react";
import {
  PawPrint,
  ArrowRight,
  RotateCcw,
  FileText,
  X,
  Copy,
  CheckCircle,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { Link } from "react-router-dom";

function KidsPetBot() {
  const { language } = useLanguage();

  // ==================== TRANSLATIONS ====================
  const translations = {
    en: {
      title: "Buddy The Health Dog 🐶",
      subtitle: "A fun little buddy that helps kids stay healthy and happy.",
      start: "Start Fun Check",
      next: "Next Question",
      restart: "Play Again",
      dashboard: "Back To Dashboard",
      complete: "Assessment Complete 🎉",
      scoreText: "Buddy thinks you're doing",
      excellent: "Amazing! Keep going 🌟",
      good: "Good Job! Stay active 💪",
      average: "You can do even better 😊",
      bad: "Buddy wants you to be healthier ❤️",
      q1: "Did you drink enough water today?",
      q2: "Did you play or exercise today?",
      q3: "Did you eat healthy food today?",
      q4: "Did you sleep well last night?",
      q5: "Did you avoid too much sugary food?",
      yes: "Yes",
      no: "No",
      little: "A Little",
      happy: "Buddy is Happy 🐶",
      sad: "Buddy is Sad 🥺",
      thinking: "Buddy is Thinking 🤔",
      sendReport: "Send Health Report 📋",
      reportTitle: "My Health Report with Buddy",
      reportIntro: "Here's how you did today! 🌟",
      tipsTitle: "✨ Buddy's Healthy Tips For You ✨",
      close: "Close",
      copyReport: "Copy Report",
      reportSent: "Report copied! Show it to your parents! 🎉",
      // Motivational messages for each answer type & question
      q1_no: "Oh no! Water helps you run, jump and think. Let's drink more water tomorrow! 🚰💪",
      q1_little: "Good start! Try to drink one more glass of water next time. You can do it! 💧",
      q1_yes: "Wow! Staying hydrated makes Buddy super happy! Keep it up! 🐶💙",
      q2_no: "Don't worry! Playing keeps your heart strong. Shall we play for 10 minutes tomorrow? 🤸‍♂️",
      q2_little: "Moving a little is great! Let's try to play a bit more tomorrow! ⚽",
      q2_yes: "You're an active superstar! Exercise makes you strong and happy! 🏆",
      q3_no: "Healthy food gives you energy to play. Let's try one healthy bite tomorrow! 🥦",
      q3_little: "That's okay! Add one fruit or veggie next time. Yummy and healthy! 🍎",
      q3_yes: "Amazing! Healthy eating makes you grow big and strong! 🦸‍♀️",
      q4_no: "Sleep is superpower! Let's try going to bed a little earlier tonight. 😴✨",
      q4_little: "Almost there! A good night's sleep helps you learn and play better! 🌙",
      q4_yes: "Perfect! Good sleep = happy brain and happy Buddy! 🛌💤",
      q5_no: "Sugar is okay sometimes! But too much makes us tired. Let's choose less sugar tomorrow! 🍭🚫",
      q5_little: "Nice control! Cutting down sugar bit by bit makes Buddy proud! 🐶👍",
      q5_yes: "Superb! Avoiding extra sugar keeps your teeth and body healthy! 🦷✨",
    },
    hi: {
      title: "बडी हेल्थ डॉग 🐶",
      subtitle: "एक मजेदार दोस्त जो बच्चों को स्वस्थ और खुश रहने में मदद करता है।",
      start: "मज़ेदार जांच शुरू करें",
      next: "अगला सवाल",
      restart: "फिर से खेलें",
      dashboard: "डैशबोर्ड पर जाएं",
      complete: "जांच पूरी हुई 🎉",
      scoreText: "बडी को लगता है कि आप",
      excellent: "बहुत शानदार! ऐसे ही जारी रखें 🌟",
      good: "बहुत अच्छा! एक्टिव रहें 💪",
      average: "आप और बेहतर कर सकते हैं 😊",
      bad: "बडी चाहता है कि आप स्वस्थ रहें ❤️",
      q1: "क्या आपने आज पर्याप्त पानी पिया?",
      q2: "क्या आपने आज खेला या व्यायाम किया?",
      q3: "क्या आपने आज स्वस्थ भोजन खाया?",
      q4: "क्या आपने कल रात अच्छी नींद ली?",
      q5: "क्या आपने ज्यादा मीठा खाने से बचा?",
      yes: "हाँ",
      no: "नहीं",
      little: "थोड़ा",
      happy: "बडी खुश है 🐶",
      sad: "बडी उदास है 🥺",
      thinking: "बडी सोच रहा है 🤔",
      sendReport: "रिपोर्ट भेजें 📋",
      reportTitle: "बडी के साथ मेरी हेल्थ रिपोर्ट",
      reportIntro: "ये रहा आपका आज का स्वास्थ्य सारांश! 🌟",
      tipsTitle: "✨ बडी के स्वास्थ्य सुझाव ✨",
      close: "बंद करें",
      copyReport: "रिपोर्ट कॉपी करें",
      reportSent: "रिपोर्ट कॉपी हो गई! मम्मी-पापा को दिखाएं! 🎉",
      q1_no: "अरे नहीं! पानी से दिमाग तेज और शरीर एक्टिव रहता है। कल ज्यादा पानी पीने की कोशिश करें! 💧",
      q1_little: "अच्छी शुरुआत है! थोड़ा और पानी पीने से बडी खुश हो जाएगा। आप कर सकते हो! 🚰",
      q1_yes: "वाह! इतना पानी पीकर आपने बडी को बहुत खुश किया! 🐶💙",
      q2_no: "कोई बात नहीं! कल 10 मिनट जरूर खेलेंगे, चाहें? दिल और दिमाग के लिए जरूरी है! 🤸‍♀️",
      q2_little: "थोड़ा खेलना भी बहुत अच्छा है! कल और ज्यादा दौड़ने की कोशिश करें! ⚽",
      q2_yes: "आप तो एक्सरसाइज चैंपियन हो! खेलने से शरीर मजबूत बनता है! 💪",
      q3_no: "हेल्दी खाना खेलने की ताकत देता है। कल एक हरी सब्जी या फल जरूर खाएं! 🥗",
      q3_little: "कोई बात नहीं! अगली बार एक सेब या केला खाएं, बहुत टेस्टी और हेल्दी! 🍌",
      q3_yes: "कमाल! हेल्दी खाना खाने से आप बड़े और मजबूत बनेंगे। शानदार! 🌟",
      q4_no: "नींद सुपरपावर है! थोड़ा जल्दी सोने की कोशिश करेंगे? 😴🌙",
      q4_little: "बहुत बढ़िया! अच्छी नींद से दिमाग तेज होता है और बडी भी खुश! 🛌",
      q4_yes: "वाह! पूरी नींद लेने से आप तरोताजा रहते हो। परफेक्ट! 💤",
      q5_no: "मीठा कभी-कभी ठीक है, लेकिन ज्यादा सेहत के लिए ठीक नहीं। कल कम मीठा खाने की कोशिश करें! 🍬",
      q5_little: "बहुत अच्छा! धीरे-धीरे मीठा कम करना बडी को पसंद है। आप मेहनती हो! 👍",
      q5_yes: "शानदार! कम मीठा खाने से दांत और शरीर दोनों स्वस्थ रहते हैं। बडी को गर्व है! 🦷",
    },
  };

  const t = translations[language];
  const questions = [t.q1, t.q2, t.q3, t.q4, t.q5];

  // Question-specific keys for motivational messages (q1_no, q1_little, etc.)
  const getMotivationKey = (qIndex, answerType) => {
    const qMap = ["q1", "q2", "q3", "q4", "q5"];
    return `${qMap[qIndex]}_${answerType}`;
  };

  const getFeedbackMessage = (qIndex, answerType) => {
    const key = getMotivationKey(qIndex, answerType);
    return translations[language][key] || (answerType === "yes" ? "Great job! 🎉" : answerType === "little" ? "Nice try! Keep improving! 💪" : "Don't worry! Try better tomorrow! ❤️");
  };

  const dogGifs = {
    happy: "https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif",
    sad: "https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif",
    thinking: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
  };

  // ==================== STATE ====================
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [emotion, setEmotion] = useState("thinking");
  const [answersHistory, setAnswersHistory] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [answering, setAnswering] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const timeoutRef = useRef(null);

  // ==================== HANDLE ANSWER ====================
  const handleAnswer = (type) => {
    if (answering) return; // Prevent double answers

    let points = 0;
    if (type === "yes") {
      points = 2;
      setEmotion("happy");
    } else if (type === "little") {
      points = 1;
      setEmotion("thinking");
    } else {
      points = 0;
      setEmotion("sad");
    }

    const updatedScore = score + points;
    setScore(updatedScore);
    setAnswering(true);

    // Store answer history
    const newAnswer = {
      question: questions[currentQuestion],
      answerType: type,
      points: points,
      feedback: getFeedbackMessage(currentQuestion, type),
    };
    setAnswersHistory((prev) => [...prev, newAnswer]);

    // Show motivational feedback for this answer (especially improvement for negative)
    const msg = getFeedbackMessage(currentQuestion, type);
    setFeedbackMessage(msg);

    // Move to next or complete after delay
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setFeedbackMessage("");
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion((prev) => prev + 1);
        setEmotion("thinking");
        setAnswering(false);
      } else {
        setCompleted(true);
        setAnswering(false);
      }
    }, 2000);
  };

  // ==================== RESTART GAME ====================
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
    setShowReportModal(false);
    setCopySuccess(false);
  };

  // ==================== RESULT BASED ON SCORE ====================
  const getResult = () => {
    if (score >= 8) return { text: t.excellent, color: "text-green-600", emoji: "🌟" };
    if (score >= 5) return { text: t.good, color: "text-blue-600", emoji: "💪" };
    if (score >= 3) return { text: t.average, color: "text-yellow-600", emoji: "😊" };
    return { text: t.bad, color: "text-red-500", emoji: "❤️" };
  };
  const result = getResult();

  // ==================== GENERATE REPORT DATA ====================
  const generateReportText = () => {
    const date = new Date().toLocaleDateString();
    let report = `${t.reportTitle}\n📅 ${date}\n\n${t.reportIntro}\n\n`;
    answersHistory.forEach((ans, idx) => {
      const answerText = ans.answerType === "yes" ? t.yes : ans.answerType === "little" ? t.little : t.no;
      report += `${idx + 1}. ${ans.question}\n   👉 ${answerText}\n   💬 ${ans.feedback}\n\n`;
    });
    report += `🏆 ${t.scoreText}: ${score}/10\n`;
    report += `✨ ${result.text} ${result.emoji}\n\n`;
    report += `${t.tipsTitle}\n`;
    if (score < 5) {
      report += "🌱 Every small healthy step makes Buddy happy! Try one improvement tomorrow.\n";
    } else if (score < 8) {
      report += "🎯 You're doing great! Pick one healthy habit and level up this week.\n";
    } else {
      report += "⭐ You're a health champion! Keep inspiring everyone!\n";
    }
    report += `\n🐶 ${t.title} - Your health buddy always cheers for you!`;
    return report;
  };

  const handleSendReport = () => {
    setShowReportModal(true);
    setCopySuccess(false);
  };

  const copyReportToClipboard = () => {
    const reportText = generateReportText();
    navigator.clipboard.writeText(reportText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // ==================== MODAL FOR REPORT ====================
  const ReportModal = () => {
    if (!showReportModal) return null;
    const reportText = generateReportText();
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-white p-5 border-b flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-6 h-6 text-green-500" /> {t.reportTitle}
            </h3>
            <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6">
            <pre className="whitespace-pre-wrap font-sans text-gray-700 bg-gray-50 p-4 rounded-2xl text-sm">
              {reportText}
            </pre>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={copyReportToClipboard}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full font-semibold transition"
              >
                {copySuccess ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copySuccess ? t.reportSent : t.copyReport}
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="bg-gray-200 hover:bg-gray-300 px-5 py-2 rounded-full font-semibold"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-green-500 p-8 text-center text-white">
          <div className="flex justify-center">
            <div className="bg-white/20 p-5 rounded-full">
              <PawPrint className="w-14 h-14" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mt-4">{t.title}</h1>
          <p className="mt-3 text-lg opacity-90">{t.subtitle}</p>
        </div>

        {/* Start Screen */}
        {!started && !completed && (
          <div className="p-10 text-center">
            <img
              src={dogGifs.thinking}
              alt="dog"
              className="w-72 h-72 object-cover mx-auto rounded-3xl shadow-xl"
            />
            <p className="mt-6 text-2xl font-semibold text-gray-700">{t.thinking}</p>
            <button
              onClick={() => setStarted(true)}
              className="mt-8 bg-gradient-to-r from-blue-500 to-green-500 text-white px-10 py-4 rounded-3xl text-xl font-bold shadow-xl hover:scale-105 transition-all"
            >
              {t.start}
            </button>
          </div>
        )}

        {/* Questions Section */}
        {started && !completed && (
          <div className="p-8 md:p-10 text-center">
            <img
              src={dogGifs[emotion]}
              alt="dog"
              className="w-72 h-72 object-cover mx-auto rounded-3xl shadow-xl"
            />
            <p className="mt-4 text-xl font-semibold text-gray-700">
              {emotion === "happy" ? t.happy : emotion === "sad" ? t.sad : t.thinking}
            </p>

            {/* Feedback message for improvement */}
            {feedbackMessage && (
              <div className="mt-3 mx-auto max-w-md bg-yellow-50 border-l-4 border-yellow-400 text-gray-700 p-3 rounded-2xl animate-bounce">
                <p className="font-medium">{feedbackMessage}</p>
              </div>
            )}

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
              <p className="mt-2 text-gray-500 text-sm">
                {currentQuestion + 1} / {questions.length}
              </p>
            </div>

            {/* Question */}
            <h2 className="mt-8 text-3xl font-bold text-gray-800 leading-relaxed">
              {questions[currentQuestion]}
            </h2>

            {/* Answer Buttons */}
            <div className="grid md:grid-cols-3 gap-4 mt-10">
              <button
                onClick={() => handleAnswer("yes")}
                disabled={answering}
                className="bg-green-500 hover:bg-green-600 text-white py-4 rounded-3xl text-lg font-bold shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
              >
                😊 {t.yes}
              </button>
              <button
                onClick={() => handleAnswer("little")}
                disabled={answering}
                className="bg-yellow-400 hover:bg-yellow-500 text-white py-4 rounded-3xl text-lg font-bold shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
              >
                😐 {t.little}
              </button>
              <button
                onClick={() => handleAnswer("no")}
                disabled={answering}
                className="bg-red-500 hover:bg-red-600 text-white py-4 rounded-3xl text-lg font-bold shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
              >
                😢 {t.no}
              </button>
            </div>
          </div>
        )}

        {/* Result Screen */}
        {completed && (
          <div className="p-10 text-center">
            <img
              src={score >= 5 ? dogGifs.happy : dogGifs.sad}
              alt="dog"
              className="w-72 h-72 object-cover mx-auto rounded-3xl shadow-xl"
            />
            <h2 className="text-4xl font-bold text-gray-800 mt-8">{t.complete}</h2>
            <p className="mt-4 text-xl text-gray-600">{t.scoreText}</p>
            <p className={`mt-4 text-3xl font-bold ${result.color}`}>
              {result.text}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
              <button
                onClick={restartGame}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-3xl text-lg font-bold shadow-lg hover:scale-105 transition-all"
              >
                <RotateCcw className="w-5 h-5" />
                {t.restart}
              </button>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-3xl text-lg font-bold shadow-lg hover:scale-105 transition-all"
              >
                <ArrowRight className="w-5 h-5" />
                {t.dashboard}
              </Link>
              <button
                onClick={handleSendReport}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-3xl text-lg font-bold shadow-lg hover:scale-105 transition-all"
              >
                <FileText className="w-5 h-5" />
                {t.sendReport}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal />
    </div>
  );
}

export default KidsPetBot;