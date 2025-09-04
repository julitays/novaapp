import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { initialEmployees } from "../../lib/modules";
import { Page } from "../../components/ui/Page.jsx";
import Card from "../../components/ui/Card.jsx";
import { Input, Select, Button, Badge } from "../../components/ui";
import StatWidget from "../../components/ui/StatWidget.jsx";

function EmployeeCard({ e, onOpen }) {
  return (
    <Card>
      <button
        onClick={onOpen}
        className="w-full text-left p-4 rounded-3xl hover:bg-slate-50 transition"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">{e.name}</div>
            <div className="text-sm text-slate-500">{e.title}</div>
          </div>
          <Badge tone={e.readiness?.percent >= 70 ? "green" : "slate"}>
            {e.readiness?.percent ?? 0}%
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
          {e.department && <span className="px-2 py-0.5 rounded bg-slate-100">{e.department}</span>}
          {e.region && <span className="px-2 py-0.5 rounded bg-slate-100">{e.region}</span>}
        </div>
      </button>
    </Card>
  );
}

export default function EmployeesListView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [q, setQ] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("Все");
  const [readyFilter, setReadyFilter] = React.useState("Все"); // Все | Готовы (≥70%) | Ещё развиваться

  // инициализация из URL
  React.useEffect(() => {
    const urlRole = searchParams.get("role");
    const urlReady = searchParams.get("readiness");
    const urlQ = searchParams.get("q");
    if (urlRole) setRoleFilter(urlRole);
    if (urlReady === "ready") setReadyFilter("Готовы (≥70%)");
    if (urlReady === "grow") setReadyFilter("Ещё развиваться");
    if (urlQ) setQ(urlQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = initialEmployees
    .filter((e) => roleFilter === "Все" || e.title === roleFilter)
    .filter((e) => {
      if (readyFilter === "Все") return true;
      const pct = e.readiness?.percent ?? 0;
      return readyFilter === "Готовы (≥70%)" ? pct >= 70 : pct < 70;
    })
    .filter((e) =>
      [e.name, e.title, e.department, e.region]
        .join(" ")
        .toLowerCase()
        .includes(q.toLowerCase())
    );

  // синхронизируем URL при изменении фильтров
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (roleFilter && roleFilter !== "Все") params.set("role", roleFilter);
    if (readyFilter !== "Все")
      params.set("readiness", readyFilter === "Готовы (≥70%)" ? "ready" : "grow");
    if (q) params.set("q", q);
    const qs = params.toString();
    const url = qs ? `/employees?${qs}` : "/employees";
    window.history.replaceState(null, "", url);
  }, [roleFilter, readyFilter, q]);

  // быстрые пресеты готовности
  const setPreset = (type) => {
    if (type === "all") setReadyFilter("Все");
    if (type === "ready") setReadyFilter("Готовы (≥70%)");
    if (type === "grow") setReadyFilter("Ещё развиваться");
  };

  const readyCount = initialEmployees.filter(
    (e) => (e.readiness?.percent ?? 0) >= 70
  ).length;

  return (
    <Page
      title="Сотрудники"
      actions={
        <>
          <Button variant="ghost" onClick={() => alert("Экспорт CSV (демо)")}>
            Экспорт CSV
          </Button>
          <Button onClick={() => alert("Добавление сотрудника (демо)")}>
            Добавить сотрудника
          </Button>
        </>
      }
    >
      {/* верхняя панель фильтров + метрики */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        <StatWidget title="Всего в списке" value={list.length} accent="brand" />
        <StatWidget title="Готовы (≥70%)" value={readyCount} accent="emerald" />
        <StatWidget
          title="Фильтр роли"
          value={roleFilter === "Все" ? "—" : roleFilter}
          accent="indigo"
        />
        <Card className="p-4">
          <div className="text-xs text-slate-500 mb-2">Быстрые пресеты</div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setPreset("all")}>
              Все
            </Button>
            <Button variant="outline" onClick={() => setPreset("ready")}>
              Готовы
            </Button>
            <Button variant="outline" onClick={() => setPreset("grow")}>
              Ещё развиваться
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-4 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <Input
            placeholder="Поиск: имя / роль / регион…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="lg:w-72"
          />
          <Select
            value={roleFilter}
            onChange={setRoleFilter}
            options={[
              "Все",
              "TM",
              "RM",
              "KAM",
              "GKAM (Electronics)",
              "Руководитель отдела обучения",
            ]}
          />
          <Select
            value={readyFilter}
            onChange={setReadyFilter}
            options={["Все", "Готовы (≥70%)", "Ещё развиваться"]}
          />

          <div className="ml-auto text-sm text-slate-500">
            Найдено: <span className="font-medium text-slate-900">{list.length}</span>
          </div>
        </div>
      </Card>

      {/* список карточек */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((e) => (
          <EmployeeCard key={e.id} e={e} onOpen={() => navigate(`/employees/${e.id}`)} />
        ))}
        {list.length === 0 && (
          <div className="text-slate-500">Пусто по заданным условиям.</div>
        )}
      </div>
    </Page>
  );
}
