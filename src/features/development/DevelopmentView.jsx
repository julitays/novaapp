// src/features/development/DevelopmentView.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

import { Page } from "../../components/ui/Page.jsx";
import Card from "../../components/ui/Card.jsx";
import { Button, Input } from "../../components/ui"; // Select убрали — используем нативный <select>
import RadarCompare from "../../components/charts/RadarCompare.jsx";

import { initialEmployees, initialRoles } from "../../lib/modules";
import { matchPercent } from "../../lib/analytics";

// ── размеры липких колонок
const FIRST_COL_W = 260;
const LVL_COL_W   = 96;
const CAND_COL_W  = 220;

// ── приоритет ролей (для исключения равных/выше целевой)
const ROLE_ORDER = {
  TM: 1, RM: 2, KAM: 3,
  "GKAM (Electronics)": 4, "GKAM FMCG": 4,
  "Руководитель отдела обучения": 3, HRBP: 4,
  "Директор по персоналу": 5, CEO: 6,
};
const rank = (name) => ROLE_ORDER[name] ?? 0;

// ── локальный «кадровый резерв»
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

// ── helpers
const getRoleByName = (n) => initialRoles.find((r) => r.name === n) || initialRoles[0];
const keysOf = (m = {}) => Object.keys(m);

// ── мини-UI
const Chip = ({ tone = "slate", children }) => {
  const map = {
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    rose:  "bg-rose-100 text-rose-700",
    indigo:"bg-indigo-100 text-indigo-700",
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

// ── нативный селект (надёжный)
function NativeSelect({ label, value, onChange, options }) {
  return (
    <div>
      {label && <div className="text-sm mb-1">{label}</div>}
      <select
        className="w-full h-[38px] px-3 rounded-xl border border-slate-200 bg-white text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

// ── простой MultiSelect с поиском и закрытием по клику вне
function MultiSelect({ label, options, value, onChange, placeholder = "Начните ввод…" }) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const rootRef = React.useRef(null);

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return !needle ? options : options.filter((o) => o.toLowerCase().includes(needle));
  }, [options, q]);

  function toggle(opt) {
    const has = value.includes(opt);
    const next = has ? value.filter((v) => v !== opt) : [...value, opt];
    onChange(next);
  }
  function clearOne(opt) {
    onChange(value.filter((v) => v !== opt));
  }

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      const root = rootRef.current;
      if (!root) return;
      if (!root.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => (e.key === "Escape" ? setOpen(false) : null);
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      {label && <div className="text-sm mb-1">{label}</div>}
      <div
        className="flex items-center gap-2 min-h-[38px] px-2 py-1 rounded-xl border border-slate-200 bg-white cursor-text"
        onClick={() => setOpen((v) => !v)}
      >
        {value.length === 0 ? (
          <span className="text-slate-400 text-sm">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {value.map((v) => (
              <span
                key={v}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100"
                onClick={(e) => e.stopPropagation()}
              >
                {v}
                <button
                  className="text-slate-500 hover:text-rose-600"
                  onClick={() => clearOne(v)}
                  aria-label="Удалить"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="ml-auto text-slate-400">▾</div>
      </div>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow">
          <div className="p-2 border-b border-slate-100">
            <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Фильтр вариантов…" />
          </div>
          <div className="max-h-56 overflow-auto p-1">
            {filtered.length === 0 ? (
              <div className="px-2 py-3 text-sm text-slate-500">Нет совпадений</div>
            ) : (
              filtered.map((opt) => {
                const active = value.includes(opt);
                return (
                  <button
                    key={opt}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-50 ${
                      active ? "bg-indigo-50 text-indigo-700" : ""
                    }`}
                    onClick={() => toggle(opt)}
                  >
                    {opt}
                  </button>
                );
              })
            )}
          </div>
          <div className="p-2 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">Выбрано: {value.length}</div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => onChange([])}>Сбросить</Button>
              <Button onClick={() => setOpen(false)}>Готово</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────

export default function DevelopmentView() {
  const navigate = useNavigate();
  const { reserveIds, toggle, has } = useLocalReserve();

  // опции
  const targetOptions = initialRoles.map((r) => r.name);
  const sourceRoleOptions = Array.from(new Set(initialEmployees.map((e) => e.title)));

  // фильтры
  const [targetRoleName, setTargetRoleName] = React.useState(
    targetOptions.includes("KAM") ? "KAM" : targetOptions[0]
  );
  const [sourceRoles, setSourceRoles] = React.useState([]);
  const [q, setQ] = React.useState("");

  // эталон
  const baseRole = React.useMemo(() => getRoleByName(targetRoleName), [targetRoleName]);
  const targetCompetencies = baseRole?.competencies || {};

  // пул кандидатов
  const pool = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return initialEmployees
      .filter((e) => (sourceRoles.length === 0 ? true : sourceRoles.includes(e.title)))
      .filter((e) => rank(e.title) < rank(targetRoleName))
      .filter((e) =>
        !needle
          ? true
          : `${e.name} ${e.title} ${e.department} ${e.region}`.toLowerCase().includes(needle)
      )
      .map((e) => ({ emp: e, readiness: matchPercent(e, baseRole) }))
      .sort((a, b) => b.readiness - a.readiness);
  }, [targetRoleName, sourceRoles, q, baseRole]);

  // выбранные кандидаты (без лимита) + фокус для радара
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [focusId, setFocusId] = React.useState(null);

  // при смене целевой роли/источника — подсказка топ-3 и зачистка выпавших
  React.useEffect(() => {
    setSelectedIds((prev) => {
      const inPool = prev.filter((id) => pool.some((p) => p.emp.id === id));
      if (inPool.length > 0) return inPool;
      return pool.slice(0, 3).map((x) => x.emp.id);
    });
  }, [pool]);

  React.useEffect(() => {
    // обновлять фокус, если его кандидат пропал
    setFocusId((prev) => {
      if (prev && pool.some((p) => p.emp.id === prev)) return prev;
      const first = (selectedIds.length ? selectedIds : pool.slice(0, 1).map((x) => x.emp.id))[0];
      return first ?? null;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds, pool]);

  const selectedEmps = selectedIds
    .map((id) => initialEmployees.find((e) => e.id === id))
    .filter(Boolean);

  const toggleSelected = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // перелистывание фокуса (для радара)
  const focusList = selectedEmps.length > 0 ? selectedEmps : pool.map((p) => p.emp);
  const focusIndex = focusList.findIndex((e) => e.id === focusId);
  const canScroll = focusList.length > 1;
  const focusEmp =
    focusList.length === 0 ? null : focusList[Math.max(0, focusIndex === -1 ? 0 : focusIndex)];
  function moveFocus(delta) {
    if (focusList.length === 0) return;
    const idx = focusIndex >= 0 ? focusIndex : 0;
    const next = (idx + delta + focusList.length) % focusList.length;
    setFocusId(focusList[next].id);
  }
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); moveFocus(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); moveFocus(1); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [focusIndex, focusList.length]);

  // рендер ячейки уровня
  function renderCell(e, comp) {
    const stdLvl = targetCompetencies[comp] ?? 0;
    const empLvl = e?.competencies?.[comp] ?? 0;
    const gap = stdLvl - empLvl;
    if (gap <= 0) return <Chip tone="green">{empLvl} ✓</Chip>;
    if (gap === 1) return <Chip tone="amber">{empLvl} (−1)</Chip>;
    return <Chip tone="rose">{empLvl} (−{gap})</Chip>;
  }

  // стиль липких колонок
  const stickyShadow = { boxShadow: "inset -1px 0 0 #e5e7eb" };
  const tableMinWidth = FIRST_COL_W + LVL_COL_W + Math.max(1, selectedEmps.length) * CAND_COL_W;

  return (
    <Page
      title="Развитие — Эталон ролей"
      subtitle="Сравнение сотрудников с эталоном роли. Фильтры работают, таблица скроллится, радар листается ◀ ▶."
      actions={<Button variant="outline" onClick={() => navigate("/development/manual")}>Ручной профиль</Button>}
    >
      {/* ФИЛЬТРЫ */}
      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr] gap-3">
          <NativeSelect
            label="Целевая роль (эталон)"
            value={targetRoleName}
            onChange={setTargetRoleName}
            options={targetOptions}
          />
          <MultiSelect
            label="Кого ищем (исходная роль)"
            options={sourceRoleOptions}
            value={sourceRoles}
            onChange={setSourceRoles}
          />
          <div>
            <div className="text-sm mb-1">Поиск по сотрудникам</div>
            <Input placeholder="Имя, отдел, регион…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
      </Card>

      {/* ТАБЛИЦА + РАДАР */}
      <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_420px] gap-4">
        {/* таблица */}
        <Card className="overflow-x-auto" key={`table-${targetRoleName}`}>
          <div style={{ minWidth: `${tableMinWidth}px` }}>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th
                    className="text-left p-3 sticky left-0 z-10 bg-slate-50"
                    style={{ width: FIRST_COL_W, ...stickyShadow }}
                  >
                    Профиль эталон
                  </th>
                  <th
                    className="text-left p-3 sticky z-10 bg-slate-50"
                    style={{ width: LVL_COL_W, left: FIRST_COL_W, ...stickyShadow }}
                  >
                    Уровень
                  </th>

                  {selectedEmps.map((e) => (
                    <th key={e.id} className="text-left p-3 align-top" style={{ width: CAND_COL_W }}>
                      <div className="flex items-start justify-between gap-2">
                        <button
                          className={`font-medium hover:underline text-left ${focusId === e.id ? "text-indigo-600" : ""}`}
                          onClick={() => setFocusId(e.id)}
                          title="Показать на радаре"
                        >
                          {e.name}
                        </button>
                        <StarToggle active={has(e.id)} onClick={() => toggle(e.id)} title="Переключить резерв" />
                      </div>
                      <div className="text-[11px] text-slate-500">{e.region || "—"}</div>
                      <div className="text-[11px] text-slate-500">
                        Стаж в роли: {e.tenureMonths ? `${e.tenureMonths} мес.` : "—"}
                      </div>
                      <div className="mt-1">
                        <Button variant="ghost" onClick={() => toggleSelected(e.id)}>
                          {selectedIds.includes(e.id) ? "убрать из сравнения" : "в сравнение"}
                        </Button>
                      </div>
                    </th>
                  ))}

                  {selectedEmps.length === 0 && (
                    <th className="text-left p-3 text-slate-400" style={{ width: CAND_COL_W }}>
                      Добавьте кандидатов ниже
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {keysOf(targetCompetencies).map((c, idx) => {
                  const stickyBgClass = idx % 2 ? "bg-slate-50" : "bg-white";
                  return (
                    <tr key={c} className={idx % 2 ? "bg-slate-50/50" : ""}>
                      <td
                        className={`p-3 sticky left-0 ${stickyBgClass}`}
                        style={{ width: FIRST_COL_W, ...stickyShadow }}
                      >
                        {c}
                      </td>
                      <td
                        className={`p-3 sticky ${stickyBgClass}`}
                        style={{ width: LVL_COL_W, left: FIRST_COL_W, ...stickyShadow }}
                      >
                        <Chip tone="indigo">{targetCompetencies[c] ?? "—"}</Chip>
                      </td>

                      {selectedEmps.map((e) => (
                        <td key={e.id} className="p-3" style={{ width: CAND_COL_W }}>
                          {renderCell(e, c)}
                        </td>
                      ))}
                      {selectedEmps.length === 0 && (
                        <td className="p-3 text-slate-300" style={{ width: CAND_COL_W }}>—</td>
                      )}
                    </tr>
                  );
                })}

                <tr className="border-t border-slate-200">
                  <td
                    className="p-3 font-medium sticky left-0 bg-white"
                    style={{ width: FIRST_COL_W, ...stickyShadow }}
                  >
                    Итог (соответствие роли)
                  </td>
                  <td
                    className="p-3 sticky bg-white"
                    style={{ width: LVL_COL_W, left: FIRST_COL_W, ...stickyShadow }}
                  />
                  {selectedEmps.map((e) => {
                    const p = matchPercent(e, baseRole);
                    return (
                      <td key={e.id} className="p-3" style={{ width: CAND_COL_W }}>
                        <div className="font-semibold">{p}%</div>
                        <div className="h-1.5 rounded bg-slate-100 mt-1">
                          <div className="h-1.5 rounded bg-indigo-400" style={{ width: `${p}%` }} />
                        </div>
                      </td>
                    );
                  })}
                  {selectedEmps.length === 0 && (
                    <td className="p-3 text-slate-300" style={{ width: CAND_COL_W }}>—</td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* радар */}
        <Card className="p-4" key={`radar-${targetRoleName}-${focusId || "none"}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium flex items-center gap-3">
              <span>Радар: эталон «{baseRole.name}» vs кандидат</span>
              <span className="flex items-center gap-2 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <i className="inline-block w-3 h-3 rounded-sm" style={{ background: "#6366f1" }} />
                  Эталон
                </span>
                <span className="inline-flex items-center gap-1">
                  <i className="inline-block w-3 h-3 rounded-sm" style={{ background: "#10b981" }} />
                  Кандидат
                </span>
              </span>
            </div>
            {canScroll && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => moveFocus(-1)} title="Предыдущий (←)">◀</Button>
                <div className="text-xs text-slate-500">{(focusIndex >= 0 ? focusIndex + 1 : 1)} / {focusList.length}</div>
                <Button variant="ghost" onClick={() => moveFocus(1)} title="Следующий (→)">▶</Button>
              </div>
            )}
          </div>

          {!focusEmp ? (
            <div className="text-sm text-slate-500">Добавьте кандидатов в сравнение или выберите из пула ниже, чтобы увидеть график.</div>
          ) : (
            <RadarCompare
              role={{ name: baseRole.name, competencies: baseRole.competencies }}
              employee={focusEmp}
              subtitle={`Эталон «${baseRole.name}» · ${focusEmp.name}`}
              height={360}
            />
          )}

          {focusEmp && (
            <div className="mt-3 text-xs text-slate-600">
              Кандидат: <b>{focusEmp.name}</b> · Регион: {focusEmp.region || "—"} · Стаж в роли:{" "}
              {focusEmp.tenureMonths ? `${focusEmp.tenureMonths} мес.` : "—"}
            </div>
          )}
        </Card>
      </div>

      {/* карточки пула */}
      <Card className="p-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium">
            Кандидаты из ролей: {sourceRoles.length ? sourceRoles.join(", ") : "Все"} (исключены: равные/выше «{targetRoleName}»)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3">
          {pool.map(({ emp, readiness }) => {
            const selected = selectedIds.includes(emp.id);
            const reserved = has(emp.id);
            return (
              <div
                key={emp.id}
                className={`relative rounded-xl border p-3 transition ${
                  selected ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white"
                }`}
              >
                <div className="absolute right-2 top-2">
                  <StarToggle active={reserved} onClick={() => toggle(emp.id)} />
                </div>

                <div className="font-medium pr-6">{emp.name}</div>
                <div className="text-[11px] text-slate-500">
                  Регион: {emp.region || "—"} · Стаж в роли: {emp.tenureMonths ? `${emp.tenureMonths} мес.` : "—"}
                </div>

                <div className="mt-2 text-sm">
                  Готовность к «{baseRole.name}»: <b>{readiness}%</b>
                </div>

                <div className="mt-2 flex items-center gap-3">
                  <Button variant="ghost" onClick={() => toggleSelected(emp.id)}>
                    {selected ? "убрать из сравнения" : "в сравнение"}
                  </Button>
                  <Button variant="ghost" onClick={() => setFocusId(emp.id)}>
                    на радар
                  </Button>
                </div>
              </div>
            );
          })}
          {pool.length === 0 && <div className="text-slate-500">По фильтру кандидатов нет.</div>}
        </div>

        <div className="mt-3 text-sm text-slate-500">
          в сравнении: {selectedEmps.length} · в резерве: {reserveIds.size} · найдено: {pool.length}
        </div>
      </Card>
    </Page>
  );
}
