import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PawPrint } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import {
  getStoredMascot,
  mascotMediaUrl,
  mascotMessage,
  resolveMascotState,
  setStoredMascot,
  NUTRIFINDER_OVERRIDE_KEY,
} from "../utils/kidsBuddyMascot";

const FALLBACK_EMOJI = { dog: "🐶", cat: "🐱" };

/** Slight zoom + top fade hides common "AI" watermarks baked into source clips */
const MASCOT_MEDIA_CLASS =
  "absolute inset-0 w-full h-full object-cover scale-[1.22] [object-position:center_40%]";

const MASCOT_TOP_MASK_CLASS =
  "pointer-events-none absolute inset-x-0 top-0 z-10 h-[12%] min-h-[22px] bg-gradient-to-b from-white via-white/95 to-transparent dark:from-slate-800 dark:via-slate-800/95";

function KidsBuddyWidget({
  displayName = "Friend",
  riskLevel,
  sleepHours,
  trendDirection,
  recommendation,
  talkLabel = "Talk To Buddy",
  talkHref = "/kidbuddy",
  title = "Kids Buddy",
  subtitle = "Your friendly health pet",
}) {
  const { language } = useLanguage();
  const [mascot, setMascot] = useState(getStoredMascot);
  const [mediaOk, setMediaOk] = useState(true);
  const [mediaExt, setMediaExt] = useState("mp4");
  const [nutrifinderUnhealthy, setNutrifinderUnhealthy] = useState(
    () => localStorage.getItem(NUTRIFINDER_OVERRIDE_KEY) === "true"
  );

  const syncNutrifinder = useCallback(() => {
    setNutrifinderUnhealthy(
      localStorage.getItem(NUTRIFINDER_OVERRIDE_KEY) === "true"
    );
  }, []);

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
          syncNutrifinder();
        }
      }
    };

    window.addEventListener("message", onMessage);
    window.addEventListener("nutrifinder-update", syncNutrifinder);
    window.addEventListener("storage", syncNutrifinder);
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("nutrifinder-update", syncNutrifinder);
      window.removeEventListener("storage", syncNutrifinder);
    };
  }, [syncNutrifinder]);

  const mascotState = useMemo(
    () =>
      resolveMascotState({
        riskLevel,
        sleepHours,
        trendDirection,
        nutrifinderUnhealthy,
      }),
    [riskLevel, sleepHours, trendDirection, nutrifinderUnhealthy]
  );

  const mediaSrc = mascotMediaUrl(mascot, mascotState, mediaExt);
  const message = mascotMessage(mascotState, language);
  const firstName = displayName.split(" ")[0];

  const handleMascotChange = (e) => {
    const next = e.target.value === "cat" ? "cat" : "dog";
    setStoredMascot(next);
    setMascot(next);
    setMediaExt("mp4");
    setMediaOk(true);
  };

  const handleMediaError = () => {
    if (mediaExt === "mp4") {
      setMediaExt("gif");
      setMediaOk(true);
    } else {
      setMediaOk(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 dark:from-purple-950/40 dark:via-slate-900 dark:to-blue-950/40 rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 border border-white/60 dark:border-slate-700 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
        <div className="relative mx-auto sm:mx-0 shrink-0">
          <div className="relative bg-white dark:bg-slate-800 w-[108px] sm:w-[120px] aspect-[9/16] max-h-[192px] sm:max-h-[214px] rounded-2xl shadow-lg overflow-hidden border-2 border-white/80 dark:border-slate-600">
            {mediaOk ? (
              <>
                {mediaExt === "mp4" ? (
                  <video
                    key={`${mascot}-${mascotState}-mp4`}
                    src={mediaSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={MASCOT_MEDIA_CLASS}
                    onError={handleMediaError}
                  />
                ) : (
                  <img
                    key={`${mascot}-${mascotState}-gif`}
                    src={mediaSrc}
                    alt={`${mascot} mascot — ${mascotState}`}
                    className={MASCOT_MEDIA_CLASS}
                    onError={handleMediaError}
                  />
                )}
                <div className={MASCOT_TOP_MASK_CLASS} aria-hidden />
              </>
            ) : (
              <span
                className="absolute inset-0 flex items-center justify-center text-5xl sm:text-6xl"
                role="img"
                aria-hidden
              >
                {FALLBACK_EMOJI[mascot]}
              </span>
            )}
          </div>
          <span className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 text-xs font-semibold px-2 py-0.5 rounded-full shadow border border-gray-100 dark:border-slate-600 capitalize">
            {mascotState}
          </span>
        </div>

        <div className="flex-1 text-center sm:text-left min-w-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-slate-100">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-slate-400 mt-1 text-sm sm:text-base">
            {subtitle}
          </p>

          <label className="mt-3 flex items-center justify-center sm:justify-start gap-2 text-sm font-medium text-gray-700 dark:text-slate-300">
            <PawPrint className="w-4 h-4 shrink-0 text-purple-600" />
            <span className="sr-only">Choose mascot</span>
            <select
              value={mascot}
              onChange={handleMascotChange}
              className="rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
              aria-label="Mascot type"
            >
              <option value="dog">Dog 🐶</option>
              <option value="cat">Cat 🐱</option>
            </select>
          </label>
        </div>
      </div>

      <div className="bg-white/90 dark:bg-slate-800/90 mt-4 sm:mt-6 rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100/80 dark:border-slate-700 flex-1">
        <p className="text-base sm:text-lg text-gray-700 dark:text-slate-200 leading-relaxed">
          Hey {firstName} 🌟 {message}
        </p>
        {recommendation && (
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400 line-clamp-2">
            {recommendation.split(".")[0]}.
          </p>
        )}
      </div>

      <Link
        to={talkHref}
        className="mt-4 sm:mt-6 block w-full text-center bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-semibold shadow-md hover:shadow-lg transition-all"
      >
        {talkLabel}
      </Link>
    </div>
  );
}

export default KidsBuddyWidget;
