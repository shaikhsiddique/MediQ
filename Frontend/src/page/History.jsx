import React, { useState, useEffect } from "react";
import { reportAPI } from "../services/api";
import { useUser } from "../context/UserContext";

import {
  Eye,
  Pencil,
  Trash2,
  Download,
  CalendarDays,
  Search,
} from "lucide-react";

import { Link } from "react-router-dom";
import { SOCKET_URL } from "../config";
import { exportReportToPdf } from "../utils/pdfExport";

import { useT } from "../context/LanguageContext";
import { mrHistory } from "../locales/mr";
import Navbar from "../components/Navbar";

function History() {


  const [search, setSearch] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    reportAPI
      .getAll()
      .then((data) => setReports(data.reports || data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  const riskToColor = (level) => {
    if (level === "low") return "green";
    if (level === "medium") return "yellow";
    return "red";
  };

  const translations = {

    en: {
      title: "Past Reports",
      subtitle: "View and manage previous diabetes risk reports",

      search: "Search reports...",

      patient: "Patient",
      risk: "Risk",
      status: "Status",
      date: "Date",

      low: "Low Risk",
      medium: "Medium Risk",
      high: "High Risk",

      view: "View",
      edit: "Edit",
      delete: "Delete",
      download: "Download PDF",
      exportPdf: "Export PDF",

      noReports: "No reports found",
      deleteConfirm: "Delete this report?",
    },

    hi: {
      title: "पुरानी रिपोर्ट",
      subtitle: "पिछली डायबिटीज जोखिम रिपोर्ट देखें और प्रबंधित करें",

      search: "रिपोर्ट खोजें...",

      patient: "मरीज",
      risk: "जोखिम",
      status: "स्थिति",
      date: "तारीख",

      low: "कम जोखिम",
      medium: "मध्यम जोखिम",
      high: "उच्च जोखिम",

      view: "देखें",
      edit: "संपादित करें",
      delete: "हटाएं",
      download: "PDF डाउनलोड करें",
      exportPdf: "PDF निर्यात",

      noReports: "कोई रिपोर्ट नहीं मिली",
      deleteConfirm: "क्या आप इस रिपोर्ट को हटाना चाहते हैं?",
    },
    mr: mrHistory,
  };

  const t = useT(translations);

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await reportAPI.delete(id);
      setReports((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const riskToStatus = (level) => {
    if (level === "low") return t.low;
    if (level === "medium") return t.medium;
    if (level === "high") return t.high;
    return level || "—";
  };

  const mappedReports = reports.map((r) => ({
    id: r._id,
    patient: user?.name || r.patient?.name || "My Report",
    risk: `${r.diabeticRiskScore ?? 0}%`,
    status: riskToStatus(r.riskLevel),
    date: formatDate(r.reportDate),
    color: riskToColor(r.riskLevel),
    raw: r,
  }));

  const filteredReports = mappedReports.filter((report) =>
    report.patient.toLowerCase().includes(search.toLowerCase()) ||
    report.date.toLowerCase().includes(search.toLowerCase())
  );

  const colorClasses = {
    green: {
      bg: "bg-green-100",
      text: "text-green-500",
      button: "bg-green-500 hover:bg-green-600",
    },

    yellow: {
      bg: "bg-yellow-100",
      text: "text-yellow-500",
      button: "bg-yellow-400 hover:bg-yellow-500",
    },

    red: {
      bg: "bg-red-100",
      text: "text-red-500",
      button: "bg-red-500 hover:bg-red-600",
    },
  };

  return (

    <div className="page-shell px-3 py-6 sm:px-6 md:px-8 pt-20 sm:pt-24 max-w-5xl mx-auto w-full">
        <Navbar/>
      {/* Header */}
      <div className="bg-white rounded-[32px] shadow-xl p-6 md:p-8 border border-gray-100">

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          {t.title}
        </h1>

        <p className="text-gray-500 mt-3 text-lg">
          {t.subtitle}
        </p>

        {/* Search */}
        <div className="mt-6 relative">

          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

          <input
            type="text"
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
          />

        </div>
      </div>

      {/* Reports */}
      <div className="mt-8 grid gap-6">

        {loading ? (
          <div className="bg-white rounded-[32px] shadow-lg border border-gray-100 p-12 text-center">
            <p className="text-gray-500">Loading reports...</p>
          </div>
        ) : filteredReports.length > 0 ? (

          filteredReports.map((report) => (

            <div
              key={report.id}
              className="bg-white rounded-[32px] shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300"
            >

              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

                {/* Left Side */}
                <div className="flex items-start gap-5">

                  <div className={`w-16 h-16 rounded-2xl ${colorClasses[report.color].bg} flex items-center justify-center shadow-sm`}>

                    <CalendarDays className={`w-8 h-8 ${colorClasses[report.color].text}`} />

                  </div>

                  <div>

                    <h2 className="text-2xl font-bold text-gray-800">
                      {report.patient}
                    </h2>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm">

                      <div className="bg-gray-100 px-4 py-2 rounded-xl text-gray-700">
                        <strong>{t.date}:</strong> {report.date}
                      </div>

                      <div className="bg-blue-100 px-4 py-2 rounded-xl text-blue-700">
                        <strong>{t.risk}:</strong> {report.risk}
                      </div>

                      <div className={`${colorClasses[report.color].bg} px-4 py-2 rounded-xl font-semibold ${colorClasses[report.color].text}`}>
                        {report.status}
                      </div>

                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 sm:gap-3 w-full xl:w-auto">

                  {/* View */}
                  <Link
                    to={`/history/${report.id}`}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-2xl transition-all shadow-md hover:scale-105"
                  >

                    <Eye className="w-5 h-5" />

                    {t.view}

                  </Link>

                  {/* Edit */}
                  <Link
                    to={`/history/${report.id}?edit=1`}
                    className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white px-5 py-3 rounded-2xl transition-all shadow-md hover:scale-105"
                  >
                    <Pencil className="w-5 h-5" />
                    {t.edit}
                  </Link>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-2xl transition-all shadow-md hover:scale-105"
                  >

                    <Trash2 className="w-5 h-5" />

                    {t.delete}

                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      exportReportToPdf(report.raw, user?.name || report.patient)
                    }
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl transition-all shadow-md text-sm sm:text-base"
                  >
                    <Download className="w-5 h-5 shrink-0" />
                    {t.exportPdf || t.download}
                  </button>

                  {(report.raw?.documentUrl || report.raw?.attachedFile) && (
                    <a
                      href={
                        report.raw.documentUrl ||
                        `${SOCKET_URL}/uploads/${report.raw.attachedFile}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl transition-all shadow-md text-sm sm:text-base"
                    >
                      <Download className="w-5 h-5 shrink-0" />
                      {t.download}
                    </a>
                  )}

                </div>
              </div>
            </div>
          ))

        ) : (

          <div className="bg-white rounded-[32px] shadow-lg border border-gray-100 p-12 text-center">

            <h2 className="text-2xl font-bold text-gray-700">
              {t.noReports}
            </h2>

          </div>
        )}
      </div>
    </div>
  );
}

export default History;
