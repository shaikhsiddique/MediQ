import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const BRAND = { r: 37, g: 99, b: 235 };
const MARGIN = 14;
const PAGE_W = 210;

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const addHeader = (doc, title, subtitle) => {
  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
  doc.rect(0, 0, PAGE_W, 36, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("mediQ Health Report", MARGIN, 16);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(title, MARGIN, 26);
  if (subtitle) {
    doc.setFontSize(9);
    doc.text(subtitle, MARGIN, 32);
  }
  doc.setTextColor(40, 40, 40);
};

const addWrappedText = (doc, text, y, maxWidth = PAGE_W - MARGIN * 2) => {
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(text || "—", maxWidth);
  doc.text(lines, MARGIN, y);
  return y + lines.length * 5 + 4;
};

const addSection = (doc, label, y) => {
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
  doc.text(label, MARGIN, y);
  doc.setTextColor(40, 40, 40);
  return y + 7;
};

const saveDoc = (doc, filename) => {
  doc.save(filename.replace(/[^\w.-]+/g, "_"));
};

export function exportReportToPdf(report, patientName = "Patient") {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const dateStr = formatDate(report.reportDate);
  addHeader(doc, `Report — ${dateStr}`, patientName);

  let y = 46;
  y = addSection(doc, "Risk Assessment", y);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Risk Score: ${report.diabeticRiskScore ?? "—"}%`, MARGIN, y);
  y += 6;
  doc.text(`Risk Level: ${(report.riskLevel || "—").toUpperCase()}`, MARGIN, y);
  y += 6;
  if (report.aiConfidence != null) {
    doc.text(`AI Confidence: ${report.aiConfidence}%`, MARGIN, y);
    y += 6;
  }
  if (report.glucoseLevel != null) {
    doc.text(`Glucose: ${report.glucoseLevel} mg/dL`, MARGIN, y);
    y += 6;
  }

  y += 4;
  y = addSection(doc, "AI Health Summary", y);
  y = addWrappedText(doc, report.healthSummary, y);

  y = addSection(doc, "Recommendation", y);
  y = addWrappedText(doc, report.recommendation, y);

  if (report.additionalOverallRemarks) {
    y = addSection(doc, "Patient Notes", y);
    y = addWrappedText(doc, report.additionalOverallRemarks, y);
  }

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `Generated ${new Date().toLocaleString()} — mediQ`,
    MARGIN,
    285
  );

  saveDoc(doc, `mediQ_Report_${dateStr}.pdf`);
}

export function exportPatientProfileToPdf(profile, reports = []) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const name = profile.name || "Patient";
  addHeader(doc, `Complete Health Profile`, name);

  let y = 46;
  y = addSection(doc, "Personal Information", y);
  const personal = [
    [`Name`, name],
    [`Email`, profile.email || "—"],
    [`Phone`, profile.phone || "—"],
    [`Age / Gender`, `${profile.age ?? "—"} / ${profile.gender || "—"}`],
    [`BMI`, profile.bmi != null ? String(profile.bmi) : "—"],
    [`Diabetic Score`, profile.diabeticScore != null ? `${profile.diabeticScore}%` : "—"],
  ];
  autoTable(doc, {
    startY: y,
    head: [["Field", "Value"]],
    body: personal,
    margin: { left: MARGIN, right: MARGIN },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [BRAND.r, BRAND.g, BRAND.b] },
  });
  y = doc.lastAutoTable.finalY + 10;

  y = addSection(doc, "30-Day Health Summary", y);
  y = addWrappedText(
    doc,
    profile.monthlyHealthSummary ||
      profile.healthSummary ||
      "No monthly summary available.",
    y
  );

  y = addSection(doc, "Latest Report Summary", y);
  y = addWrappedText(
    doc,
    profile.latestHealthSummary || "No recent report summary.",
    y
  );

  if (profile.healthSummary) {
    y = addSection(doc, "Profile Notes", y);
    y = addWrappedText(doc, profile.healthSummary, y);
  }

  if (reports.length > 0) {
    doc.addPage();
    addHeader(doc, "All Reports", `${reports.length} total`);
    y = 46;

    autoTable(doc, {
      startY: y,
      head: [["Date", "Risk %", "Level", "Summary"]],
      body: reports.map((r) => [
        formatDate(r.reportDate),
        String(r.diabeticRiskScore ?? "—"),
        r.riskLevel || "—",
        (r.healthSummary || r.recommendation || "").slice(0, 80),
      ]),
      margin: { left: MARGIN, right: MARGIN },
      styles: { fontSize: 8, cellWidth: "wrap" },
      headStyles: { fillColor: [BRAND.r, BRAND.g, BRAND.b] },
      columnStyles: { 3: { cellWidth: 70 } },
    });

    const sorted = [...reports].sort(
      (a, b) => new Date(b.reportDate) - new Date(a.reportDate)
    );
    let detailY = doc.lastAutoTable.finalY + 12;

    sorted.slice(0, 5).forEach((r, i) => {
      if (detailY > 250) {
        doc.addPage();
        detailY = 20;
      }
      detailY = addSection(
        doc,
        `Report ${i + 1} — ${formatDate(r.reportDate)}`,
        detailY
      );
      detailY = addWrappedText(
        doc,
        `Risk: ${r.diabeticRiskScore}% (${r.riskLevel})\n${r.healthSummary || r.recommendation || "No summary."}`,
        detailY
      );
      detailY += 6;
    });
  }

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.text(
      `Page ${p} of ${pages} — Generated ${new Date().toLocaleString()} — mediQ`,
      MARGIN,
      290
    );
  }

  saveDoc(doc, `mediQ_Profile_${name}.pdf`);
}
