const fs = require("fs");
const path = require("path");
const { createWorker } = require("tesseract.js");

let workerPromise = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const worker = await createWorker("eng");
      return worker;
    })();
  }
  return workerPromise;
}

async function extractTextFromImage(filePath) {
  const worker = await getWorker();
  const {
    data: { text },
  } = await worker.recognize(filePath);
  return (text || "").trim();
}

async function extractTextFromImageBuffer(buffer) {
  const worker = await getWorker();
  const {
    data: { text },
  } = await worker.recognize(buffer);
  return (text || "").trim();
}

async function extractTextFromPdf(filePath) {
  const pdfParse = require("pdf-parse");
  const buffer = fs.readFileSync(filePath);
  const result = await pdfParse(buffer);
  const text = (result.text || "").trim();

  if (text.length >= 40) {
    return text;
  }

  // Scanned PDF — rasterize pages and run Tesseract
  try {
    const ocrFromPages = await ocrScannedPdfPages(filePath, 3);
    if (ocrFromPages.length > text.length) {
      return ocrFromPages;
    }
  } catch (err) {
    console.warn("PDF page OCR skipped:", err.message);
  }

  return text;
}

async function ocrScannedPdfPages(filePath, maxPages = 3) {
  const { pdfToPng } = require("pdf-to-png-converter");
  const pages = await pdfToPng(filePath, {
    disableFontFace: true,
    useSystemFonts: true,
    viewportScale: 2,
    pagesToProcess: Array.from({ length: maxPages }, (_, i) => i + 1),
  });

  if (!pages?.length) {
    return "";
  }

  const chunks = [];
  for (const page of pages.slice(0, maxPages)) {
    const buffer = page.content;
    if (!buffer?.length) continue;
    const pageText = await extractTextFromImageBuffer(buffer);
    if (pageText) chunks.push(pageText);
  }

  return chunks.join("\n\n").trim();
}

/**
 * Extract readable text from an uploaded health document (PDF, image, or plain text).
 */
async function extractTextFromDocument(filePath, mimeType = "") {
  if (!filePath || !fs.existsSync(filePath)) {
    return "";
  }

  const mime = (mimeType || "").toLowerCase();
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (mime.startsWith("text/") || ext === ".txt") {
      return fs.readFileSync(filePath, "utf-8").slice(0, 15000).trim();
    }

    if (mime === "application/pdf" || ext === ".pdf") {
      const pdfText = await extractTextFromPdf(filePath);
      return pdfText.slice(0, 15000);
    }

    if (
      mime.startsWith("image/") ||
      [".png", ".jpg", ".jpeg", ".webp"].includes(ext)
    ) {
      const ocrText = await extractTextFromImage(filePath);
      return ocrText.slice(0, 15000);
    }

    return "";
  } catch (err) {
    console.error("OCR extraction failed:", err.message);
    return "";
  }
}

module.exports = { extractTextFromDocument };
