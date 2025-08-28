import React, { useMemo, useState } from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis
} from "recharts";

// --- Mock helpers / data ----------------------------------------------------
const uid = (() => { let i = 1; return () => i++; })();

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
    id: uid(),
    name: "KAM (FMCG)",
    version: "v1.3",
    kpi: "Рост продаж на 15%",
    createdAt: "2025-07-10",
    competencies: {
      "Стратегическое мышление": 3,
      "Переговоры": 4,
      "Аналитика": 3,
      "Коммуникация": 4,
      "Лидерство": 3,
      "Финансовое мышление": 3,
      "Тайм-менеджмент": 3,
      "Проектное управление": 3,
    },
  },
  {
    id: uid(),
    name: "GKAM (Electronics)",
    version: "v1.0",
    kpi: "Доля полки +20%, NPS ключевых сетей +10",
    createdAt: "2025-08-01",
    competencies: {
      "Стратегическое мышление": 4,
      "Переговоры": 4,
      "Аналитика": 4,
      "Коммуникация": 4,
      "Лидерство": 4,
      "Финансовое мышление": 3,
      "Тайм-менеджмент": 3,
      "Проектное управление": 4,
    },
  },
  {
    id: uid(),
    name: "RM (Regional Manager)",
    version: "v2.0",
    kpi: "Выполнение плана визитов 98%",
    createdAt: "2025-06-15",
    competencies: {
      "Стратегическое мышление": 2,
      "Переговоры": 3,
      "Аналитика": 3,
      "Коммуникация": 4,
      "Лидерство": 3,
      "Финансовое мышление": 2,
      "Тайм-менеджмент": 4,
      "Проектное управление": 3,
    },
  },
  {
    id: uid(),
    name: "Руководитель отдела обучения",
    version: "v1.1",
    kpi: "Закрытие 100% IDP вовремя",
    createdAt: "2025-07-25",
    competencies: {
      "Стратегическое мышление": 3,
      "Переговоры": 3,
      "Аналитика": 3,
      "Коммуникация": 4,
      "Лидерство": 4,
      "Финансовое мышление": 2,
      "Тайм-менеджмент": 3,
      "Проектное управление": 4,
    },
  },
];

export const initialEmployees = [
  {
    id: uid(),
    name: "Иван Иванов",
    title: "RM",
    department: "FMCG",
    region: "Юг",
    lastAssessment: "2025-08-20",
    readiness: { targetRole: "KAM (FMCG)", percent: 72 },
    competencies: {
      "Стратегическое мышление": 2,
      "Переговоры": 3,
      "Аналитика": 3,
      "Коммуникация": 4,
      "Лидерство": 3,
      "Финансовое мышление": 2,
      "Тайм-менеджмент": 4,
      "Проектное управление": 3,
    },
  },
  {
    id: uid(),
    name: "Анна Петрова",
    title: "RM",
    department: "FMCG",
    region: "Центр",
    lastAssessment: "2025-08-15",
    readiness: { targetRole: "KAM (FMCG)", percent: 65 },
    competencies: {
      "Стратегическое мышление": 2,
      "Переговоры": 3,
      "Аналитика": 2,
      "Коммуникация": 4,
      "Лидерство": 3,
      "Финансовое мышление": 2,
      "Тайм-менеджмент": 3,
      "Проектное управление": 3,
    },
  },
  {
    id: uid(),
    name: "Дмитрий Кузнецов",
    title: "KAM",
    department: "Electronics",
    region: "Москва",
    lastAssessment: "2025-08-17",
    readiness: { targetRole: "GKAM (Electronics)", percent: 88 },
    competencies: {
      "Стратегическое мышление": 4,
      "Переговоры": 4,
      "Аналитика": 4,
      "Коммуникация": 4,
      "Лидерство": 3,
      "Финансовое мышление": 3,
      "Тайм-менеджмент": 3,
      "Проектное управление": 4,
    },
  },
  {
    id: uid(),
    name: "Мария Волконская",
    title: "Руководитель отдела обучения",
    department: "HR",
    region: "Санкт-Петербург",
    lastAssessment: "2025-08-05",
    readiness: { targetRole: "Руководитель отдела обучения", percent: 92 },
    competencies: {
      "Стратегическое мышление": 3,
      "Переговоры": 3,
      "Аналитика": 3,
      "Коммуникация": 4,
      "Лидерство": 4,
      "Финансовое мышление": 2,
      "Тайм-менеджмент": 4,
      "Проектное управление": 4,
    },
  },
  {
    id: uid(),
    name: "Надежда Приходченко",
    title: "RM",
    department: "Electronics",
    region: "Сибирь",
    lastAssessment: "2025-08-18",
    readiness: { targetRole: "KAM (FMCG)", percent: 54 },
    competencies: {
      "Стратегическое мышление": 2,
      "Переговоры": 2,
      "Аналитика": 3,
      "Коммуникация": 3,
      "Лидерство": 3,
      "Финансовое мышление": 2,
      "Тайм-менеджмент": 4,
      "Проектное управление": 2,
    },
  },
  {
    id: uid(),
    name: "Сергей Брагин",
    title: "KAM",
    department: "FMCG",
    region: "Поволжье",
    lastAssessment: "2025-08-12",
    readiness: { targetRole: "GKAM (Electronics)", percent: 61 },
    competencies: {
      "Стратегическое мышление": 3,
      "Переговоры": 4,
      "Аналитика": 3,
      "Коммуникация": 4,
      "Лидерство": 3,
      "Финансовое мышление": 2,
      "Тайм-менеджмент": 3,
      "Проектное управление": 3,
    },
  },
  {
    id: uid(),
    name: "Екатерина Ли",
    title: "TM",
    department: "Electronics",
    region: "Дальний Восток",
    lastAssessment: "2025-08-09",
    readiness: { targetRole: "RM (Regional Manager)", percent: 77 },
    competencies: {
      "Стратегическое мышление": 2,
      "Переговоры": 3,
      "Аналитика": 3,
      "Коммуникация": 4,
      "Лидерство": 3,
      "Финансовое мышление": 2,
      "Тайм-менеджмент": 4,
      "Проектное управление": 3,
    },
  },
];

// --- Utils ------------------------------------------------------------------
export function matchPercent(emp, role) {
  const keys = ALL_COMPETENCIES;
  let sum = 0, max = 0;
  for (const k of keys) {
    const need = role.competencies[k] ?? 0;
    const have = emp.competencies[k] ?? 0;
    const m = Math.min(have, need);
    sum += m; max += need;
  }
  return max > 0 ? Math.round((sum / max) * 100) : 0;
}

export function toRadarData(aMap, bMap) {
  return ALL_COMPETENCIES.map((c) => ({ competency: c, A: aMap?.[c] ?? 0, B: bMap?.[c] ?? 0 }));
}
// --- More utils -------------------------------------------------------------
function computeWeakAreas(employees, roles, topN = 3) {
  const roleByName = Object.fromEntries(roles.map(r => [r.name, r]));
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
    .sort((a,b) => b[1]-a[1])
    .slice(0, topN)
    .map(([name, value]) => ({ name, value }));
}

// --- Small UI bits ----------------------------------------------------------
export const Button = ({ children, onClick, variant = "primary", className = "" }) => {
  const base = "px-4 py-2 rounded-xl text-sm font-medium transition";
  const styles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    // важное: тёмный текст в обеих темах
    ghost: "bg-white dark:bg-white border border-slate-200 dark:border-slate-700 text-slate-900 hover:bg-slate-50",
  };
  return <button onClick={onClick} className={`${base} ${styles[variant]} ${className}`}>{children}</button>;
};

export const Input = (props) => (
  <input
    {...props}
    className={`w-full rounded-xl border border-slate-200 dark:border-slate-700
                bg-white dark:bg-white text-slate-900 dark:text-slate-900
                placeholder-slate-400 px-3 py-2 text-sm outline-none
                focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-300
                ${props.className ?? ""}`}
  />
);

export const Select = ({ options = [], value, onChange, className = "" }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`w-full rounded-xl border border-slate-200 dark:border-slate-700
                bg-white dark:bg-white text-slate-900 dark:text-slate-900
                px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-300 ${className}`}
  >
    {options.map((o) => <option key={o} value={o}>{o}</option>)}
  </select>
);

const StatCard = ({ title, value, footer, onClick }) => (
  <div onClick={onClick} className="cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition">
    <div className="text-slate-600 dark:text-slate-300 text-sm">{title}</div>
    <div className="text-3xl font-semibold mt-1 text-slate-900 dark:text-slate-50">{value}</div>
    {footer && <div className="text-slate-500 dark:text-slate-400 text-xs mt-2">{footer}</div>}
  </div>
);

const WeakAreasCard = ({ data }) => {
  const total = data.reduce((s,x)=>s+x.value,0) || 1;
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <div className="text-slate-600 dark:text-slate-300 text-sm">Слабые зоны (топ-3)</div>
      <div className="mt-3 space-y-3">
        {data.map((row,i)=>(
          <div key={row.name}>
            <div className="flex items-center justify-between text-sm">
              <div className="font-medium">{row.name}</div>
              <div className="text-slate-600 dark:text-slate-300">{Math.round((row.value/total)*100)}%</div>
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
              <div
                className={`h-2 rounded-full ${i===0 ? "bg-rose-500" : i===1 ? "bg-amber-500" : "bg-indigo-500"}`}
                style={{ width: `${(row.value/total)*100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Tooltip for radar ------------------------------------------------------
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
        <div className={diff >= 0 ? "text-green-600" : "text-red-600"}>
          Δ {diff >= 0 ? `+${diff}` : diff}
        </div>
      </div>
    </div>
  );
}

// --- DashboardView ----------------------------------------------------------
export function DashboardView({ go }) {
  const employeesCount = initialEmployees.length;
  const rolesCount = initialRoles.length;
  const readyPct = Math.round(
    (initialEmployees.filter((e) => (e.readiness?.percent ?? 0) >= 70).length / employeesCount) * 100
  );
  const weakAreasData = computeWeakAreas(initialEmployees, initialRoles, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Дашборд HR</h1>
        <div className="flex gap-2">
          <Button onClick={() => go("createRoleAI")}>Создать эталон</Button>
          <Button variant="ghost" onClick={() => go("search")}>Найти кандидатов</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Сотрудников" value={employeesCount} />
        <StatCard title="Ролей" value={rolesCount} />
        <StatCard title="Готовы к переходу" value={`${readyPct}%`} />
        <WeakAreasCard data={weakAreasData} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="font-medium mb-2 text-slate-900 dark:text-slate-50">Готовность к переходу</div>
          <div className="h-56 text-slate-800 dark:text-slate-100">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={[
                    { name: "Готовы (≥70%)", value: initialEmployees.filter(e=> (e.readiness?.percent||0) >= 70).length },
                    { name: "Ещё развиваться", value: initialEmployees.filter(e=> (e.readiness?.percent||0) < 70).length },
                  ]}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#e11d48" />
                </Pie>
                <Legend wrapperStyle={{ color: "currentColor" }} />
                <Tooltip
                  contentStyle={{ background: "#0b1220", border: "1px solid #475569", color: "#e5e7eb", borderRadius: 12 }}
                  itemStyle={{ color: "#e5e7eb" }}
                  labelStyle={{ color: "#cbd5e1" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="font-medium mb-2 text-slate-900 dark:text-slate-50">Средняя готовность по подразделениям</div>
          <div className="h-56 text-slate-800 dark:text-slate-100">
            <ResponsiveContainer>
              <BarChart
                data={[
                  { dep: "FMCG", val: Math.round(
                    initialEmployees.filter(e=>e.department==="FMCG").reduce((s,e)=> s + (e.readiness?.percent||0),0) /
                    Math.max(1, initialEmployees.filter(e=>e.department==="FMCG").length)
                  ) },
                  { dep: "Electronics", val: Math.round(
                    initialEmployees.filter(e=>e.department==="Electronics").reduce((s,e)=> s + (e.readiness?.percent||0),0) /
                    Math.max(1, initialEmployees.filter(e=>e.department==="Electronics").length)
                  ) },
                  { dep: "HR", val: Math.round(
                    initialEmployees.filter(e=>e.department==="HR").reduce((s,e)=> s + (e.readiness?.percent||0),0) /
                    Math.max(1, initialEmployees.filter(e=>e.department==="HR").length)
                  ) },
                ]}
              >
                <XAxis dataKey="dep" tick={{ fill: "currentColor" }} />
                <YAxis tick={{ fill: "currentColor" }} />
                <Tooltip
                  contentStyle={{ background: "#0b1220", border: "1px solid #475569", color: "#e5e7eb", borderRadius: 12 }}
                  itemStyle={{ color: "#e5e7eb" }}
                  labelStyle={{ color: "#cbd5e1" }}
                />
                <Bar dataKey="val" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="font-medium mb-2 text-slate-900 dark:text-slate-50">Быстрые действия</div>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => go("search")}>Найти кандидатов</Button>
            <Button variant="ghost" onClick={() => go("createRoleAI")}>Создать эталон</Button>
            <Button variant="ghost" onClick={() => go("org")}>Пробелы в структуре</Button>
            <Button variant="ghost" onClick={() => go("employees")}>Сотрудники</Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-medium text-slate-900 dark:text-slate-50">Лента активностей</div>
          <Button variant="ghost" onClick={() => go("org")}>Перейти к структуре</Button>
        </div>
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
          <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 bg-indigo-600 rounded-full" />Иван Иванов прошёл ассессмент (KAM)</li>
          <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 bg-indigo-600 rounded-full" />Создана новая роль GKAM (v1.0)</li>
          <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 bg-indigo-600 rounded-full" />3 сотрудника обновили результаты</li>
        </ul>
      </div>
    </div>
  );
}
// --- CandidateCard (employee preview) --------------------------------------
export function CandidateCard({ emp, roleObj, onOpen }) {
  const data = toRadarData(roleObj.competencies, emp.competencies);
  const percent = matchPercent(emp, roleObj);

  return (
    <div
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 cursor-pointer hover:shadow-md transition"
      onClick={onOpen}
    >
      <div className="font-medium text-slate-900 dark:text-slate-50">{emp.name}</div>
      <div className="text-sm text-slate-600 dark:text-slate-300">{emp.title} — {emp.region}</div>
      <div className="text-sm mt-2">Соответствие роли <b>{roleObj.name}</b>: <b>{percent}%</b></div>

      <div className="w-full h-48 text-slate-800 dark:text-slate-100 mt-3">
        <ResponsiveContainer>
          <RadarChart data={data} outerRadius={70}>
            <PolarGrid />
            <PolarAngleAxis dataKey="competency" tick={{ fontSize: 10, fill: "currentColor" }} />
            <PolarRadiusAxis angle={30} domain={[0, 4]} tick={{ fontSize: 10, fill: "currentColor" }} />
            <Radar name="Эталон" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
            <Radar name="Сотр."  dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
            <Tooltip content={<RadarTooltip />} wrapperStyle={{ outline: "none" }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// --- SearchView -------------------------------------------------------------
export function SearchView({ go, setSearchResult, roles }) {
  const [targetRole, setTargetRole] = useState(roles[0].name);

  function onFind() {
    const role = roles.find(r => r.name === targetRole) || roles[0];
    const res = initialEmployees.map(e => ({
      ...e,
      score: matchPercent(e, role)
    }));
    setSearchResult(res);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Поиск кандидатов</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-sm text-slate-700 dark:text-slate-200">Целевая должность</label>
          <Select options={roles.map(r => r.name)} value={targetRole} onChange={setTargetRole} />
        </div>
        <div className="flex items-end">
          <Button onClick={onFind}>Найти</Button>
        </div>
      </div>
    </div>
  );
}

// --- EmployeeProfileView ----------------------------------------------------
export function EmployeeProfileView({ emp, roles }) {
  const role = roles.find(r => r.name === emp.readiness?.targetRole) || roles[0];
  const percent = matchPercent(emp, role);
  const data = toRadarData(role.competencies, emp.competencies);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{emp.name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
          <div className="text-sm text-slate-600 dark:text-slate-300">Должность: {emp.title}</div>
          <div className="text-sm text-slate-600 dark:text-slate-300">Регион: {emp.region}</div>
          <div className="text-sm text-slate-600 dark:text-slate-300">Последняя оценка: {emp.lastAssessment}</div>
          <div className="text-sm text-slate-600 dark:text-slate-300">Цель: {role.name}</div>
          <div className="text-sm">Готовность: <b>{percent}%</b></div>
          <Button onClick={() => alert("PDF отчёт готов (демо)")}>Сгенерировать PDF-отчёт</Button>
        </div>

        <div className="w-full h-72 text-slate-800 dark:text-slate-100">
          <ResponsiveContainer>
            <RadarChart data={data} outerRadius={110} margin={{ right: 120 }}>
              <PolarGrid />
              <PolarAngleAxis dataKey="competency" tick={{ fontSize: 11, fill: "currentColor" }} />
              <PolarRadiusAxis angle={30} domain={[0, 4]} tick={{ fontSize: 10, fill: "currentColor" }} />
              <Radar name="Эталон" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
              <Radar name="Сотр."  dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
              <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: 16, color: "currentColor" }} />
              <Tooltip
                contentStyle={{ background: "#0b1220", border: "1px solid #475569", color: "#e5e7eb", borderRadius: 12 }}
                itemStyle={{ color: "#e5e7eb" }}
                labelStyle={{ color: "#cbd5e1" }}
                wrapperStyle={{ outline: "none" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
// --- Roles list -------------------------------------------------------------
export function RolesListView({ roles, go }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Эталоны ролей</h2>
        <Button onClick={() => go("createRoleAI")}>Создать новую роль</Button>
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="text-left p-3 text-slate-700 dark:text-slate-200">Название роли</th>
              <th className="text-left p-3 text-slate-700 dark:text-slate-200">Версия</th>
              <th className="text-left p-3 text-slate-700 dark:text-slate-200">Компетенций</th>
              <th className="text-left p-3 text-slate-700 dark:text-slate-200">KPI</th>
              <th className="text-left p-3 text-slate-700 dark:text-slate-200">Дата создания</th>
            </tr>
          </thead>
          <tbody>
            {initialRoles.map((r) => (
              <tr
                key={r.id}
                className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
                onClick={() => go({ view: "role", payload: r })}
              >
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.version}</td>
                <td className="p-3">{Object.keys(r.competencies).length}</td>
                <td className="p-3">{r.kpi}</td>
                <td className="p-3">{r.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Role profile -----------------------------------------------------------
export function RoleProfileView({ role, go }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{role.name} ({role.version})</h2>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => go("createRoleAI")}>Редактировать эталон</Button>
          <Button onClick={() => go("compare")}>Сравнить с сотрудником</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="font-medium mb-3 text-slate-900 dark:text-slate-50">Компетенции</div>
          <ul className="text-sm space-y-1">
            {ALL_COMPETENCIES.map((c) => (
              <li key={c} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 py-1">
                <span>{c}</span>
                <span className="font-medium">{role.competencies[c] ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="font-medium mb-2 text-slate-900 dark:text-slate-50">KPI</div>
          <div className="text-sm text-slate-700 dark:text-slate-200">{role.kpi}</div>
        </div>
      </div>
    </div>
  );
}

// --- Compare view -----------------------------------------------------------
export function CompareView({ roles }) {
  const [empId, setEmpId] = useState(initialEmployees[0].id);
  const [roleName, setRoleName] = useState(roles[0].name);

  const emp = initialEmployees.find((e) => e.id === +empId || e.id === empId) || initialEmployees[0];
  const role = roles.find((r) => r.name === roleName) || roles[0];
  const percent = matchPercent(emp, role);
  const data = toRadarData(role.competencies, emp.competencies);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Сравнение</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-sm text-slate-700 dark:text-slate-200">Сотрудник</label>
          <select
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700
                       bg-white dark:bg-white text-slate-900 dark:text-slate-900
                       px-3 py-2 text-sm"
            value={empId}
            onChange={(e) => setEmpId(e.target.value)}
          >
            {initialEmployees.map((e) => (
              <option key={e.id} value={e.id}>{e.name} — {e.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-slate-700 dark:text-slate-200">Роль</label>
          <Select value={roleName} onChange={setRoleName} options={roles.map((r) => r.name)} />
        </div>

        <div className="flex items-end">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm">
            Соответствие: <span className="font-semibold">{percent}%</span>
          </div>
        </div>
      </div>

      <div className="w-full h-80 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-slate-800 dark:text-slate-100">
        <ResponsiveContainer>
          <RadarChart data={data} outerRadius={120} margin={{ right: 140 }}>
            <PolarGrid />
            <PolarAngleAxis dataKey="competency" tick={{ fontSize: 12, fill: "currentColor" }} />
            <PolarRadiusAxis angle={30} domain={[0, 4]} tick={{ fontSize: 11, fill: "currentColor" }} />
            <Radar name="Эталон" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
            <Radar name="Сотр."  dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{ paddingLeft: 16, color: "currentColor" }}
            />
            <Tooltip
              contentStyle={{ background: "#0b1220", border: "1px solid #475569", color: "#e5e7eb", borderRadius: 12 }}
              itemStyle={{ color: "#e5e7eb" }}
              labelStyle={{ color: "#cbd5e1" }}
              wrapperStyle={{ outline: "none" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// --- Create role (AI) -------------------------------------------------------
export function CreateRoleAIView({ roles, setRoles }) {
  const [messages, setMessages] = useState([
    { role: "system", text: "Я — AI-методолог. Опиши роль, и я соберу эталон компетенций и KPI." },
  ]);
  const [draftName, setDraftName] = useState("Новая роль");
  const [model, setModel] = useState("Встроенный AI");
  const [draft, setDraft] = useState({
    name: "",
    version: "v1.0",
    kpi: "",
    competencies: Object.fromEntries(ALL_COMPETENCIES.map((c) => [c, 0])),
  });

  function send(msg) {
    if (!msg.trim()) return;
    const next = [...messages, { role: "user", text: msg }];
    const auto = {
      name: draftName || "Новая роль",
      version: "v1.0",
      kpi: "KPI по результатам продаж и NPS",
      competencies: {
        "Стратегическое мышление": 3,
        "Переговоры": 4,
        "Аналитика": 3,
        "Коммуникация": 4,
        "Лидерство": 3,
        "Финансовое мышление": 3,
        "Тайм-менеджмент": 3,
        "Проектное управление": 3,
      },
    };
    setDraft(auto);
    setMessages([
      ...next,
      { role: "assistant", text: `Сформировал эталон для «${auto.name}». Модель: ${model}. Версия: ${auto.version}. KPI и компетенции доступны справа.` }
    ]);
  }

  function saveToDb() {
    const newRole = {
      id: Date.now(),
      name: draft.name || draftName,
      version: draft.version,
      kpi: draft.kpi || "KPI уточняются",
      createdAt: new Date().toISOString().slice(0, 10),
      competencies: draft.competencies,
    };
    setRoles((prev) => [...prev, newRole]);
    alert("Эталон сохранён в базе ролей");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="font-medium">Создание эталона — Chat AI</div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-700 dark:text-slate-200">Источник AI</span>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-700
                         bg-white dark:bg-white text-slate-900 dark:text-slate-900
                         px-2 py-1 text-sm"
            >
              <option>Встроенный AI</option>
              <option>Мой GPTs</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto space-y-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role === "user"
                ? "bg-indigo-50 ml-auto"
                : m.role === "assistant"
                ? "bg-slate-50 dark:bg-slate-800/60"
                : "bg-white border border-slate-200"}`}
            >
              {m.text}
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Input
            placeholder="Опиши роль, акценты, KPI…"
            onKeyDown={(e) => { if (e.key === "Enter") send(e.currentTarget.value); }}
          />
          <Button onClick={() => send("Создай роль по шаблону KAM c акцентом на переговоры и аналитику")}>
            Отправить
          </Button>
        </div>
      </div>

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
            <div className="text-sm text-slate-700 dark:text-slate-200 mb-1">Версия</div>
            <Input value={draft.version} onChange={(e) => setDraft({ ...draft, version: e.target.value })} />
          </div>
          <div>
            <div className="text-sm text-slate-700 dark:text-slate-200 mb-1">KPI</div>
            <Input value={draft.kpi} onChange={(e) => setDraft({ ...draft, kpi: e.target.value })} />
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="text-left p-3 text-slate-700 dark:text-slate-200">Компетенция</th>
                <th className="text-left p-3 text-slate-700 dark:text-slate-200">Уровень (0–4)</th>
              </tr>
            </thead>
            <tbody>
              {ALL_COMPETENCIES.map((c) => (
                <tr key={c} className="border-t border-slate-100 dark:border-slate-700">
                  <td className="p-3">{c}</td>
                  <td className="p-3">
                    <input
                      type="range" min={0} max={4}
                      value={draft.competencies[c] ?? 0}
                      onChange={(e) => setDraft({
                        ...draft,
                        competencies: { ...draft.competencies, [c]: +e.target.value },
                      })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex gap-2">
          <Button onClick={saveToDb}>Сохранить в БД</Button>
          <Button variant="ghost" onClick={() => alert("Ручное редактирование открыто (демо)")}>
            Редактировать вручную
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- Org structure ----------------------------------------------------------
export function OrgStructureView({ go }) {
  const [open, setOpen] = useState({ ceo: true, gkam: true, kam: true, rm: true, lnd: true });

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
        {children && (<div className="mt-3 space-y-2">{children}</div>)}
        {onClick && (<div className="mt-3 flex justify-end"><Button variant="ghost" onClick={onClick}>Открыть кандидатов</Button></div>)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Структура компании</h2>
        <div className="text-sm text-slate-500">Иерархия: CEO → GKAM → KAM → RM / CEO → Руководитель обучения</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Node label="CEO" badge="1" color="slate">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">GKAM FMCG</div>
                  <button className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Резерв: 2</button>
                </div>
                {open.gkam && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-sm">
                    <div className="mb-1">Кандидаты:</div>
                    <ul className="list-disc list-inside">
                      <li onClick={() => go({ view: "employee", payload: initialEmployees[2] })} className="hover:underline cursor-pointer">Дмитрий Кузнецов — 88%</li>
                      <li onClick={() => go({ view: "employee", payload: initialEmployees[5] })} className="hover:underline cursor-pointer">Сергей Брагин — 61%</li>
                    </ul>
                  </div>
                )}
                <Button variant="ghost" onClick={() => setOpen((s) => ({ ...s, gkam: !s.gkam }))}>
                  {open.gkam ? "Скрыть" : "Показать"} GKAM FMCG
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">GKAM Electronics</div>
                  <button className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Нет резерва</button>
                </div>
                {open.gkam && (
                  <div className="rounded-xl border border-rose-200 dark:border-rose-700 p-3 text-sm bg-rose-50 dark:bg-rose-900/30">
                    <div className="mb-1">⚠ Срочно ищем таланты на GKAM Electronics</div>
                    <Button onClick={() => go("search")}>Перейти к поиску</Button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Руководитель отдела обучения</div>
                  <button className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Резерв: 3</button>
                </div>
                {open.lnd && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-sm">
                    <ul className="list-disc list-inside">
                      <li className="hover:underline cursor-pointer" onClick={() => go({ view: "employee", payload: initialEmployees[3] })}>Мария Волконская — 92%</li>
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
                  <li onClick={() => go({ view: "employee", payload: initialEmployees[5] })} className="hover:underline cursor-pointer">Сергей Брагин</li>
                  <li onClick={() => go({ view: "employee", payload: initialEmployees[2] })} className="hover:underline cursor-pointer">Дмитрий Кузнецов</li>
                </ul>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                <div className="font-medium mb-2">RM</div>
                <ul className="text-sm list-disc list-inside">
                  <li onClick={() => go({ view: "employee", payload: initialEmployees[0] })} className="hover:underline cursor-pointer">Иван Иванов</li>
                  <li onClick={() => go({ view: "employee", payload: initialEmployees[1] })} className="hover:underline cursor-pointer">Анна Петрова</li>
                  <li onClick={() => go({ view: "employee", payload: initialEmployees[4] })} className="hover:underline cursor-pointer">Надежда Приходченко</li>
                </ul>
              </div>
            </div>
          </Node>
        </div>
      </div>
    </div>
  );
}

// --- Employees list ---------------------------------------------------------
export function EmployeesListView({ go }) {
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("Все");

  const list = initialEmployees
    .filter(e => (roleFilter==="Все" || e.title===roleFilter))
    .filter(e => [e.name, e.title, e.department, e.region].join(" ").toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify_between">
        <h2 className="text-xl font-semibold">Сотрудники</h2>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Поиск: имя/роль/регион…"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            className="w-64"
          />
          <Select
            value={roleFilter}
            onChange={setRoleFilter}
            options={["Все","TM","RM","KAM","Руководитель отдела обучения"]}
          />
          <Button variant="ghost" onClick={() => alert("Экспорт CSV (демо)")}>Экспорт CSV</Button>
          <Button onClick={() => alert("Добавление сотрудника (демо)")}>Добавить сотрудника</Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="text-left p-3 text-slate-700 dark:text-slate-200">ФИО</th>
              <th className="text-left p-3 text-slate-700 dark:text-slate-200">Должность</th>
              <th className="text-left p-3 text-slate-700 dark:text-slate-200">Последняя оценка</th>
              <th className="text-left p-3 text-slate-700 dark:text-slate-200">% совпадения (цель)</th>
              <th className="text-left p-3 text-slate-700 dark:text-slate-200">Дата обновления</th>
            </tr>
          </thead>
          <tbody>
            {list.map((e) => {
              const role = initialRoles.find((r) => r.name === e.readiness?.targetRole) || initialRoles[0];
              const pct = matchPercent(e, role);
              return (
                <tr
                  key={e.id}
                  className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
                  onClick={() => go({ view: "employee", payload: e })}
                >
                  <td className="p-3">{e.name}</td>
                  <td className="p-3">{e.title}</td>
                  <td className="p-3">{e.lastAssessment}</td>
                  <td className="p-3">{pct}% ({e.readiness?.targetRole || "—"})</td>
                  <td className="p-3">{e.lastAssessment}</td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr><td colSpan={5} className="p-4 text-slate-500">Пусто по заданным условиям</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
