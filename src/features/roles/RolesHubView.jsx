import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { roleStandards, initialRoles } from "../../lib/modules.js";
import { parseJSONFile } from "../../lib/importers/parseJSONFile.js";
import { exportJSON } from "../../lib/exporters/exportJSON.js";
import { Button, Input, Badge } from "../../components/ui";
import CreateRoleAIView from "./CreateRoleAIView.jsx";

export default function RolesHubView() {
  const navigate = useNavigate();

  // Собираем список из roleStandards + «быстрые» из initialRoles
  const quickFromInitial = (initialRoles || []).map((r) => ({
    id: `quick_${r.name}_${r.version || "v1.0"}`.replace(/\s+/g, "_"),
    name: r.name,
    version: r.version || "v1.0",
    division: r.name.includes("GKAM") ? "Sales / Electronics" : "Sales / FMCG",
    status: "active",
    kpi: { current: [{ name: r.kpi || "—", target: "", period: "" }], recommended: [] },
    competencyMap: r.competencies || {},
    createdAt: r.created || "",
    updatedAt: r.created || "",
  }));

  const key = (x) => `${x.name}__${x.version}`;
  const merged = new Map([...roleStandards, ...quickFromInitial].map((x) => [key(x), x]));
  const [standards, setStandards] = useState(Array.from(merged.values()));
  const [mode, setMode] = useState("list"); // list | create
  const [q, setQ] = useState("");

  const filtered = standards.filter(
    (s) =>
      s.name.toLowerCase().includes(q.toLowerCase()) ||
      (s.division || "").toLowerCase().includes(q.toLowerCase())
  );

  function openDetails(std) {
    navigate(`/roles/${encodeURIComponent(std.name)}`, { state: { role: std } });
  }

  function onImport(file) {
    parseJSONFile(
      file,
      (data) => {
        const std = {
          id: data.id || `std_${data.name}_${data.version}`.replace(/\s+/g, "_").toLowerCase(),
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
          name: data.name,
          version: data.version,
          createdAt: data.createdAt || new Date().toISOString().slice(0, 10),
          updatedAt: new Date().toISOString().slice(0, 10),
        };
        setStandards((prev) => {
          const m = new Map(prev.map((x) => [key(x), x]));
          m.set(key(std), std);
          return Array.from(m.values());
        });
        alert(`Импортирован эталон: ${std.name} (${std.version})`);
      },
      (err) => alert("Ошибка импорта: " + err.message)
    );
  }

  function exportOne(std) {
    exportJSON(std, `${std.name.replace(/\s+/g, "_")}_${std.version}.json`);
  }

  return (
    <div className="space-y-6">
      {/* Тулбар */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Эталон ролей</h2>
        <div className="flex items-center gap-2">
          <Input placeholder="Поиск по роли/подразделению…" value={q} onChange={(e) => setQ(e.target.value)} className="w-64" />
          <label className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer text-sm">
            Импорт JSON
            <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} />
          </label>
          <Button onClick={() => setMode("create")}>Создать с помощью AI</Button>
          {mode === "create" && <Button variant="ghost" onClick={() => setMode("list")}>Назад к списку</Button>}
        </div>
      </div>

      {/* Список */}
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
                <th className="text-left p-3 w-[140px]">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((std) => (
                <tr key={std.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <td className="p-3">
                    <button className="hover:underline" onClick={() => openDetails(std)}>
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
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" onClick={() => openDetails(std)}>Открыть</Button>
                      <Button variant="ghost" onClick={() => exportOne(std)}>Экспорт</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="p-3 text-slate-500" colSpan={7}>
                    Ничего не найдено по запросу «{q}»
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Создание с AI */}
      {mode === "create" && (
        <CreateRoleAIView
          onSave={(std) => {
            const k = (x) => `${x.name}__${x.version}`;
            setStandards((prev) => {
              const m = new Map(prev.map((x) => [k(x), x]));
              m.set(k(std), std);
              return Array.from(m.values());
            });
            setMode("list");
            openDetails(std);
          }}
        />
      )}
    </div>
  );
}
