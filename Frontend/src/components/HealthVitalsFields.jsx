import React from "react";
import { Activity, Droplets, Heart, Thermometer, Wind } from "lucide-react";

const inputClass =
  "w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50";

export default function HealthVitalsFields({
  vitals,
  heredityHistory,
  healthSummary,
  onVitalChange,
  onHeredityChange,
  onSummaryChange,
  t,
}) {
  const handleVital = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("bp.")) {
      const key = name.split(".")[1];
      onVitalChange({
        bloodPressure: {
          ...vitals.bloodPressure,
          [key]: value === "" ? "" : Number(value),
        },
      });
      return;
    }
    onVitalChange({
      [name]: value === "" ? "" : Number(value),
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          {t.heredity}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            ["diabetes", t.diabetes],
            ["heartDisease", t.heart],
            ["hypertension", t.hypertension],
            ["obesity", t.obesity],
          ].map(([key, label]) => (
            <label
              key={key}
              className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl cursor-pointer"
            >
              <input
                type="checkbox"
                checked={heredityHistory[key] || false}
                onChange={(e) =>
                  onHeredityChange({ ...heredityHistory, [key]: e.target.checked })
                }
                className="w-5 h-5 accent-blue-500"
              />
              <span className="text-gray-700 text-sm">{label}</span>
            </label>
          ))}
        </div>
        <input
          type="text"
          value={heredityHistory.other || ""}
          onChange={(e) =>
            onHeredityChange({ ...heredityHistory, other: e.target.value })
          }
          placeholder={t.otherCond}
          className={inputClass}
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          {t.vitalsTitle}
        </h3>
        <p className="text-sm text-gray-500">{t.vitalsHint}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 flex items-center gap-1 mb-1">
              <Heart className="w-4 h-4 text-red-500" /> {t.heartRate}
            </label>
            <input
              type="number"
              name="heartRate"
              min="0"
              value={vitals.heartRate ?? ""}
              onChange={handleVital}
              placeholder="72"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 flex items-center gap-1 mb-1">
              <Droplets className="w-4 h-4 text-blue-500" /> {t.glucose}
            </label>
            <input
              type="number"
              name="glucoseLevel"
              min="0"
              value={vitals.glucoseLevel ?? ""}
              onChange={handleVital}
              placeholder="100"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">{t.bpSystolic}</label>
            <input
              type="number"
              name="bp.systolic"
              min="0"
              value={vitals.bloodPressure?.systolic ?? ""}
              onChange={handleVital}
              placeholder="120"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">{t.bpDiastolic}</label>
            <input
              type="number"
              name="bp.diastolic"
              min="0"
              value={vitals.bloodPressure?.diastolic ?? ""}
              onChange={handleVital}
              placeholder="80"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 flex items-center gap-1 mb-1">
              <Wind className="w-4 h-4" /> {t.oxygen}
            </label>
            <input
              type="number"
              name="oxygenSaturation"
              min="0"
              max="100"
              value={vitals.oxygenSaturation ?? ""}
              onChange={handleVital}
              placeholder="98"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">{t.hba1c}</label>
            <input
              type="number"
              name="hba1c"
              min="0"
              step="0.1"
              value={vitals.hba1c ?? ""}
              onChange={handleVital}
              placeholder="5.4"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 flex items-center gap-1 mb-1">
              <Thermometer className="w-4 h-4" /> {t.temperature}
            </label>
            <input
              type="number"
              name="bodyTemperature"
              step="0.1"
              value={vitals.bodyTemperature ?? ""}
              onChange={handleVital}
              placeholder="36.6"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">{t.respiratory}</label>
            <input
              type="number"
              name="respiratoryRate"
              min="0"
              value={vitals.respiratoryRate ?? ""}
              onChange={handleVital}
              placeholder="16"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-600 mb-1 block">{t.healthSummary}</label>
        <textarea
          value={healthSummary}
          onChange={(e) => onSummaryChange(e.target.value)}
          rows={3}
          placeholder={t.healthSummaryPlaceholder}
          className={`${inputClass} resize-none`}
        />
      </div>
    </div>
  );
}
