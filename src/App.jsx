// App.jsx — главный каркас novaapp

import React, { useState } from "react";
import {
  OrgStructureView,
  RolesHubView,
  DevelopmentView,
  SuccessionView,
  DemoView,
  SettingsView,
  EmployeesListView,
  EmployeeProfileView,
  RoleDetailsView,
} from "./ui-screens";

import { initialRoles } from "./modules";

function NavItem({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm transition ${
        active
          ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
      }`}
    >
      {children}
    </button>
  );
}

export default function App() {
  // view: structure | roles | role | development | succession | demo | settings | employees | employee
  const [view, setView] = useState("structure");
  const [payload, setPayload] = useState(null);
  const [theme, setTheme] = useState("system"); // визуальная мелочь

  // универсальный роутер
  function go(arg) {
    if (typeof arg === "string") {
      setView(arg);
      setPayload(null);
    } else if (arg && typeof arg === "object") {
      if (arg.view) setView(arg.view);
      if ("payload" in arg) setPayload(arg.payload);
    }
    // прокрутка к началу для длинных страниц (карточка роли)
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      {/* Шапка */}
      <header className="sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-600" />
            <div className="font-semibold truncate">novaapp</div>
          </div>
          <nav className="flex items-center gap-1">
            <NavItem active={view === "structure"} onClick={() => go("structure")}>Структура</NavItem>
            <NavItem active={view === "roles"} onClick={() => go("roles")}>Эталон ролей</NavItem>
            <NavItem active={view === "development"} onClick={() => go("development")}>Развитие</NavItem>
            <NavItem active={view === "succession"} onClick={() => go("succession")}>Кадровый резерв</NavItem>
            <NavItem active={view === "demo"} onClick={() => go("demo")}>DEMO</NavItem>
            <NavItem active={view === "settings"} onClick={() => go("settings")}>Настройки</NavItem>
          </nav>
          <div className="flex items-center gap-2">
            <button
              title="Тема"
              onClick={() =>
                setTheme((t) => (t === "light" ? "dark" : t === "dark" ? "system" : "light"))
              }
              className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === "system" ? "🖥️" : theme === "light" ? "🌞" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      {/* Контент */}
      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {view === "structure" && <OrgStructureView go={go} />}

        {view === "roles" && <RolesHubView go={go} roles={initialRoles} />}

        {/* Карточка эталона роли (единая страница) */}
        {view === "role" && payload && <RoleDetailsView role={payload} go={go} />}

        {view === "development" && <DevelopmentView roles={initialRoles} />}

        {view === "succession" && <SuccessionView />}

        {view === "demo" && <DemoView />}

        {view === "settings" && <SettingsView />}

        {/* «Сотрудники» открываются только из «Структуры» */}
        {view === "employees" && <EmployeesListView go={go} />}

        {view === "employee" && payload && <EmployeeProfileView emp={payload} />}

        {/* Фолбэк — если по ошибке пришёл неизвестный view */}
        {[
          "structure",
          "roles",
          "role",
          "development",
          "succession",
          "demo",
          "settings",
          "employees",
          "employee",
        ].includes(view) || (
          <div className="text-sm text-slate-500">Экран не найден</div>
        )}
      </main>
    </div>
  );
}
