import React, { useState } from "react";
import { ALL_COMPETENCIES } from "../../lib/modules.js";
import { Button, Input } from "../../components/ui";

export default function CreateRoleAIView({ onSave }) {
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
          Переговоры: [
            "Готовит позицию/BATNA; фиксирует договорённости письменно",
            "Управляет повесткой и рамками встречи",
          ],
          "Стратегическое мышление": ["Формулирует гипотезы роста, просчитывает сценарии/риски"],
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
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
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
      {/* Чат */}
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
                m.role === "user" ? "bg-indigo-50 ml-auto" : "bg-slate-50 dark:bg-slate-800/60"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Input
            placeholder="Опиши роль, акценты, KPI… (Enter — отправить)"
            onKeyDown={(e) => e.key === "Enter" && send(e.currentTarget.value)}
          />
          <Button onClick={() => send("Создай роль KAM с акцентом на переговоры и аналитику")}>Отправить</Button>
        </div>
      </div>

      {/* Предпросмотр */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-medium">Предпросмотр эталона</div>
          <div className="flex gap-2">
            <Input value={draftName} onChange={(e) => setDraftName(e.target.value)} className="w-48" />
            <Button variant="ghost" onClick={() => setDraft({ ...draft, name: draftName })}>Применить имя</Button>
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
          <Button variant="ghost" onClick={() => alert("Ручное редактирование (демо)")}>Редактировать вручную</Button>
        </div>
      </div>
    </div>
  );
}
