
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { reportAPI } from "../services/api";

import {
  Moon,
  Droplets,
  Dumbbell,
  Utensils,
  HeartPulse,
  ClipboardEdit,
  Save,
  ArrowLeft,
  BatteryCharging,
  MessageSquare,
  Scale,
  Ruler,
  Upload,
  Bot,
} from "lucide-react";
import Navbar from "../components/Navbar";

import { useT } from "../context/LanguageContext";
import { mrTest } from "../locales/mr";

function Test() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const translations = {
    en: {
      title: "Quick Type 1 Diabetes Risk Test",
      subtitle:
        "Fill today's health details to estimate diabetes risk level.",

      back: "Back to Dashboard",

      glucose: "Glucose Level (mg/dL)",
      sleep: "Sleep Hours",
      water: "Water Intake (Litres)",
      exercise: "Physical Activity",
      stress: "Stress Level",
      food: "Healthy Eating",
      energy: "Energy Level",
      thirst: "Excessive Thirst",
      urination: "Frequent Urination",
      weight: "Weight (kg)",
      height: "Height (cm)",
      bmi: "BMI Score",

      remarks: "Additional Overall Remarks",
      fieldRemark: "Add Remark",

      submit: "Analyze with AI",
      uploadTitle: "Upload Lab Report / Document",
      uploadHint:
        "PDF, image, or text — analyzed by local AI (Ollama). Attach here to include with your test below, or use Upload & Analyze alone.",
      uploadBtn: "Upload & Analyze",
      aiPowered: "Powered by Ollama AI",
      aiSummary: "AI Summary",
      confidenceLabel: "Confidence",
      goDashboard: "Go to Dashboard",
      viewHistory: "View History",
      savedReport: "Report saved on server",
      viewReport: "Open saved PDF",
      ocrPreview: "Text detected from report (OCR)",

      result: "AI Risk Analysis",

      low: "Low Risk",
      medium: "Medium Risk",
      high: "High Risk",

      recommendation: "Recommendation",

      lowText:
        "Current lifestyle looks healthy. Continue maintaining balanced habits.",

      mediumText:
        "Some patterns may need attention. Monitor health regularly.",

      highText:
        "Possible diabetes-related indicators detected. Please consult a doctor soon.",
    },

    hi: {
      title: "त्वरित टाइप 1 डायबिटीज जोखिम परीक्षण",
      subtitle:
        "आज की स्वास्थ्य जानकारी भरें और जोखिम स्तर जानें।",

      back: "डैशबोर्ड पर वापस जाएं",

      glucose: "ग्लूकोज स्तर (mg/dL)",
      sleep: "नींद के घंटे",
      water: "पानी सेवन (लीटर)",
      exercise: "शारीरिक गतिविधि",
      stress: "तनाव स्तर",
      food: "स्वस्थ भोजन",
      energy: "ऊर्जा स्तर",
      thirst: "अत्यधिक प्यास",
      urination: "बार-बार पेशाब",
      weight: "वजन (kg)",
      height: "ऊंचाई (cm)",
      bmi: "बीएमआई",

      remarks: "अतिरिक्त टिप्पणी",
      fieldRemark: "टिप्पणी जोड़ें",

      submit: "AI से विश्लेषण करें",
      uploadTitle: "लैब रिपोर्ट / दस्तावेज अपलोड करें",
      uploadHint: "PDF, छवि या टेक्स्ट — Ollama AI द्वारा विश्लेषित",
      uploadBtn: "अपलोड और विश्लेषण",
      aiPowered: "Ollama AI द्वारा संचालित",
      aiSummary: "AI सारांश",
      confidenceLabel: "विश्वास",
      goDashboard: "डैशबोर्ड पर जाएं",
      viewHistory: "इतिहास देखें",

      result: "AI जोखिम विश्लेषण",

      low: "कम जोखिम",
      medium: "मध्यम जोखिम",
      high: "उच्च जोखिम",

      recommendation: "सुझाव",

      lowText:
        "आपकी वर्तमान जीवनशैली अच्छी लग रही है। इसी तरह जारी रखें।",

      mediumText:
        "कुछ स्वास्थ्य संकेतों पर ध्यान देने की आवश्यकता हो सकती है।",

      highText:
        "डायबिटीज से संबंधित संकेत पाए गए हैं। कृपया डॉक्टर से संपर्क करें।",
    },
    mr: mrTest,
  };

  const t = useT(translations);

  const [formData, setFormData] = useState({
    glucose: 95,
    glucoseRemark: "",

    weight: 70,
    weightRemark: "",

    height: 170,
    heightRemark: "",

    bmi: 24.2,

    sleep: 7,
    sleepRemark: "",

    water: 3,
    waterRemark: "",

    exercise: 7,
    exerciseRemark: "",

    stress: 3,
    stressRemark: "",

    food: 8,
    foodRemark: "",

    energy: 8,
    energyRemark: "",

    thirst: 2,
    thirstRemark: "",

    urination: 2,
    urinationRemark: "",

    remarks: "",
  });

  const [result, setResult] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadNotes, setUploadNotes] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);

  // TWO WAY BINDING
  // Input value updates state
  // State automatically updates UI

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.type === "number" || e.target.type === "range"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  // AUTO BMI CALCULATION
  // Whenever height or weight changes
  // BMI updates automatically

  useEffect(() => {
    const heightInMeters = formData.height / 100;

    if (heightInMeters > 0) {
      const calculatedBMI = (
        formData.weight /
        (heightInMeters * heightInMeters)
      ).toFixed(1);

      setFormData((prev) => ({
        ...prev,
        bmi: calculatedBMI,
      }));
    }
  }, [formData.weight, formData.height]);

  const buildFieldRemarks = () => {
    const fields = [
      "glucose", "weight", "height", "sleep", "water",
      "exercise", "stress", "food", "energy", "thirst", "urination",
    ];
    return fields
      .filter((f) => formData[`${f}Remark`]?.trim())
      .map((f) => ({ field: f, remark: formData[`${f}Remark`] }));
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploadLoading(true);
    setError("");
    try {
      const data = await reportAPI.uploadAndAnalyze(uploadFile, uploadNotes);
      const report = data.report;
      setResult(
        mapRiskDisplay(
          report?.diabeticRiskScore,
          report?.riskLevel,
          report?.recommendation,
          report?.healthSummary,
          report?.aiConfidence,
          report?.documentUrl,
          report?.extractedText
        )
      );
      setUploadFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const mapRiskDisplay = (
    score,
    riskLevel,
    recommendation,
    healthSummary,
    confidence,
    documentUrl = null,
    extractedText = ""
  ) => {
    const levelKey = riskLevel || (score < 35 ? "low" : score < 60 ? "medium" : "high");
    const level =
      levelKey === "low" ? t.low : levelKey === "medium" ? t.medium : t.high;
    const colorClasses =
      levelKey === "low"
        ? { bg: "bg-green-50", border: "border-green-200", text: "text-green-600", score: "text-green-500" }
        : levelKey === "medium"
        ? { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-600", score: "text-yellow-500" }
        : { bg: "bg-red-50", border: "border-red-200", text: "text-red-600", score: "text-red-500" };
  return {
      score,
      level,
      levelKey,
      recommendation: recommendation || (levelKey === "low" ? t.lowText : levelKey === "medium" ? t.mediumText : t.highText),
      healthSummary: healthSummary || "",
      confidence: confidence ?? 85,
      documentUrl,
      extractedTextPreview: extractedText ? extractedText.slice(0, 280) : "",
      colorClasses,
    };
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        weightKg: parseFloat(formData.weight),
        heightCm: parseFloat(formData.height),
        glucoseLevel: parseFloat(formData.glucose),
        sleepHours: parseFloat(formData.sleep),
        physicalActivity: parseInt(formData.exercise, 10),
        healthyEating: parseInt(formData.food, 10),
        waterIntakeLitres: parseFloat(formData.water),
        stressLevel: parseInt(formData.stress, 10),
        energyLevel: parseInt(formData.energy, 10),
        excessiveThirst: parseInt(formData.thirst, 10),
        frequentUrination: parseInt(formData.urination, 10),
        additionalOverallRemarks: formData.remarks,
        fieldRemarks: buildFieldRemarks(),
      };
      const data = await reportAPI.create(payload, uploadFile || null);
      const report = data.report;
      setResult(
        mapRiskDisplay(
          report?.diabeticRiskScore,
          report?.riskLevel,
          report?.recommendation,
          report?.healthSummary,
          report?.aiConfidence,
          report?.documentUrl,
          report?.extractedText
        )
      );
      setUploadFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sliderInput = (
    label,
    name,
    icon,
    min = 1,
    max = 10
  ) => (
    <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-2xl">
            {icon}
          </div>

          <h3 className="font-semibold text-gray-800">
            {label}
          </h3>
        </div>

        <span className="text-2xl font-bold text-blue-600">
          {formData[name]}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={formData[name]}
        name={name}
        onChange={handleChange}
        className="w-full accent-blue-500"
      />

      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-4 h-4 text-gray-500" />

          <p className="text-sm font-medium text-gray-600">
            {t.fieldRemark}
          </p>
        </div>

        <textarea
          rows="2"
          name={`${name}Remark`}
          value={formData[`${name}Remark`]}
          onChange={handleChange}
          placeholder={`${t.fieldRemark}...`}
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        />
      </div>
    </div>
  );

  const inputCard = (
    label,
    name,
    icon,
    type = "number"
  ) => (
    <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-100 p-3 rounded-2xl">
          {icon}
        </div>

        <h3 className="font-semibold text-gray-800">
          {label}
        </h3>
      </div>

      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className="w-full px-5 py-4 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-400"
      />

      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-4 h-4 text-gray-500" />

          <p className="text-sm font-medium text-gray-600">
            {t.fieldRemark}
          </p>
        </div>

        <textarea
          rows="2"
          name={`${name}Remark`}
          value={formData[`${name}Remark`]}
          onChange={handleChange}
          placeholder={`${t.fieldRemark}...`}
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        />
      </div>
    </div>
  );

  return (
    <div className="page-shell p-4 md:p-8 pt-24">
      <Navbar />
      <div className="max-w-7xl mx-auto">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all text-gray-700 font-semibold mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          {t.back}
        </Link>

        <div className="bg-white rounded-[32px] shadow-xl p-8 border border-gray-100">
          <h1 className="text-4xl font-bold text-gray-800">
            {t.title}
          </h1>

          <p className="text-gray-500 mt-3 text-lg">
            {t.subtitle}
          </p>
          <p className="mt-2 inline-flex items-center gap-2 text-purple-600 bg-purple-50 px-4 py-2 rounded-xl text-sm font-medium">
            <Bot className="w-4 h-4" />
            {t.aiPowered}
          </p>
        </div>

        <div className="mt-6 bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Upload className="w-5 h-5 text-green-500" />
            {t.uploadTitle}
          </h3>
          <p className="text-gray-500 text-sm mt-1">{t.uploadHint}</p>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            className="mt-4 w-full text-sm"
          />
          <textarea
            rows="2"
            value={uploadNotes}
            onChange={(e) => setUploadNotes(e.target.value)}
            placeholder={t.remarks}
            className="mt-3 w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
          <button
            onClick={handleUpload}
            disabled={!uploadFile || uploadLoading}
            className="mt-4 flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-green-600 disabled:opacity-50"
          >
            <Upload className="w-5 h-5" />
            {uploadLoading ? "..." : t.uploadBtn}
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          <div className="space-y-6">
            {inputCard(
              t.weight,
              "weight",
              <Scale className="w-6 h-6 text-pink-500" />
            )}

            {inputCard(
              t.height,
              "height",
              <Ruler className="w-6 h-6 text-cyan-500" />
            )}

            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium opacity-90">
                    {t.bmi}
                  </p>

                  <h2 className="text-5xl font-bold mt-2">
                    {formData.bmi}
                  </h2>
                </div>

                <div className="bg-white/20 p-4 rounded-3xl">
                  <HeartPulse className="w-10 h-10" />
                </div>
              </div>

              <div className="mt-4 text-sm opacity-90">
                {formData.bmi < 18.5 && "Underweight"}

                {formData.bmi >= 18.5 &&
                  formData.bmi < 25 &&
                  "Normal Weight"}

                {formData.bmi >= 25 &&
                  formData.bmi < 30 &&
                  "Overweight"}

                {formData.bmi >= 30 && "Obese"}
              </div>
            </div>

            {inputCard(
              t.glucose,
              "glucose",
              <Droplets className="w-6 h-6 text-red-500" />
            )}

            {sliderInput(
              t.sleep,
              "sleep",
              <Moon className="w-6 h-6 text-indigo-500" />
            )}

            {sliderInput(
              t.exercise,
              "exercise",
              <Dumbbell className="w-6 h-6 text-green-500" />
            )}

            {sliderInput(
              t.food,
              "food",
              <Utensils className="w-6 h-6 text-orange-500" />
            )}
          </div>

          <div className="space-y-6">
            {sliderInput(
              t.water,
              "water",
              <Droplets className="w-6 h-6 text-cyan-500" />
            )}

            {sliderInput(
              t.stress,
              "stress",
              <HeartPulse className="w-6 h-6 text-red-500" />
            )}

            {sliderInput(
              t.energy,
              "energy",
              <BatteryCharging className="w-6 h-6 text-yellow-500" />
            )}

            {sliderInput(
              t.thirst,
              "thirst",
              <Droplets className="w-6 h-6 text-blue-500" />
            )}

            {sliderInput(
              t.urination,
              "urination",
              <ClipboardEdit className="w-6 h-6 text-purple-500" />
            )}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-3 rounded-2xl">
              <ClipboardEdit className="w-6 h-6 text-purple-500" />
            </div>

            <h3 className="font-semibold text-gray-800">
              {t.remarks}
            </h3>
          </div>

          <textarea
            rows="5"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder={t.remarks}
            className="w-full px-5 py-4 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>

        {error && (
          <p className="mt-6 text-center text-red-600 bg-red-50 py-3 px-4 rounded-2xl">
            {error}
          </p>
        )}

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-green-500 text-white px-10 py-5 rounded-3xl shadow-xl hover:scale-105 transition-all text-lg font-bold disabled:opacity-60" disabled={loading}
          >
            <Save className="w-6 h-6" />
            {loading ? "..." : t.submit}
          </button>
        </div>

        {result && (
          <div className="mt-10 bg-white rounded-[32px] shadow-2xl border border-gray-100 p-8">
            <h2 className="text-3xl font-bold text-gray-800">
              {t.result}
            </h2>

            <div className="mt-6 flex flex-col md:flex-row gap-6">
              <div
                className={`flex-1 ${result.colorClasses.bg} rounded-3xl p-8 border ${result.colorClasses.border}`}
              >
                <h3
                  className={`text-5xl font-bold ${result.colorClasses.score}`}
                >
                  {result.score}%
                </h3>

                <p
                  className={`mt-3 text-2xl font-semibold ${result.colorClasses.text}`}
                >
                  {result.level}
                </p>
              </div>

              <div className="flex-1 bg-gray-50 rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-gray-800">
                  {t.recommendation}
                </h3>

                <p className="mt-4 text-gray-600 leading-relaxed text-lg">
                  {result.recommendation}
                </p>
              </div>
            </div>
            {result.documentUrl && (
              <div className="mt-4 bg-emerald-50 rounded-3xl p-6">
                <p className="text-sm font-semibold text-emerald-800">{t.savedReport}</p>
                <a
                  href={result.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-emerald-700 font-semibold hover:underline"
                >
                  <Upload className="w-4 h-4" />
                  {t.viewReport}
                </a>
              </div>
            )}
            {result.extractedTextPreview && (
              <div className="mt-4 bg-gray-50 rounded-3xl p-6 border border-gray-100">
                <p className="text-sm font-semibold text-gray-700">{t.ocrPreview}</p>
                <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap line-clamp-6">
                  {result.extractedTextPreview}
                </p>
              </div>
            )}
            {result.healthSummary && (
              <div className="mt-4 bg-purple-50 rounded-3xl p-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-500" />
                  {t.aiSummary}
                </h3>
                <p className="mt-2 text-gray-600">{result.healthSummary}</p>
                <p className="mt-2 text-sm text-purple-600">
                  {t.confidenceLabel}: {result.confidence}%
                </p>
              </div>
            )}
            <div className="mt-6 flex justify-center gap-4">
              <Link
                to="/dashboard"
                state={{ riskScore: result.score, riskLevel: result.levelKey }}
                className="bg-blue-500 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-blue-600"
              >
                {t.goDashboard}
              </Link>
              <Link to="/history" className="bg-gray-100 text-gray-700 px-8 py-3 rounded-2xl font-semibold hover:bg-gray-200">
                {t.viewHistory}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Test;
