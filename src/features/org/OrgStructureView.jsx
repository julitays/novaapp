// src/features/org/OrgStructureView.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { initialEmployees, initialVacancies } from "../../lib/modules";
import { buildOrgTree } from "../../lib/orgLevels";

import OrgTree from "../../components/tree/OrgTree";
import { Page } from "../../components/ui/Page.jsx";
import Card from "../../components/ui/Card.jsx";
import { Button, Input, Select, Badge } from "../../components/ui";

function uniq(arr) {
  return Array.from(new Set(arr.filter(Boolean)));
}

export default function OrgStructureView() {
  const navigate = useNavigate();

  // ── фильтры
  const roleOptions = ["Все", ...uniq(initialEmployees.map((e) => e.title))];
  const deptOptions = ["Все", ...uniq(initialEmployees.map((e) => e.department))];
  const unitOptions = ["Все", ...uniq(initialEmployees.map((e) => e.unit || e.team || e.section))];
  const mgrOptions  = ["Все", ...uniq(initialEmployees.map((e) => e.manager))];

  const [role, setRole] = useState("Все");
  const [dept, setDept] = useState("Все");
  const [unit, setUnit] = useState("Все");
  const [mgr,  setMgr]  = useState("Все");
  const [q,    setQ]    = useState("");

  // ── применяем фильтры к людям
  const people = useMemo(() => {
    return initialEmployees
      .filter(e => role === "Все" || e.title === role)
      .filter(e => dept === "Все" || e.department === dept)
      .filter(e => unit === "Все" || (e.unit || e.team || e.section) === unit)
      .filter(e => mgr  === "Все" || e.manager === mgr)
      .filter(e => `${e.name} ${e.title} ${e.department} ${e.region}`.toLowerCase()
        .includes(q.toLowerCase()));
  }, [role, dept, unit, mgr, q]);

  // ── метрика
  const headcount = people.length;

  // ── вакансии — те же фильтры
  const vacancies = useMemo(() => {
    return initialVacancies.filter(v =>
      (role === "Все" || v.role === role) &&
      (dept === "Все" || v.department === dept) &&
      (unit === "Все" || v.unit === unit) &&
      (mgr  === "Все" || v.manager === mgr)
    );
  }, [role, dept, unit, mgr]);

  // ── дерево строим только по отфильтрованным людям
  const tree = useMemo(() => buildOrgTree(people, { preferManagerId: true }), [people]);

  return (
    <Page
      title="Структура"
      subtitle="Фильтры по оргпризнакам, численность и актуальные вакансии"
      actions={
        <>
          <Button variant="outline" onClick={() => navigate("/employees")}>
            К сотрудникам
          </Button>
        </>
      }
    >
      {/* Фильтры + метрика */}
      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr_1fr_1fr_280px] gap-3">
          <div>
            <div className="text-sm mb-1">Должность</div>
            <Select value={role} onChange={setRole} options={roleOptions} />
          </div>
          <div>
            <div className="text-sm mb-1">Департамент</div>
            <Select value={dept} onChange={setDept} options={deptOptions} />
          </div>
          <div>
            <div className="text-sm mb-1">Отдел/направление</div>
            <Select value={unit} onChange={setUnit} options={unitOptions} />
          </div>
          <div>
            <div className="text-sm mb-1">Руководитель</div>
            <Select value={mgr} onChange={setMgr} options={mgrOptions} />
          </div>
          <div>
            <div className="text-sm mb-1">Поиск</div>
            <Input placeholder="Имя, регион, ключевые…" value={q} onChange={(e)=>setQ(e.target.value)} />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-500">Численность по фильтру</div>
            <div className="text-2xl font-semibold">{headcount}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-500">Подходящие вакансии</div>
            <div className="text-2xl font-semibold">{vacancies.length}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-500">Фильтр активен</div>
            <div className="text-sm mt-1 text-slate-700">
              {[
                role !== "Все" && `Роль: ${role}`,
                dept !== "Все" && `Департамент: ${dept}`,
                unit !== "Все" && `Отдел: ${unit}`,
                mgr  !== "Все" && `Рук.: ${mgr}`,
                q && `Поиск: «${q}»`,
              ].filter(Boolean).join(" · ") || "—"}
            </div>
          </div>
        </div>
      </Card>

      {/* Вакансии */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium">Вакансии (по активным фильтрам)</div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => alert("Импорт вакансий (демо)")}>Импорт</Button>
            <Button onClick={() => alert("Создание вакансии (демо)")}>Создать вакансию</Button>
          </div>
        </div>
        {vacancies.length === 0 ? (
          <div className="text-sm text-slate-500">Под фильтр ничего не попало.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {vacancies.map((v) => (
              <div key={v.id} className="rounded-xl border border-slate-200 p-3 bg-white">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{v.role}</div>
                  <Badge tone={v.status === "open" ? "green" : "slate"}>{v.status}</Badge>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {v.department}{v.unit ? ` · ${v.unit}` : ""}{v.manager ? ` · рук: ${v.manager}` : ""}
                </div>
                <div className="text-sm mt-2">Ставка: <b>{v.headcount}</b></div>
                <div className="text-xs text-slate-500">Локация: {v.location || "—"}</div>
                <div className="mt-2 flex gap-2">
                  <Button variant="ghost" onClick={() => alert("Открыть вакансию (демо)")}>Открыть</Button>
                  <Button variant="ghost" onClick={() => alert("Назначить подбор (демо)")}>Подбор</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Управление оргструктурой — заглушки */}
      <Card className="p-4 mb-4">
        <div className="font-medium mb-2">Управление структурой (демо)</div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => alert("Создать отдел (демо)")}>Создать отдел</Button>
          <Button variant="ghost" onClick={() => alert("Создать подразделение (демо)")}>Создать подразделение</Button>
          <Button variant="ghost" onClick={() => alert("Перевести сотрудника (демо)")}>Перевести сотрудника</Button>
        </div>
        <div className="text-xs text-slate-500 mt-2">
          На следующем шаге добавим drag-and-drop узлов, массовые операции и журнал изменений.
        </div>
      </Card>

      {/* Дерево организации — без цветовой дифференциации */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-medium">Дерево организации</div>
          <Input
            className="w-64"
            placeholder="Поиск в дереве…"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            title="Используется тот же поиск, что и в фильтрах наверху"
          />
        </div>

        {/* Важно: передаём только корни и НЕ передаём линзы/цвета */}
        <OrgTree
          roots={tree.rootNodes}
          onOpenEmployee={(id) => navigate(`/employees/${id}`)}
        />
      </Card>
    </Page>
  );
}
