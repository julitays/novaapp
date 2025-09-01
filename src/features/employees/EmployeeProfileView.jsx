import React from "react";
import { useParams } from "react-router-dom";
import { initialEmployees, initialRoles } from "../../lib/modules";
import { matchPercent, toRadarData, LABELS, meanByGroup, weightedOverall, stdBetweenGroups, calcSelfDelta, level4to5 } from "../../lib/analytics";
import { RadarCompare, Gauge5, Heatmap360 } from "../../components/charts";
import { Button, Badge } from "../../components/ui";
import { parse360Excel } from "../../lib/importers/parse360Excel";
import { exportCSV } from "../../lib/exporters/exportCSV";

export default function EmployeeProfileView() {
  const { id } = useParams();
  const emp = initialEmployees.find(e => String(e.id) === String(id)) || initialEmployees[0];

  const byName = Object.fromEntries(initialRoles.map(r => [r.name, r]));
  const currentRole = byName[emp?.title] || initialRoles[0];

  const readinessCurrent = matchPercent(emp, currentRole);
  const assessments = emp?.assessments ?? [];
  const last = assessments[assessments.length - 1];
  const prev = assessments[assessments.length - 2];
  const delta = last && prev ? last.percent - prev.percent : 0;
  const passedAssessment = assessments.length > 0;

  const radarData = toRadarData(currentRole, emp.competencies);
  const bio = emp?.bio || "Краткая биография: 5 лет в FMCG; сильные стороны — коммуникация и дисциплина.";

  const storageKey = `novaapp360_${emp.id}`;
  const [data360, setData360] = React.useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });
  React.useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data360 || []));
  }, [data360]);

  const PRESETS = {
    equal: { peers: 1, reports: 1, manager: 1, self: 1 },
    manager40: { peers: 0.3, reports: 0.3, manager: 0.8, self: 0.2 },
    peers40: { peers: 0.8, reports: 0.4, manager: 0.4, self: 0.2 },
    custom: { peers: 1, reports: 1, manager: 1, self: 0.5 },
  };
  const [preset, setPreset] = React.useState("equal");
  const [weights, setWeights] = React.useState(PRESETS.equal);
  React.useEffect(() => { if (preset !== "custom") setWeights(PRESETS[preset]); }, [preset]);

  function export360() {
    const header = ["Компетенция","Коллеги","Подчинённые","Руководитель","Самооценка","Среднее","Эталон роли (1–5)"];
    const rows = [header].concat(
      (data360||[]).map(c=>{
        const g = meanByGroup(c);
        const total = Object.values(g).length ? (Object.values(g).reduce((a,b)=>a+b,0)/Object.values(g).length) : null;
        const std5 = level4to5(currentRole.competencies?.[c.name] ?? 0);
        const fmt = (x)=> x==null ? "—" : x.toFixed(2);
        return [c.name, fmt(g.peers), fmt(g.reports), fmt(g.manager), fmt(g.self), fmt(total), fmt(std5)];
      })
    );
    exportCSV(rows, `${emp.name.replace(/\s+/g,"_")}_360.csv`);
  }

  return (
    <div className="space-y-6">
      {/* шапка */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <div className="flex flex-col gap-3">
          <div className="text-2xl font-semibold">{emp?.name}</div>
          <div className="text-slate-500 dark:text-slate-400 text-sm">
            Роль: <b>{emp?.title}</b> · Отдел: {emp?.department} · Регион: {emp?.region}
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{bio}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Соответствие текущей роли" value={`${readinessCurrent}%`} tone="green" />
            <Stat label="Последняя оценка" value={emp?.lastAssessment || "—"} />
            <Stat label="Ассессмент" value={passedAssessment ? "Проходил(а)" : "Нет"} tone={passedAssessment ? "indigo" : "slate"} />
            <Stat label="Δ к прошлой" value={(delta>0?`+${delta}`:delta)+"%"} tone={delta>=0?"green":"rose"} />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => window.print()}>Сгенерировать ИПР (PDF)</Button>
            <Button variant="ghost" onClick={export360}>Экспорт 360 (CSV)</Button>
          </div>
        </div>
      </div>

      {/* сравнение по компетенциям */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="font-medium mb-2">Соответствие компетенций текущей роли: {currentRole.name}</div>
        <RadarCompare data={radarData} />
      </div>

      {/* панель оценок */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="font-medium mb-3">Оценки и ассессмент</div>
        <div className="text-sm space-y-2">
          <Row label="Статус ассессмента" value={<Badge tone={passedAssessment ? "green" : "slate"}>{passedAssessment ? "Проходил(а)" : "Нет данных"}</Badge>} />
          <Row label="Последняя дата оценки" value={emp?.lastAssessment || "—"} />
          {last && <Row label="Последний %" value={`${last.percent}%`} />}
          {prev && <Row label="Предыдущий %" value={`${prev.percent}%`} />}
          <Row label="Динамика к прошлому" value={<span className={`font-medium ${delta>=0?"text-green-600":"text-rose-600"}`}>{delta>0?`+${delta}%`:`${delta}%`}</span>} />
        </div>
      </div>

      {/* 360° блок */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-medium">360° оценка (шкала 1–5; эталон роли приведён к 1–5)</div>
          <div className="flex items-center gap-2">
            <select value={preset} onChange={(e)=>setPreset(e.target.value)} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm px-2 py-1">
              <option value="equal">Равные веса</option>
              <option value="manager40">Менеджер 40%</option>
              <option value="peers40">Коллеги 40%</option>
              <option value="custom">Кастом</option>
            </select>
            {preset === "custom" && (
              <div className="hidden md:flex items-center gap-2 text-xs">
                {["peers","reports","manager","self"].map(k=>(
                  <label key={k} className="flex items-center gap-1">
                    {LABELS[k]}
                    <input type="number" step="0.1" min="0" className="w-16 rounded border border-slate-200 dark:border-slate-700 px-1 py-0.5" value={weights[k] ?? 0} onChange={(e)=>setWeights({...weights, [k]: Number(e.target.value)})} />
                  </label>
                ))}
              </div>
            )}
            <label className="cursor-pointer text-sm px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
              Импорт 360 (Excel)
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={async (e)=>{
                const f = e.target.files?.[0]; if (!f) return;
                const parsed = await parse360Excel(f);
                setData360(parsed);
                e.target.value = "";
              }} />
            </label>
          </div>
        </div>

        {(!data360 || data360.length === 0) && (
          <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            Нет данных 360. Загрузите Excel — мы распарсим и построим теплокарты.
          </div>
        )}

        {data360?.map((comp) => {
          const g = meanByGroup(comp);
          const overall = weightedOverall(comp, weights);
          const std = stdBetweenGroups(comp);
          const selfDelta = calcSelfDelta(comp);
          const roleStd5 = level4to5(currentRole.competencies?.[comp.name] ?? 0);
          const disagreement =
            std < 0.15 ? { label:"согласованно", tone:"green" } :
            std < 0.35 ? { label:"умеренное расхождение", tone:"amber" } :
                         { label:"высокое расхождение", tone:"rose" };

          return (
            <div key={comp.name} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="w-full p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium">{comp.name}</div>
                  <div className="text-xs text-slate-500 truncate">{comp.anchor}</div>
                </div>
                <div className="hidden md:flex items-center gap-3">
                  <Gauge5 actual={overall} standard={roleStd5} />
                  <div className="flex items-center gap-1">
                    {Object.entries(g).map(([label, val]) => (
                      <span key={label} className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        {LABELS[label]}: <b>{val!=null?val.toFixed(2):"—"}</b>
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
              </div>
              <div className="px-4 pb-4 space-y-4">
                <Heatmap360 comp={comp} />
                <div className="rounded-xl border border-amber-200 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 text-sm">
                  <b>Рекомендация:</b>{" "}
                  {overall!=null && roleStd5!=null && overall < roleStd5
                    ? `Добрать ~${(roleStd5 - overall).toFixed(2)} по «${comp.name}». Сфокусируйся на вопросах с наименьшими оценками.`
                    : `Поддерживать текущий уровень по «${comp.name}». Снизить разброс между группами.`}
                  <div className="mt-2">
                    <Button variant="ghost" onClick={()=>alert("Добавлено в ИПР (демо)")}>Добавить в ИПР</Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    indigo: "bg-indigo-100 text-indigo-700",
    green: "bg-green-100 text-green-700",
    rose: "bg-rose-100 text-rose-700",
  };
  return (
    <div className={`rounded-xl px-3 py-2 text-sm ${tones[tone] || tones.slate}`}>
      <div className="text-xs opacity-80">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-slate-600 dark:text-slate-300">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
