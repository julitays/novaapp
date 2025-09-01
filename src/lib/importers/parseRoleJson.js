// src/lib/importers/parseRoleJson.js
// ✅ Импорт канонического JSON эталона роли, валидация и нормализация

export function parseJSONFile(file, onOk, onErr) {
  try {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        onOk?.(data);
      } catch (e) {
        onErr?.(e);
      }
    };
    reader.onerror = (e) => onErr?.(e);
    reader.readAsText(file, "utf-8");
  } catch (err) {
    onErr?.(err);
  }
}


export function normalizeRoleStandard(data) {
  if (!data || !data.name || !data.version) {
    throw new Error("Некорректный формат роли: требуется { name, version, ... }");
  }
  return {
    id: data.id || `std_${slug(data.name)}_${slug(data.version)}`,
    status: data.status || "active",
    division: data.division || "—",
    goal: data.goal || "",
    responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities : [],
    kpi: data.kpi || { current: [], recommended: [] },
    competencyMap: data.competencyMap || {},
    assessmentGuidelines: data.assessmentGuidelines || {},
    testAssignment: data.testAssignment || {},
    assessmentCenter: data.assessmentCenter || {},
    tags: data.tags || [],
    meta: data.meta || {},
    name: data.name,
    version: data.version,
    createdAt: data.createdAt || new Date().toISOString().slice(0,10),
    updatedAt: new Date().toISOString().slice(0,10),
  };
}

function slug(s) {
  return String(s).toLowerCase().replace(/\s+/g, "_").replace(/[^\w\-]+/g, "");
}
