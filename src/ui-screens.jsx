
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



const LABELS = { peers:"Коллеги", reports:"Подчинённые", manager:"Руководитель", self:"Самооценка" };

/* среднее по группе для компетенции */
function meanByGroup(comp) {
  const groups = Object.keys(LABELS);
  const out = {};
  for (const g of groups) {
    let sum=0, n=0;
    for (const q of comp.questions) {
      const v = q.scores?.[g];
      if (typeof v === "number") { sum += v; n++; }
    }
    if (n) out[g] = sum / n;
  }
  return out;
}

/* взвешенный итог (по доступным группам) */
function weightedOverall(comp, weights) {
  const g = meanByGroup(comp);
  let wsum=0, s=0;
  for (const k of Object.keys(g)) {
    const w = Number(weights[k] ?? 0);
    s += g[k] * w;
    wsum += w;
  }
  return wsum ? (s / wsum) : null;
}

/* разброс восприятия между группами */
function stdBetweenGroups(comp) {
  const g = meanByGroup(comp);
  const vals = Object.values(g);
  if (vals.length <= 1) return 0;
  const m = vals.reduce((a,b)=>a+b,0)/vals.length;
  const v = vals.reduce((a,b)=>a+(b-m)*(b-m),0)/(vals.length-1);
  return Math.sqrt(v);
}

/* self vs внешние */
function calcSelfDelta(comp) {
  const g = meanByGroup(comp);
  if (g.self == null) return null;
  const ext = [g.peers, g.reports, g.manager].filter(x=>x!=null);
  if (!ext.length) return null;
  const extMean = ext.reduce((a,b)=>a+b,0)/ext.length;
  return g.self - extMean;
}

/* карточка компетенции 360 */
function Competency360Card({ comp, groups, overall, std, selfDelta, roleStd5 }) {
  const [open, setOpen] = React.useState(false);
  const disagreement =
    std < 0.15 ? { label:"согласованно", tone:"green" } :
    std < 0.35 ? { label:"умеренное расхождение", tone:"amber" } :
                 { label:"высокое расхождение", tone:"rose" };

  const chips = [
    ["Коллеги", groups.peers],
    ["Подчинённые", groups.reports],
    ["Руководитель", groups.manager],
    ["Самооценка", groups.self],
  ];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <button onClick={()=>setOpen(v=>!v)} className="w-full p-4 flex items-center justify-between gap-3 text-left">
        <div className="min-w-0">
          <div className="font-medium">{comp.name}</div>
          <div className="text-xs text-slate-500 truncate">{comp.anchor}</div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Gauge5 actual={overall} standard={roleStd5} />
          <div className="flex items-center gap-1">
            {chips.map(([label, val]) => (
              <span key={label} className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                {label}: <b>{val!=null?val.toFixed(2):"—"}</b>
              </span>
            ))}
          </div>
          <Badge tone={disagreement.tone}>{disagreement.label}</Badge>
          {selfDelta!=null && (
            <Badge tone={selfDelta>=0 ? "slate" : "rose"}>
              Δ self vs внешние: {selfDelta>=0?`+${selfDelta.toFixed(2)}`:selfDelta.toFixed(2)}
            </Badge>
          )}
        </div>
        <div className="md:hidden"><Gauge5 actual={overall} standard={roleStd5} compact /></div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {/* мобильные чипы */}
          <div className="md:hidden flex flex-wrap gap-2">
            {chips.map(([label, val]) => (
              <span key={label} className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                {label}: <b>{val!=null?val.toFixed(2):"—"}</b>
              </span>
            ))}
            <Badge tone={disagreement.tone}>{disagreement.label}</Badge>
            {selfDelta!=null && <Badge tone={selfDelta>=0 ? "slate" : "rose"}>Δ self: {selfDelta>=0?`+${selfDelta.toFixed(2)}`:selfDelta.toFixed(2)}</Badge>}
          </div>

          <Heatmap360 comp={comp} />

          <div className="rounded-xl border border-amber-200 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 text-sm">
            <b>Рекомендация:</b>{" "}
            {overall!=null && roleStd5!=null && overall < roleStd5
              ? `Добрать ~${(roleStd5 - overall).toFixed(2)} по «${comp.name}». Сфокусируйся на вопросах с наименьшими оценками (см. теплокарту).`
              : `Поддерживать текущий уровень по «${comp.name}». Для устойчивости снизить разброс между группами.`}
            <div className="mt-2">
              <Button variant="ghost" onClick={()=>alert("Добавлено в ИПР (демо)")}>Добавить в ИПР</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ====== Импорт Excel: лениво подгружаем XLSX с CDN и парсим в наш формат */
async function handleImportExcel(e, setData360) {
  const file = e.target.files?.[0];
  if (!file) return;
  const XLSX = await ensureXLSX();
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });

  // ищем строку заголовка: содержит "Компетенция" или "Компетенция/Вопрос"
  let head = 0;
  for (let i=0;i<rows.length;i++){
    const line = rows[i].map(String);
    if (line.join(" ").toLowerCase().includes("компетенция")) { head = i; break; }
  }
  const header = (rows[head]||[]).map(s=>String(s||"").trim());
  const idxC = header.findIndex(h=>/компетенция/i.test(h));
  const idxPeers = header.findIndex(h=>/коллег/i.test(h));
  const idxSelf = header.findIndex(h=>/само/i.test(h));
  const idxRep = header.findIndex(h=>/подчин/i.test(h));
  const idxMgr = header.findIndex(h=>/руковод/i.test(h));

  const out = [];
  let current = null;

  for (let i=head+1; i<rows.length; i++){
    const r = rows[i] || [];
    const cell = String(r[idxC] ?? "").trim();
    const hasScores = [idxPeers, idxRep, idxMgr, idxSelf].some(ix => r[ix] != null && r[ix] !== "");
    const toNum = (x)=> x==null || x==="" ? undefined : Number(x);

    if (cell && !hasScores) {
      // имя компетенции (строка-заголовок блока)
      current = { name: cell, anchor: "", questions: [] };
      out.push(current);
    } else if (current && (cell || hasScores)) {
      // вопрос в рамках текущей компетенции
      current.questions.push({
        question: cell || `Вопрос ${current.questions.length+1}`,
        scores: {
          peers: toNum(r[idxPeers]),
          reports: toNum(r[idxRep]),
          manager: toNum(r[idxMgr]),
          self: toNum(r[idxSelf]),
        }
      });
    }
  }

  setData360(out);
  e.target.value = ""; // сброс инпута, чтобы можно было перезаливать тот же файл
}

// динамическая подгрузка XLSX из CDN
function ensureXLSX() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/xlsx@0.19.3/dist/xlsx.full.min.js";
    s.onload = () => resolve(window.XLSX);
    s.onerror = () => reject(new Error("Не удалось загрузить XLSX с CDN"));
    document.body.appendChild(s);
  });
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
