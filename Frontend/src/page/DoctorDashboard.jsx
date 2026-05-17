import React, { useEffect, useState } from "react";
import {
  Stethoscope,
  Users,
  ChevronRight,
  UserPlus,
  Trash2,
  FileText,
  Activity,
  Moon,
  Droplets,
} from "lucide-react";
import Navbar from "../components/Navbar";
import RiskGraph from "../components/RiskGraph";
import { doctorAPI } from "../services/api";
import { useUser } from "../context/UserContext";

function DoctorDashboard() {
  const { user } = useUser();
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedReports, setSelectedReports] = useState([]);
  const [progression, setProgression] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignInput, setAssignInput] = useState("");
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);

  const loadPatients = () => {
    return doctorAPI
      .getPatients()
      .then((data) => setPatients(data.patients || data || []))
      .catch(console.error);
  };

  useEffect(() => {
    loadPatients().finally(() => setLoading(false));
  }, []);

  const viewPatient = async (id) => {
    setDetailLoading(true);
    setProgression(null);
    try {
      const [patientRes, progRes] = await Promise.all([
        doctorAPI.getPatient(id),
        doctorAPI.getPatientRiskProgression(id).catch(() => null),
      ]);
      const patient = patientRes.patient || patientRes.data || patientRes;
      setSelected(patient);
      setSelectedReports(patient.reports || []);
      setProgression(progRes?.data || progRes || null);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setAssignError("");
    setAssignSuccess("");
    const value = assignInput.trim();
    if (!value) return;

    try {
      let res;
      if (value.includes("@")) {
        res = await doctorAPI.linkPatientByEmail(value);
      } else if (/^[a-f0-9]{24}$/i.test(value)) {
        res = await doctorAPI.assignPatient(value);
      } else {
        setAssignError("Enter patient email or 24-character patient ID");
        return;
      }
      setAssignInput("");
      const note = res.notifications?.sent
        ? " SMS sent to patient and doctor phones."
        : res.notifications?.results
        ? " Linked (check phones on profile for SMS delivery)."
        : "";
      setAssignSuccess((res.message || "Patient linked.") + note);
      await loadPatients();
    } catch (err) {
      setAssignError(err.message || "Could not link patient");
    }
  };

  const handleRemove = async (patientId) => {
    if (!window.confirm("Remove this patient from your list?")) return;
    try {
      await doctorAPI.removePatient(patientId);
      if (selected?._id === patientId) {
        setSelected(null);
        setSelectedReports([]);
        setProgression(null);
      }
      await loadPatients();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-shell-green p-4 md:p-8 pt-20 sm:pt-24">
      <Navbar />

      <div className="max-w-7xl mx-auto mt-4 sm:mt-6">
        <div className="bg-white rounded-[32px] shadow-xl p-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-2xl">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Dr. {user?.name || "Dashboard"}
                </h1>
                <p className="text-gray-500 mt-1">
                  {user?.specialization || "Patient care portal"} ·{" "}
                  {patients.length} patients
                </p>
              </div>
            </div>

            <form
              onSubmit={handleAssign}
              className="flex flex-col sm:flex-row gap-2 w-full md:w-auto"
            >
              <input
                type="text"
                value={assignInput}
                onChange={(e) => setAssignInput(e.target.value)}
                placeholder="Patient email or ID"
                className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-green-400 min-w-0 sm:min-w-[260px] flex-1"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-3 rounded-2xl font-semibold hover:bg-green-700 transition-all shrink-0"
              >
                <UserPlus className="w-5 h-5" />
                Link patient
              </button>
            </form>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Both you and the patient receive an SMS on the phone numbers in your profiles.
          </p>
          {assignSuccess && (
            <p className="text-green-700 text-sm mt-2 bg-green-50 px-3 py-2 rounded-xl">
              {assignSuccess}
            </p>
          )}
          {assignError && (
            <p className="text-red-600 text-sm mt-3">{assignError}</p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-[32px] shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-800">My Patients</h2>
            </div>

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : patients.length === 0 ? (
              <p className="text-gray-500">
                No patients assigned. Add a patient using their ID.
              </p>
            ) : (
              <ul className="space-y-3 max-h-[480px] overflow-y-auto">
                {patients.map((p) => (
                  <li key={p._id}>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => viewPatient(p._id)}
                        className={`flex-1 flex items-center justify-between p-4 rounded-2xl transition-all text-left ${
                          selected?._id === p._id
                            ? "bg-green-100 border border-green-300"
                            : "bg-gray-50 hover:bg-green-50"
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-gray-800">{p.name}</p>
                          <p className="text-sm text-gray-500">
                            Avg risk: {p.diabeticScore ?? 0}% · BMI:{" "}
                            {p.bmi ?? "—"}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(p._id)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-2xl"
                        title="Remove patient"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[32px] shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Patient Overview
              </h2>

              {!selected ? (
                <p className="text-gray-500">
                  Select a patient to view reports, charts, and AI summary.
                </p>
              ) : detailLoading ? (
                <p className="text-gray-500">Loading patient data...</p>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 rounded-2xl p-5">
                      <p className="font-bold text-xl text-gray-800">
                        {selected.name}
                      </p>
                      <p className="text-gray-600 text-sm mt-1">
                        {selected.email}
                      </p>
                      <p className="text-gray-600 text-sm">{selected.phone}</p>
                      <p className="mt-3 text-sm">
                        Age: {selected.age ?? "—"} · Gender:{" "}
                        {selected.gender ?? "—"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 rounded-2xl p-4 text-center">
                        <p className="text-sm text-gray-500">Current Risk</p>
                        <p className="text-3xl font-bold text-blue-600">
                          {progression?.currentRiskScore ??
                            selected.diabeticScore ??
                            0}
                          %
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-2xl p-4 text-center">
                        <p className="text-sm text-gray-500">Avg (all reports)</p>
                        <p className="text-3xl font-bold text-purple-600">
                          {progression?.averageRiskScore
                            ? Math.round(parseFloat(progression.averageRiskScore))
                            : selected.diabeticScore ?? 0}
                          %
                        </p>
                      </div>
                      <div className="bg-orange-50 rounded-2xl p-4 text-center col-span-2 capitalize">
                        <p className="text-sm text-gray-500">Risk Level</p>
                        <p className="text-xl font-bold text-orange-600">
                          {progression?.currentRiskLevel || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selected.monthlyHealthSummary && (
                    <div className="bg-blue-50 rounded-2xl p-4 mb-4">
                      <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        30-Day Summary
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {selected.monthlyHealthSummary}
                      </p>
                    </div>
                  )}

                  {selected.latestHealthSummary && (
                    <div className="bg-purple-50 rounded-2xl p-4 mb-4">
                      <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Latest Report Summary
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {selected.latestHealthSummary}
                      </p>
                    </div>
                  )}

                  {selected.healthSummary && (
                    <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                      <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Profile Notes
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {selected.healthSummary}
                      </p>
                    </div>
                  )}

                  {selected.documents?.length > 0 && (
                    <div className="bg-emerald-50 rounded-2xl p-4 mb-6">
                      <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-600" />
                        Uploaded lab reports
                      </h3>
                      <ul className="space-y-2">
                        {selected.documents.map((doc, i) => (
                          <li key={doc._id || i}>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 text-sm font-medium hover:underline"
                            >
                              {doc.fileName || `Report ${i + 1}`}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {progression?.lifestyleMetrics && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      {[
                        {
                          icon: Moon,
                          label: "Sleep",
                          value: progression.lifestyleMetrics.averageSleepHours,
                        },
                        {
                          icon: Activity,
                          label: "Activity",
                          value:
                            progression.lifestyleMetrics.averagePhysicalActivity,
                        },
                        {
                          icon: Droplets,
                          label: "Water",
                          value: progression.lifestyleMetrics.averageWaterIntake,
                        },
                        {
                          icon: Activity,
                          label: "Stress",
                          value: progression.lifestyleMetrics.averageStressLevel,
                        },
                      ].map(({ icon: Icon, label, value }) => (
                        <div
                          key={label}
                          className="bg-white border border-gray-100 rounded-2xl p-3 text-center"
                        >
                          <Icon className="w-5 h-5 text-green-600 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">{label}</p>
                          <p className="font-bold text-gray-800">
                            {value ?? "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <RiskGraph
                    timeline={progression?.reportTimeline || []}
                    averageRisk={progression?.averageRiskScore}
                    trendDirection={progression?.trendDirection}
                    currentRisk={progression?.currentRiskScore}
                  />
                </>
              )}
            </div>

            {selected && !detailLoading && (
              <div className="bg-white rounded-[32px] shadow-lg border border-gray-100 p-6">
                <h3 className="font-bold text-gray-800 mb-4">
                  All Reports ({selectedReports.length})
                </h3>
                {selectedReports.length === 0 ? (
                  <p className="text-gray-500 text-sm">No reports yet.</p>
                ) : (
                  <ul className="space-y-2 max-h-72 overflow-y-auto">
                    {selectedReports.map((r) => (
                      <li
                        key={r._id}
                        className="flex justify-between items-center bg-gray-50 p-4 rounded-xl text-sm"
                      >
                        <span>
                          {new Date(r.reportDate).toLocaleDateString()}
                        </span>
                        <span
                          className={`font-semibold capitalize ${
                            r.riskLevel === "low"
                              ? "text-green-600"
                              : r.riskLevel === "high"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {r.riskLevel} · {r.diabeticRiskScore}%
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {progression?.recommendations?.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Clinical Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {progression.recommendations.map((rec, i) => (
                        <li
                          key={i}
                          className={`text-sm p-3 rounded-xl ${
                            rec.priority === "high"
                              ? "bg-red-50 text-red-800"
                              : rec.priority === "positive"
                              ? "bg-green-50 text-green-800"
                              : "bg-yellow-50 text-yellow-800"
                          }`}
                        >
                          {rec.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;
