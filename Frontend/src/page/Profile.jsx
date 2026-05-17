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
  FileDown,
  Stethoscope,
  Link2,
  Unlink,
} from "lucide-react";
import { reportAPI } from "../services/api";
import { exportPatientProfileToPdf } from "../utils/pdfExport";
import Navbar from "../components/Navbar";
import HealthVitalsFields from "../components/HealthVitalsFields";
import { patientAPI } from "../services/api";
import { useUser } from "../context/UserContext";
import { useT } from "../context/LanguageContext";
import { mrProfile } from "../locales/mr";
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
  const [profileData, setProfileData] = useState(null);
  const [reports, setReports] = useState([]);
  const [doctorEmail, setDoctorEmail] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkMessage, setLinkMessage] = useState("");

  const t = useT({
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
      healthSummary: "Profile Notes",
      healthSummaryPlaceholder: "Allergies, medications, conditions...",
      monthlySummary: "30-Day AI Summary",
      latestSummary: "Latest Report Summary",
      exportPdf: "Export Full Profile PDF",
      myDoctor: "My Doctor",
      linkDoctorHint: "Enter your doctor's email to link. Both of you will get an SMS on the phone numbers in your profiles.",
      doctorEmail: "Doctor's email",
      linkDoctor: "Link with doctor",
      unlinkDoctor: "Unlink doctor",
      linkedWith: "Linked with",
      smsNote: "SMS sent to your number and your doctor's number when linked.",
      noDoctor: "No doctor linked yet",
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
    mr: mrProfile,
  });

  useEffect(() => {
    Promise.all([patientAPI.getProfile(), reportAPI.getAll()])
      .then(([profRes, repRes]) => {
        const p = profRes.data || profRes;
        setProfileData(p);
        setReports(repRes.reports || repRes.data || repRes || []);
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

  const linkedDoctor = profileData?.doctor;

  const reloadProfile = async () => {
    const profRes = await patientAPI.getProfile();
    const p = profRes.data || profRes;
    setProfileData(p);
    return p;
  };

  const handleLinkDoctor = async (e) => {
    e.preventDefault();
    if (!doctorEmail.trim()) return;
    setLinkLoading(true);
    setLinkMessage("");
    setError("");
    try {
      const res = await patientAPI.linkDoctor({
        doctorEmail: doctorEmail.trim(),
      });
      setLinkMessage(
        res.message ||
          "Linked! Check your phone for a confirmation SMS."
      );
      setDoctorEmail("");
      await reloadProfile();
    } catch (err) {
      setError(err.message);
    } finally {
      setLinkLoading(false);
    }
  };

  const handleUnlinkDoctor = async () => {
    if (!window.confirm("Unlink your doctor?")) return;
    setLinkLoading(true);
    try {
      await patientAPI.unlinkDoctor();
      setLinkMessage("Doctor unlinked.");
      await reloadProfile();
    } catch (err) {
      setError(err.message);
    } finally {
      setLinkLoading(false);
    }
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
      const updated = data.patient || data.data || data;
      setProfileData(updated);
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
      <div className="page-shell flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-600">{t.loading}</span>
      </div>
    );
  }

  const displayScore = user?.diabeticScore ?? "—";

  return (
    <div className="page-shell px-3 py-6 sm:px-6 md:px-8 pt-20 sm:pt-24 min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto w-full">
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
            <div className="flex flex-col sm:items-end gap-2 sm:ml-auto shrink-0">
              <div className="text-center bg-blue-50 rounded-2xl px-5 py-3">
                <p className="text-xs text-gray-500">{t.riskScore}</p>
                <p className="text-2xl font-bold text-blue-600">{displayScore}%</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  exportPatientProfileToPdf(
                    { ...profileData, ...form, email: user?.email },
                    reports
                  )
                }
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-2xl font-semibold text-sm"
              >
                <FileDown className="w-4 h-4" />
                {t.exportPdf}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-6 border border-gray-100 mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-emerald-600" />
            {t.myDoctor}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{t.linkDoctorHint}</p>
          <p className="text-xs text-gray-400 mt-1">{t.smsNote}</p>

          {linkedDoctor?._id || linkedDoctor ? (
            <div className="mt-4 bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
              <p className="font-semibold text-gray-800">
                {t.linkedWith}: Dr. {linkedDoctor.name}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {linkedDoctor.specialization} · {linkedDoctor.email}
              </p>
              {linkedDoctor.phone && (
                <p className="text-sm text-gray-500">📱 {linkedDoctor.phone}</p>
              )}
              <button
                type="button"
                onClick={handleUnlinkDoctor}
                disabled={linkLoading}
                className="mt-4 flex items-center gap-2 text-red-600 font-semibold text-sm hover:underline disabled:opacity-50"
              >
                <Unlink className="w-4 h-4" />
                {t.unlinkDoctor}
              </button>
            </div>
          ) : (
            <form onSubmit={handleLinkDoctor} className="mt-4 flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={doctorEmail}
                onChange={(e) => setDoctorEmail(e.target.value)}
                placeholder={t.doctorEmail}
                className={inputClass}
                required
              />
              <button
                type="submit"
                disabled={linkLoading}
                className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-emerald-700 disabled:opacity-60 shrink-0"
              >
                <Link2 className="w-5 h-5" />
                {linkLoading ? "..." : t.linkDoctor}
              </button>
            </form>
          )}

          {linkMessage && (
            <p className="mt-3 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl">
              {linkMessage}
            </p>
          )}
        </div>

        {profileData?.documents?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <FileDown className="w-5 h-5 text-emerald-600" />
              Saved lab reports
            </h3>
            <ul className="mt-3 space-y-2">
              {profileData.documents.map((doc, i) => (
                <li key={doc._id || i}>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:underline text-sm font-medium"
                  >
                    {doc.fileName || `Report ${i + 1}`}
                  </a>
                  <span className="text-gray-400 text-xs ml-2">
                    {doc.uploadedAt
                      ? new Date(doc.uploadedAt).toLocaleDateString()
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(profileData?.monthlyHealthSummary || profileData?.latestHealthSummary) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {profileData?.monthlyHealthSummary && (
              <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
                <h3 className="font-bold text-gray-800">{t.monthlySummary}</h3>
                <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                  {profileData.monthlyHealthSummary}
                </p>
              </div>
            )}
            {profileData?.latestHealthSummary && (
              <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
                <h3 className="font-bold text-gray-800">{t.latestSummary}</h3>
                <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                  {profileData.latestHealthSummary}
                </p>
              </div>
            )}
          </div>
        )}

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
