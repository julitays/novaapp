// расчёт процентов соответствия и подготовка данных для радара

export function roleToMap(role) {
  return role?.competencyMap || role?.competencies || {};
}

export function matchPercent(emp, role) {
  const rmap = roleToMap(role);
  const keys = Object.keys(rmap);
  if (!keys.length) return 0;
  let sum = 0, max = 0;
  keys.forEach(k => {
    const need = rmap[k] || 0;
    const have = (emp?.competencies?.[k]) || 0;
    sum += Math.min(have, need);
    max += need;
  });
  return Math.round((sum / (max || 1)) * 100);
}

export function toRadarData(role, emp) {
  const roleMap = roleToMap(role);
  const keys = new Set([...Object.keys(roleMap || {}), ...Object.keys(emp || {})]);
  return Array.from(keys).map(k => ({
    competency: k,
    A: roleMap?.[k] || 0,
    B: emp?.[k] || 0,
  }));
}

// 360° утилиты
export const LABELS = { peers:"Коллеги", reports:"Подчинённые", manager:"Руководитель", self:"Самооценка" };

export function meanByGroup(comp) {
  const groups = Object.keys(LABELS);
  const out = {};
  for (const g of groups) {
    let sum=0, n=0;
    for (const q of comp.questions) {
      const v = q.scores?.[g];
      if (typeof v === "number") { sum += v; n++; }
    }
    if (n) out[g] = sum / n;
  }
  return out;
}

export function weightedOverall(comp, weights) {
  const g = meanByGroup(comp);
  let wsum=0, s=0;
  for (const k of Object.keys(g)) {
    const w = Number(weights[k] ?? 0);
    s += g[k] * w;
    wsum += w;
  }
  return wsum ? (s / wsum) : null;
}

export function stdBetweenGroups(comp) {
  const g = meanByGroup(comp);
  const vals = Object.values(g);
  if (vals.length <= 1) return 0;
  const m = vals.reduce((a,b)=>a+b,0)/vals.length;
  const v = vals.reduce((a,b)=>a+(b-m)*(b-m),0)/(vals.length-1);
  return Math.sqrt(v);
}

export function calcSelfDelta(comp) {
  const g = meanByGroup(comp);
  if (g.self == null) return null;
  const ext = [g.peers, g.reports, g.manager].filter(x=>x!=null);
  if (!ext.length) return null;
  const extMean = ext.reduce((a,b)=>a+b,0)/ext.length;
  return g.self - extMean;
}

export const level4to5 = (lvl4)=> lvl4 ? (lvl4/4)*5 : 0;
