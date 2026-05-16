import React, { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Bot,
  FileText,
  Loader2,
  Download,
  Save,
  Pencil,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { reportAPI } from "../services/api";
import { SOCKET_URL } from "../config";
import { useLanguage } from "../context/LanguageContext";

const API_HOST = SOCKET_URL;

function ReportDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get("edit") === "1";
  const { language } = useLanguage();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [remarks, setRemarks] = useState("");
  const [editing, setEditing] = useState(isEditMode);

  const t = {
    en: {
      back: "Back to History",
      title: "Report Details",
      risk: "Risk Score",
      level: "Risk Level",
      recommendation: "AI Recommendation",
      summary: "AI Health Summary",
      confidence: "AI Confidence",
      date: "Report Date",
      source: "Source",
      form: "Health Test",
      upload: "Uploaded Document",
      file: "Attached File",
      download: "Download File",
      notFound: "Report not found",
      remarks: "Your Notes",
      remarksPlaceholder: "Add or update your personal notes for this report...",
      save: "Save Changes",
      saved: "Report updated successfully!",
      edit: "Edit Notes",
      cancel: "Cancel",
    },
    hi: {
      back: "इतिहास पर वापस",
      title: "रिपोर्ट विवरण",
      risk: "जोखिम स्कोर",
      level: "जोखिम स्तर",
      recommendation: "AI सुझाव",
      summary: "AI स्वास्थ्य सारांश",
      confidence: "AI विश्वास",
      date: "रिपोर्ट तारीख",
      source: "स्रोत",
      form: "स्वास्थ्य परीक्षण",
      upload: "अपलोड किया दस्तावेज",
      file: "संलग्न फ़ाइल",
      download: "फ़ाइल डाउनलोड करें",
      notFound: "रिपोर्ट नहीं मिली",
      remarks: "आपके नोट्स",
      remarksPlaceholder: "इस रिपोर्ट के लिए अपने नोट्स जोड़ें या अपडेट करें...",
      save: "परिवर्तन सहेजें",
      saved: "रिपोर्ट सफलतापूर्वक अपडेट!",
      edit: "नोट्स संपादित करें",
      cancel: "रद्द करें",
    },
  }[language];

  useEffect(() => {
    reportAPI
      .getById(id)
      .then((data) => {
        setReport(data.report);
        setRemarks(data.report?.additionalOverallRemarks || "");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const data = await reportAPI.update(id, {
        additionalOverallRemarks: remarks,
      });
      setReport(data.report || data);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const riskColor =
    report?.riskLevel === "low"
      ? "text-green-600 bg-green-50 border-green-200"
      : report?.riskLevel === "medium"
      ? "text-yellow-600 bg-yellow-50 border-yellow-200"
      : "text-red-600 bg-red-50 border-red-200";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen p-8 pt-24">
        <Navbar />
        <p className="text-center text-red-600">{error || t.notFound}</p>
        <Link to="/history" className="block text-center mt-4 text-blue-600">
          {t.back}
        </Link>
      </div>
    );
  }

  const fileUrl = report.attachedFile
    ? `${API_HOST}/uploads/${report.attachedFile}`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-8 pt-24">
      <Navbar />
      <div className="max-w-3xl mx-auto">
        <Link
          to="/history"
          className="inline-flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-md mb-6 text-gray-700 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          {t.back}
        </Link>

        <div className="bg-white rounded-[32px] shadow-xl p-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-800">{t.title}</h1>
          <div className="flex items-center gap-2 mt-2 text-gray-500">
            <CalendarDays className="w-4 h-4" />
            {t.date}: {new Date(report.reportDate).toLocaleDateString()}
          </div>

          <div className={`mt-6 p-6 rounded-3xl border ${riskColor}`}>
            <p className="text-sm font-medium">{t.risk}</p>
            <p className="text-5xl font-bold mt-1">{report.diabeticRiskScore}%</p>
            <p className="text-xl font-semibold mt-2 capitalize">
              {report.riskLevel} — {t.level}
            </p>
          </div>

          {report.analyzedByGemini && (
            <div className="mt-4 flex items-center gap-2 text-purple-600 bg-purple-50 px-4 py-2 rounded-xl">
              <Bot className="w-5 h-5" />
              <span>
                {t.confidence}: {report.aiConfidence ?? 85}%
              </span>
            </div>
          )}

          <div className="mt-6">
            <p className="text-sm text-gray-500">{t.source}</p>
            <p className="font-semibold text-gray-800">
              {report.sourceType === "upload" ? t.upload : t.form}
            </p>
          </div>

          {report.healthSummary && (
            <div className="mt-6 bg-gray-50 rounded-2xl p-5">
              <h3 className="font-bold text-gray-800">{t.summary}</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">{report.healthSummary}</p>
            </div>
          )}

          <div className="mt-6 bg-blue-50 rounded-2xl p-5">
            <h3 className="font-bold text-gray-800">{t.recommendation}</h3>
            <p className="mt-2 text-gray-600 leading-relaxed">{report.recommendation}</p>
          </div>

          <div className="mt-6 bg-gray-50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800">{t.remarks}</h3>
              {!editing && report.sourceType === "form" && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1 text-sm text-blue-600 font-semibold hover:underline"
                >
                  <Pencil className="w-4 h-4" />
                  {t.edit}
                </button>
              )}
            </div>
            {editing ? (
              <>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={4}
                  placeholder={t.remarksPlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="flex gap-3 mt-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-500 text-white px-5 py-2 rounded-xl font-semibold disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {t.save}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRemarks(report.additionalOverallRemarks || "");
                      setEditing(false);
                    }}
                    className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold"
                  >
                    {t.cancel}
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-600 leading-relaxed">
                {report.additionalOverallRemarks || "—"}
              </p>
            )}
          </div>

          {fileUrl && (
            <div className="mt-6">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t.file}: {report.attachedFileName}
              </h3>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 bg-green-500 text-white px-5 py-3 rounded-2xl hover:bg-green-600"
              >
                <Download className="w-5 h-5" />
                {t.download}
              </a>
            </div>
          )}

          {report.glucoseLevel != null && (
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-gray-500">Glucose</span>
                <p className="font-bold">{report.glucoseLevel} mg/dL</p>
              </div>
              {report.bmiScore != null && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <span className="text-gray-500">BMI</span>
                  <p className="font-bold">{report.bmiScore}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportDetail;
