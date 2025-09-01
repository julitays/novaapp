export async function parse360Excel(file) {
  const XLSX = await ensureXLSX();
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });

  // заголовок
  let head = 0;
  for (let i=0;i<rows.length;i++){
    const line = rows[i].map(String);
    if (line.join(" ").toLowerCase().includes("компетенция")) { head = i; break; }
  }
  const header = (rows[head]||[]).map(s=>String(s||"").trim());
  const idxC = header.findIndex(h=>/компетенция/i.test(h));
  const idxPeers = header.findIndex(h=>/коллег/i.test(h));
  const idxSelf = header.findIndex(h=>/само/i.test(h));
  const idxRep = header.findIndex(h=>/подчин/i.test(h));
  const idxMgr = header.findIndex(h=>/руковод/i.test(h));

  const out = [];
  let current = null;
  for (let i=head+1; i<rows.length; i++){
    const r = rows[i] || [];
    const cell = String(r[idxC] ?? "").trim();
    const hasScores = [idxPeers, idxRep, idxMgr, idxSelf].some(ix => r[ix] != null && r[ix] !== "");
    const toNum = (x)=> x==null || x==="" ? undefined : Number(x);

    if (cell && !hasScores) {
      current = { name: cell, anchor: "", questions: [] };
      out.push(current);
    } else if (current && (cell || hasScores)) {
      current.questions.push({
        question: cell || `Вопрос ${current.questions.length+1}`,
        scores: {
          peers: toNum(r[idxPeers]),
          reports: toNum(r[idxRep]),
          manager: toNum(r[idxMgr]),
          self: toNum(r[idxSelf]),
        }
      });
    }
  }
  return out;
}

function ensureXLSX() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/xlsx@0.19.3/dist/xlsx.full.min.js";
    s.onload = () => resolve(window.XLSX);
    s.onerror = () => reject(new Error("Не удалось загрузить XLSX с CDN"));
    document.body.appendChild(s);
  });
}
