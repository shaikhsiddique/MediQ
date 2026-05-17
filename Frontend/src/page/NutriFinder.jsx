import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, UtensilsCrossed } from "lucide-react";
import Navbar from "../components/Navbar";
import { NUTRIFINDER_URL } from "../config";
import { NUTRIFINDER_OVERRIDE_KEY } from "../utils/kidsBuddyMascot";
import { useT } from "../context/LanguageContext";

function NutriFinder() {
  const t = useT({
    en: {
      back: "Back to Dashboard",
      title: "NutriFinder",
      subtitle: "Scan meals and get nutrition insights",
      missing: "NutriFinder URL is not configured. Set VITE_NUTRIFINDER_URL in Frontend/.env",
      demo: "Open NutriFinder in a new tab",
    },
    hi: {
      back: "डैशबोर्ड पर वापस",
      title: "NutriFinder",
      subtitle: "भोजन स्कैन करें और पोषण जानकारी पाएं",
      missing: "NutriFinder URL कॉन्फ़िगर नहीं है। Frontend/.env में VITE_NUTRIFINDER_URL सेट करें",
      demo: "नई टैब में NutriFinder खोलें",
    },
    mr: {
      back: "डॅशबोर्डवर परत",
      title: "NutriFinder",
      subtitle: "जेवण स्कॅन करा आणि पोषण माहिती मिळवा",
      missing: "NutriFinder URL सेट नाही. Frontend/.env मध्ये VITE_NUTRIFINDER_URL जोडा",
      demo: "नवीन टॅबमध्ये NutriFinder उघडा",
    },
  });

  const hasUrl =
    NUTRIFINDER_URL &&
    NUTRIFINDER_URL !== "YOUR_DEPLOYMENT_LINK" &&
    NUTRIFINDER_URL.startsWith("http");

  useEffect(() => {
    const onMessage = (event) => {
      const data = event?.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "nutrifinder_result" || data.source === "nutrifinder") {
        const unhealthy =
          data.unhealthy === true ||
          data.result === "unhealthy" ||
          data.health === "unhealthy";
        if (unhealthy) {
          localStorage.setItem(NUTRIFINDER_OVERRIDE_KEY, "true");
          window.dispatchEvent(new Event("nutrifinder-update"));
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="page-shell min-h-screen px-3 sm:px-6 md:px-8 pt-20 sm:pt-24 pb-10">
      <Navbar />

      <div className="max-w-5xl mx-auto w-full">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl shadow-md hover:shadow-lg transition-all text-gray-700 dark:text-slate-200 font-semibold text-sm sm:text-base mb-4 sm:mb-6"
        >
          <ArrowLeft className="w-5 h-5 shrink-0" />
          {t.back}
        </Link>

        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 p-5 sm:p-8">
          <div className="flex items-start gap-3 mb-4 sm:mb-6">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-2xl shrink-0">
              <UtensilsCrossed className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-slate-100">
                {t.title}
              </h1>
              <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm sm:text-base">
                {t.subtitle}
              </p>
            </div>
          </div>

          {hasUrl ? (
            <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-600 bg-gray-50 dark:bg-slate-900/50">
              <iframe
                title="NutriFinder"
                src={NUTRIFINDER_URL}
                className="w-full min-h-[420px] sm:min-h-[560px] md:min-h-[600px] border-0"
                style={{ borderRadius: "12px" }}
                allow="camera; microphone; fullscreen"
              />
            </div>
          ) : (
            <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-6 text-center">
              <p className="text-amber-900 dark:text-amber-200 text-sm sm:text-base">
                {t.missing}
              </p>
              {NUTRIFINDER_URL && NUTRIFINDER_URL.startsWith("http") && (
                <a
                  href={NUTRIFINDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  {t.demo}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NutriFinder;
