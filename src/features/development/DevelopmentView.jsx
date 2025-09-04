// src/features/development/DevelopmentView.jsx
import React from "react";


import { Page } from "../../components/ui/Page.jsx";
import Card from "../../components/ui/Card.jsx";
import { Button, Select } from "../../components/ui";
import RadarCompare from "../../components/charts/RadarCompare.jsx";


import {
  initialEmployees,
  initialRoles,
  roleStandards,
} from "../../lib/modules";
import { matchPercent } from "../../lib/analytics";

// ── роль → «вес» для сравнения грейдов
const ROLE_ORDER = {
  TM: 1,
  RM: 2,
  KAM: 3,
  "GKAM (Electronics)": 4,
  "GKAM FMCG": 4,
  "Руководитель отдела обучения": 3,
  HRBP: 4,
  "Директор по персоналу": 5,
  CEO: 6,
};
const rank = (name) => ROLE_ORDER[name] ?? 0;

// ── локальный «кадровый резерв» в localStorage
const LS_RESERVE_KEY = "novaapp_reserve_ids";
function useLocalReserve() {
  const [reserveIds, setReserveIds] = React.useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(LS_RESERVE_KEY) || "[]")); }
    catch { return new Set(); }
  });
  const toggle = (id) => {
    setReserveIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem(LS_RESERVE_KEY, JSON.stringify([...next]));
      return next;
    });
  };
  const has = (id) => reserveIds.has(id);
  return { reserveIds, toggle, has };
}

const getRoleByName = (n) => initialRoles.find((r) => r.name === n) || initialRoles[0];
const getStandardByName = (n) => roleStandards.find((s) => s.name === n) || null;
const keysOf = (m = {}) => Object.keys(m);

// ── мини-UI
const Chip = ({ tone = "slate", children }) => {
  const map = {
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700",
    indigo: "bg-indigo-100 text-indigo-700",
    slate: "bg-slate-100 text-slate-700",
  };
  return <span className={`inline-block text-xs px-2 py-0.5 rounded ${map[tone]}`}>{children}</span>;
};

const StarToggle = ({ active, onClick, title }) => (
  <button
    onClick={onClick}
    title={title || (active ? "Убрать из резерва" : "Добавить в резерв")}
    className="text-lg leading-none select-none"
    aria-label="toggle-reserve"
  >
    <span className={active ? "text-amber-500" : "text-slate-300"}>{active ? "★" : "☆"}</span>
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────

export default function DevelopmentView() {
  const { reserveIds, toggle, has } = useLocalReserve();

  // Фильтры/опции
  const roleOptions = ["Все", ...Array.from(new Set(initialEmployees.map((e) => e.title)))];
  const targetOptions = initialRoles.map((r) => r.name);

  const [sourceRole, setSourceRole] = React.useState("RM");
  const [targetRoleName, setTargetRoleName] = React.useState(
    targetOptions.includes("KAM") ? "KAM" : targetOptions[0]
  );
  const [useExpandedStandard, setUseExpandedStandard] = React.useState(true);

  // Эталон
  const baseRole = getRoleByName(targetRoleName);
  const std = useExpandedStandard ? getStandardByName(targetRoleName) : null;
  const targetCompetencies = std?.competencyMap || baseRole?.competencies || {};

  // Пул кандидатов: исключаем равных и выше целевой роли
  const pool = initialEmployees
    .filter((e) => (sourceRole === "Все" ? true : e.title === sourceRole))
    .filter((e) => rank(e.title) < rank(targetRoleName))
    .map((e) => ({ emp: e, readiness: matchPercent(e, baseRole) }))
    .sort((a, b) => b.readiness - a.readiness);

  // Выбранные (до 3-х)
  const [selectedIds, setSelectedIds] = React.useState([]);
  React.useEffect(() => {
    const top3 = pool.slice(0, 3).map((x) => x.emp.id);
    setSelectedIds((prev) => {
      const keep = prev.filter((id) => top3.includes(id));
      const res = [...keep];
      for (const id of top3) if (res.length < 3 && !res.includes(id)) res.push(id);
      return res;
    });
  }, [sourceRole, targetRoleName, useExpandedStandard, pool.length]);

  const selectedEmps = selectedIds
    .map((id) => initialEmployees.find((e) => e.id === id))
    .filter(Boolean);

  const toggleSelected = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 3 ? [...prev.slice(1), id] : [...prev, id]
    );

  // Фокус для радара
  const [focusId, setFocusId] = React.useState(null);
  React.useEffect(() => {
    if (!focusId || !selectedIds.includes(focusId)) setFocusId(selectedIds[0] ?? null);
  }, [selectedIds, focusId]);
  const focusEmp = selectedEmps.find((e) => e.id === focusId) || selectedEmps[0] || null;

  // Цветовое кодирование ячеек по разрыву с эталоном
  function renderCell(e, comp) {
    const stdLvl = targetCompetencies[comp] ?? 0;
    const empLvl = e?.competencies?.[comp] ?? 0;
    const gap = stdLvl - empLvl;
    if (gap <= 0) return <Chip tone="green">{empLvl} ✓</Chip>;
    if (gap === 1) return <Chip tone="amber">{empLvl} (−1)</Chip>;
    return <Chip tone="rose">{empLvl} (−{gap})</Chip>;
  }

  // ───────────────────────────────────────────────────────────────────────────

  return (
    <Page
      title="Развитие"
      actions={<Button variant="ghost" onClick={() => alert("Экспорт CSV (демо)")}>Экспорт CSV (демо)</Button>}
    >
      {/* Фильтры */}
      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
          <div>
            <div className="text-sm mb-1">Из какой роли ищем</div>
            <Select value={sourceRole} onChange={setSourceRole} options={roleOptions} />
          </div>
          <div>
            <div className="text-sm mb-1">Целевая роль (эталон)</div>
            <Select value={targetRoleName} onChange={setTargetRoleName} options={targetOptions} />
            <label className="mt-2 inline-flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={useExpandedStandard}
                onChange={(e) => setUseExpandedStandard(e.target.checked)}
              />
              использовать расширенный эталон (roleStandards)
            </label>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm flex flex-col justify-center">
            <div className="text-slate-500">Найдено кандидатов</div>
            <div className="text-2xl font-semibold">{pool.length}</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-4">
        {/* ── Таблица сравнения */}
        <Card className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="text-left p-3 w-[30%] sticky left-0 bg-slate-50">Профиль эталон</th>
                <th className="text-left p-3 w-[10%]">Уровень</th>
                {selectedEmps.map((e) => (
                  <th key={e.id} className="text-left p-3">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        className={`font-medium hover:underline ${focusId === e.id ? "text-indigo-600" : ""}`}
                        onClick={() => setFocusId(e.id)}
                        title="Показать на радаре"
                      >
                        {e.name}
                      </button>
                      {/* «в резерв» — в заголовке колонки */}
                      <StarToggle active={has(e.id)} onClick={() => toggle(e.id)} title="Переключить резерв" />
                    </div>
                    <div className="text-xs text-slate-500">{e.title}</div>
                  </th>
                ))}
                {[...Array(Math.max(0, 3 - selectedEmps.length))].map((_, i) => (
                  <th key={`empty-${i}`} className="text-left p-3 text-slate-400">—</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keysOf(targetCompetencies).map((c, idx) => (
                <tr key={c} className={idx % 2 ? "bg-slate-50/50" : ""}>
                  <td className="p-3 sticky left-0 bg-inherit">{c}</td>
                  <td className="p-3"><Chip tone="indigo">{targetCompetencies[c] ?? "—"}</Chip></td>
                  {selectedEmps.map((e) => (
                    <td key={e.id} className="p-3">{renderCell(e, c)}</td>
                  ))}
                  {[...Array(Math.max(0, 3 - selectedEmps.length))].map((_, i) => (
                    <td key={`cell-empty-${i}`} className="p-3 text-slate-300">—</td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-slate-200 bg-slate-50">
                <td className="p-3 font-medium sticky left-0 bg-slate-50">Итог (соответствие роли)</td>
                <td className="p-3"></td>
                {selectedEmps.map((e) => {
                  const p = matchPercent(e, baseRole);
                  return (
                    <td key={e.id} className="p-3">
                      <div className="font-semibold">{p}%</div>
                      <div className="h-1.5 rounded bg-slate-100 mt-1">
                        <div className="h-1.5 rounded bg-indigo-400" style={{ width: `${p}%` }} />
                      </div>
                    </td>
                  );
                })}
                {[...Array(Math.max(0, 3 - selectedEmps.length))].map((_, i) => (
                  <td key={`sum-empty-${i}`} className="p-3 text-slate-300">—</td>
                ))}
              </tr>
            </tbody>
          </table>
        </Card>

        {/* ── Радар-чарт */}
              <Card className="p-4">
                <RadarCompare
                  role={{ name: baseRole.name, competencies: targetCompetencies }}
                  employee={focusEmp}
                  subtitle={
                    focusEmp
                      ? `${focusEmp.name} — готовность к «${baseRole.name}»: ${matchPercent(focusEmp, baseRole)}%`
                      : "Выберите кандидата слева, чтобы увидеть сравнение"
                  }
                  height={340}
                />
              </Card>
      </div>

      {/* Кандидаты */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium">Кандидаты из роли «{sourceRole}» (исключены: равные/выше «{targetRoleName}»)</div>
          <div className="text-sm text-slate-500">в сравнении: {selectedEmps.length}/3 · в резерве: {reserveIds.size}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {pool.map(({ emp, readiness }) => {
            const selected = selectedIds.includes(emp.id);
            const reserved = has(emp.id);
            return (
              <div
                key={emp.id}
                className={`relative rounded-xl border p-3 transition ${selected ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white"}`}
              >
                {/* звездочка-резерв — правый верх */}
                <div className="absolute right-2 top-2">
                  <StarToggle active={reserved} onClick={() => toggle(emp.id)} />
                </div>

                <div className="font-medium pr-6">{emp.name}</div>
                <div className="text-xs text-slate-500">{emp.title} · {emp.department} · {emp.region}</div>
                <div className="mt-2 text-sm">Готовность к «{baseRole.name}»: <b>{readiness}%</b></div>
                <div className="mt-2 flex items-center gap-3">
                  <Button variant="ghost" onClick={() => toggleSelected(emp.id)}>
                    {selected ? "убрать из сравнения" : "в сравнение"}
                  </Button>
                  {selected && (
                    <Button variant="ghost" onClick={() => setFocusId(emp.id)}>
                      на радар
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          {pool.length === 0 && <div className="text-slate-500">По фильтру кандидатов нет</div>}
        </div>
      </Card>
    </Page>
  );
}
