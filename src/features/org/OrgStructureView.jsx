// src/features/org/OrgStructureView.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { initialEmployees } from "../../lib/modules";
import { Button, Input, Select } from "../../components/ui";
import OrgTree from "../../components/tree/OrgTree";
import { buildOrgTree } from "../../lib/orgLevels";

// ——— существующие помощники пресетов (оставлены как раньше) ———
const READY_PCT = 70;
const LS_KEY_PRESETS = "novaapp_employee_filter_presets";
const LS_KEY_PINS = "novaapp_employee_filter_pins";

function applyFilters(list, { role = "Все", readiness = "Все", q = "" }) {
  return list
    .filter((e) => role === "Все" || e.title === role)
    .filter((e) => {
      if (readiness === "Все") return true;
      const pct = e.readiness?.percent ?? 0;
      return readiness === "Готовы (≥70%)" ? pct >= READY_PCT : pct < READY_PCT;
    })
    .filter((e) =>
      [e.name, e.title, e.department, e.region].join(" ").toLowerCase().includes((q || "").toLowerCase())
    );
}
function countByPreset(preset) { return applyFilters(initialEmployees, preset).length; }
function loadJSON(key, fallback) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } }
function saveJSON(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

const BUILTIN_PRESETS = [
  { id: "_b_1", name: "Готовые на KAM", role: "KAM", readiness: "Готовы (≥70%)", q: "" },
  { id: "_b_2", name: "Расти → GKAM (Electronics)", role: "GKAM (Electronics)", readiness: "Ещё развиваться", q: "" },
  { id: "_b_3", name: "Все RM", role: "RM", readiness: "Все", q: "" },
];

// Карта треков (как раньше)
const ROLE_PATHS = [
  {
    lane: "Sales FMCG",
    color: "indigo",
    nodes: [
      { role: "RM", label: "RM" },
      { role: "KAM", label: "KAM" },
      { role: "GKAM (Electronics)", label: "GKAM Electronics" },
    ],
  },
  {
    lane: "Enablement",
    color: "emerald",
    nodes: [
      { role: "TM", label: "TM" },
      { role: "Руководитель отдела обучения", label: "Руководитель обучения" },
    ],
  },
];

export default function OrgStructureView() {
  const navigate = useNavigate();

  // таб: карта или дерево
  const [tab, setTab] = useState("tree"); // "tree" | "map"

  // пресеты (как раньше)
  const [presets, setPresets] = useState(() => loadJSON(LS_KEY_PRESETS, []));
  const [pins, setPins] = useState(() => loadJSON(LS_KEY_PINS, []));
  useEffect(() => { saveJSON(LS_KEY_PRESETS, presets); }, [presets]);
  useEffect(() => { saveJSON(LS_KEY_PINS, pins); }, [pins]);

  // форма нового пресета
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("Все");
  const [newReady, setNewReady] = useState("Все");
  const [newQ, setNewQ] = useState("");

  // линзы + поиск для дерева
  const [lens, setLens] = useState("readiness"); // readiness | reserve | managerLoad
  const [query, setQuery] = useState("");

  const allPresets = [...BUILTIN_PRESETS, ...presets];
  const pinnedObjects = useMemo(() => {
    const list = pins
      .map((id) => allPresets.find((p) => p.id === id))
      .filter(Boolean)
      .map((p) => ({ ...p, count: countByPreset(p) }));
    return list.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ru"));
  }, [pins, presets]);

  // Строим дерево из initialEmployees (готово к замене на импорт)
  const tree = useMemo(() => buildOrgTree(initialEmployees, { preferManagerId: true }), []);

  function goEmployees(preset) {
    const params = new URLSearchParams();
    if (preset.role && preset.role !== "Все") params.set("role", preset.role);
    if (preset.readiness && preset.readiness !== "Все") {
      params.set("readiness", preset.readiness === "Готовы (≥70%)" ? "ready" : "grow");
    }
    if (preset.q) params.set("q", preset.q);
    const qs = params.toString();
    navigate(qs ? `/employees?${qs}` : "/employees");
  }

  function addPreset() {
    if (!newName.trim()) return alert("Дай название пресету");
    const p = { id: `p_${Date.now()}`, name: newName.trim(), role: newRole, readiness: newReady, q: newQ };
    setPresets((prev) => [p, ...prev]);
    setNewName(""); setNewRole("Все"); setNewReady("Все"); setNewQ("");
  }
  function removePreset(id) { setPresets((prev) => prev.filter((p) => p.id !== id)); setPins((prev) => prev.filter((x) => x !== id)); }
  function togglePin(id) { setPins((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]); }

  function PresetChip({ p, allowRemove = false }) {
    const cnt = countByPreset(p);
    const pinned = pins.includes(p.id);
    return (
      <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <button className="hover:underline" onClick={() => goEmployees(p)} title={`${p.name} • найдено: ${cnt}`}>{p.name}</button>
        <span className="inline-block rounded bg-slate-100 text-slate-700 px-1">{cnt}</span>
        <button
          className={`ml-1 ${pinned ? "text-amber-600" : "text-slate-500"} hover:underline`}
          title={pinned ? "Открепить" : "Закрепить"}
          onClick={() => togglePin(p.id)}
        >
          {pinned ? "📌" : "📍"}
        </button>
        {allowRemove && (
          <button className="text-rose-600 hover:underline" title="Удалить пресет" onClick={() => removePreset(p.id)}>×</button>
        )}
      </div>
    );
  }

  // ——— UI ———
  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Структура компании</h2>
        <div className="flex items-center gap-2">
          <div className="text-sm text-slate-500">Иерархия и карьерные треки по эталонам ролей</div>
          <Button variant="ghost" onClick={() => navigate("/succession")}>Кадровый резерв</Button>
          <Button variant="ghost" onClick={() => navigate("/employees")}>К сотрудникам</Button>
        </div>
      </div>

      {/* Переключатель режимов */}
      <div className="flex items-center gap-2">
        <button
          className={`px-3 py-1.5 rounded-xl text-sm border ${tab==="tree" ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200"}`}
          onClick={() => setTab("tree")}
        >
          Дерево
        </button>
        <button
          className={`px-3 py-1.5 rounded-xl text-sm border ${tab==="map" ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200"}`}
          onClick={() => setTab("map")}
        >
          Карта треков
        </button>
      </div>

      {/* Пин-борд */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-medium">Закреплённые фильтры</div>
          <div className="text-xs text-slate-500">Сортировка: по числу найденных кандидатов</div>
        </div>
        {pinnedObjects.length === 0 ? (
          <div className="text-sm text-slate-500">Пока пусто — закрепите любой пресет ниже (иконкой 📍)</div>
        ) : (
          <div className="flex flex-wrap gap-2">{pinnedObjects.map((p) => <PresetChip key={p.id} p={p} />)}</div>
        )}
      </div>

      {/* Быстрые фильтры + Создание пресета */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">
        {/* Быстрые */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="font-medium mb-2">Быстрые фильтры</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {BUILTIN_PRESETS.map((p) => <PresetChip key={p.id} p={p} />)}
          </div>
          <div className="border-top border-slate-100 dark:border-slate-800 pt-3">
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Сохранённые пресеты</div>
            {presets.length === 0 ? (
              <div className="text-sm text-slate-500">Пока нет — создайте справа</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => <PresetChip key={p.id} p={p} allowRemove />)}
              </div>
            )}
          </div>
        </div>
        {/* Создание */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="font-medium mb-3">Создать пресет</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-sm mb-1">Название</div>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Напр., «Кандидаты на GKAM»" />
            </div>
            <div>
              <div className="text-sm mb-1">Роль</div>
              <Select value={newRole} onChange={setNewRole} options={["Все", "TM", "RM", "KAM", "GKAM (Electronics)", "Руководитель отдела обучения"]} />
            </div>
            <div>
              <div className="text-sm mb-1">Готовность</div>
              <Select value={newReady} onChange={setNewReady} options={["Все", "Готовы (≥70%)", "Ещё развиваться"]} />
            </div>
            <div>
              <div className="text-sm mb-1">Поиск</div>
              <Input value={newQ} onChange={(e) => setNewQ(e.target.value)} placeholder="Имя, регион, ключевые слова…" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button onClick={addPreset}>Сохранить пресет</Button>
            <Button variant="ghost" onClick={() => goEmployees({ role: newRole, readiness: newReady, q: newQ })}>
              Применить без сохранения
            </Button>
          </div>
        </div>
      </div>

      {/* Контент: дерево или карта */}
      {tab === "tree" ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium">Дерево организации</div>
            <div className="flex items-center gap-2">
              <Select value={lens} onChange={setLens} options={["readiness", "reserve", "managerLoad"]} />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск по имени/роли/отделу…" className="w-64" />
            </div>
          </div>
          <OrgTree
            roots={tree.rootNodes}
            lens={lens}
            query={query}
            onOpenEmployee={(id) => navigate(`/employees/${id}`)}
            onFilter={(preset) => goEmployees(preset)}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="font-medium mb-2">Карта карьерных треков</div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {ROLE_PATHS.map((lane) => (
              <div key={lane.lane} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                <div className="text-sm text-slate-500 mb-2">{lane.lane}</div>
                <div className="grid lg:grid-cols-3 gap-3">
                  {lane.nodes.map((n, i) => (
                    <div key={n.role} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                      <div className="font-medium">{n.label}</div>
                      <div className="mt-2 flex gap-2">
                        <Button variant="ghost" onClick={() => goEmployees({ role: n.role, readiness: "Готовы (≥70%)", q: "" })}>
                          Готовые
                        </Button>
                        <Button variant="ghost" onClick={() => goEmployees({ role: n.role, readiness: "Ещё развиваться", q: "" })}>
                          Прокачать
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
