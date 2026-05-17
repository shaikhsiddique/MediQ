/**
 * Build a public URL for a file stored under /uploads.
 */
function buildDocumentUrl(filename) {
  if (!filename) return "";
  const base =
    process.env.API_PUBLIC_URL ||
    process.env.SERVER_URL ||
    `http://localhost:${process.env.PORT || 4000}`;
  const normalized = base.replace(/\/$/, "");
  return `${normalized}/uploads/${filename}`;
}

module.exports = { buildDocumentUrl };
