/**
 * Best-effort E.164 formatting for Twilio (defaults to +91 for 10-digit IN numbers).
 */
const normalizePhone = (phone) => {
  if (!phone || typeof phone !== "string") return null;

  let cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) {
    return cleaned.length >= 11 ? cleaned : null;
  }

  if (cleaned.startsWith("91") && cleaned.length === 12) {
    return `+${cleaned}`;
  }

  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }

  if (cleaned.length >= 11 && cleaned.length <= 15) {
    return `+${cleaned}`;
  }

  return null;
};

module.exports = normalizePhone;
