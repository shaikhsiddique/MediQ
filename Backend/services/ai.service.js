const fs = require("fs");
const path = require("path");

// ─────────────────────────────────────────────────────────────
// OLLAMA CONFIG
// ─────────────────────────────────────────────────────────────
const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL || "http://localhost:11434";

const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL || "llama3.2:1b";

// ─────────────────────────────────────────────────────────────
// CHAT SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────
const CHAT_SYSTEM_PROMPT = `
You are GlucoBot, an AI assistant ONLY for diabetes care.

IMPORTANT RULES:
- Keep EVERY response extremely short.
- Maximum 2-3 lines only.
- Give direct and practical answers.
- Avoid long explanations.

TOPIC RULE:
- ONLY answer diabetes-related questions.
- Allowed topics:
  glucose, insulin, HbA1c, diabetes diet,
  exercise, symptoms, monitoring,
  hypoglycemia, hyperglycemia, lifestyle.

- If unrelated question:
"I'm only able to help with diabetes-related questions."

LANGUAGE RULE:
- Default reply language is English.
- Change language ONLY if user asks.

RESPONSE FORMAT:

ANSWER:
<short answer>

SUGGESTION:
<1 short practical tip>

GLUCOSE ALERTS:
- Above 200 mg/dL:
"⚠️ High glucose level. Please consult your doctor soon."

- Below 70 mg/dL:
"🚨 Low blood sugar. Take juice or glucose immediately and consult your doctor."

SAFETY RULES:
- Never diagnose.
- Never give medicine or insulin doses.
- Always suggest consulting a doctor for serious concerns.

You are a support assistant, not a doctor.
`;

// ─────────────────────────────────────────────────────────────
// ANALYSIS PROMPT
// ─────────────────────────────────────────────────────────────
const ANALYSIS_SYSTEM_PROMPT = `
You are a medical AI assistant specializing in Type 1 diabetes risk assessment.

Rules:
- Analyze carefully and conservatively.
- Always recommend doctor consultation.
- Respond ONLY with valid JSON.
- No markdown.
- No extra text.
`;

// ─────────────────────────────────────────────────────────────
// NEW: SUMMARIZATION PROMPT
// ─────────────────────────────────────────────────────────────
const SUMMARIZATION_SYSTEM_PROMPT = `
You are a medical conversation summarizer for diabetes care.

Rules:
- Create concise, clinical summaries of patient conversations.
- Focus on key health information, symptoms, and concerns discussed.
- Extract glucose levels, medications, diet, and lifestyle topics.
- Use clear, professional medical language.
- Respond ONLY with valid JSON.
- No markdown or extra text.
`;

// ─────────────────────────────────────────────────────────────
// OLLAMA CHAT FUNCTION
// ─────────────────────────────────────────────────────────────
const ollamaChat = async (messages) => {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages,
      stream: false,
      options: {
        temperature: 0.1,
        num_predict: 512,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();

    throw new Error(
      `Ollama error ${response.status}: ${errText}`
    );
  }

  const data = await response.json();

  return data.message?.content?.trim() || "";
};

// ─────────────────────────────────────────────────────────────
// BETTER JSON PARSER
// ─────────────────────────────────────────────────────────────
const parseJsonResponse = (text) => {
  try {
    if (!text) {
      throw new Error("Empty response");
    }

    let cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      console.log("RAW MODEL RESPONSE:\n", text);
      throw new Error("No JSON object found");
    }

    cleaned = cleaned.slice(firstBrace, lastBrace + 1);

    cleaned = cleaned.replace(/,\s*}/g, "}");
    cleaned = cleaned.replace(/,\s*]/g, "]");

    cleaned = cleaned
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'");

    return JSON.parse(cleaned);

  } catch (err) {
    console.log("\n❌ JSON Parse Error:", err.message);
    console.log("\n📦 RAW RESPONSE:\n", text);

    return {
      diabeticRiskScore: 50,
      riskLevel: "medium",
      recommendation:
        "Please consult your doctor for proper diabetes evaluation.",
      healthSummary:
        "AI could not fully analyze the health data.",
      confidence: 60,
    };
  }
};

// ─────────────────────────────────────────────────────────────
// GENERATE CHAT REPLY
// ─────────────────────────────────────────────────────────────
const generateChatReply = async (
  message,
  history = [],
  userSummary = ""
) => {
  const summaryBlock = userSummary
    ? `
USER HEALTH SUMMARY:
${userSummary}

Use this information for personalized replies.
`
    : "";

  const messages = [
    {
      role: "system",
      content: CHAT_SYSTEM_PROMPT + "\n" + summaryBlock,
    },

    ...(history || [])
      .filter((h) => h?.role && h?.content)
      .slice(-8)
      .map((h) => ({
        role:
          h.role === "assistant"
            ? "assistant"
            : "user",
        content: h.content,
      })),

    {
      role: "user",
      content: `
Reply in maximum 2-3 lines only.

User Message:
${message}
`,
    },
  ];

  return await ollamaChat(messages);
};

// ─────────────────────────────────────────────────────────────
// NEW: SUMMARIZE CHAT HISTORY
// ─────────────────────────────────────────────────────────────
const summarizeChatHistory = async (
  chatHistory,
  previousSummary = ""
) => {
  if (!chatHistory || chatHistory.length === 0) {
    return {
      summary: "No conversation history to summarize.",
      messageCount: 0,
      topics: [],
    };
  }

  // Format conversation for summarization
  const conversationText = chatHistory
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n");

  const prompt = `
Analyze and summarize this diabetes care conversation.

${previousSummary ? `Previous Summary:\n${previousSummary}\n\n` : ""}

Recent Conversation:
${conversationText}

Return ONLY valid JSON in this format:

{
  "summary": "Brief clinical summary of the conversation",
  "messageCount": ${chatHistory.length},
  "topics": ["topic1", "topic2"],
  "keyPoints": {
    "glucoseLevels": [],
    "symptoms": [],
    "concerns": [],
    "recommendations": []
  }
}

Focus on:
- Glucose readings mentioned
- Symptoms discussed
- Diet and lifestyle topics
- Patient concerns
- Medical advice given
`;

  try {
    const text = await ollamaChat([
      {
        role: "system",
        content: SUMMARIZATION_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: prompt,
      },
    ]);

    const parsed = parseJsonResponse(text);

    return {
      summary: parsed.summary || "Conversation summarized.",
      messageCount: chatHistory.length,
      topics: parsed.topics || [],
      keyPoints: parsed.keyPoints || {},
      lastUpdated: new Date(),
    };
  } catch (err) {
    console.error("Summarization error:", err.message);
    
    // Fallback summary
    return {
      summary: `Conversation with ${chatHistory.length} messages about diabetes care.`,
      messageCount: chatHistory.length,
      topics: ["diabetes", "general"],
      lastUpdated: new Date(),
    };
  }
};

// ─────────────────────────────────────────────────────────────
// MONTHLY REPORTS SUMMARY
// ─────────────────────────────────────────────────────────────
const summarizeMonthlyReports = async (reports = [], patientContext = {}) => {
  if (!reports.length) {
    return {
      summary: "No health reports in the last 30 days.",
      reportCount: 0,
      averageRiskScore: 0,
    };
  }

  const avg =
    reports.reduce((s, r) => s + (r.diabeticRiskScore || 0), 0) / reports.length;

  const prompt = `
Summarize this patient's diabetes health reports from the LAST 30 DAYS.

Return ONLY valid JSON:

{
  "summary": "",
  "reportCount": 0,
  "averageRiskScore": 0,
  "trend": "stable",
  "keyFindings": []
}

Rules:
- Write a cohesive 4-6 sentence clinical narrative (not a bullet list of reports).
- Highlight trends, average risk, glucose patterns, and lifestyle themes.
- Mention if risk is improving, worsening, or stable.
- Always recommend consulting a doctor for medical decisions.

Patient Context:
${JSON.stringify(patientContext, null, 2)}

Reports (${reports.length}):
${JSON.stringify(reports, null, 2)}
`;

  const text = await ollamaChat([
    { role: "system", content: SUMMARIZATION_SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ]);

  const parsed = parseJsonResponse(text);

  return {
    summary:
      parsed.summary ||
      `Patient completed ${reports.length} assessment(s) in the last 30 days with an average risk of ${Math.round(avg)}%.`,
    reportCount: reports.length,
    averageRiskScore: Math.round(parsed.averageRiskScore ?? avg),
    trend: parsed.trend || "stable",
    keyFindings: Array.isArray(parsed.keyFindings) ? parsed.keyFindings : [],
  };
};

// ─────────────────────────────────────────────────────────────
// ANALYZE HEALTH DATA
// ─────────────────────────────────────────────────────────────
const analyzeHealthData = async (
  healthData,
  patientContext = {}
) => {
  const reportText = healthData.uploadedReportText || "";
  const prompt = `
Analyze this diabetes health assessment.

Return ONLY valid JSON in this format:

{
  "diabeticRiskScore": 0,
  "riskLevel": "low",
  "recommendation": "",
  "healthSummary": "",
  "confidence": 0
}

Health Data:
${JSON.stringify(healthData, null, 2)}

${
  reportText
    ? `Uploaded Lab Report (OCR extracted text):
${reportText.slice(0, 8000)}`
    : ""
}

Patient Context:
${JSON.stringify(patientContext, null, 2)}
`;

  const text = await ollamaChat([
    {
      role: "system",
      content: ANALYSIS_SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: prompt,
    },
  ]);

  const parsed = parseJsonResponse(text);

  const score = Math.min(
    100,
    Math.max(
      0,
      Math.round(parsed.diabeticRiskScore || 0)
    )
  );

  let riskLevel = parsed.riskLevel;

  if (!["low", "medium", "high"].includes(riskLevel)) {
    riskLevel =
      score >= 60
        ? "high"
        : score >= 35
        ? "medium"
        : "low";
  }

  return {
    diabeticRiskScore: score,
    riskLevel,

    recommendation:
      parsed.recommendation ||
      "Please consult your doctor regularly.",

    healthSummary:
      parsed.healthSummary ||
      "Basic diabetes assessment completed.",

    confidence: Math.min(
      100,
      Math.max(
        0,
        Math.round(parsed.confidence || 85)
      )
    ),

    analyzedByOllama: true,
  };
};

// ─────────────────────────────────────────────────────────────
// ANALYZE UPLOADED FILE
// ─────────────────────────────────────────────────────────────
const analyzeUploadedFile = async (
  filePath,
  mimeType,
  notes = "",
  patientContext = {},
  preExtractedText = "",
  formData = null
) => {
  let fileContent = preExtractedText || "";

  if (!fileContent) {
    const isText =
      mimeType.startsWith("text/") ||
      mimeType === "application/json";

    if (isText && fs.existsSync(filePath)) {
      fileContent = fs.readFileSync(filePath, "utf-8").slice(0, 8000);
    } else {
      fileContent =
        "No text could be extracted from this document. Use patient notes and form data only.";
    }
  }

  const prompt = `
Analyze this uploaded health document for diabetes risk.

Patient Notes:
${notes || "None"}

Patient Context:
${JSON.stringify(patientContext, null, 2)}

${
  formData
    ? `Form Assessment Data (submitted with this report):
${JSON.stringify(formData, null, 2)}`
    : ""
}

Document Content (OCR / parsed text):
${fileContent.slice(0, 8000)}

Return ONLY valid JSON:

{
  "diabeticRiskScore": 0,
  "riskLevel": "low",
  "recommendation": "",
  "healthSummary": "",
  "confidence": 0,
  "extractedData": {
    "glucoseLevel": null,
    "notes": ""
  }
}
`;

  const text = await ollamaChat([
    {
      role: "system",
      content: ANALYSIS_SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: prompt,
    },
  ]);

  const parsed = parseJsonResponse(text);

  const score = Math.min(
    100,
    Math.max(
      0,
      Math.round(parsed.diabeticRiskScore || 0)
    )
  );

  let riskLevel = parsed.riskLevel;

  if (!["low", "medium", "high"].includes(riskLevel)) {
    riskLevel =
      score >= 60
        ? "high"
        : score >= 35
        ? "medium"
        : "low";
  }

  return {
    diabeticRiskScore: score,

    riskLevel,

    recommendation:
      parsed.recommendation ||
      "Please review this report with your doctor.",

    healthSummary:
      parsed.healthSummary ||
      "Document analyzed successfully.",

    confidence: Math.min(
      100,
      Math.max(
        0,
        Math.round(parsed.confidence || 80)
      )
    ),

    extractedData:
      parsed.extractedData || {},

    analyzedByOllama: true,
  };
};

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────
module.exports = {
  generateChatReply,
  analyzeHealthData,
  analyzeUploadedFile,
  summarizeChatHistory,
  summarizeMonthlyReports,
};