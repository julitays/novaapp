// src/lib/importers/parseEmployeesCsv.js
import { normalizeOrgTag } from "../orgLevels";

export async function parseEmployeesCsv(file) {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());

  const idx = (name) => header.indexOf(name);

  const out = [];
  for (let i = 1; i < lines.length; i++) {
    const row = splitCsvLine(lines[i]);
    if (row.length === 0) continue;

    const id           = val(row[idx("id")]);
    const name         = val(row[idx("name")]);
    const title        = val(row[idx("title")]);
    const department   = val(row[idx("department")]);
    const managerId    = toNum(row[idx("managerid")]);
    const orgTagRaw    = val(row[idx("orgtag")]);
    const readiness    = toNum(row[idx("readiness")]);
    const roleTarget   = val(row[idx("roletarget")]);
    const region       = val(row[idx("region")]);

    out.push({
      id: id || `${i + 1}`,
      name, title, department, managerId,
      orgTag: normalizeOrgTag(orgTagRaw),
      readiness: readiness != null ? { percent: readiness } : undefined,
      roleTarget, region,
    });
  }
  return out;
}

function val(x) { return x == null ? "" : String(x).trim(); }
function toNum(x) { const n = Number(x); return Number.isFinite(n) ? n : undefined; }

// простой CSV split с учётом кавычек
function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === "," && !inQ) {
      out.push(cur); cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}
