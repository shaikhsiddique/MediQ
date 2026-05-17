/** Mascot GIF states — files live in /public/assets/kidsbuddy/{dog|cat}/ */
export const MASCOT_TYPES = ["dog", "cat"];
export const MASCOT_STORAGE_KEY = "mascot";
export const NUTRIFINDER_OVERRIDE_KEY = "nutrifinder_unhealthy";

export const MASCOT_STATES = [
  "happy",
  "sad",
  "thinking",
  "motivation",
  "celebrating",
  "sleep",
  "alert",
];

export function getStoredMascot() {
  if (typeof window === "undefined") return "dog";
  const stored = localStorage.getItem(MASCOT_STORAGE_KEY);
  return stored === "cat" ? "cat" : "dog";
}

export function setStoredMascot(type) {
  localStorage.setItem(MASCOT_STORAGE_KEY, type === "cat" ? "cat" : "dog");
}

/** Build URL for mascot clip (.mp4 or .gif) */
export function mascotMediaUrl(mascot, state, ext = "mp4") {
  const safeMascot = mascot === "cat" ? "cat" : "dog";
  const safeState = MASCOT_STATES.includes(state) ? state : "happy";
  const safeExt = ext === "gif" ? "gif" : "mp4";
  return `/assets/kidsbuddy/${safeMascot}/${safeState}.${safeExt}`;
}

/** @deprecated use mascotMediaUrl */
export function mascotGifUrl(mascot, state) {
  return mascotMediaUrl(mascot, state, "gif");
}

/**
 * Priority (last wins): risk base → sleep override → NutriFinder → improvement celebrating
 */
export function resolveMascotState({
  riskLevel,
  sleepHours,
  trendDirection,
  nutrifinderUnhealthy = false,
}) {
  let state = "motivation";

  const level = (riskLevel || "").toLowerCase();
  if (level === "low") state = "happy";
  else if (level === "medium") state = "thinking";
  else if (level === "high") state = "alert";

  if (sleepHours != null && Number(sleepHours) < 6) {
    state = "sleep";
  }

  if (nutrifinderUnhealthy) {
    state = level === "high" ? "alert" : "thinking";
  }

  if (trendDirection === "decreasing") {
    state = "celebrating";
  }

  return state;
}

/** Map quiz answer tone → mascot animation state */
export function answerTypeToEmotion(answerType) {
  if (answerType === "yes") return "happy";
  if (answerType === "little") return "thinking";
  return "sad";
}

/** Emotion after quiz completes based on overall score */
/** Simple tone detection for chat / Q&A (keyword-based, no LLM). */
export function resolveMessageTone(text = "") {
  const lower = String(text).toLowerCase();
  const worried =
    /worried|scared|sad|pain|hurt|help|emergency|low|hypo|dizzy|faint/.test(
      lower
    );
  const positive =
    /thank|great|good|happy|better|yes|awesome|love|yay|cheer/.test(lower);
  const curious = /how|what|why|when|can i|should i|\?/.test(lower);

  if (worried) return "alert";
  if (positive) return "happy";
  if (curious) return "thinking";
  return "motivation";
}

export function resolveQuizEmotion({ completed, score = 0, maxScore = 1 }) {
  if (!completed) return "thinking";
  const pct = maxScore > 0 ? score / maxScore : 0;
  if (pct >= 0.7) return "celebrating";
  if (pct >= 0.45) return "happy";
  return "motivation";
}

export function mascotMessage(state, language = "en") {
  const messages = {
    en: {
      happy: "Great job! Keep going!",
      sad: "Buddy is here for you — small steps help.",
      thinking: "Let's think about one healthy change today.",
      motivation: "Try to be more active today!",
      celebrating: "Amazing progress! You're doing great!",
      sleep: "Let's improve your sleep tonight!",
      alert: "Please take care — check in with your health plan.",
    },
    hi: {
      happy: "बहुत बढ़िया! ऐसे ही जारी रखें!",
      sad: "बडी आपके साथ है — छोटे कदम मदद करते हैं।",
      thinking: "आज एक स्वस्थ बदलाव सोचते हैं।",
      motivation: "आज थोड़ी और गतिविधि करें!",
      celebrating: "शानदार प्रगति! आप बहुत अच्छा कर रहे हैं!",
      sleep: "आज रात अच्छी नींद लें!",
      alert: "ध्यान दें — अपनी स्वास्थ्य योजना देखें।",
    },
    mr: {
      happy: "छान काम! असेच चालू ठेवा!",
      sad: "बडी तुमच्या सोबत आहे — लहान पावले मदत करतात.",
      thinking: "आज एक निरोगी सवय निवडूया.",
      motivation: "आज थोडा व्यायाम करा!",
      celebrating: "अप्रतिम प्रगती! तुम्ही छान करत आहात!",
      sleep: "आज चांगली झोप घ्या!",
      alert: "काळजी घ्या — आरोग्य योजना तपासा.",
    },
  };

  const lang = messages[language] ? language : "en";
  return messages[lang][state] || messages.en[state] || messages.en.happy;
}
