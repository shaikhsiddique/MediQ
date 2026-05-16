import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Phone,
  MapPin,
  Scale,
  Ruler,
  Save,
  ArrowLeft,
  Loader2,
  Activity,
} from "lucide-react";
import Navbar from "../components/Navbar";
import HealthVitalsFields from "../components/HealthVitalsFields";
import { patientAPI } from "../services/api";
import { useUser } from "../context/UserContext";
import { useLanguage } from "../context/LanguageContext";
import { buildQuickAssessment } from "../utils/buildQuickAssessment";

const defaultVitals = {
  heartRate: "",
  glucoseLevel: "",
  bloodPressure: { systolic: "", diastolic: "" },
  oxygenSaturation: "",
  bodyTemperature: "",
  respiratoryRate: "",
  hba1c: "",
};

function Profile() {
  const { language } = useLanguage();
  const { user, updateUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "male",
    address: "",
    height: "",
    weight: "",
    healthSummary: "",
    heredityHistory: {
      diabetes: false,
      heartDisease: false,
      hypertension: false,
      obesity: false,
      other: "",
    },
  });
  const [vitals, setVitals] = useState(defaultVitals);

  const t = {
    en: {
      title: "My Profile",
      subtitle: "View and update your health profile",
      back: "Back to Dashboard",
      name: "Full Name",
      phone: "Phone",
      age: "Age",
      gender: "Gender",
      male: "Male",
      female: "Female",
      other: "Other",
      address: "Address",
      height: "Height (cm)",
      weight: "Weight (kg)",
      bmi: "BMI",
      riskScore: "Baseline Risk Score",
      save: "Save Changes",
      saved: "Profile updated successfully!",
      loading: "Loading profile...",
      personal: "Personal Information",
      vitalsSection: "Health Assessment & Vitals",
      heredity: "Family Health History",
      diabetes: "Diabetes in family",
      heart: "Heart disease",
      hypertension: "Hypertension",
      obesity: "Obesity",
      otherCond: "Other conditions",
      vitalsTitle: "Current Vitals",
      vitalsHint: "Update your latest readings for accurate risk scoring",
      heartRate: "Heart rate (bpm)",
      glucose: "Blood glucose (mg/dL)",
      bpSystolic: "Blood pressure — systolic",
      bpDiastolic: "Blood pressure — diastolic",
      oxygen: "Oxygen saturation (%)",
      hba1c: "HbA1c (%)",
      temperature: "Body temperature (°C)",
      respiratory: "Respiratory rate (/min)",
      healthSummary: "Health Summary",
      healthSummaryPlaceholder: "Allergies, medications, conditions...",
    },
    hi: {
      title: "मेरी प्रोफाइल",
      subtitle: "अपनी स्वास्थ्य प्रोफाइल देखें और अपडेट करें",
      back: "डैशबोर्ड पर वापस",
      name: "पूरा नाम",
      phone: "फोन",
      age: "उम्र",
      gender: "लिंग",
      male: "पुरुष",
      female: "महिला",
      other: "अन्य",
      address: "पता",
      height: "ऊंचाई (cm)",
      weight: "वजन (kg)",
      bmi: "बीएमआई",
      riskScore: "बेसलाइन जोखिम स्कोर",
      save: "परिवर्तन सहेजें",
      saved: "प्रोफाइल सफलतापूर्वक अपडेट!",
      loading: "प्रोफाइल लोड हो रही है...",
      personal: "व्यक्तिगत जानकारी",
      vitalsSection: "स्वास्थ्य मूल्यांकन और वाइटल्स",
      heredity: "पारिवारिक स्वास्थ्य इतिहास",
      diabetes: "परिवार में डायबिटीज",
      heart: "हृदय रोग",
      hypertension: "उच्च रक्तचाप",
      obesity: "मोटापा",
      otherCond: "अन्य स्थितियां",
      vitalsTitle: "वर्तमान वाइटल्स",
      vitalsHint: "सटीक जोखिम स्कोरिंग के लिए नवीनतम रीडिंग अपडेट करें",
      heartRate: "हृदय गति (bpm)",
      glucose: "रक्त ग्लूकोज (mg/dL)",
      bpSystolic: "रक्तचाप — सिस्टोलिक",
      bpDiastolic: "रक्तचाप — डायस्टोलिक",
      oxygen: "ऑक्सीजन संतृप्ति (%)",
      hba1c: "HbA1c (%)",
      temperature: "शरीर का तापमान (°C)",
      respiratory: "श्वसन दर (/min)",
      healthSummary: "स्वास्थ्य सारांश",
      healthSummaryPlaceholder: "एलर्जी, दवाएं, बीमारियां...",
    },
  }[language];

  useEffect(() => {
    patientAPI
      .getProfile()
      .then((data) => {
        const p = data.patient || data;
        setForm({
          name: p.name || "",
          phone: p.phone || "",
          age: p.age ?? "",
          gender: p.gender || "male",
          address: p.address || "",
          height: p.height ?? "",
          weight: p.weight ?? "",
          healthSummary: p.healthSummary || "",
          heredityHistory: {
            diabetes: p.heredityHistory?.diabetes || false,
            heartDisease: p.heredityHistory?.heartDisease || false,
            hypertension: p.heredityHistory?.hypertension || false,
            obesity: p.heredityHistory?.obesity || false,
            other: p.heredityHistory?.other || "",
          },
        });

        const latest = p.healthRecords?.[0];
        if (latest) {
          setVitals({
            heartRate: latest.heartRate ?? "",
            glucoseLevel: latest.glucoseLevel ?? "",
            bloodPressure: {
              systolic: latest.bloodPressure?.systolic ?? "",
              diastolic: latest.bloodPressure?.diastolic ?? "",
            },
            oxygenSaturation: latest.oxygenSaturation ?? "",
            bodyTemperature: latest.bodyTemperature ?? "",
            respiratoryRate: latest.respiratoryRate ?? "",
            hba1c: latest.hba1c ?? "",
          });
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const bmi =
    form.height && form.weight
      ? (form.weight / Math.pow(form.height / 100, 2)).toFixed(1)
      : "—";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "age" || name === "height" || name === "weight" ? value : value,
    }));
  };

  const handleVitalChange = (patch) => {
    setVitals((prev) => ({ ...prev, ...patch }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        age: Number(form.age) || undefined,
        gender: form.gender,
        address: form.address,
        height: Number(form.height) || undefined,
        weight: Number(form.weight) || undefined,
        healthSummary: form.healthSummary,
        heredityHistory: form.heredityHistory,
        quickAssessment: buildQuickAssessment(vitals),
      };
      const data = await patientAPI.updateProfile(payload);
      const updated = data.patient || data;
      updateUser({
        ...updated,
        diabeticScore: updated.diabeticScore,
        isDiabetic: updated.isDiabetic,
        bmi: updated.bmi,
      });
      setSuccess(t.saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 bg-white";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-600">{t.loading}</span>
      </div>
    );
  }

  const displayScore = user?.diabeticScore ?? "—";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-8 pt-24">
      <Navbar />
      <div className="max-w-3xl mx-auto">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all text-gray-700 font-semibold mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          {t.back}
        </Link>

        <div className="bg-white rounded-[32px] shadow-xl p-8 border border-gray-100 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {form.name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{t.title}</h1>
              <p className="text-gray-500 mt-1">{t.subtitle}</p>
              <p className="text-sm text-gray-400 mt-1">{user?.email}</p>
            </div>
            <div className="ml-auto text-center bg-blue-50 rounded-2xl px-5 py-3">
              <p className="text-xs text-gray-500">{t.riskScore}</p>
              <p className="text-2xl font-bold text-blue-600">{displayScore}%</p>
            </div>
          </div>
        </div>

        {error && (
          <p className="mb-4 text-red-600 bg-red-50 py-3 px-4 rounded-2xl">{error}</p>
        )}
        {success && (
          <p className="mb-4 text-green-600 bg-green-50 py-3 px-4 rounded-2xl">{success}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100 space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              {t.personal}
            </h2>
            <input name="name" value={form.name} onChange={handleChange} className={inputClass} required />
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                  <Phone className="w-4 h-4" /> {t.phone}
                </label>
                <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">{t.age}</label>
                <input name="age" type="number" value={form.age} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">{t.gender}</label>
              <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
                <option value="male">{t.male}</option>
                <option value="female">{t.female}</option>
                <option value="other">{t.other}</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                <MapPin className="w-4 h-4" /> {t.address}
              </label>
              <textarea name="address" value={form.address} onChange={handleChange} rows={2} className={inputClass} />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                  <Ruler className="w-4 h-4" /> {t.height}
                </label>
                <input name="height" type="number" value={form.height} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                  <Scale className="w-4 h-4" /> {t.weight}
                </label>
                <input name="weight" type="number" value={form.weight} onChange={handleChange} className={inputClass} />
              </div>
              <div className="bg-blue-50 rounded-2xl p-4 flex flex-col justify-center items-center">
                <p className="text-sm text-gray-600">{t.bmi}</p>
                <p className="text-3xl font-bold text-blue-600">{bmi}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-green-500" />
              {t.vitalsSection}
            </h2>
            <HealthVitalsFields
              vitals={vitals}
              heredityHistory={form.heredityHistory}
              healthSummary={form.healthSummary}
              onVitalChange={handleVitalChange}
              onHeredityChange={(h) => setForm((prev) => ({ ...prev, heredityHistory: h }))}
              onSummaryChange={(s) => setForm((prev) => ({ ...prev, healthSummary: s }))}
              t={t}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-green-500 text-white py-4 rounded-3xl font-bold text-lg hover:scale-[1.02] transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? "..." : t.save}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
