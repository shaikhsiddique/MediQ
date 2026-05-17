import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Bell,
  BellOff,
  Loader2,
  Radio,
  ShieldAlert,
  Wifi,
  WifiOff,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { monitorAPI } from "../services/api";
import { useUser } from "../context/UserContext";

function playUrgentAlert() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.35, 0.7].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "square";
      gain.gain.setValueAtTime(0.35, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.25);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.3);
    });
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utter = new SpeechSynthesisUtterance(
        "Critical diabetes risk detected. Guardian alert sent to parent."
      );
      utter.rate = 0.9;
      utter.pitch = 0.8;
      window.speechSynthesis.speak(utter);
    }
  } catch {
    /* ignore */
  }
}

function requestBrowserNotification(title, body) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body, requireInteraction: true });
  }
}

function GuardianMonitor() {
  const { user } = useUser();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const lastCriticalRef = useRef(null);
  const pollRef = useRef(null);

  const refreshStatus = useCallback(async () => {
    try {
      const res = await monitorAPI.getStatus();
      const data = res.data || res;
      setStatus(data);

      const result = data.lastResult;
      if (
        data.active &&
        result?.isCritical &&
        result.checkedAt !== lastCriticalRef.current
      ) {
        lastCriticalRef.current = result.checkedAt;
        playUrgentAlert();
        requestBrowserNotification(
          "DiabetesGuard — CRITICAL ALERT",
          `${result.childName} is at ${result.riskLevel} risk. Parent SMS ${
            result.smsSent ? "sent" : "pending"
          }.`
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
    pollRef.current = setInterval(refreshStatus, 5000);
    return () => clearInterval(pollRef.current);
  }, [refreshStatus]);

  const handleStart = async () => {
    setActionLoading(true);
    setError("");
    try {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
      await monitorAPI.start();
      await refreshStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStop = async () => {
    setActionLoading(true);
    setError("");
    try {
      await monitorAPI.stop();
      lastCriticalRef.current = null;
      await refreshStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const active = status?.active;
  const twilioOk = status?.twilioConnected;
  const last = status?.lastResult;

  return (
    <>
      {/* Navbar MUST be outside the page wrapper — placing it inside
          a positioned ancestor causes its fixed layer to intercept clicks */}
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-red-950 via-gray-950 to-black text-white px-3 sm:px-6">
        <div className="max-w-2xl mx-auto pt-24 sm:pt-28 pb-16">

          {/* ── Header ── */}
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="w-10 h-10 text-red-400 animate-pulse shrink-0" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                DiabetesGuard Monitor
              </h1>
              <p className="text-red-300/90 text-sm sm:text-base mt-1">
                24/7 parent SMS alerts · checks every 5 minutes until you stop
              </p>
            </div>
          </div>

          {/* ── Error banner ── */}
          {error && (
            <div className="mt-4 bg-red-900/80 border border-red-500 rounded-2xl p-4 text-red-100 text-sm">
              {error}
            </div>
          )}

          {/* ── Status cards ── */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={`rounded-2xl p-5 border-2 ${
                twilioOk
                  ? "border-green-500/60 bg-green-950/40"
                  : "border-red-500 bg-red-950/50"
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {twilioOk ? (
                  <Wifi className="w-5 h-5 text-green-400" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-400" />
                )}
                Twilio SMS
              </div>
              <p className="text-sm mt-2 text-gray-300">
                {twilioOk
                  ? "Connected — parent number will receive HIGH risk alerts"
                  : status?.twilioError ||
                    "Not connected. Add Twilio keys to Backend/.env"}
              </p>
            </div>

            <div
              className={`rounded-2xl p-5 border-2 ${
                active
                  ? "border-red-500 bg-red-900/30 animate-pulse"
                  : "border-gray-600 bg-gray-900/50"
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                <Radio
                  className={`w-5 h-5 ${active ? "text-red-400" : "text-gray-500"}`}
                />
                Monitoring
              </div>
              <p className="text-sm mt-2 text-gray-300">
                {active
                  ? `ACTIVE — ${status.checkCount} check(s), ${status.criticalCount} critical`
                  : "Stopped — no SMS cron running"}
              </p>
            </div>
          </div>

          {/* ── Main content ── */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-red-400" />
            </div>
          ) : (
            <>
              {/* Last result card */}
              {last && (
                <div
                  className={`mt-6 rounded-2xl p-6 border-2 ${
                    last.isCritical
                      ? "border-red-500 bg-red-950/60"
                      : "border-gray-700 bg-gray-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className={`w-6 h-6 ${
                        last.isCritical ? "text-red-400" : "text-yellow-400"
                      }`}
                    />
                    <h2 className="text-xl font-bold">
                      {last.childName || user?.name} — {last.riskLevel} RISK
                    </h2>
                  </div>
                  {last.score != null && (
                    <p className="text-sm text-gray-400 mt-1">
                      Risk score: {last.score}%
                    </p>
                  )}
                  <p className="mt-3 text-gray-200">
                    <span className="font-semibold text-red-300">Reasons: </span>
                    {last.reasons?.length
                      ? last.reasons.join(", ")
                      : "No specific flags"}
                  </p>
                  {last.isCritical && (
                    <p className="mt-3 text-red-200 font-semibold text-sm">
                      {last.smsSent
                        ? "Parent SMS alert dispatched via Twilio."
                        : `SMS failed: ${last.smsError || "unknown error"}`}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-3">
                    Last check: {new Date(last.checkedAt).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                {!active ? (
                  <button
                    type="button"
                    onClick={handleStart}
                    disabled={actionLoading || !twilioOk}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-red-900/50 transition-all"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Bell className="w-5 h-5" />
                    )}
                    Connect Twilio & Start Monitoring
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStop}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border-2 border-red-500 text-white font-bold py-4 px-6 rounded-2xl transition-all"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <BellOff className="w-5 h-5" />
                    )}
                    Stop Monitoring (Manual)
                  </button>
                )}
              </div>

              <p className="mt-6 text-center text-xs text-gray-500 leading-relaxed">
                When risk is HIGH, an SMS is sent to the parent number configured in
                .env. Cron runs every 5 minutes while monitoring is active. This is
                not a substitute for emergency medical care.
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default GuardianMonitor;