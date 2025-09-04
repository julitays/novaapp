// src/features/employees/EmployeeProfileView.jsx
import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

import { Page } from "../../components/ui/Page.jsx";
import Card from "../../components/ui/Card.jsx";
import { Button, Badge } from "../../components/ui";
import RadarCompare from "../../components/charts/RadarCompare.jsx";

import { initialEmployees, initialRoles } from "../../lib/modules";
import { matchPercent } from "../../lib/analytics";

// ───────── helpers
const roleByName = (n) => initialRoles.find((r) => r.name === n) || initialRoles[0];
const unionKeys = (a = {}, b = {}) =>
  Array.from(new Set([...Object.keys(a || {}), ...Object.keys(b || {})]));

const Chip = ({ tone = "slate", children }) => {
  const map = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700",
    indigo: "bg-indigo-100 text-indigo-700",
  };
  return <span className={`inline-block text-xs px-2 py-0.5 rounded ${map[tone]}`}>{children}</span>;
};

function Avatar({ user, size = 96 }) {
  const name = user?.name || "";
  const initials = name.split(" ").map(w=>w[0]).filter(Boolean).slice(0,2).join("").toUpperCase();
  const url = user?.photoUrl || user?.avatar;
  return url ? (
    <img src={url} alt={name} className="rounded-2xl object-cover" style={{width:size, height:size}} />
  ) : (
    <div
      className="rounded-2xl grid place-items-center text-white font-medium"
      style={{width:size, height:size, background:"linear-gradient(135deg,#6366f1 0%,#10b981 100%)"}}
    >
      {initials || "●"}
    </div>
  );
}
function formatTenure(startStr){
  if(!startStr) return "—";
  const d=new Date(startStr); if(Number.isNaN(+d)) return "—";
  const now=new Date();
  let m=(now.getFullYear()-d.getFullYear())*12+(now.getMonth()-d.getMonth());
  if(now.getDate()<d.getDate()) m--;
  const y=Math.floor(m/12), mm=m%12;
  return (y?`${y} г. `:"")+(mm?`${mm} мес.`:"") || "меньше месяца";
}

// inline-editable поле с автосохранением
function EditableField({ label, value, onChange, placeholder="—" }) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value ?? "");
  React.useEffect(() => setDraft(value ?? ""), [value]);

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-slate-500">{label}</span>
      {!editing ? (
        <button className="text-left hover:underline" onClick={()=>setEditing(true)} title="Редактировать">
          {value?.trim() ? value : <span className="text-slate-400">{placeholder}</span>}
        </button>
      ) : (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            className="text-sm rounded border border-slate-300 px-2 py-1 w-44"
            value={draft}
            onChange={(e)=>setDraft(e.target.value)}
            onKeyDown={(e)=>{ if(e.key==="Enter"){ onChange(draft.trim()); setEditing(false);} if(e.key==="Escape"){ setEditing(false);} }}
          />
          <Button variant="ghost" onClick={()=>{onChange(draft.trim()); setEditing(false);}}>OK</Button>
          <Button variant="ghost" onClick={()=>setEditing(false)}>Отмена</Button>
        </div>
      )}
    </div>
  );
}

// компактный timeline переходов
function CareerTimeline({ history=[] }) {
  if (!history.length) return <div className="text-sm text-slate-500">История переходов не указана.</div>;
  return (
    <ol className="relative pl-5 text-sm">
      <span className="absolute left-2 top-0 bottom-0 w-px bg-slate-200" />
      {history.map((h, i)=>(
        <li key={i} className="mb-3">
          <div className="relative">
            <span className="absolute -left-[10px] top-1 w-2 h-2 rounded-full bg-indigo-500" />
            <div className="font-medium">{h.role}</div>
            <div className="text-slate-500">
              {h.from || "—"} {h.to ? `→ ${h.to}` : ""}
              {h.department ? ` · ${h.department}` : ""}
            </div>
            {h.note && <div className="text-slate-600">{h.note}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}

function deriveStrengthsAndGaps(emp, role, topN=3){
  const keys = unionKeys(role?.competencies, emp?.competencies);
  const tuples = keys.map(k=>{
    const std=role?.competencies?.[k]??0, val=emp?.competencies?.[k]??0;
    return {k,std,val,diff:val-std};
  });
  return {
    strengths: tuples.filter(t=>t.diff>=0).sort((a,b)=>b.diff-a.diff||b.val-a.val).slice(0,topN)
      .map(t=>({name:t.k, hint:t.diff>0?`>${t.std}`:`=${t.std}`})),
    gaps: tuples.filter(t=>t.diff<0).sort((a,b)=>a.diff-b.diff).slice(0,topN)
      .map(t=>({name:t.k, missing:t.std-t.val})),
  };
}
function Stat({label,value,sub,bar}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {sub && <div className="text-xs mt-0.5">{sub}</div>}
      {typeof bar === "number" && (
        <div className="mt-2 h-1.5 rounded bg-slate-100">
          <div className="h-1.5 rounded bg-indigo-500" style={{width:`${bar}%`}} />
        </div>
      )}
    </div>
  );
}

// ───────── component
export default function EmployeeProfileView() {
  const navigate = useNavigate();
  const params = useParams();
  const loc = useLocation();

  const byState = loc.state?.emp;
  const byId = initialEmployees.find((e) => String(e.id) === String(params.id));
  const baseEmp = byState || byId || initialEmployees[0];

  // локальные редактируемые поля (autosave per employee)
  const STORE_KEY = `novaapp_emp_profile_${baseEmp.id}`;
  const stored = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); } catch { return {}; }
  }, [STORE_KEY]);

  const [empExtra, setEmpExtra] = React.useState({
    city: baseEmp.city || baseEmp.region || stored.city || "",
    languages: baseEmp.languages || stored.languages || "",
    contacts: baseEmp.email || baseEmp.phone || stored.contacts || "",
  });
  React.useEffect(()=>{ localStorage.setItem(STORE_KEY, JSON.stringify(empExtra)); }, [empExtra, STORE_KEY]);

  const emp = { ...baseEmp, city: empExtra.city, languages: empExtra.languages, contacts: empExtra.contacts };

  const currentRole = roleByName(emp?.title);
  const suitability = matchPercent(emp, currentRole);

  const assessments = emp?.assessments || [];
  const last = assessments[assessments.length - 1];
  const prev = assessments[assessments.length - 2];
  const delta = last && prev ? last.percent - prev.percent : 0;

  const manager =
    emp?.managerName ||
    initialEmployees.find((x) => String(x.id) === String(emp?.managerId))?.name ||
    "—";

  const bio = emp?.bio || "5 лет в FMCG; работа с федеральными сетями; сильные стороны — коммуникация и дисциплина.";
  const clientReview = emp?.clientReview || "Клиент отмечает стабильную коммуникацию и инициативность.";
  const managerReview = emp?.managerReview || "Усилить переговорный блок и кейсовую аналитику.";

  const startedAtRole = emp?.startedAtRole || emp?.startedAtCurrentRole || emp?.startedAt;
  const tenure = formatTenure(startedAtRole);

  // История карьеры (если нет — сделаем мягкий фолбэк)
  const career = emp?.careerHistory && emp.careerHistory.length
    ? emp.careerHistory
    : [
        { role: emp.title, from: startedAtRole || "—", to: "", department: emp.department },
        { role: emp.prevTitle || "RM", from: "2022-01-01", to: startedAtRole || "—", department: emp.prevDepartment || emp.department, note: "внутреннее повышение" },
      ];

  const { strengths, gaps } = deriveStrengthsAndGaps(emp, currentRole);

  const summaryLine =
    gaps.length === 0
      ? `По компетенциям не ниже эталона «${currentRole.name}». Можно расширять зону ответственности.`
      : `Зоны роста: ${gaps.map(g=>`${g.name} (−${g.missing})`).join(", ")} — сфокусировать развитие под «${currentRole.name}».`;

  const renderLevelCell = (stdLvl=0, empLvl=0) => {
    const gap = stdLvl - empLvl;
    if (gap <= 0) return <Chip tone="green">{empLvl} ✓</Chip>;
    if (gap === 1) return <Chip tone="amber">{empLvl} (−1)</Chip>;
    return <Chip tone="rose">{empLvl} (−{gap})</Chip>;
  };

  // экшены паспорта
  const emailHref = emp?.email ? `mailto:${emp.email}` : null;
  const openManager = () => {
    const m = initialEmployees.find(x => x.name === manager) ||
              initialEmployees.find(x => String(x.id) === String(emp.managerId));
    if (m) navigate(`/employees/${m.id}`);
  };

  return (
    <Page
      title={emp?.name || "Сотрудник"}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => window.print()}>Сгенерировать ИПР (PDF)</Button>
          <Button variant="ghost" onClick={() => navigate(-1)}>Назад</Button>
        </div>
      }
      subtitle={
        <span className="text-slate-600">
          {emp?.title} · {emp?.department} · {emp.city || emp.region || "—"} · Соответствие текущей роли: <b>{suitability}%</b>{" "}
          <Badge tone={delta >= 0 ? "green" : "rose"}>{delta >= 0 ? `+${delta}%` : `${delta}%`} к прошлой</Badge>
        </span>
      }
    >
      {/* Двухколоночный макет */}
      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-4">
        {/* LEFT: Паспорт (sticky) */}
        <aside className="xl:sticky xl:top-20 self-start">
          <Card className="p-4">
            {/* header */}
            <div className="flex items-center gap-3">
              <Avatar user={emp} />
              <div className="leading-snug">
                <div className="text-base font-semibold text-slate-900">{emp?.name}</div>
                <div className="text-[12px] text-slate-600 mt-0.5">Руководитель</div>
                <div className="text-sm text-slate-800">{manager}</div>
              </div>
            </div>

            {/* actions */}
            <div className="mt-3 flex items-center gap-2">
              <Button variant="outline" onClick={openManager}>Профиль руководителя</Button>
              <Button
                variant="outline"
                onClick={() => emailHref ? window.location.assign(emailHref) : alert("E-mail не указан")}
              >
                Написать
              </Button>
            </div>

            {/* паспорт с инлайновым редактированием */}
            <div className="mt-4 rounded-xl border border-slate-200 p-3 text-sm space-y-2">
              <EditableField
                label="Департамент"
                value={emp?.department || "—"}
                onChange={()=>{}}
              />
              <EditableField
                label="Отдел/команда"
                value={emp?.subDepartment || emp?.team || ""}
                onChange={()=>{}}
                placeholder="уточнить"
              />
              <EditableField
                label="Город"
                value={empExtra.city}
                onChange={(v)=>setEmpExtra(s=>({ ...s, city: v }))}
                placeholder="добавить"
              />
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Стаж в роли</span>
                <span>{tenure}</span>
              </div>
              <EditableField
                label="Языки"
                value={empExtra.languages}
                onChange={(v)=>setEmpExtra(s=>({ ...s, languages: v }))}
                placeholder="RU, EN…"
              />
              <EditableField
                label="Контакты"
                value={empExtra.contacts}
                onChange={(v)=>setEmpExtra(s=>({ ...s, contacts: v }))}
                placeholder="email/телефон"
              />
            </div>

            {/* strengths/gaps */}
            <div className="mt-3">
              <div className="text-xs text-slate-500 mb-1">Сильные стороны</div>
              <div className="flex flex-wrap gap-1.5">
                {strengths.length ? strengths.map(s=>(
                  <Chip key={s.name} tone="green">{s.name} {s.hint}</Chip>
                )) : <span className="text-xs text-slate-500">—</span>}
              </div>
            </div>
            <div className="mt-2">
              <div className="text-xs text-slate-500 mb-1">Зоны роста</div>
              <div className="flex flex-wrap gap-1.5">
                {gaps.length ? gaps.map(g=>(
                  <Chip key={g.name} tone="amber">{g.name} (−{g.missing})</Chip>
                )) : <span className="text-xs text-slate-500">—</span>}
              </div>
            </div>

            {/* био */}
            <div className="mt-3 text-sm leading-relaxed text-slate-700">
              <span className="font-medium">Био:</span> {bio}
            </div>

            {/* timeline */}
            <div className="mt-4">
              <div className="text-xs text-slate-500 mb-1">История переходов</div>
              <CareerTimeline history={career} />
            </div>
          </Card>
        </aside>

        {/* RIGHT: Контентные панели */}
        <div className="space-y-4">
          {/* Радар + статы */}
          <Card className="p-4">
            <div className="mb-3">
              <div className="font-medium">Эталон «{currentRole.name}» vs сотрудник</div>
            </div>
            <RadarCompare
              role={{ name: currentRole.name, competencies: currentRole.competencies }}
              employee={emp}
              height={360}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <Stat label="Соответствие текущей роли" value={`${suitability}%`} bar={suitability} />
              <Stat
                label="Последняя оценка"
                value={last ? `${last.percent}%` : "—"}
                sub={<span className={delta>=0?"text-green-600":"text-rose-600"}>{delta>=0?`+${delta}%`:`${delta}%`} к предыдущей</span>}
              />
              <Stat
                label="Ассессмент"
                value={assessments.length ? "Есть" : "Нет"}
                sub={assessments.length ? `замеров: ${assessments.length}` : "запланируйте"}
              />
            </div>
          </Card>

          {/* Динамика оценок */}
          <Card className="p-4">
            <div className="font-medium mb-2">Динамика оценок</div>
            {assessments.length === 0 ? (
              <div className="text-sm text-slate-500">Пока нет данных.</div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {assessments.slice().reverse().map((a, idx) => {
                  const next = assessments[assessments.length - 1 - idx - 1];
                  const d = next ? a.percent - next.percent : 0;
                  return (
                    <li key={a.date} className="py-2 flex items-center justify-between">
                      <div className="text-sm">
                        <div className="font-medium">{a.date}</div>
                        <div className="text-slate-500">Итоговая оценка</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{a.percent}%</div>
                        <div className={`text-xs ${d>=0?"text-green-600":"text-rose-600"}`}>
                          {d>=0?`+${d}%`:`${d}%`} к предыдущей
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {/* Отзывы */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="font-medium mb-1">ОС от клиента</div>
                <p className="text-sm text-slate-700 leading-relaxed">{clientReview}</p>
              </div>
              <div>
                <div className="font-medium mb-1">ОС от руководителя</div>
                <p className="text-sm text-slate-700 leading-relaxed">{managerReview}</p>
              </div>
            </div>
          </Card>

          {/* Таблица сравнения */}
          <Card className="overflow-auto">
            <div className="p-4 pb-0 font-medium">Сопоставление по компетенциям (текущая роль)</div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="text-left p-3 w-[44%]">Компетенция</th>
                  <th className="text-left p-3">Эталон (ур.)</th>
                  <th className="text-left p-3">Сотрудник</th>
                </tr>
              </thead>
              <tbody>
                {unionKeys(currentRole.competencies, emp.competencies).map((c, i) => {
                  const stdLvl = currentRole.competencies?.[c] ?? 0;
                  const empLvl = emp.competencies?.[c] ?? 0;
                  return (
                    <tr key={c} className={i%2?"bg-slate-50/50":""}>
                      <td className="p-3">{c}</td>
                      <td className="p-3"><Chip tone="indigo">{stdLvl}</Chip></td>
                      <td className="p-3">{renderLevelCell(stdLvl, empLvl)}</td>
                    </tr>
                  );
                })}
                <tr className="border-t border-slate-200 bg-slate-50">
                  <td className="p-3 font-medium">Итог (соответствие роли)</td>
                  <td className="p-3" />
                  <td className="p-3">
                    <div className="font-semibold">{suitability}%</div>
                    <div className="h-1.5 rounded bg-slate-100 mt-1">
                      <div className="h-1.5 rounded bg-indigo-400" style={{width:`${suitability}%`}} />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>

          {/* Выжимка */}
          <Card className="p-4">
            <div className="text-slate-500 text-xs mb-1">Краткая выжимка</div>
            <div className="text-sm text-slate-700">{summaryLine}</div>
          </Card>
        </div>
      </div>
    </Page>
  );
}
