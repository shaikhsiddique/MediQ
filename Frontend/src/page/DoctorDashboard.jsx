import React, { useEffect, useState } from "react";
import { Stethoscope, Users, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import { doctorAPI } from "../services/api";
import { useUser } from "../context/UserContext";

function DoctorDashboard() {
  const { user } = useUser();
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedReports, setSelectedReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    doctorAPI
      .getPatients()
      .then((data) => setPatients(data.patients || data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const viewPatient = (id) => {
    doctorAPI.getPatient(id).then((data) => {
      const patient = data.patient || data;
      setSelected(patient);
      setSelectedReports(patient.reports || []);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4 md:p-8">
      <Navbar />

      <div className="max-w-6xl mx-auto mt-20">
        <div className="bg-white rounded-[32px] shadow-xl p-8 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-2xl">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Dr. {user?.name || "Dashboard"}
              </h1>
              <p className="text-gray-500 mt-1">
                {user?.specialization || "Manage your patients"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-[32px] shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-800">Patients</h2>
            </div>

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : patients.length === 0 ? (
              <p className="text-gray-500">No patients assigned yet.</p>
            ) : (
              <ul className="space-y-3">
                {patients.map((p) => (
                  <li key={p._id}>
                    <button
                      type="button"
                      onClick={() => viewPatient(p._id)}
                      className="w-full flex items-center justify-between bg-gray-50 hover:bg-green-50 p-4 rounded-2xl transition-all text-left"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{p.name}</p>
                        <p className="text-sm text-gray-500">
                          Risk: {p.diabeticScore ?? 0}% · BMI: {p.bmi ?? "—"}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-[32px] shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Patient Details
            </h2>

            {!selected ? (
              <p className="text-gray-500">Select a patient to view details.</p>
            ) : (
              <>
                <div className="bg-green-50 rounded-2xl p-4 mb-4">
                  <p className="font-bold text-lg text-gray-800">{selected.name}</p>
                  <p className="text-gray-600 text-sm mt-1">{selected.email}</p>
                  <p className="text-gray-600 text-sm">{selected.phone}</p>
                  <p className="mt-2 text-sm">
                    <span className="font-semibold">Diabetic score:</span>{" "}
                    {selected.diabeticScore ?? 0}% ·{" "}
                    <span className="font-semibold">BMI:</span> {selected.bmi ?? "—"}
                  </p>
                </div>

                <h3 className="font-semibold text-gray-700 mb-2">Recent Reports</h3>
                {selectedReports.length === 0 ? (
                  <p className="text-gray-500 text-sm">No reports yet.</p>
                ) : (
                  <ul className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedReports.map((r) => (
                      <li
                        key={r._id}
                        className="flex justify-between bg-gray-50 p-3 rounded-xl text-sm"
                      >
                        <span>
                          {new Date(r.reportDate).toLocaleDateString()}
                        </span>
                        <span className="font-semibold capitalize">
                          {r.riskLevel} · {r.diabeticRiskScore}%
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;
