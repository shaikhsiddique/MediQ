import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Heart,
  User,
  Stethoscope,
  Phone,
  VenusAndMars,
  MapPin,
  ChevronRight,
  ChevronLeft,
  ClipboardList,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useT } from "../context/LanguageContext";
import { mrSignup } from "../locales/mr";
import LanguageThemeControls from "../components/LanguageThemeControls";
import { authAPI } from "../services/api";
import { useUser } from "../context/UserContext";
import HealthVitalsFields from "../components/HealthVitalsFields";
import { buildQuickAssessment } from "../utils/buildQuickAssessment";

const defaultHeredity = {
  diabetes: false,
  heartDisease: false,
  hypertension: false,
  obesity: false,
  other: "",
};

const defaultVitals = {
  heartRate: "",
  glucoseLevel: "",
  bloodPressure: { systolic: "", diastolic: "" },
  oxygenSaturation: "",
  bodyTemperature: "",
  respiratoryRate: "",
  hba1c: "",
};

function Signup() {
  const navigate = useNavigate();
  const { login } = useUser();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("user");
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "",
    address: "",
    email: "",
    password: "",
    age: "",
    height: "",
    weight: "",
    specialization: "General Physician",
  });

  const [heredityHistory, setHeredityHistory] = useState(defaultHeredity);
  const [vitals, setVitals] = useState(defaultVitals);
  const [healthSummary, setHealthSummary] = useState("");

  const translations = {
    en: {
      title: "Create Account",
      subtitle: "Join Smart HealthCare today",
      step1: "Account Details",
      step2: "Quick Health Assessment",
      step2Subtitle: "Help us personalize your diabetes risk profile",
      name: "Full Name",
      phone: "Phone Number",
      gender: "Gender",
      address: "Address",
      email: "Email Address",
      password: "Password",
      male: "Male",
      female: "Female",
      other: "Other",
      signup: "Sign Up",
      next: "Continue to Assessment",
      back: "Back",
      skip: "Skip for now",
      haveAccount: "Already have an account?",
      login: "Login",
      user: "User",
      doctor: "Doctor",
      age: "Age",
      height: "Height (cm)",
      weight: "Weight (kg)",
      specialization: "Specialization",
      heredity: "Family Health History",
      diabetes: "Diabetes in family",
      heart: "Heart disease",
      hypertension: "Hypertension",
      obesity: "Obesity",
      otherCond: "Other conditions (optional)",
      vitalsTitle: "Current Vitals",
      vitalsHint: "Optional — enter what you know for a better baseline score",
      heartRate: "Heart rate (bpm)",
      glucose: "Blood glucose (mg/dL)",
      bpSystolic: "Blood pressure — systolic",
      bpDiastolic: "Blood pressure — diastolic",
      oxygen: "Oxygen saturation (%)",
      hba1c: "HbA1c (%)",
      temperature: "Body temperature (°C)",
      respiratory: "Respiratory rate (/min)",
      healthSummary: "Health notes",
      healthSummaryPlaceholder: "Allergies, medications, past conditions...",
    },
    hi: {
      title: "अकाउंट बनाएं",
      subtitle: "आज ही Smart HealthCare से जुड़ें",
      step1: "खाता विवरण",
      step2: "त्वरित स्वास्थ्य मूल्यांकन",
      step2Subtitle: "अपनी डायबिटीज जोखिम प्रोफाइल को व्यक्तिगत बनाने में हमारी मदद करें",
      name: "पूरा नाम",
      phone: "फोन नंबर",
      gender: "लिंग",
      address: "पता",
      email: "ईमेल पता",
      password: "पासवर्ड",
      male: "पुरुष",
      female: "महिला",
      other: "अन्य",
      signup: "साइन अप करें",
      next: "मूल्यांकन पर जाएं",
      back: "वापस",
      skip: "अभी छोड़ें",
      haveAccount: "क्या आपका पहले से अकाउंट है?",
      login: "लॉगिन",
      user: "यूज़र",
      doctor: "डॉक्टर",
      age: "उम्र",
      height: "ऊंचाई (cm)",
      weight: "वजन (kg)",
      specialization: "विशेषज्ञता",
      heredity: "पारिवारिक स्वास्थ्य इतिहास",
      diabetes: "परिवार में डायबिटीज",
      heart: "हृदय रोग",
      hypertension: "उच्च रक्तचाप",
      obesity: "मोटापा",
      otherCond: "अन्य स्थितियां (वैकल्पिक)",
      vitalsTitle: "वर्तमान वाइटल्स",
      vitalsHint: "वैकल्पिक — बेहतर बेसलाइन स्कोर के लिए जो जानते हैं भरें",
      heartRate: "हृदय गति (bpm)",
      glucose: "रक्त ग्लूकोज (mg/dL)",
      bpSystolic: "रक्तचाप — सिस्टोलिक",
      bpDiastolic: "रक्तचाप — डायस्टोलिक",
      oxygen: "ऑक्सीजन संतृप्ति (%)",
      hba1c: "HbA1c (%)",
      temperature: "शरीर का तापमान (°C)",
      respiratory: "श्वसन दर (/min)",
      healthSummary: "स्वास्थ्य नोट्स",
      healthSummaryPlaceholder: "एलर्जी, दवाएं, पिछली बीमारियां...",
    },
    mr: mrSignup,
  };

  const t = useT(translations);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVitalChange = (patch) => {
    setVitals((prev) => ({ ...prev, ...patch }));
  };

  const submitRegistration = async (includeAssessment) => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        gender: formData.gender,
        address: formData.address,
        ...(role === "user" && {
          age: Number(formData.age),
          height: Number(formData.height),
          weight: Number(formData.weight),
        }),
        ...(role === "doctor" && {
          specialization: formData.specialization || "General Physician",
        }),
        ...(role === "user" &&
          includeAssessment && {
            heredityHistory,
            healthSummary,
            quickAssessment: buildQuickAssessment(vitals),
          }),
      };

      const isDoctor = role === "doctor";
      const data = isDoctor
        ? await authAPI.registerDoctor(payload)
        : await authAPI.registerPatient(payload);

      const userData = data.user || data.patient || data.doctor;
      const userRole = isDoctor ? "doctor" : "patient";

      login(userData, data.token, userRole);
      navigate(isDoctor ? "/doctor-dashboard" : "/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    if (role === "doctor") {
      submitRegistration(false);
    } else {
      setStep(2);
    }
  };

  const handleStep2 = (e) => {
    e.preventDefault();
    submitRegistration(true);
  };

  const inputClass =
    "w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-400";

  return (
    <div className="page-shell flex items-center justify-center p-4 relative">
      <LanguageThemeControls className="absolute top-4 right-4 z-10" />
      <div
        className={`w-full bg-white rounded-[32px] shadow-2xl p-8 border border-gray-100 ${
          step === 2 && role === "user" ? "max-w-2xl" : "max-w-md"
        }`}
      >
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-2xl shadow-lg">
            {step === 2 && role === "user" ? (
              <ClipboardList className="w-10 h-10 text-white" />
            ) : (
              <Heart className="w-10 h-10 text-white" />
            )}
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mt-5">
            {step === 2 && role === "user" ? t.step2 : t.title}
          </h1>
          <p className="text-gray-500 mt-2 text-center">
            {step === 2 && role === "user" ? t.step2Subtitle : t.subtitle}
          </p>
          {role === "user" && (
            <div className="flex gap-2 mt-4">
              <span
                className={`h-2 w-12 rounded-full ${step >= 1 ? "bg-blue-500" : "bg-gray-200"}`}
              />
              <span
                className={`h-2 w-12 rounded-full ${step >= 2 ? "bg-blue-500" : "bg-gray-200"}`}
              />
            </div>
          )}
        </div>

        {step === 1 && (
          <div className="grid grid-cols-2 gap-3 mt-8">
            <button
              type="button"
              onClick={() => {
                setRole("user");
                setStep(1);
              }}
              className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold transition-all ${
                role === "user"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <User className="w-5 h-5" />
              {t.user}
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("doctor");
                setStep(1);
              }}
              className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold transition-all ${
                role === "doctor"
                  ? "bg-green-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <Stethoscope className="w-5 h-5" />
              {t.doctor}
            </button>
          </div>
        )}

        {error && (
          <p className="mt-6 text-center text-red-600 bg-red-50 py-3 px-4 rounded-2xl text-sm font-medium">
            {error}
          </p>
        )}

        {step === 1 ? (
          <form onSubmit={handleStep1} className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700">{t.name}</label>
              <div className="relative mt-2">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">{t.phone}</label>
              <div className="relative mt-2">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">{t.gender}</label>
              <div className="relative mt-2">
                <VenusAndMars className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <select
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className={`${inputClass} appearance-none`}
                >
                  <option value="">{t.gender}</option>
                  <option value="male">{t.male}</option>
                  <option value="female">{t.female}</option>
                  <option value="other">{t.other}</option>
                </select>
              </div>
            </div>

            {role === "user" && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t.age}</label>
                  <input
                    type="number"
                    name="age"
                    required
                    min="0"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full mt-2 px-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t.height}</label>
                    <input
                      type="number"
                      name="height"
                      required
                      min="0"
                      value={formData.height}
                      onChange={handleChange}
                      className="w-full mt-2 px-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t.weight}</label>
                    <input
                      type="number"
                      name="weight"
                      required
                      min="0"
                      value={formData.weight}
                      onChange={handleChange}
                      className="w-full mt-2 px-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
              </>
            )}

            {role === "doctor" && (
              <div>
                <label className="text-sm font-medium text-gray-700">{t.specialization}</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full mt-2 px-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">{t.address}</label>
              <div className="relative mt-2">
                <MapPin className="absolute left-4 top-5 text-gray-400 w-5 h-5" />
                <textarea
                  name="address"
                  required
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">{t.email}</label>
              <div className="relative mt-2">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">{t.password}</label>
              <div className="relative mt-2">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-14 py-4 rounded-2xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold text-lg shadow-lg hover:scale-105 transition-all disabled:opacity-60 ${
                role === "doctor"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600"
                  : "bg-gradient-to-r from-blue-500 to-cyan-600"
              }`}
            >
              {loading ? "..." : role === "doctor" ? t.signup : t.next}
              {role === "user" && !loading && <ChevronRight className="w-5 h-5" />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleStep2} className="mt-8 space-y-6">
            <HealthVitalsFields
              vitals={vitals}
              heredityHistory={heredityHistory}
              healthSummary={healthSummary}
              onVitalChange={handleVitalChange}
              onHeredityChange={setHeredityHistory}
              onSummaryChange={setHealthSummary}
              t={t}
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
              >
                <ChevronLeft className="w-5 h-5" />
                {t.back}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => submitRegistration(false)}
                className="flex-1 py-4 rounded-2xl border border-blue-200 text-blue-600 font-semibold hover:bg-blue-50 disabled:opacity-60"
              >
                {t.skip}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold shadow-lg hover:scale-105 transition-all disabled:opacity-60"
              >
                {loading ? "..." : t.signup}
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-6">
          <p className="text-gray-500">
            {t.haveAccount}{" "}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              {t.login}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
