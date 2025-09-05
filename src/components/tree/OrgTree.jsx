// src/components/tree/OrgTree.jsx
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useMemo,
  useCallback,
} from "react";

/** Публичное API: collapseAll(), expandAll(), exportPNG(), exportPDF()
 *  Props:
 *   - roots: OrgNode[]
 *   - deptCounts?: Map<string, number> (необяз., если нет — посчитаем сами)
 *   - query?: string
 *   - onOpenEmployee?: (id) => void
 */

const PALETTE = {
  // закреплённые брендовские сочетания
  "Продажи": ["#6366f1", "#c7d2fe"],
  Sales: ["#6366f1", "#c7d2fe"],
  "L&D": ["#10b981", "#bbf7d0"],
  HR: ["#06b6d4", "#a5f3fc"],
  Маркетинг: ["#f59e0b", "#fde68a"],
  HQ: ["#0ea5e9", "#bae6fd"],
  Enablement: ["#84cc16", "#d9f99d"],
  Electronics: ["#8b5cf6", "#ddd6fe"],
};

// ——— детерминированная пастельная из строки (fallback)
function pastelFromString(str = "") {
  // простейший хеш
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  // угол тона 0–360
  const hue = Math.abs(h) % 360;
  // две пары: акцент и пастель
  const accent = `hsl(${hue} 70% 48%)`;
  const pastel = `hsl(${hue} 85% 90%)`;
  return [accent, pastel];
}
function colorFor(emp) {
  const dep = (emp?.department || emp?.dept || "").toString();
  const role = (emp?.title || emp?.role || "").toString();
  // мягкий фуззи-поиск по ключам палитры
  for (const k of Object.keys(PALETTE)) {
    if (dep.toLowerCase().includes(k.toLowerCase()) ||
        role.toLowerCase().includes(k.toLowerCase())) {
      return PALETTE[k];
    }
  }
  // иначе — детерминированная пастель от департамента (или роли)
  const key = dep || role || "default";
  return pastelFromString(key);
}
const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join("");

// ——— рекурсивный поиск «похожего на сотрудника» внутри узла
function findEmployeeDeep(obj, depth = 0, seen = new Set(), path = "root") {
  if (!obj || typeof obj !== "object" || seen.has(obj) || depth > 4) return null;
  seen.add(obj);
  const name = obj.name || obj.fullName;
  const title = obj.title || obj.role;
  if (name && (title || obj.department || obj.dept)) return { hit: obj, path };
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === "object") {
      const found = findEmployeeDeep(v, depth + 1, seen, `${path}.${k}`);
      if (found) return found;
    }
  }
  return null;
}
// ——— нормализация полей сотрудника
function normalizeEmployee(raw, fallbackId) {
  const e = raw || {};
  return {
    id: e.id ?? fallbackId ?? "",
    name: e.name ?? e.fullName ?? "—",
    title: e.title ?? e.role ?? "—",
    department: e.department ?? e.dept ?? "—",
    region: e.region ?? e.location ?? "—",
    manager: e.manager ?? e.managerName ?? "—",
  };
}

// ——— сборщик Map<department, count> если её не передали пропсом
function collectDeptCounts(nodes = []) {
  const map = new Map();
  const bump = (dep) => {
    if (!dep) return;
    map.set(dep, (map.get(dep) || 0) + 1);
  };
  const walk = (n) => {
    if (!n) return;
    const primary = n.employee || n.emp || n.data || n.user || null;
    const deep = primary ? null : findEmployeeDeep(n);
    const raw = primary || deep?.hit || {};
    const emp = normalizeEmployee(raw, n?.id);
    bump(emp.department);
    if (Array.isArray(n.children)) n.children.forEach(walk);
  };
  nodes.forEach(walk);
  return map;
}

const OrgTree = forwardRef(function OrgTree(
  { roots = [], deptCounts: deptCountsProp, query = "", onOpenEmployee },
  ref
) {
  const treeRef = useRef(null);
  const q = (query || "").trim().toLowerCase();

  // если Map не передали — считаем сами из дерева
  const deptCounts = useMemo(
    () => (deptCountsProp && deptCountsProp.size ? deptCountsProp : collectDeptCounts(roots)),
    [deptCountsProp, roots]
  );

  const collapseAll = useCallback(() => {
    treeRef.current?.querySelectorAll('[data-node="1"]').forEach((el) =>
      el.setAttribute("data-collapsed", "true")
    );
  }, []);
  const expandAll = useCallback(() => {
    treeRef.current?.querySelectorAll('[data-node="1"]').forEach((el) =>
      el.setAttribute("data-collapsed", "false")
    );
  }, []);
  useImperativeHandle(ref, () => ({
    collapseAll,
    expandAll,
    exportPNG: () => window.print?.(),
    exportPDF: () => window.print?.(),
  }));

  const hi = (txt) => {
    const s = String(txt ?? "");
    if (!q) return s;
    const i = s.toLowerCase().indexOf(q);
    if (i === -1) return s;
    return (
      <>
        {s.slice(0, i)}
        <mark className="bg-yellow-200 rounded px-0.5">{s.slice(i, i + q.length)}</mark>
        {s.slice(i + q.length)}
      </>
    );
  };

  const Node = ({ node }) => {
    const primary = node?.employee || node?.emp || node?.data || node?.user || null;
    const deep = primary ? null : findEmployeeDeep(node);
    const raw = primary || deep?.hit || {};
    const emp = normalizeEmployee(raw, node?.id);
    const [accent, pastel] = colorFor(emp);

    const span = Array.isArray(node?.children) ? node.children.length : 0;
    const depCount = deptCounts.get(emp.department) || 0;

    const onCardClick = (ev) => {
      if (ev.target?.closest?.('[data-role="open-link"]')) return;
      const host = ev.currentTarget.closest('[data-node="1"]');
      if (!host) return;
      const collapsed = host.getAttribute("data-collapsed") === "true";
      host.setAttribute("data-collapsed", collapsed ? "false" : "true");
    };
    const onCardKey = (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        onCardClick(ev);
      }
    };

    return (
      <li
        className="org-node"
        data-node="1"
        data-collapsed="false"
        style={{ ["--accent"]: accent, ["--pastel"]: pastel }}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={onCardClick}
          onKeyDown={onCardKey}
          className="node-card group cursor-pointer rounded-2xl border bg-white px-4 py-3 shadow-sm hover:shadow transition flex items-start justify-between gap-4"
          title="Нажмите, чтобы свернуть/развернуть ветку"
        >
          <div className="min-w-0 flex items-start gap-3">
            <div className="avatar shrink-0 rounded-xl text-white font-semibold grid place-items-center">
              {initials(emp.name)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <i className="chev" />
                <button
                  data-role="open-link"
                  className="text-base sm:text-lg font-semibold leading-tight truncate hover:underline text-slate-900"
                  title="Открыть профиль"
                  onClick={(e2) => {
                    e2.preventDefault();
                    e2.stopPropagation();
                    onOpenEmployee?.(emp.id);
                  }}
                >
                  {hi(emp.name)}
                </button>
              </div>
              <div className="mt-0.5 text-xs sm:text-sm text-slate-700">
                {hi(emp.title)} · {hi(emp.department)}
              </div>
              <div className="mt-0.5 text-xs text-slate-500">
                {hi(emp.region)} · Руководитель: {hi(emp.manager)}
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-start gap-2">
            <span className="badge">
              <span className="badge-dot" />
              <b>Span:</b>&nbsp;{span}
            </span>
            <span className="badge">
              <span className="badge-dot" />
              <b>В департаменте:</b>&nbsp;{depCount}
            </span>
          </div>
        </div>

        {Array.isArray(node?.children) && node.children.length > 0 && (
          <ul className="children">
            {node.children.map((ch, i) => (
              <Node
                key={
                  ch.id ??
                  ch?.emp?.id ??
                  ch?.employee?.id ??
                  `${emp.id || "n"}_${i}`
                }
                node={ch}
              />
            ))}
          </ul>
        )}
      </li>
    );
  };

  const content = useMemo(() => {
    if (!roots?.length)
      return <div className="text-sm text-slate-500">Нет данных для отображения.</div>;
    return (
      <ul className="org-tree">
        {roots.map((r, i) => (
          <Node
            key={r.id ?? r?.emp?.id ?? r?.employee?.id ?? `root_${i}`}
            node={r}
          />
        ))}
      </ul>
    );
  }, [roots, q, deptCounts]); // важно: завязываем на deptCounts, чтобы бейджи обновлялись

  return (
    <>
      <style>{styles}</style>
      <div ref={treeRef}>{content}</div>
    </>
  );
});

export default OrgTree;

const styles = `
.org-tree { padding-left:0; margin:0; }
.org-tree > .org-node + .org-node { margin-top:.5rem; }
.org-node { list-style:none; position:relative; }

.node-card{
  position:relative;
  border-color: var(--pastel, #e2e8f0);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--pastel, #e2e8f0) 40%, transparent);
  background:
    linear-gradient(180deg, #ffffff 0%, #ffffff 60%, color-mix(in srgb, var(--pastel, #e2e8f0) 18%, #fff) 100%);
}
.node-card:hover{ box-shadow: 0 0 0 4px color-mix(in srgb, var(--pastel, #e2e8f0) 60%, transparent); }
.node-card::before{
  content:""; position:absolute; inset:0 auto 0 0; width:.28rem;
  border-radius:1rem 0 0 1rem; background: var(--accent,#64748b); opacity:.95;
}

.avatar{ width:42px; height:42px;
  background: radial-gradient(120px 60px at 20% 20%, var(--accent, #64748b), var(--pastel, #e2e8f0));
  box-shadow: inset 0 0 0 2px #ffffffa8, 0 1px 2px rgba(0,0,0,.06);
}

.chev{
  width:.75rem; height:.75rem; display:inline-block;
  border-right:2px solid #94a3b8; border-bottom:2px solid #94a3b8;
  transform: rotate(45deg); margin-right:.125rem; transition: transform .18s ease;
}
[data-collapsed="true"] .chev{ transform: rotate(-135deg); }

.badge{
  display:inline-flex; align-items:center; gap:.35rem;
  padding:.25rem .5rem; border-radius:.75rem; font-size:.75rem;
  background: color-mix(in srgb, var(--pastel, #e2e8f0) 55%, white);
  color:#0f172a; border:1px solid var(--pastel,#e2e8f0);
}
.badge-dot{ width:.45rem; height:.45rem; border-radius:9999px; background: var(--accent,#64748b); }

.children{
  margin-left:1.25rem; padding-left:1.25rem;
  border-left:2px solid color-mix(in srgb, var(--pastel,#e2e8f0) 85%, #e5e7eb);
  margin-top:.5rem;
}
.children > .org-node{ position:relative; margin-top:.5rem; }
.children > .org-node::before{
  content:""; position:absolute; left:-1.25rem; top:1.25rem; width:1.25rem; height:0;
  border-top:2px solid color-mix(in srgb, var(--pastel,#e2e8f0) 85%, #e5e7eb);
}

[data-node="1"][data-collapsed="true"] > .children { display:none; }
mark{ color:inherit; padding:0 .15rem; border-radius:.25rem; }
`;
