// src/features/succession/SuccessionView.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

import { Page } from "../../components/ui/Page.jsx";
import Card from "../../components/ui/Card.jsx";
import { Button, Select, Input, Badge } from "../../components/ui";
import StatWidget from "../../components/ui/StatWidget.jsx";

import { initialEmployees, initialRoles } from "../../lib/modules";
import { matchPercent } from "../../lib/analytics";
import {
  loadVacancies,
  upsertVacancy,
  closeVacancy,
  createVacancyFromRole,
} from "../../lib/vacancies";

// ────────────────────────────────────────────────────────────────────────────
// Константы/утилиты
const READY_STRONG = 90;
const LS_RESERVE_KEY = "novaapp_reserve_ids";

function useReserveIds() {
  const [ids, setIds] = React.useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(LS_RESERVE_KEY) || "[]"));
    } catch {
      return new Set();
    }
  });
  const toggle = (id) => {
    setIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem(LS_RESERVE_KEY, JSON.stringify([...next]));
      return next;
    });
  };
  const has = (id) => ids.has(id);
  return { ids, has, toggle };
}

const roleByName = (n) => initialRoles.find((r) => r.name === n) || initialRoles[0];
const uniq = (arr) => Array.from(new Set(arr));
const daysSince = (iso) => {
  if (!iso) return 0;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
};

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

// ────────────────────────────────────────────────────────────────────────────

export default function SuccessionView() {
  const navigate = useNavigate();
  const { ids: reserveIds, has, toggle } = useReserveIds();

  // Вакансии
  const [vacancies, setVacancies] = React.useState(() => loadVacancies());

  // Фильтры
  const roleOptions = initialRoles.map((r) => r.name);
  const deptOptions = uniq(initialEmployees.map((e) => e.department)).filter(Boolean);

  const [targetRoleName, setTargetRoleName] = React.useState(roleOptions.includes("KAM") ? "KAM" : roleOptions[0]);
  const [deptFilter, setDeptFilter] = React.useState("Все");
  const [q, setQ] = React.useState("");

  const targetRole = roleByName(targetRoleName);

  // Резервисты (по звездочке из «Развития»)
  const reserveList = initialEmployees
    .filter((e) => reserveIds.has(e.id))
    .filter((e) => (deptFilter === "Все" ? true : e.department === deptFilter))
    .filter((e) => [e.name, e.title, e.department, e.region].join(" ").toLowerCase().includes(q.toLowerCase()))
    .map((e) => ({
      emp: e,
      percent: matchPercent(e, targetRole),
    }))
    .sort((a, b) => b.percent - a.percent);

  // Метрики по резерву
  const totalReserve = reserveList.length;
  const readyStrong = reserveList.filter((x) => x.percent >= READY_STRONG).length;
  const needGrow = totalReserve - readyStrong;

  // Метрики по вакансиям
  const openVac = vacancies.filter((v) => v.status === "open");
  const overdueVac = openVac.filter((v) => daysSince(v.openedAt) > 30);
  const criticalVac = openVac.filter((v) => v.priority === "critical");

  // Дельты «резерв vs вакансии» по ролям
  const openByRole = openVac.reduce((m, v) => {
    m[v.roleName] = (m[v.roleName] || 0) + (v.headcount || 1);
    return m;
  }, {});
  const readyByRole = reserveList
    .filter((x) => x.percent >= READY_STRONG)
    .reduce((m, r) => {
      const rn = targetRoleName; // считаем к выбранной целевой роли
      m[rn] = (m[rn] || 0) + 1;
      return m;
    }, {});
  const roleDeltas = Object.keys(openByRole).map((name) => {
    const open = openByRole[name];
    const ready = readyByRole[name] || 0;
    return { roleName: name, open, ready, delta: ready - open };
  });

  // Фильтры вакансий
  const [vacRoleFilter, setVacRoleFilter] = React.useState("Все");
  const [vacDeptFilter, setVacDeptFilter] = React.useState("Все");
  const [vacQ, setVacQ] = React.useState("");

  const vacRoleOptions = ["Все", ...uniq(vacancies.map((v) => v.roleName))];
  const vacDeptOptions = ["Все", ...uniq(vacancies.map((v) => v.department).filter(Boolean))];

  const filteredVacancies = vacancies
    .filter((v) => (vacRoleFilter === "Все" ? true : v.roleName === vacRoleFilter))
    .filter((v) => (vacDeptFilter === "Все" ? true : v.department === vacDeptFilter))
    .filter((v) => [v.id, v.title, v.roleName, v.department, v.location, v.status, v.priority]
      .join(" ")
      .toLowerCase()
      .includes(vacQ.toLowerCase()));

  const createVacancyQuick = () => {
    const out = createVacancyFromRole(targetRoleName);
    setVacancies(out);
  };

  return (
    <Page
      title="Кадровый резерв"
      subtitle={<span className="text-slate-600">Сводка по резерву vs потребности (вакансии)</span>}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate("/development")}>Перейти к подбору</Button>
          <Button onClick={createVacancyQuick}>Создать вакансию из роли</Button>
        </div>
      }
    >
      {/* ── Метрики */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        <StatWidget title="В резерве" value={String(totalReserve)} />
        <StatWidget title="Готовы к переходу (≥90%)" value={String(readyStrong)} accent="emerald" />
        <StatWidget title="Нуждаются в развитии" value={String(needGrow)} accent="indigo" />
        <StatWidget title="Открытых вакансий" value={String(openVac.length)} />
      </div>

      {/* ── Дефицит ролей (дельты) */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="font-medium">Дефицит по ролям (резерв vs открытые позиции)</div>
          <div className="text-xs text-slate-500">Целевая роль для сравнения: <b>{targetRoleName}</b></div>
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {roleDeltas.length === 0 ? (
            <div className="text-sm text-slate-500">Нет открытых позиций — дефицитов не найдено</div>
          ) : (
            roleDeltas
              .sort((a, b) => a.delta - b.delta)
              .slice(0, 6)
              .map((r) => (
                <div key={r.roleName} className="rounded-xl border border-slate-200 p-3 bg-white">
                  <div className="font-medium">{r.roleName}</div>
                  <div className="text-xs text-slate-500">Открыто: {r.open} · Готовы: {r.ready}</div>
                  <div className="mt-2">
                    {r.delta < 0 ? (
                      <Badge tone="rose">Нужны кандидаты ({r.delta})</Badge>
                    ) : r.delta === 0 ? (
                      <Badge tone="slate">Паритет</Badge>
                    ) : (
                      <Badge tone="green">Резерв покрывает (+{r.delta})</Badge>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
      </Card>

      {/* ── Фильтры по резерву */}
      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr] gap-3">
          <div>
            <div className="text-sm mb-1">Целевая роль (эталон для сравнения)</div>
            <Select value={targetRoleName} onChange={setTargetRoleName} options={roleOptions} />
          </div>
          <div>
            <div className="text-sm mb-1">Департамент</div>
            <Select value={deptFilter} onChange={setDeptFilter} options={["Все", ...deptOptions]} />
          </div>
          <div>
            <div className="text-sm mb-1">Поиск</div>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Имя, роль, регион…" />
          </div>
        </div>
      </Card>

      {/* ── Таблица резервистов (sticky шапка и первая колонка) */}
      <Card className="overflow-auto mb-6">
        <div className="p-4 pb-0 font-medium">Резервисты (клик по имени — профиль сотрудника)</div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="text-left p-3 w-[26%] sticky left-0 bg-slate-50">Сотрудник</th>
              <th className="text-left p-3 w-[12%]">Текущая роль</th>
              <th className="text-left p-3 w-[12%]">Департамент</th>
              <th className="text-left p-3 w-[12%]">Регион</th>
              <th className="text-left p-3 w-[14%]">Соответствие «{targetRoleName}»</th>
              <th className="text-left p-3 w-[18%]">Примечания</th>
              <th className="text-left p-3 w-[6%]">Действия</th>
            </tr>
          </thead>
          <tbody>
            {reserveList.length === 0 && (
              <tr>
                <td className="p-3 text-slate-500" colSpan={7}>В резерве пока пусто или не найдено по фильтрам</td>
              </tr>
            )}
            {reserveList.map(({ emp, percent }, i) => (
              <tr key={emp.id} className={i % 2 ? "bg-slate-50/50" : ""}>
                <td className="p-3 sticky left-0 bg-inherit">
                  <button
                    className="font-medium hover:underline"
                    onClick={() => navigate(`/employees/${emp.id}`, { state: { emp } })}
                    title="Открыть профиль"
                  >
                    {emp.name}
                  </button>
                  <div className="text-xs text-slate-500">{emp.yearsInRole ? `Стаж в роли: ${emp.yearsInRole} г.` : ""}</div>
                </td>
                <td className="p-3">{emp.title}</td>
                <td className="p-3">{emp.department}</td>
                <td className="p-3">{emp.region}</td>
                <td className="p-3">
                  <div className="font-semibold">{percent}%</div>
                  <div className="mt-1 h-1.5 rounded bg-slate-100">
                    <div className="h-1.5 rounded bg-indigo-500" style={{ width: `${percent}%` }} />
                  </div>
                </td>
                <td className="p-3">
                  {/* Короткая подсказка по отставаниям (2–3) */}
                  {hintGaps(emp, targetRole).length ? (
                    <div className="flex flex-wrap gap-1">
                      {hintGaps(emp, targetRole).map((g) => (
                        <Chip key={g} tone="amber">{g}</Chip>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <button
                      className="text-lg leading-none"
                      title="Убрать из резерва"
                      onClick={() => toggle(emp.id)}
                    >
                      <span className="text-amber-500">★</span>
                    </button>
                    <Button
                      variant="ghost"
                      onClick={() => navigate(`/development?target=${encodeURIComponent(targetRoleName)}`)}
                      title="Открыть подбор под роль"
                    >
                      Подбор
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* ── Блок «Вакансии»: карточки + фильтры + таблица (sticky шапка) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        <Card className="p-4">
          <div className="text-sm text-slate-500">Открытых позиций</div>
          <div className="text-2xl font-semibold">{openVac.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-500">Просрочено (&gt;30 дней)</div>
          <div className="text-2xl font-semibold">{overdueVac.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-500">Критичный приоритет</div>
          <div className="text-2xl font-semibold">{criticalVac.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-500">Быстрые действия</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button variant="ghost" onClick={createVacancyQuick}>Новая из «{targetRoleName}»</Button>
            <Button variant="ghost" onClick={() => setVacancies(loadVacancies())}>Обновить</Button>
          </div>
        </Card>
      </div>

      <Card className="p-4 mb-2">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr] gap-3">
          <div>
            <div className="text-sm mb-1">Роль</div>
            <Select value={vacRoleFilter} onChange={setVacRoleFilter} options={vacRoleOptions} />
          </div>
          <div>
            <div className="text-sm mb-1">Подразделение</div>
            <Select value={vacDeptFilter} onChange={setVacDeptFilter} options={vacDeptOptions} />
          </div>
          <div>
            <div className="text-sm mb-1">Поиск</div>
            <Input value={vacQ} onChange={(e) => setVacQ(e.target.value)} placeholder="ID, локация, статус, приоритет…" />
          </div>
        </div>
      </Card>

      <Card className="overflow-auto">
        <div className="p-4 pb-0 font-medium">Вакансии</div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="text-left p-3 w-[10%] sticky left-0 bg-slate-50">ID</th>
              <th className="text-left p-3 w-[20%]">Должность (Роль)</th>
              <th className="text-left p-3 w-[14%]">Подразделение</th>
              <th className="text-left p-3 w-[14%]">Локация</th>
              <th className="text-left p-3 w-[12%]">Приоритет</th>
              <th className="text-left p-3 w-[10%]">Статус</th>
              <th className="text-left p-3 w-[10%]">Открыта (дней)</th>
              <th className="text-left p-3 w-[10%]">h/c</th>
              <th className="text-left p-3 w-[10%]">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredVacancies.length === 0 && (
              <tr>
                <td className="p-3 text-slate-500" colSpan={9}>Вакансий не найдено по фильтрам</td>
              </tr>
            )}
            {filteredVacancies.map((v, i) => (
              <tr key={v.id} className={i % 2 ? "bg-slate-50/50" : ""}>
                <td className="p-3 sticky left-0 bg-inherit">{v.id}</td>
                <td className="p-3">
                  <div className="font-medium">{v.title}</div>
                  <div className="text-xs text-slate-500">{v.roleName}</div>
                </td>
                <td className="p-3">{v.department || "—"}</td>
                <td className="p-3">{v.location}</td>
                <td className="p-3">
                  {v.priority === "critical" ? <Badge tone="rose">critical</Badge> :
                   v.priority === "high" ? <Badge tone="amber">high</Badge> :
                   <Badge tone="slate">normal</Badge>}
                </td>
                <td className="p-3">
                  {v.status === "open" ? <Badge tone="green">open</Badge> :
                   v.status === "on_hold" ? <Badge tone="indigo">on&nbsp;hold</Badge> :
                   <Badge tone="slate">closed</Badge>}
                </td>
                <td className="p-3">{daysSince(v.openedAt)}</td>
                <td className="p-3">{v.headcount || 1}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => navigate(`/development?target=${encodeURIComponent(v.roleName)}`)}
                      title="Подобрать кандидатов"
                    >
                      Подобрать
                    </Button>
                    {v.status === "open" && (
                      <Button
                        variant="ghost"
                        onClick={() => setVacancies(closeVacancy(v.id))}
                        title="Закрыть вакансию"
                      >
                        Закрыть
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Page>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Подсказка по отставаниям — 2–3 ключевые компетенции, где сотрудник ниже эталона
function hintGaps(emp, role) {
  const std = role?.competencies || {};
  const empMap = emp?.competencies || {};
  const tuples = Object.keys(std).map((k) => ({ k, gap: (std[k] || 0) - (empMap[k] || 0) }));
  return tuples
    .filter((t) => t.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3)
    .map((t) => `${t.k} (−${t.gap})`);
}
