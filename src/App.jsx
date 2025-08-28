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
  CandidateCard,
  initialRoles as rolesSeed,
} from "./ui-screens";

// --- Minimal local UI (login/header) ----------------------------------------
const Button = ({ children, onClick, variant = "primary" }) => {
  const base = "px-4 py-2 rounded-xl text-sm font-medium transition";
  const styles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    ghost:   "bg-white dark:bg-white border border-slate-200 dark:border-slate-700 text-slate-900 hover:bg-slate-50",
  };
  return <button onClick={onClick} className={`${base} ${styles[variant]}`}>{children}</button>;
};

const Input = (props) => (
  <input
    {...props}
    className={`w-full rounded-xl border border-slate-200 dark:border-slate-700
                bg-white dark:bg-white text-slate-900 dark:text-slate-900
                placeholder-slate-400 px-3 py-2 text-sm outline-none
                focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-300 ${props.className ?? ""}`}
  />
);

// --- Error Boundary ----------------------------------------------------------
class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { hasError:false, error:null }; }
  static getDerivedStateFromError(error){ return { hasError:true, error }; }
  componentDidCatch(error, info){ console.error("[Render error]", error, info); }
  render(){
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">Проблема при рендере страницы</h2>
          <pre className="whitespace-pre-wrap text-sm text-rose-600">{String(this.state.error && this.state.error.message || this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-slate-800/80 backdrop-blur border-b border-slate-200 dark:border-slate-700">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600" />
            <div className="font-semibold">RoleMaster</div>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            {[
              ["Дашборд", "dashboard"],
              ["Роли", "roles"],
              ["Сотрудники", "employees"],
              ["Сравнение", "compare"],
              ["Структура", "org"],
              ["Создать эталон (AI)", "createRoleAI"],
            ].map(([label, view]) => (
              <button
                key={view}
                onClick={() => setCurrent(view)}
                className={`px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 ${current === view ? "bg-slate-100 dark:bg-slate-700 font-medium" : "text-slate-600 dark:text-slate-300"}`}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => setDark(d => !d)}
              className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-sm"
              title="Тёмная тема"
            >
              {dark ? "🌙" : "☀️"}
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}

// --- Helper grid for searchResults reuse ------------------------------------
function EmployeesListLikeGrid({ list, roles, go }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {list.map((e) => (
        <CandidateCard
          key={e.id}
          emp={e}
          roleObj={roles.find((r) => r.name === (e.readiness?.targetRole || roles[0].name))}
          onOpen={() => go({ view: "employee", payload: e })}
        />
      ))}
      {list.length === 0 && <div className="text-slate-500">Нет результатов</div>}
    </div>
  );
}

// --- App --------------------------------------------------------------------
export default function App() {
  const [authed, setAuthed] = useState(false);
  const [view, setView] = useState("dashboard");
  const [roles, setRoles] = useState(rolesSeed);
  const [searchResult, setSearchResult] = useState([]);
  const [payload, setPayload] = useState(null);

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
          setSearchResult={(r) => { setSearchResult(r); go("searchResults"); }}
          roles={roles}
        />
      )}

      {view === "searchResults" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Результаты поиска</h2>
            <Button variant="ghost" onClick={() => go("search")}>Изменить фильтры</Button>
          </div>
          <EmployeesListLikeGrid list={searchResult} roles={roles} go={go} />
        </div>
      )}

      {view === "employee" && payload && (
        <EmployeeProfileView emp={payload} go={go} roles={roles} />
      )}

      {view === "roles" && <RolesListView roles={roles} go={go} />}

      {view === "role" && payload && <RoleProfileView role={payload} go={go} />}

      {view === "compare" && <CompareView roles={roles} />}

      {view === "createRoleAI" && <CreateRoleAIView roles={roles} setRoles={setRoles} />}

      {view === "org" && <OrgStructureView go={go} />}

      {view === "employees" && (
        <ErrorBoundary>
          <EmployeesListView go={go} />
        </ErrorBoundary>
      )}
    </Shell>
  );
}
