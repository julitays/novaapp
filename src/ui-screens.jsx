// ui-screens.jsx — экраны novaapp (полная сборка)

import React, { useState } from "react";
import {
  ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip, Legend,
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis,
  LineChart, Line, CartesianGrid,
} from "recharts";

import {
  initialRoles,
  initialEmployees,
  ALL_COMPETENCIES,
  matchPercent,
  toRadarData,
  Button,
  Input,
  Select,
  CandidateCard,
  roleStandards,
  exportJSON,
  parseJSONFile,
} from "./modules";

// ────────────────────────────────────────────────────────────────────────────
// Мелкие помощники UI и аналитики
function computeWeakAreas(employees, roles, topN = 3) {
  const roleByName = Object.fromEntries(roles.map((r) => [r.name, r]));
  const gap = {};
  for (const e of employees) {
    const target = roleByName[e?.readiness?.targetRole] || roles[0];
    for (const c of ALL_COMPETENCIES) {
      const need = target?.competencies?.[c] ?? 0;
      const have = e?.competencies?.[c] ?? 0;
      const diff = Math.max(0, need - have);
      gap[c] = (gap[c] || 0) + diff;
    }
  }
  return Object.entries(gap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([name, value]) => ({ name, value }));
}

const StatCard = ({ title, value, footer, onClick }) => (
  <div
    onClick={onClick}
    className="cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition"
  >
    <div className="text-slate-600 dark:text-slate-300 text-sm">{title}</div>
    <div className="text-3xl font-semibold mt-1 text-slate-900 dark:text-slate-50">{value}</div>
    {footer && <div className="text-slate-500 dark:text-slate-400 text-xs mt-2">{footer}</div>}
  </div>
);

const WeakAreasCard = ({ data }) => {
  const total = data.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <div className="text-slate-600 dark:text-slate-300 text-sm">Слабые зоны (топ-3)</div>
      <div className="mt-3 space-y-3">
        {data.map((row, i) => (
          <div key={row.name}>
            <div className="flex items-center justify-between text-sm">
              <div className="font-medium">{row.name}</div>
              <div className="text-slate-600 dark:text-slate-300">
                {Math.round((row.value / total) * 100)}%
              </div>
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
              <div
                className={`h-2 rounded-full ${
                  i === 0 ? "bg-rose-500" : i === 1 ? "bg-amber-500" : "bg-indigo-500"
                }`}
                style={{ width: `${(row.value / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function RadarTooltip({ active, payload, label }) {
  if (!active || !Array.isArray(payload) || !payload.length) return null;
  const getVal = (key) => {
    const p = payload.find((x) => x.dataKey === key);
    return p && typeof p.value === "number" ? p.value : 0;
  };
  const a = getVal("A");
  const b = getVal("B");
  const diff = b - a;
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 shadow-md text-xs">
      <div className="font-medium mb-1">{label}</div>
      <div className="flex items-center gap-3">
        <div>Эталон: <b>{a}</b>/4</div>
        <div>Сотр.: <b>{b}</b>/4</div>
        <div className={diff >= 0 ? "text-green-600" : "text-red-600"}>Δ {diff >= 0 ? `+${diff}` : diff}</div>
      </div>
    </div>
  );
}

function StatBadge({ label, value, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    indigo: "bg-indigo-100 text-indigo-700",
    green: "bg-green-100 text-green-700",
    rose: "bg-rose-100 text-rose-700",
  };
  return (
    <div className={`rounded-xl px-3 py-2 text-sm ${tones[tone] || tones.slate}`}>
      <div className="text-xs opacity-80">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-green-100 text-green-700",
    rose: "bg-rose-100 text-rose-700",
    gray:  "bg-gray-100 text-gray-700",
    indigo:"bg-indigo-100 text-indigo-700",
  };
  return <span className={`inline-block text-xs px-2 py-0.5 rounded ${tones[tone] || tones.slate}`}>{children}</span>;
}

function FeedbackCard({ title, text, tone = "slate" }) {
  const border = {
    slate: "border-slate-200 dark:border-slate-800",
    amber: "border-amber-200 dark:border-amber-600",
    indigo: "border-indigo-200 dark:border-indigo-700",
  }[tone];
  const bg = {
    slate: "bg-white dark:bg-slate-900",
    amber: "bg-amber-50 dark:bg-amber-900/20",
    indigo: "bg-indigo-50 dark:bg-indigo-900/20",
  }[tone];

  return (
    <div className={`rounded-2xl border ${border} ${bg} p-4`}>
      <div className="font-medium mb-2">{title}</div>
      <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{text}</p>
    </div>
  );
}

// Моки отзывов
function mockClientReview(emp) {
  if (emp?.name?.includes("Иван")) {
    return "Клиент отмечает стабильную коммуникацию, повышение скорости реакции на запросы. Предложены 2 инициативы по мерч-выкладке, эффект — +3% к полке.";
  }
  if (emp?.name?.includes("Анна")) {
    return "Позитивная динамика: аккуратное ведение операционки, но просит больше инициативности в планировании промо-активностей.";
  }
  return "Сильные переговоры с сетями, чёткая фиксация договорённостей. Рекомендуют расширить аналитику по категориям.";
}
function mockManagerFeedback(emp) {
  if (emp?.name?.includes("Иван")) {
    return "Хороший прогресс за квартал. Усилить стратегический блок (горизонт 2–3 квартала) и практику кейсов по аналитике.";
  }
  if (emp?.name?.includes("Анна")) {
    return "Хорошая дисциплина. Сфокусироваться на переговорах и работе с возражениями. Рекомендую внутреннее наставничество на 1 спринт.";
  }
  return "Готов брать расширенную ответственность. Предложить GKAM при сохранении текущих показателей.";
}

// ────────────────────────────────────────────────────────────────────────────
// 1) Структура компании
export function OrgStructureView({ go }) {
  const [open, setOpen] = useState({ gkam: true, lnd: true });

  function Node({ label, color = "slate", badge, children, onClick }) {
    const colorMap = {
      green: "bg-green-100 text-green-700",
      red: "bg-red-100 text-red-700",
      amber: "bg-amber-100 text-amber-700",
      slate: "bg-slate-100 text-slate-700",
    };
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="font-medium">{label}</div>
          {badge && <span className={`text-xs px-2 py-0.5 rounded-full ${colorMap[color]}`}>{badge}</span>}
        </div>
        {children && <div className="mt-3 space-y-2">{children}</div>}
        {onClick && (
          <div className="mt-3 flex justify-end">
            <Button variant="ghost" onClick={onClick}>Открыть кандидатов</Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Структура компании</h2>
        <div className="flex items-center gap-2">
          <div className="text-sm text-slate-500">
            Иерархия: CEO → GKAM → KAM → RM / CEO → Руководитель обучения
          </div>
          <Button variant="ghost" onClick={() => go("employees")}>Перейти к сотрудникам</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Node label="CEO" badge="1" color="slate">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* GKAM FMCG */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">GKAM FMCG</div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Резерв: 2</span>
                </div>
                {open.gkam && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-sm">
                    <div className="mb-1">Кандидаты:</div>
                    <ul className="list-disc list-inside">
                      <li onClick={() => go({ view: "employee", payload: initialEmployees[2] })} className="hover:underline cursor-pointer">
                        Дмитрий Кузнецов — 88%
                      </li>
                      <li className="text-slate-400">+ ещё 1</li>
                    </ul>
                  </div>
                )}
                <Button variant="ghost" onClick={() => setOpen((s) => ({ ...s, gkam: !s.gkam }))}>
                  {open.gkam ? "Скрыть" : "Показать"} GKAM FMCG
                </Button>
              </div>

              {/* GKAM Electronics */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">GKAM Electronics</div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Нет резерва</span>
                </div>
                {open.gkam && (
                  <div className="rounded-xl border border-rose-200 dark:border-rose-700 p-3 text-sm bg-rose-50 dark:bg-rose-900/30">
                    <div className="mb-1">⚠ Срочно ищем таланты на GKAM Electronics</div>
                    <Button onClick={() => go("roles")}>Перейти к эталонам</Button>
                  </div>
                )}
              </div>

              {/* Руководитель обучения */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Руководитель отдела обучения</div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Резерв: 3</span>
                </div>
                {open.lnd && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-sm">
                    <ul className="list-disc list-inside">
                      <li className="hover:underline cursor-pointer">Мария Волконская — 92%</li>
                      <li className="text-slate-400">+ ещё 2</li>
                    </ul>
                  </div>
                )}
                <Button variant="ghost" onClick={() => setOpen((s) => ({ ...s, lnd: !s.lnd }))}>
                  {open.lnd ? "Скрыть" : "Показать"} обучение
                </Button>
              </div>
            </div>
          </Node>
        </div>

        <div className="space-y-4">
          <Node label="KAM → RM" badge="цепочка" color="amber">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                <div className="font-medium mb-2">KAM</div>
                <ul className="text-sm list-disc list-inside">
                  <li className="hover:underline cursor-pointer">Сергей Брагин</li>
                  <li onClick={() => go({ view: "employee", payload: initialEmployees[2] })} className="hover:underline cursor-pointer">
                    Дмитрий Кузнецов
                  </li>
                </ul>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                <div className="font-medium mb-2">RM</div>
                <ul className="text-sm list-disc list-inside">
                  <li onClick={() => go({ view: "employee", payload: initialEmployees[0] })} className="hover:underline cursor-pointer">
                    Иван Иванов
                  </li>
                  <li onClick={() => go({ view: "employee", payload: initialEmployees[1] })} className="hover:underline cursor-pointer">
                    Анна Петрова
                  </li>
                </ul>
              </div>
            </div>
          </Node>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 2) Эталон ролей (список) + Создание с AI + Импорт/Экспорт + Деталка
export function RolesHubView({ go, roles = initialRoles }) {
  const [standards, setStandards] = useState(() => {
    const base = Array.isArray(roles) && roles.length
      ? roles.map(r => ({
          ...roleStandards[0],
          id: `tmp_${r.name}_${r.version}`.replace(/\s+/g,"_"),
          name: r.name, version: r.version || "v1.0", competencyMap: r.competencies || {},
          division: r.name.includes("GKAM") ? "Sales / Electronics" : "Sales / FMCG",
          kpi: { current: [{ name: r.kpi || "Рост продаж" }], recommended: roleStandards[0].kpi.recommended },
          createdAt: r.created || new Date().toISOString().slice(0,10),
          updatedAt: r.created || new Date().toISOString().slice(0,10),
          status: "active",
        }))
      : roleStandards;
    const key = (x) => `${x.name}__${x.version}`;
    const map = new Map(base.map(x => [key(x), x]));
    return Array.from(map.values());
  });
  const [mode, setMode] = useState("list"); // 'list' | 'create'

  function onImport(file) {
    parseJSONFile(
      file,
      (data) => {
        const standard = {
          id: data.id || `std_${data.name}_${data.version}`.replace(/\s+/g,"_").toLowerCase(),
          status: data.status || "active",
          division: data.division || "—",
          goal: data.goal || "",
          responsibilities: data.responsibilities || [],
          kpi: data.kpi || { current: [], recommended: [] },
          competencyMap: data.competencyMap || {},
          assessmentGuidelines: data.assessmentGuidelines || {},
          testAssignment: data.testAssignment || {},
          assessmentCenter: data.assessmentCenter || {},
          tags: data.tags || [],
          meta: data.meta || {},
          name: data.name, version: data.version,
          createdAt: data.createdAt || new Date().toISOString().slice(0,10),
          updatedAt: new Date().toISOString().slice(0,10),
        };
        setStandards(prev => {
          const k = (x) => `${x.name}__${x.version}`;
          const map = new Map(prev.map(x => [k(x), x]));
          map.set(k(standard), standard);
          return Array.from(map.values());
        });
        alert(`Импортирован эталон: ${standard.name} (${standard.version})`);
      },
      (err) => alert("Ошибка импорта: " + err.message)
    );
  }

  function exportOne(std) {
    exportJSON(std, `${std.name.replace(/\s+/g,"_")}_${std.version}.json`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Эталон ролей</h2>
        <div className="flex items-center gap-2">
          <label className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer text-sm">
            Импорт JSON
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])}
            />
          </label>
          <Button onClick={() => setMode("create")}>Создать с помощью AI</Button>
          {mode === "create" && (
            <Button variant="ghost" onClick={() => setMode("list")}>Назад к списку</Button>
          )}
        </div>
      </div>

      {mode === "list" && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="text-left p-3">Роль</th>
                <th className="text-left p-3">Подразделение</th>
                <th className="text-left p-3">Статус</th>
                <th className="text-left p-3">Версия</th>
                <th className="text-left p-3">Компетенций</th>
                <th className="text-left p-3">KPI (текущие)</th>
                <th className="text-left p-3 w-[140px]">Действия</th>
              </tr>
            </thead>
            <tbody>
              {standards.map((std) => (
                <tr
                  key={std.id}
                  className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <td className="p-3">
                    <button className="hover:underline" onClick={() => go({ view: "role", payload: std })}>
                      {std.name}
                    </button>
                  </td>
                  <td className="p-3">{std.division || "—"}</td>
                  <td className="p-3">
                    <Badge tone={std.status === "active" ? "green" : std.status === "draft" ? "slate" : "gray"}>
                      {std.status}
                    </Badge>
                  </td>
                  <td className="p-3">{std.version}</td>
                  <td className="p-3">{Object.keys(std.competencyMap || {}).length}</td>
                  <td className="p-3">
                    {(std.kpi?.current || []).slice(0,2).map(k => k.name).join(", ") || "—"}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" onClick={() => go({ view: "role", payload: std })}>Открыть</Button>
                      <Button variant="ghost" onClick={() => exportOne(std)}>Экспорт</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {standards.length === 0 && (
                <tr><td className="p-3 text-slate-500" colSpan={7}>Пока пусто — импортируй JSON или создай с помощью AI</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {mode === "create" && (
        <CreateRoleAIViewEmbedded
          onSave={(std) => {
            // std — должен быть в каноническом формате
            const k = (x) => `${x.name}__${x.version}`;
            setStandards(prev => {
              const map = new Map(prev.map(x => [k(x), x]));
              map.set(k(std), std);
              return Array.from(map.values());
            });
            setMode("list");
            go({ view: "role", payload: std });
          }}
        />
      )}
    </div>
  );
}

// Детальный экран эталона роли
// ────────────────────────────────────────────────────────────────────────────
// Карточка эталона роли — единая страница без вкладок
export function RoleDetailsView({ role, go }) {
  // якоря секций для мини-навигации справа
  const sections = [
    { id: "goal", label: "Цель роли" },
    { id: "resp", label: "Функции и задачи" },
    { id: "kpi", label: "KPI" },
    { id: "comp", label: "Карта компетенций" },
    { id: "assess", label: "Оценочные рекомендации" },
    { id: "test", label: "Тестовое задание" },
    { id: "ac", label: "Ассессмент-центр" },
  ];

  return (
    <div className="space-y-6">
      {/* Шапка */}
      <div className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-slate-900/70 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-2xl font-semibold truncate">{role.name}</div>
            <div className="text-slate-500 dark:text-slate-400 text-sm">
              Подразделение: <b>{role.division || "—"}</b> · Версия: <b>{role.version}</b> ·{" "}
              Статус:{" "}
              <Badge tone={role.status === "active" ? "green" : role.status === "draft" ? "slate" : "gray"}>
                {role.status || "—"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              onClick={() =>
                exportJSON(role, `${role.name.replace(/\s+/g, "_")}_${role.version}.json`)
              }
            >
              Экспорт JSON
            </Button>
            <Button variant="ghost" onClick={() => go("roles")}>К списку</Button>
          </div>
        </div>
      </div>

      {/* Контент с правой колонкой-навигацией */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* левая колонка — всё содержимое карточки */}
        <div className="space-y-6">
          {/* Цель роли */}
          <section id="goal" className="scroll-mt-20 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="text-sm text-slate-500 mb-1">Цель роли</div>
            <p className="text-slate-900 dark:text-slate-100 leading-relaxed">
              {role.goal || "—"}
            </p>
            {!!(role.tags && role.tags.length) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {role.tags.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
            )}
          </section>

          {/* Функции и задачи */}
          <section id="resp" className="scroll-mt-20 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="text-base font-medium mb-3">Основные функции и задачи</div>
            {Array.isArray(role.responsibilities) && role.responsibilities.length > 0 ? (
              <ul className="text-sm list-disc list-inside space-y-1">
                {role.responsibilities.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-slate-500">—</div>
            )}
          </section>

          {/* KPI (две таблицы рядом) */}
          <section id="kpi" className="scroll-mt-20 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <KPITable title="Текущие KPI" data={role.kpi?.current || []} />
            <KPITable title="Рекомендуемые KPI" data={role.kpi?.recommended || []} />
          </section>

          {/* Карта компетенций */}
          <section id="comp" className="scroll-mt-20 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="text-base font-medium mb-3">Карта компетенций (уровни 1–4)</div>
            <CompetencyMatrix competencyMap={role.competencyMap || {}} />
            <div className="text-xs text-slate-500 mt-2">
              Уровень в колонке «Эталон» — требуемый для роли. Колонки 1–4 — поведенческие индикаторы по уровням (заполняются методологом).
            </div>
          </section>

          {/* Рекомендации по оценке */}
          <section id="assess" className="scroll-mt-20 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="text-base font-medium mb-3">Рекомендации по оценке</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-slate-500 mb-1">Шкалы</div>
                <div className="text-sm">{role.assessmentGuidelines?.scales || "—"}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-slate-500 mb-1">Примеры подтверждений (evidence)</div>
                {Array.isArray(role.assessmentGuidelines?.evidenceExamples) &&
                role.assessmentGuidelines.evidenceExamples.length ? (
                  <ul className="text-sm list-disc list-inside">
                    {role.assessmentGuidelines.evidenceExamples.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-slate-500">—</div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm text-slate-500 mb-1">Поведенческие индикаторы</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(role.assessmentGuidelines?.behavioralAnchors || {}).map(
                  ([comp, list]) => (
                    <div key={comp} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                      <div className="font-medium mb-1">{comp}</div>
                      <ul className="text-sm list-disc list-inside">
                        {(list || []).map((x, i) => (
                          <li key={i}>{x}</li>
                        ))}
                      </ul>
                    </div>
                  )
                )}
                {Object.keys(role.assessmentGuidelines?.behavioralAnchors || {}).length === 0 && (
                  <div className="text-sm text-slate-500">—</div>
                )}
              </div>
            </div>
          </section>

          {/* Тестовое задание */}
          <section id="test" className="scroll-mt-20 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="text-base font-medium mb-3">Тестовое задание</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-500 mb-1">Цель</div>
                <div>{role.testAssignment?.objective || "—"}</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">Таймбокс (часы)</div>
                <div>{role.testAssignment?.timeboxHours ?? "—"}</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">Ожидаемые артефакты</div>
                {Array.isArray(role.testAssignment?.deliverables) &&
                role.testAssignment.deliverables.length ? (
                  <ul className="list-disc list-inside">{role.testAssignment.deliverables.map((d, i) => <li key={i}>{d}</li>)}</ul>
                ) : (
                  <div>—</div>
                )}
              </div>
              <div>
                <div className="text-slate-500 mb-1">Критерии оценки</div>
                {Array.isArray(role.testAssignment?.evaluationCriteria) &&
                role.testAssignment.evaluationCriteria.length ? (
                  <ul className="list-disc list-inside">{role.testAssignment.evaluationCriteria.map((d, i) => <li key={i}>{d}</li>)}</ul>
                ) : (
                  <div>—</div>
                )}
              </div>
            </div>
          </section>

          {/* Ассессмент-центр */}
          <section id="ac" className="scroll-mt-20 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="text-base font-medium mb-3">Ассессмент-центр</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="md:col-span-2">
                <div className="text-slate-500 mb-1">Кейсы</div>
                {Array.isArray(role.assessmentCenter?.cases) && role.assessmentCenter.cases.length ? (
                  <ul className="list-disc list-inside space-y-1">
                    {role.assessmentCenter.cases.map((c, i) => (
                      <li key={i}>
                        <b>{c.title}</b> — {c.durationMin} мин; Наблюдатели:{" "}
                        {(c.observersRoles || []).join(", ") || "—"}; Компетенции:{" "}
                        {(c.competenciesObserved || []).join(", ") || "—"}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div>—</div>
                )}
              </div>
              <div>
                <div className="text-slate-500 mb-1">Рубрики</div>
                <div>{role.assessmentCenter?.rubrics || "—"}</div>
              </div>
            </div>
          </section>
        </div>

        {/* правая колонка — мини-навигация по секциям (якоря) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <div className="text-sm font-medium mb-2">Навигация по карточке</div>
            <div className="space-y-1">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {s.label}
                </a>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500">Обновлено:</div>
              <div className="text-sm">{role.updatedAt || "—"}</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}


function KPITable({ title, data, tone="slate" }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <div className="font-medium mb-2">{title}</div>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            <th className="text-left p-3">Метрика</th>
            <th className="text-left p-3">Цель</th>
            <th className="text-left p-3">Период</th>
          </tr>
        </thead>
        <tbody>
          {(data || []).map((k, i) => (
            <tr key={i} className="border-t border-slate-100 dark:border-slate-700">
              <td className="p-3">{k.name || "—"}</td>
              <td className="p-3">{k.target || "—"}</td>
              <td className="p-3">{k.period || "—"}</td>
            </tr>
          ))}
          {(data || []).length === 0 && (
            <tr><td className="p-3 text-slate-500" colSpan={3}>—</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function CompetencyMatrix({ competencyMap }) {
  const rows = Object.entries(competencyMap || {});
  return (
    <div className="overflow-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            <th className="text-left p-3 w-[40%]">Компетенция</th>
            <th className="text-left p-3">Уровень (эталон)</th>
            <th className="text-left p-3">1</th>
            <th className="text-left p-3">2</th>
            <th className="text-left p-3">3</th>
            <th className="text-left p-3">4</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, lvl]) => (
            <tr key={name} className="border-t border-slate-100 dark:border-slate-700">
              <td className="p-3">{name}</td>
              <td className="p-3">
                <Badge tone="indigo">{lvl}</Badge>
              </td>
              <td className="p-3">{lvl >= 1 ? "• поведенческие индикаторы (ур.1)" : "—"}</td>
              <td className="p-3">{lvl >= 2 ? "• индикаторы (ур.2)" : "—"}</td>
              <td className="p-3">{lvl >= 3 ? "• индикаторы (ур.3)" : "—"}</td>
              <td className="p-3">{lvl >= 4 ? "• индикаторы (ур.4)" : "—"}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td className="p-3 text-slate-500" colSpan={6}>—</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Встроенный AI-конструктор роли (упрощённый, но сохраняет канонический формат)
function CreateRoleAIViewEmbedded({ onSave }) {
  const [messages, setMessages] = useState([
    { role: "system", text: "Я — AI-методолог. Опиши роль, и я соберу эталон компетенций и KPI." },
  ]);
  const [draftName, setDraftName] = useState("Новая роль");
  const [draft, setDraft] = useState({
    name: "Новая роль",
    version: "v1.0",
    status: "draft",
    division: "—",
    goal: "",
    responsibilities: [],
    kpi: { current: [], recommended: [] },
    competencyMap: Object.fromEntries(ALL_COMPETENCIES.map((c) => [c, 0])),
    assessmentGuidelines: {},
    testAssignment: {},
    assessmentCenter: {},
    tags: [],
    meta: {},
  });

  function send(msg) {
    if (!msg.trim()) return;
    // Демогенерация (подставляем разумные значения)
    const auto = {
      ...draft,
      name: draftName || "Новая роль",
      version: "v1.0",
      status: "draft",
      goal: "Достичь бизнес-целей подразделения, масштабировать продажи и клиентский успех.",
      responsibilities: [
        "Планирование и защита JBP",
        "Управление промо и листингом",
        "Синхронизация маркетинга и логистики",
      ],
      kpi: {
        current: [
          { name: "Рост sell-out", target: "+8% QoQ", period: "квартал" },
          { name: "Доля полки в ТОП-5 сетях", target: "≥95%", period: "месяц" },
        ],
        recommended: [
          { name: "Маржинальность категории", target: "≥Х%", period: "квартал" },
          { name: "NPS сетей", target: "+10", period: "полугодие" },
        ],
      },
      competencyMap: {
        "Стратегическое мышление": 3,
        "Переговоры": 4,
        "Аналитика": 3,
        "Коммуникация": 4,
        "Лидерство": 3,
        "Финансовое мышление": 3,
        "Тайм-менеджмент": 3,
        "Проектное управление": 3,
      },
      assessmentGuidelines: {
        scales: "Шкала 1–4 с поведенческими индикаторами на каждый уровень.",
        behavioralAnchors: {
          "Переговоры": [
            "Готовит позицию/BATNA; фиксирует договорённости письменно",
            "Управляет повесткой и рамками встречи",
          ],
          "Стратегическое мышление": [
            "Формулирует гипотезы роста, просчитывает сценарии/риски",
          ],
        },
        evidenceExamples: ["Снижение OOS на 30%", "JBP с X5 на Q3"],
      },
      testAssignment: {
        objective: "Собрать JBP на 6 месяцев для сети Y",
        deliverables: ["Презентация 10 слайдов", "Мини-модель P&L"],
        evaluationCriteria: ["Логика гипотез", "Финансовая обоснованность", "План рисков"],
        timeboxHours: 8,
      },
      assessmentCenter: {
        cases: [
          {
            title: "Эскалация с категорией",
            durationMin: 30,
            observersRoles: ["HRBP", "Sales Director"],
            competenciesObserved: ["Коммуникация", "Переговоры", "Лидерство"],
          },
        ],
        rubrics: "Матрица Компетенции × Поведенческие индикаторы",
      },
      createdAt: new Date().toISOString().slice(0,10),
      updatedAt: new Date().toISOString().slice(0,10),
    };
    setDraft(auto);
    setMessages((m) => [
      ...m,
      { role: "user", text: msg },
      { role: "assistant", text: `Сформировал эталон для «${auto.name}». Версия: ${auto.version}.` },
    ]);
  }

  function saveToRegistry() {
    const std = { ...draft, name: draftName || draft.name };
    onSave?.(std);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Чат с AI */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="font-medium">Создание эталона — Chat AI</div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">Embedded</span>
        </div>

        <div className="flex-1 overflow-auto space-y-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                m.role === "user"
                  ? "bg-indigo-50 ml-auto"
                  : "bg-slate-50 dark:bg-slate-800/60"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Input
            placeholder="Опиши роль, акценты, KPI… (Enter — отправить)"
            onKeyDown={(e) => {
              if (e.key === "Enter") send(e.currentTarget.value);
            }}
          />
          <Button onClick={() => send("Создай роль KAM с акцентом на переговоры и аналитику")}>
            Отправить
          </Button>
        </div>
      </div>

      {/* Предпросмотр эталона */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-medium">Предпросмотр эталона</div>
          <div className="flex gap-2">
            <Input value={draftName} onChange={(e) => setDraftName(e.target.value)} className="w-48" />
            <Button variant="ghost" onClick={() => setDraft({ ...draft, name: draftName })}>
              Применить имя
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="text-sm mb-1">Версия</div>
            <Input value={draft.version} onChange={(e) => setDraft({ ...draft, version: e.target.value })} />
          </div>
          <div>
            <div className="text-sm mb-1">Подразделение</div>
            <Input value={draft.division} onChange={(e) => setDraft({ ...draft, division: e.target.value })} />
          </div>
          <div className="lg:col-span-2">
            <div className="text-sm mb-1">Цель</div>
            <Input value={draft.goal} onChange={(e) => setDraft({ ...draft, goal: e.target.value })} />
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="text-left p-3">Компетенция</th>
                <th className="text-left p-3">Уровень (0–4)</th>
              </tr>
            </thead>
            <tbody>
              {ALL_COMPETENCIES.map((c) => (
                <tr key={c} className="border-t border-slate-100 dark:border-slate-700">
                  <td className="p-3">{c}</td>
                  <td className="p-3">
                    <input
                      type="range"
                      min={0}
                      max={4}
                      value={draft.competencyMap[c] ?? 0}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          competencyMap: { ...draft.competencyMap, [c]: +e.target.value },
                        })
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex gap-2">
          <Button onClick={saveToRegistry}>Сохранить в реестр</Button>
          <Button variant="ghost" onClick={() => alert("Ручное редактирование (демо)")}>
            Редактировать вручную
          </Button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 3) Развитие — радар + динамика
export function DevelopmentView({ roles }) {
  const [empId, setEmpId] = useState(initialEmployees[0].id);
  const [roleName, setRoleName] = useState(roles[0].name);

  const emp = initialEmployees.find((e) => e.id === +empId || e.id === empId) || initialEmployees[0];
  const role = roles.find((r) => r.name === roleName) || roles[0];
  const percent = matchPercent(emp, role);
  const data = toRadarData(role.competencies, emp.competencies);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Развитие</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-sm">Сотрудник</label>
          <select
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-white text-slate-900 dark:text-slate-900 px-3 py-2 text-sm"
            value={empId}
            onChange={(e) => setEmpId(e.target.value)}
          >
            {initialEmployees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} — {e.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm">Роль</label>
          <Select value={roleName} onChange={setRoleName} options={roles.map((r) => r.name)} />
        </div>
        <StatCard title="Соответствие" value={`${percent}%`} />
      </div>

      <div className="w-full h-80 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
        <ResponsiveContainer>
          <RadarChart data={data} outerRadius={120} margin={{ right: 140 }}>
            <PolarGrid />
            <PolarAngleAxis dataKey="competency" tick={{ fontSize: 12, fill: "currentColor" }} />
            <PolarRadiusAxis angle={30} domain={[0, 4]} tick={{ fontSize: 11, fill: "currentColor" }} />
            <Radar name="Эталон" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
            <Radar name="Сотр." dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
            <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: 16, color: "currentColor" }} />
            <Tooltip content={<RadarTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <div className="font-medium mb-2">Динамика готовности</div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={emp.assessments ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="percent" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 4) Управление кадровым резервом
export function SuccessionView() {
  const data = [
    { role: "GKAM Electronics", reserve: 0 },
    { role: "KAM", reserve: 2 },
    { role: "RM", reserve: 3 },
  ];
  const readyData = [
    { name: "Готовы (≥70%)", value: initialEmployees.filter(e => (e.readiness?.percent || 0) >= 70).length },
    { name: "Ещё развиваться", value: initialEmployees.filter(e => (e.readiness?.percent || 0) < 70).length },
  ];
  const weakAreasData = computeWeakAreas(initialEmployees, initialRoles, 3);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Управление кадровым резервом</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Барчарт по резерву */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="font-medium mb-2">Резерв по ключевым ролям</div>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={data}>
                <XAxis dataKey="role" tick={{ fill: "currentColor" }} />
                <YAxis allowDecimals={false} tick={{ fill: "currentColor" }} />
                <Tooltip />
                <Bar dataKey="reserve" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Пирог готовности */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="font-medium mb-2">Готовность к переходу</div>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={readyData} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                  <Cell fill="#10b981" />
                  <Cell fill="#e11d48" />
                </Pie>
                <Legend wrapperStyle={{ color: "currentColor" }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Слабые зоны */}
        <WeakAreasCard data={weakAreasData} />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 5) DEMO
export function DemoView() {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">DEMO</h2>
      <p className="text-slate-600 dark:text-slate-300">
        Песочница для демонстрации сценариев, заглушки интеграций и A/B вариантов UI.
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 6) Настройки
export function SettingsView() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Настройки</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div className="text-sm mb-1">Бренд</div>
          <Input defaultValue="novaapp" />
        </div>
        <div>
          <div className="text-sm mb-1">Тема</div>
          <Select options={["Светлая", "Тёмная", "Системная"]} value="Системная" onChange={() => {}} />
        </div>
      </div>
      <Button variant="ghost" onClick={() => alert("Сохранено (демо)")}>Сохранить</Button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 7) Сотрудники — список карточек (переход только из «Структуры»)
export function EmployeesListView({ go }) {
  const [q, setQ] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("Все");

  const list = initialEmployees
    .filter((e) => roleFilter === "Все" || e.title === roleFilter)
    .filter((e) =>
      [e.name, e.title, e.department, e.region].join(" ").toLowerCase().includes(q.toLowerCase())
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Сотрудники</h2>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Поиск: имя/роль/регион…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-64"
          />
          <Select
            value={roleFilter}
            onChange={setRoleFilter}
            options={["Все", "TM", "RM", "KAM", "Руководитель отдела обучения"]}
          />
          <Button variant="ghost" onClick={() => alert("Экспорт CSV (демо)")}>Экспорт CSV</Button>
          <Button onClick={() => alert("Добавление сотрудника (демо)")}>Добавить сотрудника</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((e) => (
          <CandidateCard key={e.id} emp={e} onOpen={() => go({ view: "employee", payload: e })} />
        ))}
        {list.length === 0 && <div className="text-slate-500">Пусто по заданным условиям</div>}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 8) Профиль сотрудника (ВСЕГДА по текущей роли) + PDF/CSV
export function EmployeeProfileView({ emp }) {
  const byName = Object.fromEntries(initialRoles.map(r => [r.name, r]));
  const currentRole = byName[emp?.title] || initialRoles[0];

  const readinessCurrent = matchPercent(emp, currentRole);
  const assessments = emp?.assessments ?? [];
  const last = assessments[assessments.length - 1];
  const prev = assessments[assessments.length - 2];
  const delta = last && prev ? last.percent - prev.percent : 0;
  const passedAssessment = assessments.length > 0;

  const radarData = toRadarData(currentRole.competencies, emp.competencies);
  const bio =
    emp?.bio ||
    "Краткая биография: 5 лет в FMCG, сфера — федеральные сети и региональные дистрибьюторы. Сильные стороны: коммуникация, дисциплина, операционная точность.";

  const [openClient, setOpenClient] = React.useState(true);
  const [openManager, setOpenManager] = React.useState(true);

  const rows = Object.keys(currentRole.competencies || {}).map((k) => {
    const need = currentRole.competencies[k] ?? 0;
    const have = emp.competencies?.[k] ?? 0;
    return {
      competency: k,
      standardHint: standardHints[k] || "—",
      have,
      need,
      indicator: have >= need ? "+ дорос" : "− не дорос",
    };
  });

  // Экспорт CSV
  function exportCompetenciesCSV() {
    const header = ["Компетенция","Описание эталона","Цифра сотрудника","Цифра эталона","Индикатор"];
    const lines = [header]
      .concat(rows.map(r => [
        r.competency,
        r.standardHint,
        String(r.have),
        String(r.need),
        r.indicator
      ]));
    const csv = lines.map(line =>
      line.map(cell => {
        const s = String(cell ?? "");
        if (/[",\n]/.test(s)) return `"${s.replace(/"/g,'""')}"`;
        return s;
      }).join(",")
    ).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${emp.name.replace(/\s+/g,"_")}_competencies.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Печатный ИПР → print (можно сохранить как PDF)
  function generateIPRPDF() {
    const win = window.open("", "_blank", "noopener,noreferrer");
    if (!win) return alert("Поп-ап заблокирован. Разреши всплывающие окна для сайта.");
    const style = `
      <style>
        body{font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color:#0f172a; margin:24px;}
        h1{font-size:20px; margin:0 0 8px;}
        h2{font-size:16px; margin:16px 0 8px;}
        .muted{color:#475569; font-size:12px}
        table{width:100%; border-collapse:collapse; margin-top:8px;}
        th,td{border:1px solid #e2e8f0; padding:8px; font-size:12px; vertical-align:top;}
        th{background:#f1f5f9; text-align:left;}
        .badge{display:inline-block; padding:2px 6px; border-radius:6px; font-size:11px;}
        .green{background:#dcfce7; color:#166534;}
        .rose{background:#ffe4e6; color:#9f1239;}
        .grid{display:grid; grid-template-columns:1fr 1fr; gap:12px;}
        .box{border:1px solid #e2e8f0; border-radius:12px; padding:12px;}
        .mb8{margin-bottom:8px;}
      </style>
    `;
    const tableRows = rows.map(r => `
      <tr>
        <td><b>${r.competency}</b><br><span class="muted">${r.standardHint}</span></td>
        <td>${r.have}</td>
        <td>${r.need}</td>
        <td><span class="badge ${r.indicator.startsWith('+')?'green':'rose'}">${r.indicator}</span></td>
      </tr>
    `).join("");

    win.document.write(`
      <html><head><meta charset="utf-8" />${style}</head><body>
        <h1>ИПР — ${emp.name}</h1>
        <div class="muted">Текущая роль: <b>${emp.title}</b> · Отдел: ${emp.department} · Регион: ${emp.region}</div>

        <div class="grid">
          <div class="box">
            <h2>Итоги оценки</h2>
            <div class="mb8 muted">Соответствие текущей роли: <b>${readinessCurrent}%</b></div>
            <div class="muted">Последняя оценка: <b>${emp.lastAssessment || "—"}</b></div>
            ${assessments.length ? `<div class="muted">Последний %: <b>${assessments[assessments.length-1].percent}%</b></div>` : ""}
            ${assessments.length>1 ? `<div class="muted">Предыдущий %: <b>${assessments[assessments.length-2].percent}%</b></div>` : ""}
            <div class="muted">Динамика: <b>${delta>0?`+${delta}%`: `${delta}%`}</b></div>
          </div>
          <div class="box">
            <h2>Краткая биография</h2>
            <div class="muted">${bio}</div>
          </div>
        </div>

        <h2>Сопоставление по компетенциям (текущая роль)</h2>
        <table>
          <thead>
            <tr>
              <th>Эталон (описание)</th>
              <th>Цифра сотрудника</th>
              <th>Цифра эталона</th>
              <th>Индикатор</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>

        <script>window.onload = () => setTimeout(()=>window.print(), 100);</script>
      </body></html>
    `);
    win.document.close();
  }

  return (
    <div className="space-y-6">
      {/* Шапка + кнопки действий */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <div className="flex flex-col gap-3">
          <div className="text-2xl font-semibold">{emp?.name}</div>
          <div className="text-slate-500 dark:text-slate-400 text-sm">
            Роль: <b>{emp?.title}</b> · Отдел: {emp?.department} · Регион: {emp?.region}
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{bio}</p>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatBadge label="Соответствие текущей роли" value={`${readinessCurrent}%`} tone="green" />
              <StatBadge label="Последняя оценка" value={emp?.lastAssessment || "—"} tone="slate" />
              <StatBadge label="Есть ассессменты" value={passedAssessment ? "Да" : "Нет"} tone={passedAssessment ? "indigo" : "slate"} />
              <StatBadge label="Δ к прошлой оценке" value={delta === 0 ? "0" : (delta > 0 ? `+${delta}` : `${delta}`)} tone={delta >= 0 ? "green" : "rose"} />
            </div>

            {/* Кнопки действий */}
            <div className="flex items-center gap-2">
              <Button onClick={generateIPRPDF}>Сгенерировать ИПР (PDF)</Button>
              <Button variant="ghost" onClick={exportCompetenciesCSV}>Экспорт компетенций (CSV)</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Верхняя строка: слева — радар (текущая роль), справа — панель с оценками */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="font-medium mb-2">Соответствие компетенций текущей роли: {currentRole.name}</div>
          <div className="flex items-center gap-4 text-xs mb-2">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "#6366f1" }}></span>
              Эталон (текущая роль)
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "#10b981" }}></span>
              Сотрудник
            </span>
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer>
              <RadarChart data={radarData} outerRadius={120} margin={{ right: 16, left: 0, top: 8, bottom: 8 }}>
                <PolarGrid />
                <PolarAngleAxis dataKey="competency" tick={{ fontSize: 12, fill: "currentColor" }} />
                <PolarRadiusAxis angle={30} domain={[0, 4]} tick={{ fontSize: 11, fill: "currentColor" }} />
                <Radar name="Эталон" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                <Radar name="Сотр." dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="font-medium mb-2">Оценки и ассессмент</div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="text-slate-600 dark:text-slate-300">Статус ассессмента</div>
              <Badge tone={passedAssessment ? "green" : "slate"}>
                {passedAssessment ? "Проходил(а)" : "Нет данных"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-slate-600 dark:text-slate-300">Последняя дата оценки</div>
              <div className="font-medium">{emp?.lastAssessment || "—"}</div>
            </div>
            {last && (
              <div className="flex items-center justify-between">
                <div className="text-slate-600 dark:text-slate-300">Последний %</div>
                <div className="font-medium">{last.percent}%</div>
              </div>
            )}
            {prev && (
              <div className="flex items-center justify-between">
                <div className="text-slate-600 dark:text-slate-300">Предыдущий %</div>
                <div className="font-medium">{prev.percent}%</div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="text-slate-600 dark:text-slate-300">Динамика к прошлому</div>
              <div className={`font-medium ${delta >= 0 ? "text-green-600" : "text-rose-600"}`}>
                {delta > 0 ? `+${delta}%` : `${delta}%`}
              </div>
            </div>
            <div className="pt-2">
              <Button variant="ghost" onClick={() => alert("Скачать полный отчёт оценки (PDF) — демо")}>
                Скачать отчёт (PDF)
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Отзывы */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FeedbackCard title="Отзыв клиента (бизнес-ревью)" text={mockClientReview(emp)} tone="amber" />
        <FeedbackCard title="Оценка руководителя (по итогам оценки)" text={mockManagerFeedback(emp)} tone="indigo" />
      </div>

      {/* Таблица внизу */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-4 font-medium">Сопоставление по компетенциям (текущая роль)</div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="text-left p-3 w-[40%]">Эталон (описание)</th>
              <th className="text-left p-3 w-[20%]">Цифра сотрудника</th>
              <th className="text-left p-3 w-[20%]">Цифра эталона</th>
              <th className="text-left p-3 w-[20%]">Индикатор</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.competency} className="border-t border-slate-100 dark:border-slate-700">
                <td className="p-3">
                  <div className="font-medium">{r.competency}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-xs mt-1">{r.standardHint}</div>
                </td>
                <td className="p-3">{r.have}</td>
                <td className="p-3">{r.need}</td>
                <td className="p-3">
                  <Badge tone={r.indicator.startsWith("+") ? "green" : "rose"}>
                    {r.indicator}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Button onClick={generateIPRPDF}>Сгенерировать ИПР (PDF)</Button>
          <Button variant="ghost" onClick={exportCompetenciesCSV}>Экспорт компетенций (CSV)</Button>
        </div>
      </div>
    </div>
  );
}

// подсказки по компетенциям
const standardHints = {
  "Стратегическое мышление": "Формулирует цели, просчитывает сценарии и риски, выбирает приоритеты.",
  "Переговоры": "Управляет повесткой, использует BATNA, оформляет договоренности письменно.",
  "Аналитика": "Работает с данными, отчётами, трендами; принимает решения из цифр.",
  "Коммуникация": "Кратко, по делу, адаптация к собеседнику, фиксация решений.",
  "Лидерство": "Делегирует, даёт обратную связь, держит фокус на результате.",
  "Финансовое мышление": "Понимает маржинальность, ROI инициатив, P&L команды.",
  "Тайм-менеджмент": "Планирует, расставляет приоритеты, встречается по повестке.",
  "Проектное управление": "Декомпозиция, контроль рисков и сроков, управление изменениями.",
};
