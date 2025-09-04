// src/features/roles/RoleDetailsView.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { exportJSON } from "../../lib/exporters/exportJSON.js";
import { upsertRoleStandard } from "../../lib/rolesRegistry.js";
import { Badge, Button, Input, Select, Textarea } from "../../components/ui";
import Card from "../../components/ui/Card.jsx";

/* ──────────────────────────────────────────────────────────────────────────
   Адаптеры данных + генераторы заглушек
------------------------------------------------------------------------- */

function toMinimalRequirements(role) {
  const mr = role.minimalRequirements || {};
  return {
    workMode: mr.workMode || "Гибрид (2 дня офис / 3 — удалённо)",
    locationPreferred: mr.locationPreferred || "Москва / СПБ",
    relocationReady: typeof mr.relocationReady === "boolean" ? mr.relocationReady : false,
    businessTrips: mr.businessTrips ?? "до 20% времени",
    languages: mr.languages || "RU (C1), EN (B1+)",
    experience: mr.experience || "3+ года в смежной роли, 1+ год взаимодействия с сетями / крупными B2B клиентами",
    tools: mr.tools || "Google Sheets/Excel (уверенно), BI (желательно), CRM/ERP (плюс)",
    education: mr.education || "Высшее (экономика/менеджмент/математика — плюс)",
  };
}

function generateCompetencyBlocks(role) {
  if (Array.isArray(role.competencyBlocks) && role.competencyBlocks.length) return role.competencyBlocks;
  const map = role.competencyMap || {};
  return Object.keys(map).map((name) => {
    const lvl = map[name] ?? 0;
    const qcount = 2 + Math.min(2, Math.max(0, lvl - 1)); // 2..4
    const questions = Array.from({ length: qcount }).map((_, i) => ({
      text: `Вопрос ${i + 1}: поведенческий кейс по теме «${name}»`,
      indicators: [
        `ур.1: базовая демонстрация ${name.toLowerCase()}`,
        `ур.2: стабильное применение в типовых ситуациях`,
        `ур.3: уверенное применение, обучение других`,
        `ур.4: системное влияние/масштабирование`,
      ],
    }));
    return {
      name,
      description:
        role.assessmentGuidelines?.behavioralAnchors?.[name]?.[0] ||
        `О чём компетенция: ${name}. Подробные индикаторы раскрыты ниже по уровням.`,
      standardLevel: lvl,
      questions,
    };
  });
}

function toInterview(role) {
  return (
    role.interview?.questions ||
    role.assessmentGuidelines?.evidenceExamples?.map((e) => ({
      text: `Расскажите про кейс: «${e}». Какую роль вы выполняли?`,
      goal: "Выявить роль кандидата, глубину участия и метрики результата",
      signal: "Конкретные метрики, выводы, перенос опыта",
    })) || [
      {
        text:
          "Опишите наиболее сложные переговоры за последний год. Как готовились, какая была BATNA, чем завершилось?",
        goal: "Проверить переговорную подготовку и фиксацию договорённостей",
        signal: "Есть расчёт позиции, альтернативы, протокол/договоренности",
      },
      {
        text:
          "Приведите пример, когда меняли план промо/поставок из-за данных. Что увидели и как пересобрали план?",
        goal: "Проверить мышление через данные и управление рисками",
        signal: "Показывает цифры, сценарии, коммуникацию и результат",
      },
    ]
  );
}

function toTestAssignment(role) {
  return (
    role.testAssignment || {
      objective: "Собрать JBP на 6 месяцев для сети Х",
      timeboxHours: 8,
      deliverables: ["10-слайдовая презентация", "мини-модель P&L"],
      evaluationCriteria: ["Логика гипотез", "Финансовая обоснованность", "План рисков"],
    }
  );
}

function toAssessmentCenter(role) {
  return (
    role.assessmentCenter || {
      cases: [
        {
          title: "Эскалация с категорией",
          durationMin: 30,
          observersRoles: ["HRBP", "Sales Director"],
          competenciesObserved: ["Коммуникация", "Переговоры", "Лидерство"],
        },
      ],
      rubrics: "Матрица Компетенции × Поведенческие индикаторы",
    }
  );
}

// экспорт markdown (для печати/шеринга)
function exportMarkdown(text, filename) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ──────────────────────────────────────────────────────────────────────────
   Главный компонент
------------------------------------------------------------------------- */

export default function RoleDetailsView({ role }) {
  const navigate = useNavigate();
  const [tab, setTab] = React.useState("about"); // 'about' | 'hiring'

  // редактируемая копия + черновик/история
  const DRAFT_KEY = React.useMemo(
    () => `novaapp_role_draft_${(role?.id || role?.name || "role").replace(/\s+/g, "_")}`,
    [role?.id, role?.name]
  );
  const HISTORY_KEY = React.useMemo(
    () => `novaapp_role_history_${(role?.id || role?.name || "role").replace(/\s+/g, "_")}`,
    [role?.id, role?.name]
  );

  const [edit, setEdit] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [autosaveTs, setAutosaveTs] = React.useState(null);

  const fromDraft = safeLoadJSON(DRAFT_KEY, null);
  const initialModel = React.useMemo(
    () => normalizeForEdit(fromDraft || role),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [role?.id, role?.name, fromDraft?.__draftId]
  );
  const [model, setModel] = React.useState(initialModel);

  React.useEffect(() => setModel(initialModel), [initialModel]);

  // автосейв с дебаунсом
  React.useEffect(() => {
    if (!edit) return;
    const h = setTimeout(() => {
      const draft = { ...model, __draftId: Date.now() };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setAutosaveTs(new Date());
      pushHistory(HISTORY_KEY, draft);
    }, 800);
    return () => clearTimeout(h);
  }, [model, edit]); // eslint-disable-line

  const validation = validate(model);

  function patch(path, value) {
    setModel((prev) => {
      const next = structuredClone(prev);
      let o = next;
      const keys = path.split(".");
      while (keys.length > 1) o = o[keys.shift()];
      o[keys[0]] = value;
      return next;
    });
  }

  async function onSavePublish() {
    if (!validation.ok) {
      alert("Заполните обязательные поля: " + validation.missing.join(", "));
      return;
    }
    setSaving(true);
    try {
      const canonical = toCanonical(model);
      upsertRoleStandard(canonical);
      localStorage.removeItem(DRAFT_KEY);
      setEdit(false);
      alert("Опубликовано ✅");
    } catch (e) {
      console.error(e);
      alert("Не удалось сохранить профиль");
    } finally {
      setSaving(false);
    }
  }

  function onDiscardDraft() {
    localStorage.removeItem(DRAFT_KEY);
    setModel(normalizeForEdit(role));
    setAutosaveTs(null);
    setEdit(false);
  }

  function restoreFromHistory(snapshot) {
    setModel(normalizeForEdit(snapshot));
    setEdit(true);
  }

  // отображение (используем твои генераторы)
  const mr = toMinimalRequirements(model);
  const blocks = generateCompetencyBlocks(model);
  const interview = toInterview(model);
  const test = toTestAssignment(model);
  const ac = toAssessmentCenter(model);

  return (
    <div className="space-y-6">
      {/* Шапка */}
      <div className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-slate-900/70 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            {!edit ? (
              <div className="text-2xl font-semibold truncate">{model.name}</div>
            ) : (
              <div className="flex items-center gap-2">
                <Input className="w-80" value={model.name} onChange={(e) => patch("name", e.target.value)} />
                <Input className="w-24" value={model.version} onChange={(e) => patch("version", e.target.value)} />
              </div>
            )}
            <div className="text-slate-500 dark:text-slate-400 text-sm">
              {!edit ? (
                <>
                  Подразделение: <b>{model.division || "—"}</b> · Версия: <b>{model.version}</b> · Статус:{" "}
                  <Badge tone={model.status === "active" ? "green" : model.status === "draft" ? "slate" : "gray"}>
                    {model.status || "—"}
                  </Badge>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Подразделение:</span>
                  <Input className="w-60" value={model.division || ""} onChange={(e) => patch("division", e.target.value)} />
                  <span>Статус:</span>
                  <Select value={model.status} onChange={(v) => patch("status", v)} options={["draft", "active", "archived"]} />
                </div>
              )}
            </div>
            {autosaveTs && edit && (
              <div className="text-xs text-slate-400 mt-1">Черновик сохранён: {fmtTime(autosaveTs)}</div>
            )}
            {!validation.ok && edit && (
              <div className="text-xs text-rose-600 mt-1">
                Заполните обязательные поля: {validation.missing.join(", ")}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!edit ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => exportJSON(toCanonical(model), `${model.name.replace(/\s+/g, "_")}_${model.version}.json`)}
                >
                  Экспорт JSON
                </Button>
                <Button variant="outline" onClick={() => setEdit(true)}>
                  Редактировать
                </Button>
                <Button variant="outline" onClick={() => navigate("/roles")}>
                  К списку ролей
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={onDiscardDraft}>Отмена</Button>
                <Button onClick={onSavePublish} disabled={!validation.ok || saving}>
                  {saving ? "Сохраняю…" : "Опубликовать"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Табы */}
        <div className="mt-3 flex gap-2">
          <TabButton active={tab === "about"} onClick={() => setTab("about")}>Описание роли</TabButton>
          <TabButton active={tab === "hiring"} onClick={() => setTab("hiring")}>Подбор</TabButton>

          {/* История изменений */}
          <HistoryDropdown historyKey={HISTORY_KEY} onRestore={restoreFromHistory} />
        </div>
      </div>

      {tab === "about" ? (
        <AboutTab model={model} mr={mr} blocks={blocks} edit={edit} patch={patch} />
      ) : (
        <HiringTab model={model} interview={interview} test={test} ac={ac} />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Вкладка «Описание роли» (с редактурой)
------------------------------------------------------------------------- */

function AboutTab({ model, mr, blocks, edit, patch }) {
  return (
    <div className="space-y-6">
      {/* Цель роли */}
      <Card className="p-5">
        <div className="text-sm text-slate-500 mb-1">Цель роли</div>
        {!edit ? (
          <p className="text-slate-900 dark:text-slate-100 leading-relaxed">{model.goal || "—"}</p>
        ) : (
          <Textarea rows={3} value={model.goal || ""} onChange={(e) => patch("goal", e.target.value)} />
        )}
        {!!(model.tags && model.tags.length) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {model.tags.map((t, i) => (
              <Badge key={t + i}>{t}</Badge>
            ))}
          </div>
        )}
      </Card>

      {/* Минимальные требования */}
      <Card className="p-5">
        <div className="font-medium mb-3">Минимальные требования</div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 text-sm">
          <ReqItem label="Формат работы" value={mr.workMode} edit={edit} onChange={(v) => patch("minimalRequirements.workMode", v)} />
          <ReqItem label="Локации/офисы" value={mr.locationPreferred} edit={edit} onChange={(v) => patch("minimalRequirements.locationPreferred", v)} />
          <ReqItem
            label="Готовность к переезду"
            value={mr.relocationReady ? "Да" : "Не требуется"}
            edit={edit}
            onChange={(v) => patch("minimalRequirements.relocationReady", v.toLowerCase().startsWith("д"))}
          />
          <ReqItem label="Командировки" value={mr.businessTrips} edit={edit} onChange={(v) => patch("minimalRequirements.businessTrips", v)} />
          <ReqItem label="Языки" value={mr.languages} edit={edit} onChange={(v) => patch("minimalRequirements.languages", v)} />
          <ReqItem label="Опыт" value={mr.experience} edit={edit} onChange={(v) => patch("minimalRequirements.experience", v)} />
          <ReqItem label="Инструменты" value={mr.tools} edit={edit} onChange={(v) => patch("minimalRequirements.tools", v)} />
          <ReqItem label="Образование" value={mr.education} edit={edit} onChange={(v) => patch("minimalRequirements.education", v)} />
        </div>
      </Card>

      {/* Функции и задачи */}
      <Card className="p-5">
        <div className="text-base font-medium mb-3">Основные функции и задачи</div>
        {!edit ? (
          Array.isArray(model.responsibilities) && model.responsibilities.length ? (
            <ul className="text-sm list-disc list-inside space-y-1">
              {model.responsibilities.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-slate-500">—</div>
          )
        ) : (
          <ListEditor
            items={model.responsibilities || []}
            onChange={(arr) => patch("responsibilities", arr)}
            placeholder="Добавить пункт…"
          />
        )}
      </Card>

      {/* Карта компетенций — раскрывающиеся блоки с вопросами */}
      <Card className="p-5">
        <div className="text-base font-medium mb-3">Карта компетенций (уровни 1–4)</div>
        {!edit ? (
          <div className="divide-y divide-slate-200">
            {blocks.map((b) => (
              <CompetencyAccordion key={b.name} block={b} />
            ))}
          </div>
        ) : (
          <BlocksEditor blocks={blocks} onChange={(arr) => patch("competencyBlocks", arr)} />
        )}
        <div className="text-xs text-slate-500 mt-3">
          Уровень «эталона» — требуемый по роли. Вопросы применяются в интервью/360/ассессменте.
        </div>
      </Card>
    </div>
  );
}

function ReqItem({ label, value, edit, onChange }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3 bg-white dark:bg-slate-900">
      <div className="text-xs text-slate-500">{label}</div>
      {!edit ? <div className="text-sm">{value}</div> : <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />}
    </div>
  );
}

function CompetencyAccordion({ block }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <button className="w-full flex items-start justify-between gap-3 py-3 text-left" onClick={() => setOpen((v) => !v)}>
        <div className="min-w-0">
          <div className="font-medium">{block.name}</div>
          <div className="text-xs text-slate-500 line-clamp-2">{block.description}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge tone="indigo">{block.standardLevel}</Badge>
          <span className="text-slate-400">{open ? "▾" : "▸"}</span>
        </div>
      </button>

      {open && (
        <div className="mb-3 overflow-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-3 w-[40%]">Вопрос</th>
                <th className="text-left p-3">Индикатор (ур.1)</th>
                <th className="text-left p-3">ур.2</th>
                <th className="text-left p-3">ур.3</th>
                <th className="text-left p-3">ур.4</th>
              </tr>
            </thead>
            <tbody>
              {(block.questions || []).map((q, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="p-3">{q.text}</td>
                  <td className="p-3">{q.indicators?.[0] || "—"}</td>
                  <td className="p-3">{q.indicators?.[1] || "—"}</td>
                  <td className="p-3">{q.indicators?.[2] || "—"}</td>
                  <td className="p-3">{q.indicators?.[3] || "—"}</td>
                </tr>
              ))}
              {(!block.questions || block.questions.length === 0) && (
                <tr>
                  <td className="p-3 text-slate-500" colSpan={5}>
                    Нет вопросов — добавьте в карточке роли.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Вкладка «Подбор» (без изменений логики, но с экспортом)
------------------------------------------------------------------------- */

function HiringTab({ model, interview, test, ac }) {
  function downloadInterviewJSON() {
    exportJSON({ role: model.name, interview }, `${model.name.replace(/\s+/g, "_")}_interview.json`);
  }
  function downloadInterviewMD() {
    const md =
      `# Вопросы для интервью — ${model.name}\n\n` +
      interview
        .map(
          (q, i) =>
            `**${i + 1}. ${q.text}**\n\n• Цель: ${q.goal || "—"}\n\n• Что считаем сигналом: ${q.signal || "—"}\n`
        )
        .join("\n");
    exportMarkdown(md, `${model.name.replace(/\s+/g, "_")}_interview.md`);
  }

  function downloadTestJSON() {
    exportJSON({ role: model.name, test }, `${model.name.replace(/\s+/g, "_")}_test.json`);
  }
  function downloadTestMD() {
    const md =
      `# Тестовое задание — ${model.name}\n\n` +
      `**Цель:** ${test.objective || "—"}\n\n` +
      `**Таймбокс:** ${test.timeboxHours ?? "—"} ч\n\n` +
      `**Артефакты:**\n${(test.deliverables || []).map((d) => `- ${d}`).join("\n")}\n\n` +
      `**Критерии оценки:**\n${(test.evaluationCriteria || []).map((c) => `- ${c}`).join("\n")}\n`;
    exportMarkdown(md, `${model.name.replace(/\s+/g, "_")}_test.md`);
  }

  function downloadACJSON() {
    exportJSON({ role: model.name, assessmentCenter: ac }, `${model.name.replace(/\s+/g, "_")}_assessment_center.json`);
  }
  function downloadACMD() {
    const md =
      `# Ассессмент-центр — ${model.name}\n\n` +
      `**Рубрики/Оценочные листы:** ${ac.rubrics || "—"}\n\n` +
      `## Кейсы\n` +
      (ac.cases || [])
        .map(
          (c) =>
            `### ${c.title}\n- Длительность: ${c.durationMin} мин\n- Наблюдатели: ${(c.observersRoles || []).join(
              ", "
            )}\n- Компетенции: ${(c.competenciesObserved || []).join(", ")}\n`
        )
        .join("\n");
    exportMarkdown(md, `${model.name.replace(/\s+/g, "_")}_assessment_center.md`);
  }

  return (
    <div className="space-y-6">
      {/* Вопросы для интервью */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div className="font-medium">Вопросы для интервью</div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={downloadInterviewMD}>Скачать .md</Button>
            <Button variant="ghost" onClick={downloadInterviewJSON}>Скачать .json</Button>
          </div>
        </div>
        <ol className="mt-3 list-decimal list-inside space-y-2 text-sm">
          {interview.map((q, i) => (
            <li key={i}>
              <div className="font-medium">{q.text}</div>
              <div className="text-slate-600">Цель: {q.goal || "—"}</div>
              <div className="text-slate-600">Сигнал: {q.signal || "—"}</div>
            </li>
          ))}
        </ol>
      </Card>

      {/* Тестовое задание */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div className="font-medium">Тестовое задание</div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={downloadTestMD}>Скачать .md</Button>
            <Button variant="ghost" onClick={downloadTestJSON}>Скачать .json</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-3">
          <Field label="Цель" value={test.objective || "—"} />
          <Field label="Таймбокс (часы)" value={test.timeboxHours ?? "—"} />
          <Field label="Ожидаемые артефакты" value={(test.deliverables || []).map((d, i) => <li key={i}>{d}</li>)} list />
          <Field label="Критерии оценки" value={(test.evaluationCriteria || []).map((d, i) => <li key={i}>{d}</li>)} list />
        </div>
      </Card>

      {/* Ассессмент-центр */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div className="font-medium">Ассессмент-центр</div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={downloadACMD}>Скачать .md</Button>
            <Button variant="ghost" onClick={downloadACJSON}>Скачать .json</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-3">
          <div className="md:col-span-2">
            <div className="text-slate-500 mb-1">Кейсы</div>
            {(ac.cases || []).length ? (
              <ul className="list-disc list-inside space-y-1">
                {ac.cases.map((c, i) => (
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
            <div className="text-slate-500 mb-1">Рубрики/оценочные листы</div>
            <div>{ac.rubrics || "—"}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Общие мини-компоненты
------------------------------------------------------------------------- */

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-sm border ${
        active ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, value, list = false }) {
  return (
    <div>
      <div className="text-slate-500 mb-1">{label}</div>
      {list ? <ul className="list-disc list-inside">{value}</ul> : <div>{value}</div>}
    </div>
  );
}

function ListEditor({ items, onChange, placeholder = "Новый пункт…", label }) {
  const [list, setList] = React.useState(items || []);
  React.useEffect(() => setList(items || []), [items]);
  const set = (i, v) => {
    const next = [...list];
    next[i] = v;
    setList(next);
    onChange(next);
  };
  return (
    <div>
      {label && <div className="text-sm mb-2">{label}</div>}
      <div className="space-y-2">
        {list.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input value={it} onChange={(e) => set(i, e.target.value)} />
            <Button
              variant="ghost"
              onClick={() => {
                const next = list.filter((_, idx) => idx !== i);
                setList(next);
                onChange(next);
              }}
            >
              Удалить
            </Button>
          </div>
        ))}
        <Button
          variant="ghost"
          onClick={() => {
            const next = [...list, ""];
            setList(next);
            onChange(next);
          }}
        >
          + {placeholder}
        </Button>
      </div>
    </div>
  );
}

function BlocksEditor({ blocks, onChange }) {
  const [list, setList] = React.useState(blocks || []);
  React.useEffect(() => setList(blocks || []), [blocks]);

  function setBlock(i, patch) {
    const next = [...list];
    next[i] = { ...next[i], ...patch };
    setList(next);
    onChange(next);
  }
  function addBlock() {
    const next = [...list, { name: "Новая компетенция", description: "", standardLevel: 1, questions: [] }];
    setList(next);
    onChange(next);
  }
  function delBlock(i) {
    const next = list.filter((_, idx) => idx !== i);
    setList(next); onChange(next);
  }

  return (
    <div className="space-y-4">
      {list.map((b, i) => (
        <div key={i} className="rounded-xl border border-slate-200">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <Input className="w-64" value={b.name} onChange={(e) => setBlock(i, { name: e.target.value })} />
              <span className="text-xs text-slate-500">Эталон:</span>
              <Input className="w-16" type="number" value={b.standardLevel ?? 0} onChange={(e) => setBlock(i, { standardLevel: Number(e.target.value) })} />
            </div>
            <Button variant="ghost" onClick={() => delBlock(i)}>Удалить блок</Button>
          </div>

          <div className="px-3 pb-3">
            <Textarea rows={2} value={b.description || ""} onChange={(e) => setBlock(i, { description: e.target.value })} />

            <div className="overflow-auto rounded-lg border border-slate-200 mt-3">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-3 w-[42%]">Вопрос</th>
                    <th className="text-left p-3">ур.1</th>
                    <th className="text-left p-3">ур.2</th>
                    <th className="text-left p-3">ур.3</th>
                    <th className="text-left p-3">ур.4</th>
                    <th className="p-3 w-[80px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {(b.questions || []).map((q, qi) => (
                    <tr key={qi} className="border-t border-slate-100">
                      <td className="p-3">
                        <Input value={q.text} onChange={(e) => {
                          const qs = [...b.questions]; qs[qi] = { ...qs[qi], text: e.target.value }; setBlock(i, { questions: qs });
                        }} />
                      </td>
                      {Array.from({ length: 4 }).map((_, lvl) => (
                        <td key={lvl} className="p-3">
                          <Input
                            value={q.indicators?.[lvl] || ""}
                            onChange={(e) => {
                              const qs = [...b.questions];
                              const inds = [...(qs[qi].indicators || ["", "", "", ""])];
                              inds[lvl] = e.target.value;
                              qs[qi] = { ...qs[qi], indicators: inds };
                              setBlock(i, { questions: qs });
                            }}
                          />
                        </td>
                      ))}
                      <td className="p-3">
                        <Button variant="ghost" onClick={() => {
                          const qs = b.questions.filter((_, idx) => idx !== qi);
                          setBlock(i, { questions: qs });
                        }}>Удалить</Button>
                      </td>
                    </tr>
                  ))}
                  {(b.questions || []).length === 0 && (
                    <tr><td className="p-3 text-slate-500" colSpan={6}>—</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-2">
              <Button variant="ghost" onClick={() => {
                const qs = [...(b.questions || [])];
                qs.push({ text: "Новый вопрос", indicators: ["", "", "", ""] });
                setBlock(i, { questions: qs });
              }}>+ добавить вопрос</Button>
            </div>
          </div>
        </div>
      ))}

      <Button variant="ghost" onClick={addBlock}>+ добавить компетенцию</Button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Валидация / нормализация / история
------------------------------------------------------------------------- */

function validate(m) {
  const missing = [];
  if (!m.name?.trim()) missing.push("Название");
  if (!m.version?.trim()) missing.push("Версия");
  if (!m.division?.trim()) missing.push("Подразделение");
  const blocks = m.competencyBlocks && m.competencyBlocks.length ? m.competencyBlocks : generateCompetencyBlocks(m);
  if (!blocks.length) missing.push("Компетенции");
  return { ok: missing.length === 0, missing };
}

function normalizeForEdit(role) {
  return {
    id: role.id || `std_${(role.name || "role").replace(/\s+/g, "_")}`.toLowerCase(),
    name: role.name || "",
    version: role.version || "v1.0",
    division: role.division || "",
    status: role.status || "draft",
    goal: role.goal || "",
    responsibilities: Array.isArray(role.responsibilities) ? role.responsibilities : [],
    tags: Array.isArray(role.tags) ? role.tags : [],
    competencyMap: role.competencyMap || {},
    competencyBlocks: generateCompetencyBlocks(role),
    minimalRequirements: toMinimalRequirements(role),
    interview: { questions: toInterview(role) },
    testAssignment: toTestAssignment(role),
    assessmentCenter: toAssessmentCenter(role),
    updatedAt: role.updatedAt || new Date().toISOString().slice(0, 10),
    createdAt: role.createdAt || new Date().toISOString().slice(0, 10),
  };
}

function toCanonical(r) {
  const competencyMap = {};
  for (const b of r.competencyBlocks || []) competencyMap[b.name] = b.standardLevel ?? 0;
  return {
    id: r.id,
    name: r.name,
    version: r.version,
    division: r.division,
    status: r.status,
    goal: r.goal,
    responsibilities: r.responsibilities,
    kpi: r.kpi, // если использовались
    competencyMap,
    competencyBlocks: r.competencyBlocks,
    minimalRequirements: r.minimalRequirements,
    interview: r.interview,
    testAssignment: r.testAssignment,
    assessmentCenter: r.assessmentCenter,
    tags: r.tags,
    updatedAt: new Date().toISOString().slice(0, 10),
    createdAt: r.createdAt,
  };
}

function safeLoadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function pushHistory(key, snapshot, limit = 15) {
  try {
    const arr = safeLoadJSON(key, []);
    const next = [{ ts: Date.now(), snapshot }, ...arr].slice(0, limit);
    localStorage.setItem(key, JSON.stringify(next));
  } catch {}
}

function fmtTime(d) {
  try {
    return new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(d);
  } catch {
    return "";
  }
}

function HistoryDropdown({ historyKey, onRestore }) {
  const [open, setOpen] = React.useState(false);
  const history = safeLoadJSON(historyKey, []);
  if (!history.length) return null;
  return (
    <div className="relative">
      <Button variant="ghost" onClick={() => setOpen((v) => !v)}>История</Button>
      {open && (
        <div className="absolute z-20 mt-2 w-80 max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white p-2 shadow">
          {history.map((h, i) => (
            <button
              key={i}
              className="w-full text-left px-3 py-2 rounded hover:bg-slate-50"
              onClick={() => {
                onRestore(h.snapshot);
                setOpen(false);
              }}
            >
              Снимок от {new Date(h.ts).toLocaleString("ru-RU")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
