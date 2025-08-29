// modules.jsx — общие модули проекта (данные, утилиты, UI-примитивы)
// ВНИМАНИЕ: здесь НЕТ экранов. Только переиспользуемые части.

// modules.jsx — данные, утилиты и UI-примитивы (без экранов)

import React from "react";

// ---------------------------------------------------------------------------
// Seed-данные (моки)
// ---------------------------------------------------------------------------
export const ALL_COMPETENCIES = [
  "Стратегическое мышление",
  "Переговоры",
  "Аналитика",
  "Коммуникация",
  "Лидерство",
  "Финансовое мышление",
  "Тайм-менеджмент",
  "Проектное управление",
];

export const initialRoles = [
  {
    id: 1,
    name: "RM",
    version: "v1.0",
    kpi: "Рост продаж 10%",
    createdAt: "2025-08-01",
    competencies: {
      "Стратегическое мышление": 3,
      "Переговоры": 2,
      "Коммуникация": 4,
      "Тайм-менеджмент": 4,
    },
  },
  {
    id: 2,
    name: "KAM",
    version: "v1.0",
    kpi: "Рост продаж 15%",
    createdAt: "2025-08-02",
    competencies: {
      "Стратегическое мышление": 4,
      "Аналитика": 3,
      "Переговоры": 4,
      "Коммуникация": 4,
    },
  },
  {
    id: 3,
    name: "GKAM (Electronics)",
    version: "v1.0",
    kpi: "Доля полки +20%, NPS ключевых сетей +10",
    createdAt: "2025-08-10",
    competencies: {
      "Стратегическое мышление": 4,
      "Аналитика": 4,
      "Переговоры": 4,
      "Лидерство": 4,
    },
  },
];

export const initialEmployees = [
  {
    id: 101,
    name: "Иван Иванов",
    title: "RM",
    department: "FMCG",
    region: "Москва",
    lastAssessment: "2025-07-20",
    readiness: { targetRole: "KAM", percent: 72 },
    competencies: {
      "Стратегическое мышление": 3,
      "Переговоры": 3,
      "Аналитика": 2,
      "Коммуникация": 4,
      "Тайм-менеджмент": 4,
    },
    assessments: [
      { date: "2025-05", percent: 60 },
      { date: "2025-06", percent: 68 },
      { date: "2025-07", percent: 72 },
    ],
  },
  {
    id: 102,
    name: "Анна Петрова",
    title: "RM",
    department: "FMCG",
    region: "СПб",
    lastAssessment: "2025-07-18",
    readiness: { targetRole: "KAM", percent: 65 },
    competencies: {
      "Стратегическое мышление": 3,
      "Переговоры": 2,
      "Аналитика": 3,
      "Коммуникация": 4,
    },
    assessments: [
      { date: "2025-05", percent: 55 },
      { date: "2025-06", percent: 61 },
      { date: "2025-07", percent: 65 },
    ],
  },
  {
    id: 103,
    name: "Дмитрий Кузнецов",
    title: "KAM",
    department: "Electronics",
    region: "Москва",
    lastAssessment: "2025-07-22",
    readiness: { targetRole: "GKAM (Electronics)", percent: 88 },
    competencies: {
      "Стратегическое мышление": 4,
      "Переговоры": 4,
      "Аналитика": 4,
      "Коммуникация": 4,
      "Лидерство": 3,
    },
    assessments: [
      { date: "2025-05", percent: 78 },
      { date: "2025-06", percent: 84 },
      { date: "2025-07", percent: 88 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Утилиты
// ---------------------------------------------------------------------------
export function roleToMap(role) {
  return { ...(role?.competencies || {}) };
}

export function matchPercent(emp, role) {
  const rmap = roleToMap(role);
  const keys = Object.keys(rmap);
  if (!keys.length) return 0;
  let sum = 0, max = 0;
  for (const k of keys) {
    const need = rmap[k] || 0;
    const have = emp?.competencies?.[k] || 0;
    sum += Math.min(have, need);
    max += need;
  }
  return Math.round((sum / (max || 1)) * 100);
}

export function toRadarData(roleMap, empMap) {
  const keys = new Set([...Object.keys(roleMap || {}), ...Object.keys(empMap || {})]);
  return Array.from(keys).map((k) => ({ competency: k, A: roleMap?.[k] || 0, B: empMap?.[k] || 0 }));
}

// ---------------------------------------------------------------------------
// UI-примитивы
// ---------------------------------------------------------------------------
export const Button = ({ children, onClick, variant = "primary" }) => {
  const base = "px-4 py-2 rounded-xl text-sm font-medium transition";
  const styles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    ghost: "bg-white dark:bg-white border border-slate-200 dark:border-slate-700 text-slate-900 hover:bg-slate-50",
  };
  return (
    <button onClick={onClick} className={`${base} ${styles[variant]}`}>
      {children}
    </button>
  );
};

export const Input = (props) => (
  <input
    {...props}
    className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-white text-slate-900 dark:text-slate-900 placeholder-slate-400 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-300 ${props.className ?? ""}`}
  />
);

export const Select = ({ options = [], value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-300"
  >
    {options.map((o) => (
      <option key={String(o)} value={o}>
        {o}
      </option>
    ))}
  </select>
);

// ---------------------------------------------------------------------------
// Карточка кандидата
// ---------------------------------------------------------------------------
export function CandidateCard({ emp, onOpen }) {
  return (
    <div
      onClick={onOpen}
      className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow hover:shadow-md transition cursor-pointer bg-white dark:bg-slate-800"
    >
      <div className="font-semibold">{emp.name}</div>
      <div className="text-sm text-slate-500 dark:text-slate-400">{emp.title}</div>
      <div className="mt-2">Готовность: {emp.readiness?.percent ?? 0}%</div>
    </div>
  );
}
/**
 * @typedef {{name:string, target?:string, period?:string}} KPIItem
 * @typedef {{
 *  id:string, name:string, version:string, status:"draft"|"active"|"archived",
 *  division:string, goal:string,
 *  responsibilities:string[],
 *  kpi:{ current: KPIItem[], recommended: KPIItem[] },
 *  competencyMap: Record<string, 1|2|3|4>,
 *  assessmentGuidelines?: {
 *    behavioralAnchors?: Record<string, string[]>,
 *    scales?: string,
 *    evidenceExamples?: string[]
 *  },
 *  testAssignment?: {
 *    objective:string, deliverables:string[], evaluationCriteria:string[], timeboxHours?:number
 *  },
 *  assessmentCenter?: {
 *    cases?: { title:string, durationMin:number, observersRoles:string[], competenciesObserved:string[] }[],
 *    rubrics?: string
 *  },
 *  tags?: string[],
 *  meta?: Record<string, any>,
 *  createdAt?: string, updatedAt?: string
 * }} RoleStandard
 */

// Небольшой генератор полноценных эталонов на базе initialRoles (моки)
function makeStandardFromInitial(r) {
  /** @type {RoleStandard} */
  return {
    id: `std_${r.name.replace(/\s+/g,"_").toLowerCase()}_${(r.version||"v1.0").toLowerCase()}`,
    name: r.name,
    version: r.version || "v1.0",
    status: "active",
    division: r.name.includes("GKAM") ? "Sales / Electronics" : "Sales / FMCG",
    goal: r.kpi || "Достичь целей по продажам/полке/NPS для категории.",
    responsibilities: [
      "Вести ключевые сети/регионы, обеспечивать листинг и промо",
      "Готовить и защищать JBP, синхронизировать кросс-функции",
      "Отслеживать P&L, управлять маржой и OOS",
    ],
    kpi: {
      current: [{ name: r.kpi || "Рост продаж", target: "", period: "квартал" }],
      recommended: [
        { name: "Маржинальность категории", target: "↑", period: "квартал" },
        { name: "NPS ключевых сетей", target: "+10", period: "полугодие" },
      ],
    },
    competencyMap: r.competencies || {},
    assessmentGuidelines: {
      behavioralAnchors: {
        "Переговоры": [
          "Готовит позицию/BATNA; фиксирует договорённости письменно",
          "Управляет повесткой и рамками встречи"
        ],
        "Стратегическое мышление": [
          "Формулирует гипотезы роста, просчитывает сценарии/риски",
        ],
      },
      scales: "Шкала 1–4 с поведенческими индикаторами для каждого уровня",
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
    tags: [r.name],
    meta: {},
    createdAt: r.created || new Date().toISOString().slice(0,10),
    updatedAt: r.created || new Date().toISOString().slice(0,10),
  };
}

// Канонический массив эталонов (моки)
export const roleStandards = initialRoles.map(makeStandardFromInitial);

// Утилиты импорта/экспорта JSON
export function exportJSON(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseJSONFile(file, onOk, onErr) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data.name || !data.version || !data.competencyMap) throw new Error("Некорректный формат: нужны name, version, competencyMap");
      onOk?.(data);
    } catch (e) { onErr?.(e); }
  };
  reader.onerror = () => onErr?.(new Error("Не удалось прочитать файл"));
  reader.readAsText(file);
}
