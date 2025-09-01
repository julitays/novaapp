import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { initialEmployees } from "../../lib/modules";
import { Input, Select, Button } from "../../components/ui";

function Card({ e, onOpen }) {
  return (
    <div onClick={onOpen} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow hover:shadow-md transition cursor-pointer bg-white dark:bg-slate-800">
      <div className="font-semibold">{e.name}</div>
      <div className="text-sm text-slate-500 dark:text-slate-400">{e.title}</div>
      <div className="mt-2">Готовность: {e.readiness?.percent ?? 0}%</div>
    </div>
  );
}

export default function EmployeesListView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [q, setQ] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("Все");
  const [readyFilter, setReadyFilter] = React.useState("Все"); // Все | Готовы (≥70%) | Ещё развиваться

  // инициализация из URL: ?role=KAM&readiness=ready|grow
  React.useEffect(() => {
    const urlRole = searchParams.get("role");
    const urlReady = searchParams.get("readiness");
    if (urlRole) setRoleFilter(urlRole);
    if (urlReady === "ready") setReadyFilter("Готовы (≥70%)");
    if (urlReady === "grow")  setReadyFilter("Ещё развиваться");
    const urlQ = searchParams.get("q");
    if (urlQ) setQ(urlQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // только при первом монтировании

  const list = initialEmployees
    .filter((e) => roleFilter === "Все" || e.title === roleFilter)
    .filter((e) => {
      if (readyFilter === "Все") return true;
      const pct = e.readiness?.percent ?? 0;
      return readyFilter === "Готовы (≥70%)" ? pct >= 70 : pct < 70;
    })
    .filter((e) =>
      [e.name, e.title, e.department, e.region].join(" ").toLowerCase().includes(q.toLowerCase())
    );

  // синхронизируем URL при ручном изменении фильтров
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (roleFilter && roleFilter !== "Все") params.set("role", roleFilter);
    if (readyFilter !== "Все") params.set("readiness", readyFilter === "Готовы (≥70%)" ? "ready" : "grow");
    if (q) params.set("q", q);
    const qs = params.toString();
    const url = qs ? `/employees?${qs}` : "/employees";
    // не дёргаем историю при каждом символе — легкая оптимизация
    window.history.replaceState(null, "", url);
  }, [roleFilter, readyFilter, q]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Сотрудники</h2>
        <div className="flex items-center gap-2">
          <Input placeholder="Поиск: имя/роль/регион…" value={q} onChange={(e) => setQ(e.target.value)} className="w-64" />
          <Select value={roleFilter} onChange={setRoleFilter} options={["Все", "TM", "RM", "KAM", "GKAM (Electronics)", "Руководитель отдела обучения"]} />
          <Select value={readyFilter} onChange={setReadyFilter} options={["Все", "Готовы (≥70%)", "Ещё развиваться"]} />
          <Button variant="ghost" onClick={() => alert("Экспорт CSV (демо)")}>Экспорт CSV</Button>
          <Button onClick={() => alert("Добавление сотрудника (демо)")}>Добавить сотрудника</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((e) => (
          <Card key={e.id} e={e} onOpen={() => navigate(`/employees/${e.id}`)} />
        ))}
        {list.length === 0 && <div className="text-slate-500">Пусто по заданным условиям</div>}
      </div>
    </div>
  );
}
