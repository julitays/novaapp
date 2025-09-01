// src/lib/orgLevels.js

// Нормализуем любые варианты: "СЕО 1", "CEO-1", "ceo1" -> "CEO-1"
export function normalizeOrgTag(raw) {
  if (!raw) return null;
  let s = String(raw).trim();
  s = s.replace(/с|С/g, "C").replace(/е|Е/g, "E").replace(/о|О/g, "O"); // кириллица -> латиница
  s = s.toUpperCase().replace(/\s+/g, "").replace(/-/g, "");
  const m = s.match(/^(CEO)(\d+)?$/);
  if (!m) return null;
  const depth = m[2] ? Number(m[2]) : 0;
  return depth === 0 ? "CEO" : `CEO-${depth}`;
}

export function parseOrgTag(raw) {
  const n = normalizeOrgTag(raw);
  if (!n) return null;
  if (n === "CEO") return { root: "CEO", depth: 0 };
  const m = n.match(/^CEO-(\d+)$/);
  const depth = m ? Number(m[1]) : 0;
  return { root: "CEO", depth };
}

// Строим дерево из сотрудников. Если есть managerId — используем.
// Если нет, пытаемся пришить по orgTag (CEO уровни), предпочитая связки внутри одного department.
export function buildOrgTree(employees, { preferManagerId = true } = {}) {
  const byId = new Map();
  const nodes = employees.map((e) => ({
    ...e,
    children: [],
    _org: parseOrgTag(e.orgTag),
  }));
  nodes.forEach((n) => byId.set(n.id, n));

  // 1) Пробуем связать по managerId
  const roots = new Set(nodes);
  nodes.forEach((n) => {
    if (preferManagerId && n.managerId != null && byId.has(n.managerId)) {
      const parent = byId.get(n.managerId);
      parent.children.push(n);
      roots.delete(n);
    }
  });

  // 2) Оставшихся пришиваем по orgTag глубине (CEO-0 -> CEO-1 -> CEO-2 ...)
  const undecided = Array.from(roots).filter((n) => n !== null); // копия
  // карты по глубине
  const depthBuckets = new Map();
  undecided.forEach((n) => {
    const d = n._org ? n._org.depth : Infinity; // без orgTag считаем "неопределившимися"
    if (!depthBuckets.has(d)) depthBuckets.set(d, []);
    depthBuckets.get(d).push(n);
  });

  // Все CEO (depth 0) — кандидаты на корень
  const ceos = (depthBuckets.get(0) || []);
  // всё, что глубже, пришиваем к ближайшему родителю с depth-1
  const maxDepth = Math.max(...Array.from(depthBuckets.keys()).filter((x)=>x!==Infinity), 0);
  for (let d = 1; d <= maxDepth; d++) {
    const level = depthBuckets.get(d) || [];
    const parents = depthBuckets.get(d - 1) || ceos;
    level.forEach((n) => {
      // Ищем родителя сначала в своём department, иначе любой
      let parent =
        parents.find((p) => p.department && n.department && p.department === n.department) ||
        parents[0];
      if (parent && !parent.children.includes(n)) {
        parent.children.push(n);
        roots.delete(n);
      }
    });
  }

  // 3) Остальные остаются корнями
  const rootNodes = Array.from(roots);

  return { rootNodes, mapById: byId };
}

// Подсветка «линз» на узлах дерева
export function lensColor(node, lens = "readiness") {
  const ready = (node.readiness?.percent ?? 0) >= 70;
  if (lens === "readiness") {
    return ready
      ? { bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-700/50", badge: "bg-green-100 text-green-700" }
      : { bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-700/50", badge: "bg-amber-100 text-amber-700" };
  }
  if (lens === "reserve") {
    // роль без резерва (в дереве на сотруднике оцениваем по его целевой роли/отделу — тут демо: красним если readiness<70)
    return ready
      ? { bg: "bg-slate-50 dark:bg-slate-800/40", border: "border-slate-200 dark:border-slate-700/50", badge: "bg-slate-100 text-slate-700" }
      : { bg: "bg-rose-50 dark:bg-rose-900/20", border: "border-rose-200 dark:border-rose-700/50", badge: "bg-rose-100 text-rose-700" };
  }
  if (lens === "managerLoad") {
    const load = (node.children || []).length;
    if (load >= 8) {
      return { bg: "bg-rose-50 dark:bg-rose-900/20", border: "border-rose-200 dark:border-rose-700/50", badge: "bg-rose-100 text-rose-700" };
    }
    if (load >= 5) {
      return { bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-700/50", badge: "bg-amber-100 text-amber-700" };
    }
    return { bg: "bg-slate-50 dark:bg-slate-800/40", border: "border-slate-200 dark:border-slate-700/50", badge: "bg-slate-100 text-slate-700" };
  }
  return { bg: "bg-slate-50 dark:bg-slate-800/40", border: "border-slate-200 dark:border-slate-700/50", badge: "bg-slate-100 text-slate-700" };
}

// Подсчёт готовых/растущих по поддереву
export function subtreeCounters(node) {
  const list = [];
  (function dfs(n){ list.push(n); (n.children||[]).forEach(dfs); })(node);
  const ready = list.filter(n => (n.readiness?.percent ?? 0) >= 70).length;
  const grow  = list.length - ready;
  return { ready, grow };
}
