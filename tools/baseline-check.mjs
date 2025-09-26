#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Import web-features data
const webFeaturesPath = path.resolve(process.cwd(), "node_modules/web-features/data.json");
const webFeaturesData = JSON.parse(fs.readFileSync(webFeaturesPath, "utf-8"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const allowNewly = process.argv.includes("--allow-newly");
const reportOnly = process.argv.includes("--report");

const configPath = path.join(root, "baseline-features.json");
let declared = [];
if (fs.existsSync(configPath)) {
  try {
    const cfg = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    declared = Array.isArray(cfg.features) ? cfg.features : [];
  } catch {}
}

const SRC_DIR = path.join(root, "src");
const detected = new Set();
function scanFile(file) {
  const text = fs.readFileSync(file, "utf-8");
  if (/:has\s*\(/.test(text)) detected.add("css-has");
  if (/startViewTransition\s*\(/.test(text)) detected.add("view-transitions");
  if (/\bpopover\b|\bshowPopover\s*\(/.test(text)) detected.add("popover");
  if (/navigator\.clipboard/.test(text)) detected.add("clipboard");
}
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) walk(p);
    else if (/\.(tsx?|jsx?|css|scss|mdx?)$/.test(name)) scanFile(p);
  }
}
walk(SRC_DIR);

const featuresToCheck = Array.from(new Set([...(declared || []), ...detected]));
const byId = new Map(Object.entries(webFeaturesData.features).map(([id, f]) => [id, f]));

function statusFor(id) {
  const f = byId.get(id);
  if (!f) return { id, found: false, baseline: null, name: null };
  const baseline = f?.status?.baseline ?? null;
  return { id, found: true, baseline, name: f.name || id };
}

const results = featuresToCheck.map(statusFor);

function printTable(rows) {
  const pad = (s, n) => (s + " ".repeat(n)).slice(0, n);
  console.log(pad("Feature ID", 24), pad("Name", 36), "Baseline");
  console.log("-".repeat(24), "-".repeat(36), "--------");
  for (const r of rows) {
    console.log(
      pad(r.id, 24),
      pad(r.name || "-", 36),
      r.found ? (r.baseline || "none") : "NOT FOUND"
    );
  }
}

if (featuresToCheck.length === 0) {
  console.log("No features declared or detected. Add IDs to baseline-features.json to enable checks.");
  process.exit(0);
}

printTable(results);

const violations = results.filter(r => {
  if (!r.found) return true;
  if (allowNewly) return r.baseline !== "widely" && r.baseline !== "newly";
  return r.baseline !== "widely";
});

if (reportOnly) {
  console.log(`\nReport mode: ${violations.length} potential issues (not failing).`);
  process.exit(0);
}

if (violations.length) {
  console.error(`\nBaseline check FAILED: ${violations.length} feature(s) not allowed${allowNewly ? " (allowing 'newly')" : ""}.`);
  console.error("Violations:", violations.map(v => v.id).join(", "));
  process.exit(1);
} else {
  console.log("\nBaseline check PASSED 🎉");
  process.exit(0);
}
