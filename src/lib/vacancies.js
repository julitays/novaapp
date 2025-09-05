// src/lib/vacancies.js
const LS_KEY = "novaapp_vacancies_v1";

// Статусы: open | on_hold | closed
// Приоритет: low | normal | high | critical
// Источник: headcount | backfill | growth

export const initialVacancies = [
  {
    id: "VAC-001",
    title: "KAM — федеральные сети",
    roleName: "KAM",
    department: "Sales",
    location: "Москва",
    workMode: "гибрид", // офис | гибрид | удалёнка
    priority: "high",
    source: "growth",
    headcount: 2,
    openedAt: "2025-08-20",
    status: "open",
    requirements: {
      relocation: false,
      languages: ["ru", "en"],
      minExpYears: 3,
    },
    notes: "Расширение команды по X5/VTB",
  },
  {
    id: "VAC-002",
    title: "GKAM (Electronics)",
    roleName: "GKAM (Electronics)",
    department: "Sales Electronics",
    location: "Санкт-Петербург",
    workMode: "офис",
    priority: "critical",
    source: "headcount",
    headcount: 1,
    openedAt: "2025-08-05",
    status: "open",
    requirements: {
      relocation: true,
      languages: ["ru", "en"],
      minExpYears: 5,
    },
    notes: "Стратегический клиент DNS, ASAP",
  },
  {
    id: "VAC-003",
    title: "Руководитель отдела обучения",
    roleName: "Руководитель отдела обучения",
    department: "Enablement",
    location: "Москва",
    workMode: "гибрид",
    priority: "normal",
    source: "backfill",
    headcount: 1,
    openedAt: "2025-07-10",
    status: "on_hold",
    requirements: {
      relocation: false,
      languages: ["ru"],
      minExpYears: 4,
    },
    notes: "Ожидаем бюджет Q4",
  },
];

// ——— helpers ———
function loadLS() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}
function saveLS(arr) { localStorage.setItem(LS_KEY, JSON.stringify(arr)); }

// Публичные API
export function loadVacancies() {
  const saved = loadLS();
  if (saved.length) return saved;
  saveLS(initialVacancies);
  return initialVacancies;
}
export function upsertVacancy(vac) {
  const list = loadVacancies();
  const map = new Map(list.map(v => [v.id, v]));
  map.set(vac.id, { ...map.get(vac.id), ...vac });
  const out = [...map.values()];
  saveLS(out);
  return out;
}
export function closeVacancy(id) {
  const list = loadVacancies().map(v => v.id === id ? { ...v, status: "closed" } : v);
  saveLS(list);
  return list;
}
export function deleteVacancy(id) {
  const list = loadVacancies().filter(v => v.id !== id);
  saveLS(list);
  return list;
}
export function createVacancyFromRole(roleName, { department = "", location = "Москва" } = {}) {
  const id = "VAC-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const vac = {
    id,
    title: `${roleName}`,
    roleName,
    department,
    location,
    workMode: "гибрид",
    priority: "normal",
    source: "growth",
    headcount: 1,
    openedAt: new Date().toISOString().slice(0, 10),
    status: "open",
    requirements: { relocation: false, languages: ["ru"], minExpYears: 2 },
    notes: "",
  };
  return upsertVacancy(vac);
}
