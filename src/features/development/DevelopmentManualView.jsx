// src/features/development/DevelopmentManualView.jsx
import React from "react";
import {
  ResponsiveContainer,
  RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip,
} from "recharts";

import { Page } from "../../components/ui/Page.jsx";
import Card from "../../components/ui/Card.jsx";
import { Button, Select, Input } from "../../components/ui";

import { initialEmployees, initialRoles } from "../../lib/modules";
import { toRadarData } from "../../lib/analytics";

// ───────────────────────── helpers / ui bits
const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));
const ROLE_ORDER = { TM: 1, RM: 2, KAM: 3, "GKAM (Electronics)": 4, "GKAM FMCG": 4, "Руководитель отдела обучения": 3, HRBP: 4, "Директор по персоналу": 5, CEO: 6 };
const rank = (name) => ROLE_ORDER[name] ?? 0;
const roleByName = (n) => initialRoles.find((r) => r.name === n) || initialRoles[0];

const Chip = ({ tone = "slate", children }) => {
  const map = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700",
    indigo: "bg-indigo-100 text-indigo-700",
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

// локальный «кадровый резерв» в localStorage (совместимо с остальными экранами)
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

// объединение ключей карт компетенций
const unionKeys = (a = {}, b = {}) => Array.from(new Set([...Object.keys(a || {}), ...Object.keys(b || {})]));

// ───────────────────────── Component
export default function DevelopmentManualView() {
  const { reserveIds, toggle, has } = useLocalReserve();

  // ---------- «ручной профиль»
  // Пул всех компетенций из эталонов (для быстрого выбора)
  const allCompetencyNames = React.useMemo(() => {
    const names = initialRoles.flatMap((r) => Object.keys(r.competencies || {}));
    return uniq(names).sort((a, b) => a.localeCompare(b, "ru"));
  }, []);

  // выбранные компетенции профиля (массив) + уровни (map)
  const [picked, setPicked] = React.useState(() => allCompetencyNames.slice(0, 6)); // старт — первые 6 для наглядности
  const [levels, setLevels] = React.useState(() => {
    const m = {};
    for (const n of picked) m[n] = 3; // стартовый 3
    return m;
  });

  // добавление / удаление компетенций
  const [addQuery, setAddQuery] = React.useState("");
  const addOptions = React.useMemo(() => {
    const needle = addQuery.trim().toLowerCase();
    const pool = allCompetencyNames.filter((n) => !picked.includes(n));
    return needle ? pool.filter((n) => n.toLowerCase().includes(needle)) : pool.slice(0, 30);
  }, [allCompetencyNames, picked, addQuery]);

  function addCompetency(name) {
    if (!name || picked.includes(name)) return;
    setPicked((prev) => [...prev, name]);
    setLevels((prev) => ({ ...prev, [name]: prev[name] ?? 3 }));
    setAddQuery("");
  }
  function removeCompetency(name) {
    setPicked((prev) => prev.filter((n) => n !== name));
    setLevels((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }
  function setLevel(name, lvl) {
    const val = Math.max(0, Math.min(4, Number(lvl) || 0));
    setLevels((prev) => ({ ...prev, [name]: val }));
  }

  // поле имя профиля (для сохранения пресета)
  const [profileName, setProfileName] = React.useState("Мой ручной профиль");

  // ---------- кандидаты / фильтры
  const roleOptions = ["Все", ...uniq(initialEmployees.map((e) => e.title))];
  const [sourceRole, setSourceRole] = React.useState("RM");
  const [q, setQ] = React.useState("");

  const pool = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    const base = initialEmployees
      .filter((e) => (sourceRole === "Все" ? true : e.title === sourceRole))
      // без ограничений по грейду в ручном режиме — сравниваем любых
      .filter((e) =>
        !needle
          ? true
          : `${e.name} ${e.title} ${e.department} ${e.region}`.toLowerCase().includes(needle)
      )
      .map((e) => ({ emp: e, fit: calcManualFit(e.competencies || {}, levels) }))
      .sort((a, b) => b.fit - a.fit || a.emp.name.localeCompare(b.emp.name, "ru"));
    return base;
  }, [sourceRole, q, levels]);

  // выбранные для сравнения (скроллим и можно выбрать больше 3, но радар фокус на одном)
  const [selectedIds, setSelectedIds] = React.useState([]);
  const toggleSelected = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const selectedEmps = selectedIds
    .map((id) => initialEmployees.find((e) => e.id === id))
    .filter(Boolean);

  // фокус на радар
  const [focusId, setFocusId] = React.useState(null);
  React.useEffect(() => {
    if (!focusId || !selectedIds.includes(focusId)) setFocusId(selectedIds[0] ?? null);
  }, [selectedIds, focusId]);
  const focusEmp = selectedEmps.find((e) => e?.id === focusId) || selectedEmps[0] || null;

  // данные для радара (ручной профиль vs фокус-кандидат)
  const manualMap = React.useMemo(() => {
    const m = {};
    for (const name of picked) m[name] = levels[name] ?? 0;
    return m;
  }, [picked, levels]);

  // ─────────────────────── UI helpers
  function renderCell(stdLvl, empLvl) {
    const gap = stdLvl - empLvl;
    if (gap <= 0) return <Chip tone="green">{empLvl} ✓</Chip>;
    if (gap === 1) return <Chip tone="amber">{empLvl} (−1)</Chip>;
    return <Chip tone="rose">{empLvl} (−{gap})</Chip>;
  }

  // ─────────────────────── render
  return (
    <Page
      title="Развитие • Ручной профиль"
      subtitle="Подберите набор компетенций и уровни — сравните сотрудников с вашим профилем"
      actions={<Button variant="ghost" onClick={() => alert("Экспорт CSV (демо)")}>Экспорт CSV (демо)</Button>}
    >
      {/* Верх — настройка ручного профиля */}
      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
          {/* Слева — комптенции и уровни */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Input className="w-64" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
              <Button
                variant="outline"
                onClick={() => {
                  const snapshot = {
                    id: `manual_${Date.now()}`,
                    name: profileName || "Ручной профиль",
                    competencies: { ...manualMap },
                  };
                  const prev = JSON.parse(localStorage.getItem("dev_manual_profiles") || "[]");
                  localStorage.setItem("dev_manual_profiles", JSON.stringify([snapshot, ...prev].slice(0, 50)));
                  alert("Профиль сохранён локально");
                }}
              >
                Сохранить профиль
              </Button>
            </div>

            {/* Добавление компетенций */}
            <div className="rounded-xl border border-slate-200 p-3 bg-white mb-3">
              <div className="text-sm mb-2">Добавить компетенции</div>
              <div className="flex items-center gap-2 mb-2">
                <Input
                  className="w-72"
                  value={addQuery}
                  onChange={(e) => setAddQuery(e.target.value)}
                  placeholder="Поиск по компетенциям…"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    if (addOptions[0]) addCompetency(addOptions[0]);
                  }}
                >
                  Добавить первую из списка
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-auto">
                {addOptions.map((n) => (
                  <button
                    key={n}
                    className="text-xs px-2 py-1 rounded-full border border-slate-200 hover:border-indigo-300"
                    onClick={() => addCompetency(n)}
                  >
                    + {n}
                  </button>
                ))}
                {addOptions.length === 0 && <div className="text-sm text-slate-500">Нет совпадений</div>}
              </div>
            </div>

            {/* Выбранные компетенции + уровни */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-3 w-[40%]">Компетенция</th>
                    <th className="text-left p-3 w-[180px]">Уровень профиля</th>
                    <th className="text-left p-3">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {picked.map((name, idx) => (
                    <tr key={name} className={idx % 2 ? "bg-slate-50/60" : ""}>
                      <td className="p-3">{name}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={0}
                            max={4}
                            value={levels[name] ?? 0}
                            onChange={(e) => setLevel(name, e.target.value)}
                            className="w-40"
                          />
                          <Chip tone="indigo">{levels[name] ?? 0}</Chip>
                        </div>
                      </td>
                      <td className="p-3">
                        <Button variant="ghost" onClick={() => removeCompetency(name)}>
                          Удалить
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {picked.length === 0 && (
                    <tr>
                      <td className="p-3 text-slate-500" colSpan={3}>
                        Выберите компетенции через поиск выше — и настройте уровни.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Справа — фильтр кандидатов + мини-метрика */}
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-sm mb-1">Из какой роли ищем</div>
            <Select value={sourceRole} onChange={setSourceRole} options={roleOptions} />
            <div className="text-sm mt-3 mb-1">Поиск по людям</div>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Имя, отдел, регион…" />
            <div className="mt-3 rounded-xl border border-slate-200 p-3 bg-slate-50/50">
              <div className="text-xs text-slate-500">Найдено кандидатов</div>
              <div className="text-2xl font-semibold">{pool.length}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Средний блок — таблица сравнения слева + радар справа */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-4">
        {/* Таблица сравнения */}
        <Card className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="text-left p-3 w-[30%] sticky left-0 bg-slate-50">Профиль (ручной)</th>
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
              {picked.map((c, idx) => (
                <tr key={c} className={idx % 2 ? "bg-slate-50/50" : ""}>
                  <td className="p-3 sticky left-0 bg-inherit">{c}</td>
                  <td className="p-3"><Chip tone="indigo">{levels[c] ?? 0}</Chip></td>
                  {selectedEmps.map((e) => {
                    const empLvl = e?.competencies?.[c] ?? 0;
                    return <td key={e.id} className="p-3">{renderCell(levels[c] ?? 0, empLvl)}</td>;
                  })}
                  {[...Array(Math.max(0, 3 - selectedEmps.length))].map((_, i) => (
                    <td key={`cell-empty-${i}`} className="p-3 text-slate-300">—</td>
                  ))}
                </tr>
              ))}

              {/* Итоговая строка */}
              <tr className="border-t border-slate-200 bg-slate-50">
                <td className="p-3 font-medium sticky left-0 bg-slate-50">Итог (соответствие профилю)</td>
                <td className="p-3"></td>
                {selectedEmps.map((e) => {
                  const p = calcManualFit(e.competencies || {}, levels);
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

        {/* Радар */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium flex items-center gap-3">
              <span>Радар: ручной профиль vs кандидат</span>
              <span className="flex items-center gap-2 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1"><i className="inline-block w-3 h-3 rounded-sm" style={{background:"#6366f1"}} />Профиль</span>
                <span className="inline-flex items-center gap-1"><i className="inline-block w-3 h-3 rounded-sm" style={{background:"#10b981"}} />Кандидат</span>
              </span>
            </div>
            {focusEmp && (
              <div className="flex items-center gap-3">
                <div className="text-xs text-slate-500">{focusEmp.name.split(" ")[0]}</div>
                <StarToggle active={has(focusEmp.id)} onClick={() => toggle(focusEmp.id)} />
              </div>
            )}
          </div>

          {!focusEmp ? (
            <div className="text-sm text-slate-500">Добавьте кандидата в сравнение ниже — и выберите его на радар.</div>
          ) : (
            <div className="w-full h-80">
              <ResponsiveContainer>
                <RadarChart
                  key={`${focusEmp.id}-${picked.join("|")}`}
                  data={toRadarData(manualMap, focusEmp.competencies || {})}
                  outerRadius={120}
                  margin={{ right: 16 }}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="competency" tick={{ fontSize: 12, fill: "currentColor" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 4]} tick={{ fontSize: 11, fill: "currentColor" }} />
                  <Radar name="Профиль" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} isAnimationActive={false} />
                  <Radar name={focusEmp.name} dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.25} isAnimationActive={false} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Кандидаты — низ (скролл, можно отмечать сколько угодно, фокус на одного) */}
      <Card className="p-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium">Кандидаты из роли «{sourceRole}»</div>
          <div className="text-sm text-slate-500">в сравнении: {selectedEmps.length} · в резерве: {reserveIds.size}</div>
        </div>

        {pool.length === 0 ? (
          <div className="text-sm text-slate-500">По фильтру кандидатов нет</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {pool.map(({ emp, fit }) => {
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
                  <div className="mt-2 text-sm">Соответствие профилю: <b>{fit}%</b></div>

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
          </div>
        )}
      </Card>
    </Page>
  );
}

// ───────────────────────── scoring (ручной профиль)
function calcManualFit(empComp = {}, profileMap = {}) {
  const keys = Object.keys(profileMap || {});
  if (keys.length === 0) return 0;
  let ok = 0;
  let all = 0;
  for (const k of keys) {
    const need = profileMap[k] ?? 0;
    const have = empComp[k] ?? 0;
    // простая метрика: доля попаданий относительно требуемого уровня (нормируем к 4)
    const ratio = Math.min(have, need) / Math.max(need, 1);
    ok += ratio;
    all += 1;
  }
  const pct = Math.round((ok / all) * 100);
  return isNaN(pct) ? 0 : Math.max(0, Math.min(100, pct));
}
