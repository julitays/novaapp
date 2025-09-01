import React from "react";
import { exportJSON } from "../../lib/exporters/exportJSON.js";
import { Badge, Button } from "../../components/ui";

export default function RoleDetailsView({ role }) {
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
              onClick={() => exportJSON(role, `${role.name.replace(/\s+/g, "_")}_${role.version}.json`)}
            >
              Экспорт JSON
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Левая колонка */}
        <div className="space-y-6">
          {/* Цель */}
          <section id="goal" className="scroll-mt-20 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="text-sm text-slate-500 mb-1">Цель роли</div>
            <p className="text-slate-900 dark:text-slate-100 leading-relaxed">{role.goal || "—"}</p>
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

          {/* KPI */}
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
                {Object.entries(role.assessmentGuidelines?.behavioralAnchors || {}).map(([comp, list]) => (
                  <div key={comp} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                    <div className="font-medium mb-1">{comp}</div>
                    <ul className="text-sm list-disc list-inside">
                      {(list || []).map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                ))}
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
                {Array.isArray(role.testAssignment?.deliverables) && role.testAssignment.deliverables.length ? (
                  <ul className="list-disc list-inside">{role.testAssignment.deliverables.map((d, i) => <li key={i}>{d}</li>)}</ul>
                ) : (
                  <div>—</div>
                )}
              </div>
              <div>
                <div className="text-slate-500 mb-1">Критерии оценки</div>
                {Array.isArray(role.testAssignment?.evaluationCriteria) && role.testAssignment.evaluationCriteria.length ? (
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
                        <b>{c.title}</b> — {c.durationMin} мин; Наблюдатели: {(c.observersRoles || []).join(", ") || "—"}; Компетенции: {(c.competenciesObserved || []).join(", ") || "—"}
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

        {/* Правая мини-навигация */}
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

function KPITable({ title, data }) {
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
            <tr>
              <td className="p-3 text-slate-500" colSpan={3}>
                —
              </td>
            </tr>
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
              <td className="p-3">{lvl >= 1 ? "• индикаторы (ур.1)" : "—"}</td>
              <td className="p-3">{lvl >= 2 ? "• индикаторы (ур.2)" : "—"}</td>
              <td className="p-3">{lvl >= 3 ? "• индикаторы (ур.3)" : "—"}</td>
              <td className="p-3">{lvl >= 4 ? "• индикаторы (ур.4)" : "—"}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td className="p-3 text-slate-500" colSpan={6}>
                —
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
