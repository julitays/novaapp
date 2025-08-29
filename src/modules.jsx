// modules.jsx — общие модули проекта (данные, утилиты, UI-примитивы)
// ВНИМАНИЕ: здесь НЕТ экранов. Только переиспользуемые части.

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
      "Тайм-менеджмент": 4,
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
      "Тайм-менеджмент": 4,
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
            {
              date: "2025-05-15",
              percent: 60,
              competencies: {
                "Стратегическое мышление": 2,
                "Переговоры": 2,
                "Аналитика": 3,
                "Коммуникация": 3,
                "Тайм-менеджмент": 4,
              }
            },
            {
              date: "2025-06-20",
              percent: 68,
              competencies: {
                "Стратегическое мышление": 1,
                "Переговоры": 3,
                "Аналитика": 1,
                "Коммуникация": 4,
                "Тайм-менеджмент": 3,
              }
            },
            {
              date: "2025-07-25",
              percent: 72,
              competencies: {
                "Стратегическое мышление": 3,
                "Переговоры": 3,
                "Аналитика": 2,
                "Коммуникация": 4,
                "Тайм-менеджмент": 5,
              }
            }
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
            {
              date: "2025-05-15",
              percent: 60,
              competencies: {
                "Стратегическое мышление": 2,
                "Переговоры": 4,
                "Аналитика": 2,
                "Коммуникация": 2,
                "Тайм-менеджмент": 1,
              }
            },
            {
              date: "2025-06-20",
              percent: 68,
              competencies: {
                "Стратегическое мышление": 3,
                "Переговоры": 3,
                "Аналитика": 5,
                "Коммуникация": 3,
                "Тайм-менеджмент": 1,
              }
            },
            {
              date: "2025-07-25",
              percent: 72,
              competencies: {
                "Стратегическое мышление": 6,
                "Переговоры": 1,
                "Аналитика": 2,
                "Коммуникация": 2,
                "Тайм-менеджмент": 4,
              }
            }
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
        {
          date: "2025-05-15",
          percent: 60,
          competencies: {
            "Стратегическое мышление": 2,
            "Переговоры": 2,
            "Аналитика": 2,
            "Коммуникация": 3,
            "Тайм-менеджмент": 3,
          }
        },
        {
          date: "2025-06-20",
          percent: 68,
          competencies: {
            "Стратегическое мышление": 3,
            "Переговоры": 3,
            "Аналитика": 2,
            "Коммуникация": 4,
            "Тайм-менеджмент": 4,
          }
        },
        {
          date: "2025-07-25",
          percent: 72,
          competencies: {
            "Стратегическое мышление": 3,
            "Переговоры": 3,
            "Аналитика": 2,
            "Коммуникация": 4,
            "Тайм-менеджмент": 4,
          }
        }
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
  const keys = new Set([
    ...Object.keys(roleMap || {}),
    ...Object.keys(empMap || {}),
  ]);
  return Array.from(keys).map((k) => ({
    competency: k,
    A: roleMap?.[k] || 0,
    B: empMap?.[k] || 0,
  }));
}

// ---------------------------------------------------------------------------
// UI-примитивы
// ---------------------------------------------------------------------------
export const Button = ({ children, onClick, variant = "primary" }) => {
  const base = "px-4 py-2 rounded-xl text-sm font-medium transition";
  const styles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    ghost:
      "bg-white dark:bg-white border border-slate-200 dark:border-slate-700 text-slate-900 hover:bg-slate-50",
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
    className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-white text-slate-900 dark:text-slate-900 placeholder-slate-400 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-300 ${
      props.className ?? ""
    }`}
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

export const Chip = ({ children, color = "slate" }) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-${color}-100 text-${color}-700`}
  >
    {children}
  </span>
);

// ---------------------------------------------------------------------------
// Простая карточка кандидата
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
// Расчёт месяцев между датами (грубо, нам хватит для EI)
export function monthsBetween(d1, d2) {
  const a = new Date(d1);
  const b = new Date(d2);
  return Math.max(0.1, (b - a) / (1000 * 60 * 60 * 24 * 30));
}

// Efficiency Index по assessments (использует percent)
export function efficiencyIndex(assessments, monthsHorizon = 12) {
  if (!Array.isArray(assessments) || assessments.length < 2) return 0;
  const arr = [...assessments].sort((a,b)=> new Date(a.date) - new Date(b.date));

  // ограничим по горизонту
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - monthsHorizon);
  const filtered = arr.filter(a => new Date(a.date) >= cutoff);
  const src = filtered.length >= 2 ? filtered : arr;

  let segments = 0, sum = 0;
  for (let i=1; i<src.length; i++){
    const prev = src[i-1], cur = src[i];
    const delta = (cur.percent ?? 0) - (prev.percent ?? 0);
    const months = monthsBetween(prev.date, cur.date);
    sum += delta / months;
    segments++;
  }
  return Math.round((sum / Math.max(1, segments)) * 10) / 10; // округлим до 0.1
}

// Quality по выбранным компетенциям (0..100)
export function qualityByCompetencies(roleMap, currentMap, prevMap, selected) {
  const comps = selected && selected.length ? selected : Object.keys(roleMap || {});
  const sumNeed = comps.reduce((s,c)=> s + (roleMap?.[c] || 0), 0) || 1;

  const gapNow  = comps.reduce((s,c)=> s + Math.max(0, (roleMap?.[c]||0) - (currentMap?.[c]||0)), 0);
  const gapPrev = comps.reduce((s,c)=> s + Math.max(0, (roleMap?.[c]||0) - (prevMap?.[c]||0)), 0);

  const now  = Math.round((1 - gapNow/sumNeed)  * 100);
  const prev = Math.round((1 - gapPrev/sumNeed) * 100);
  return { now, prev, delta: now - prev };
}
// matchPercent c учётом выбранных компетенций
export function matchPercentFiltered(emp, role, selected = []) {
  const rmap = role?.competencies || {};
  const keys = (selected && selected.length ? selected : Object.keys(rmap));
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

// EI для выбранных компетенций (используем поминутно оценки с competencies)
export function efficiencyIndexFiltered(assessments = [], role, selected = [], monthsHorizon = 12) {
  const arr = (assessments || []).filter(a => a?.competencies).sort((a,b)=> new Date(a.date) - new Date(b.date));
  if (arr.length < 2) return 0;

  const cutoff = new Date(); cutoff.setMonth(cutoff.getMonth() - monthsHorizon);
  const src = arr.filter(a => new Date(a.date) >= cutoff);
  const data = src.length >= 2 ? src : arr;

  let seg = 0, sum = 0;
  for (let i = 1; i < data.length; i++) {
    // считаем «частичную готовность» только по выбранным навыкам на каждый момент
    const prevPct = matchPercentFiltered({ competencies: data[i-1].competencies }, role, selected);
    const curPct  = matchPercentFiltered({ competencies: data[i].competencies }, role, selected);
    const delta = curPct - prevPct;

    const months = Math.max(0.1, (new Date(data[i].date) - new Date(data[i-1].date)) / (1000*60*60*24*30));
    sum += delta / months;
    seg++;
  }
  return Math.round((sum / Math.max(1, seg)) * 10) / 10;
}