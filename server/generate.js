/**
 * Standalone dummy data generator — does NOT send SMS or use Twilio.
 * Usage:
 *   npm run generate
 *   npm run generate:high-risk
 *   node generate.js --email=user@test.com --count=10 --risk=high
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../Backend/.env") });

const mongoose = require("mongoose");
const { generateDummyData } = require("./services/dummyDataGenerator");

const Patient = require("../Backend/models/patient.model");
const Report = require("../Backend/models/report.model");
const Health = require("../Backend/models/health.model");

const parseArgs = () => {
  const args = process.argv.slice(2);
  const opts = {
    count: Number(process.env.DUMMY_REPORT_COUNT) || 5,
    risk: "mixed",
    email: process.env.PATIENT_EMAIL || "",
  };

  args.forEach((arg) => {
    if (arg.startsWith("--count=")) opts.count = Number(arg.split("=")[1]);
    if (arg.startsWith("--risk=")) opts.risk = arg.split("=")[1];
    if (arg.startsWith("--email=")) opts.email = arg.split("=")[1];
  });

  return opts;
};

async function main() {
  const { count, risk, email } = parseArgs();
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("MONGODB_URI is required (set in Backend/.env)");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  let patient;
  if (email) {
    patient = await Patient.findOne({ email: email.toLowerCase().trim() });
  } else {
    patient = await Patient.findOne().sort({ createdAt: 1 });
  }

  if (!patient) {
    console.error("No patient found. Register a patient first or set PATIENT_EMAIL.");
    process.exit(1);
  }

  const result = await generateDummyData({
    Patient,
    Report,
    Health,
    patientId: patient._id,
    count,
    riskProfile: risk,
  });

  console.log("\nDummy data generated:");
  console.log(JSON.stringify(result, null, 2));
  console.log(
    "\nTip: Restart Guardian monitoring in the app to pick up new vitals."
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
