const answerToScale = (answerType) => {
  if (answerType === "yes") return 10;
  if (answerType === "little") return 6;
  return 2;
};

const QUESTION_FIELDS = {
  water: "water",
  exercise: "exercise",
  healthyFood: "healthyFood",
  sleep: "sleep",
  sugar: "sugar",
  screenTime: "screenTime",
  fruitsVeggies: "fruitsVeggies",
  outdoorPlay: "outdoorPlay",
  hygiene: "hygiene",
  mood: "mood",
};

const mapKidsBuddyToReport = (answers, totalScore, maxScore, language = "en") => {
  const byKey = {};
  answers.forEach((a) => {
    if (a.questionKey) byKey[a.questionKey] = a.answerType;
  });

  const scale = (key) => answerToScale(byKey[key] || "no");

  const waterScale = scale("water");
  const exerciseScale = scale("exercise");
  const foodScale = scale("healthyFood");
  const sleepScale = scale("sleep");
  const sugarScale = scale("sugar");
  const screenScale = scale("screenTime");
  const fruitScale = scale("fruitsVeggies");
  const outdoorScale = scale("outdoorPlay");
  const hygieneScale = scale("hygiene");
  const moodScale = scale("mood");

  const sleepHours = sleepScale >= 9 ? 9 : sleepScale >= 6 ? 7 : 5;
  const waterIntakeLitres = Number(((waterScale / 10) * 2.5).toFixed(1));
  const physicalActivity = Math.round((exerciseScale + outdoorScale) / 2);
  const healthyEating = Math.round((foodScale + fruitScale + sugarScale) / 3);
  const stressLevel = Math.round(10 - (screenScale + moodScale) / 2);
  const energyLevel = Math.round((moodScale + hygieneScale + exerciseScale) / 3);

  const percent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  const answerLines = answers
    .map((a, i) => {
      const label =
        a.answerType === "yes"
          ? language === "hi"
            ? "हाँ"
            : language === "mr"
            ? "होय"
            : "Yes"
          : a.answerType === "little"
          ? language === "hi"
            ? "थोड़ा"
            : language === "mr"
            ? "थोडे"
            : "A little"
          : language === "hi"
          ? "नहीं"
          : language === "mr"
          ? "नाही"
          : "No";
      return `${i + 1}. ${a.question} → ${label}`;
    })
    .join("\n");

  const healthSummary =
    language === "hi"
      ? `बडी किड्स हेल्थ चेक: ${percent}% स्कोर (${totalScore}/${maxScore})। पानी ${waterIntakeLitres}L, नींद ${sleepHours} घंटे, गतिविधि ${physicalActivity}/10।`
      : language === "mr"
      ? `बडी किड्स हेल्थ चेक: ${percent}% गुण (${totalScore}/${maxScore}). पाणी ${waterIntakeLitres}L, झोप ${sleepHours} तास, हालचाल ${physicalActivity}/10.`
      : `Buddy Kids Health Check: ${percent}% score (${totalScore}/${maxScore}). Water ${waterIntakeLitres}L, sleep ${sleepHours}h, activity ${physicalActivity}/10.`;

  const recommendation =
    percent >= 80
      ? language === "hi"
        ? "शानदार! स्वस्थ आदतें जारी रखें। बडी को आप पर गर्व है!"
        : language === "mr"
        ? "अप्रतिम! निरोगी सवय चालू ठेवा. बडीला तुमचा अभिमान आहे!"
        : "Excellent healthy habits! Keep it up — Buddy is proud of you!"
      : percent >= 50
      ? language === "hi"
        ? "अच्छा प्रयास! पानी, नींद और खेल में थोड़ा सुधार करें।"
        : language === "mr"
        ? "चांगा प्रयत्न! पाणी, झोप आणि बाहेर खेळ थोडा सुधारा."
        : "Good effort! Try to improve water, sleep, and outdoor play a little more."
      : language === "hi"
        ? "बडी चाहता है कि आप कल एक स्वस्थ चीज़ आज़माएं — ज्यादा पानी, कम स्क्रीन, ज्यादा खेल!"
        : language === "mr"
        ? "बडी म्हणतो उद्या एक निरोगी सवय आजमवा — अधिक पाणी, कमी स्क्रीन, जास्त खेळ!"
        : "Buddy wants you to try one healthy change tomorrow — more water, less screen time, more play!";

  return {
    sleepHours,
    waterIntakeLitres,
    physicalActivity,
    healthyEating,
    stressLevel,
    energyLevel,
    healthSummary,
    recommendation,
    additionalOverallRemarks: `Kids Buddy Assessment\n${answerLines}\n\nScore: ${totalScore}/${maxScore} (${percent}%)`,
    aiConfidence: percent,
  };
};

module.exports = { mapKidsBuddyToReport, QUESTION_FIELDS };
