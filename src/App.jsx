import React, { useState } from "react";
import {
  DashboardView,
  SearchView,
  EmployeeProfileView,
  RolesListView,
  RoleProfileView,
  CompareView,
  CreateRoleAIView,
  OrgStructureView,
  EmployeesListView,
} from "./ui-screens";

import { initialRoles, initialEmployees, Button, Input } from "./modules";

// --- Auth (Login) -----------------------------------------------------------
function LoginView({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-lg border border-slate-200 dark:border-slate-800">
        <div className="mb-6 text-center">
          <div className="text-2xl font-semibold">RoleMaster</div>
          <div className="text-slate-500 dark:text-slate-400 text-sm mt-1">Вход в систему</div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </div>
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300">Пароль</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button onClick={() => onLogin({ email })}>Войти</Button>
        </div>
      </div>
    </div>
  );
}

// --- Shell with dark toggle --------------------------------------------------
function Shell({ current, setCurrent, children }) {
  const [dark, setDark] = React.useState(() => localStorage.getItem("theme") === "dark");
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const nav = [
    ["Дашборд", "dashboard"],
    ["Роли", "roles"],
    ["Сотрудники", "employees"],
    ["Сравнение", "compare"],
    ["Структура", "org"],
    ["Создать эталон (AI)", "createRoleAI"],
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-slate-800/80 backdrop-blur border-b border-slate-200 dark:border-slate-700">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600" />
            <div className="font-semibold">RoleMaster</div>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            {nav.map(([label, view]) => (
              <button
                key={view}
                onClick={() => setCurrent(view)}
                className={`px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 ${
                  current === view ? "bg-slate-100 dark:bg-slate-700 font-medium" : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => setDark((d) => !d)}
              className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-sm"
              title="Тёмная тема"
            >
              {dark ? "🌙" : "☀️"}
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}

// --- App --------------------------------------------------------------------
export default function App() {
  const [authed, setAuthed] = useState(false);
  const [view, setView] = useState("dashboard");
  const [roles, setRoles] = useState(initialRoles);
  const [employees] = useState(initialEmployees);
  const [payload, setPayload] = useState(null);
  const [searchResult, setSearchResult] = useState([]);

  function go(next) {
    if (typeof next === "string") {
      setPayload(null);
      setView(next);
    } else if (typeof next === "object") {
      setPayload(next.payload ?? null);
      setView(next.view);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!authed) return <LoginView onLogin={() => setAuthed(true)} />;

  return (
    <Shell current={view} setCurrent={go}>
      {view === "dashboard" && <DashboardView go={go} />}

      {view === "search" && (
        <SearchView
          go={go}
          roles={roles}
          setSearchResult={(r) => {
            setSearchResult(r);
            go("searchResults");
          }}
        />
      )}

      {view === "searchResults" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Результаты поиска</h2>
            <button
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
              onClick={() => go("search")}
            >
              Изменить фильтры
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {searchResult.map((e) => (
              <CandidateCard key={e.id} emp={e} onOpen={() => go({ view: "employee", payload: e })} />
            ))}
            {searchResult.length === 0 && <div className="text-slate-500">Нет результатов</div>}
          </div>
        </div>
      )}

      {view === "employee" && payload && <EmployeeProfileView emp={payload} go={go} roles={roles} />}

      {view === "roles" && <RolesListView roles={roles} go={go} />}

      {view === "role" && payload && <RoleProfileView role={payload} go={go} />}

      {view === "compare" && <CompareView roles={roles} />}

      {view === "createRoleAI" && <CreateRoleAIView roles={roles} setRoles={setRoles} />}

      {view === "org" && <OrgStructureView go={go} />}

      {view === "employees" && <EmployeesListView go={go} />}
    </Shell>
  );
}
