import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "../ui";

export default function Topbar() {
  const location = useLocation();
  const title = routeTitle(location.pathname);

  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur border-b border-slate-100">
      <div className="h-14 px-4 md:px-6 flex items-center justify-between">
        {/* left: breadcrumb / title */}
        <div className="flex items-center gap-3 min-w-0">
          <Crumb />
          <h1 className="text-sm md:text-base font-semibold text-slate-900 truncate">{title}</h1>
        </div>

        {/* center: search (md+) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-6">
          <div className="relative w-full">
            <input
              type="search"
              placeholder="Поиск по сотрудникам, ролям, KPI…"
              className="w-full h-9 pl-9 pr-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
            />
            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* right: actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => document.dispatchEvent(new CustomEvent("novaapp:create"))}>
            Создать
          </Button>
          <Bell className="w-9 h-9 p-2 rounded-2xl bg-slate-50 text-slate-500 hover:text-slate-700 cursor-pointer" />
          <Link to="/settings" className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
            <Avatar />
          </Link>
        </div>
      </div>
    </header>
  );
}

function routeTitle(path) {
  if (path.startsWith("/org")) return "Структура";
  if (path.startsWith("/roles")) return "Эталон ролей";
  if (path.startsWith("/development")) return "Развитие";
  if (path.startsWith("/succession")) return "Кадровый резерв";
  if (path.startsWith("/employees")) return "Сотрудники";
  if (path.startsWith("/settings")) return "Настройки";
  return "novaapp";
}

function Crumb() {
  return (
    <div className="hidden md:flex items-center gap-2 text-slate-500">
      <Logo className="w-5 h-5" />
      <span className="text-xs">/</span>
    </div>
  );
}

function Logo({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7l8-4 8 4-8 4-8-4z" />
      <path d="M4 12l8 4 8-4" />
      <path d="M4 17l8 4 8-4" />
    </svg>
  );
}

function SearchIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-3.6-3.6" />
    </svg>
  );
}

function Bell({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

function Avatar() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 11a4 4 0 10-8 0 4 4 0 008 0z" />
      <path d="M3 21a7 7 0 0118 0" />
    </svg>
  );
}
