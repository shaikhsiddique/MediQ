const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const CHAT_SYSTEM_PROMPT = `You are GlucoBot, a friendly AI health assistant for children with Type 1 diabetes and their parents in India.
Speak simply and warmly. Give evidence-based guidance on diet, exercise, glucose monitoring, and daily habits.
Always recommend consulting a doctor for serious concerns. Never diagnose or prescribe medication.
Keep answers concise (2-4 short paragraphs max). Reply in the same language the user writes in (English or Hindi).`;

const ANALYSIS_SYSTEM_PROMPT = `You are a medical AI assistant specializing in Type 1 diabetes risk assessment for children and families in India.
Analyze health data carefully using clinical knowledge. Be conservative with risk ratings.
Always recommend consulting a qualified doctor for diagnosis or treatment decisions.
Respond ONLY with valid JSON — no markdown, no code fences, no extra text.`;

let chatModel;
let analysisModel;

const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured on the server");
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const getChatModel = () => {
  if (!chatModel) {
    const genAI = getGenAI();
    chatModel = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
      systemInstruction: CHAT_SYSTEM_PROMPT,
    });
  }
  return chatModel;
};

const getAnalysisModel = () => {
  if (!analysisModel) {
    const genAI = getGenAI();
    analysisModel = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
      systemInstruction: ANALYSIS_SYSTEM_PROMPT,
    });
  }
  return analysisModel;
};

const parseJsonResponse = (text) => {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Gemini did not return valid JSON");
  }
  return JSON.parse(cleaned.slice(start, end + 1));
};

const generateChatReply = async (message, history = []) => {
  const model = getChatModel();

  const validHistory = (history || [])
    .filter((h) => h?.role && h?.content)
    .slice(-12)
    .map((h) => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.content }],
    }));

  const chat = model.startChat({ history: validHistory });
  const result = await chat.sendMessage(message);
  return result.response.text().trim();
};

const analyzeHealthData = async (healthData, patientContext = {}) => {
  const model = getAnalysisModel();

  const prompt = `Analyze this Type 1 diabetes health assessment and return JSON with exactly these fields:
{
  "diabeticRiskScore": <number 0-100>,
  "riskLevel": "<low|medium|high>",
  "recommendation": "<2-3 sentence personalized advice>",
  "healthSummary": "<2-3 sentence AI health summary>",
  "confidence": <number 0-100 representing analysis confidence>
}

Health data:
${JSON.stringify(healthData, null, 2)}

Patient context:
${JSON.stringify(patientContext, null, 2)}`;

  const result = await model.generateContent(prompt);
  const parsed = parseJsonResponse(result.response.text());

  const score = Math.min(100, Math.max(0, Math.round(parsed.diabeticRiskScore || 0)));
  let riskLevel = parsed.riskLevel;
  if (!["low", "medium", "high"].includes(riskLevel)) {
    riskLevel = score >= 60 ? "high" : score >= 35 ? "medium" : "low";
  }

  return {
    diabeticRiskScore: score,
    riskLevel,
    recommendation: parsed.recommendation || "Continue monitoring your health and consult your doctor regularly.",
    healthSummary: parsed.healthSummary || "",
    confidence: Math.min(100, Math.max(0, Math.round(parsed.confidence || 85))),
    analyzedByGemini: true,
  };
};

const analyzeUploadedFile = async (filePath, mimeType, notes = "", patientContext = {}) => {
  const model = getAnalysisModel();
  const fileBuffer = fs.readFileSync(filePath);
  const base64 = fileBuffer.toString("base64");

  const prompt = `This is a medical/health document uploaded by a patient for Type 1 diabetes risk review.
${notes ? `Patient notes: ${notes}` : ""}
Patient context: ${JSON.stringify(patientContext)}

Analyze the document content and return JSON with exactly these fields:
{
  "diabeticRiskScore": <number 0-100>,
  "riskLevel": "<low|medium|high>",
  "recommendation": "<2-4 sentence personalized advice based on the document>",
  "healthSummary": "<2-4 sentence summary of findings from the document>",
  "confidence": <number 0-100>,
  "extractedData": {
    "glucoseLevel": <number or null>,
    "notes": "<key findings from document>"
  }
}`;

  const result = await model.generateContent([
    { inlineData: { mimeType, data: base64 } },
    { text: prompt },
  ]);

  const parsed = parseJsonResponse(result.response.text());
  const score = Math.min(100, Math.max(0, Math.round(parsed.diabeticRiskScore || 0)));
  let riskLevel = parsed.riskLevel;
  if (!["low", "medium", "high"].includes(riskLevel)) {
    riskLevel = score >= 60 ? "high" : score >= 35 ? "medium" : "low";
  }

  return {
    diabeticRiskScore: score,
    riskLevel,
    recommendation: parsed.recommendation || "Please share this report with your doctor for a full review.",
    healthSummary: parsed.healthSummary || "",
    confidence: Math.min(100, Math.max(0, Math.round(parsed.confidence || 80))),
    extractedData: parsed.extractedData || {},
    analyzedByGemini: true,
  };
};

module.exports = {
  generateChatReply,
  analyzeHealthData,
  analyzeUploadedFile,
};
