/**
 * Pull common lab values from OCR / report text (best-effort regex).
 */
function parseLabValuesFromText(text = "") {
  if (!text || typeof text !== "string") {
    return {};
  }

  const normalized = text.replace(/\s+/g, " ");

  const glucosePatterns = [
    /(?:fasting\s+)?glucose[:\s]*(\d{2,3}(?:\.\d+)?)/i,
    /blood\s+sugar[:\s]*(\d{2,3}(?:\.\d+)?)/i,
    /(?:f\.?\s*)?bs[:\s]*(\d{2,3}(?:\.\d+)?)/i,
    /(\d{2,3}(?:\.\d+)?)\s*mg\s*\/\s*dl/i,
  ];

  let glucoseLevel = null;
  for (const pattern of glucosePatterns) {
    const match = normalized.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      if (value >= 40 && value <= 600) {
        glucoseLevel = value;
        break;
      }
    }
  }

  const hba1cMatch = normalized.match(
    /(?:hba1c|hb\s*a1c|a1c)[:\s]*(\d{1,2}(?:\.\d+)?)\s*%?/i
  );
  const hba1c = hba1cMatch ? parseFloat(hba1cMatch[1]) : null;

  return {
    glucoseLevel,
    hba1c: hba1c != null && hba1c <= 20 ? hba1c : null,
  };
}

module.exports = { parseLabValuesFromText };
