// src/components/layout/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const nav = [
  { to: "/org",          label: "Структура",        icon: "org" },
  { to: "/roles",        label: "Эталон ролей",     icon: "roles" },
  // Важно: ведём на /development (редиректит на /development/standard).
  // Ссылку на /development/manual намеренно НЕ показываем в сайдбаре.
  { to: "/development",  label: "Развитие",         icon: "dev" },
  { to: "/succession",   label: "Кадровый резерв",  icon: "succ" },
  { to: "/employees",    label: "Сотрудники",       icon: "users" },
  { to: "/settings",     label: "Настройки",        icon: "settings" },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-white border-r border-slate-100">
      {/* logo / brand */}
      <div className="h-14 px-4 border-b border-slate-100 flex items-center gap-2">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-card" />
        <div className="font-semibold text-slate-900">novaapp</div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {nav.map((i) => (
          <NavLink
            key={i.to}
            to={i.to}
            end={i.to === "/org" || i.to === "/roles" || i.to === "/succession" || i.to === "/employees" || i.to === "/settings" ? true : false}
            className={({ isActive }) =>
              [
                "group flex items-center gap-3 px-3 py-2 rounded-2xl transition",
                "border border-transparent",
                isActive
                  ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              ].join(" ")
            }
            title={i.label}
          >
            <Icon name={i.icon} className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
            <span className="text-sm">{i.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* footer */}
      <div className="p-3">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
          <div className="text-xs text-slate-600">Версия</div>
          <div className="text-sm font-semibold">MVP • {new Date().getFullYear()}</div>
        </div>
      </div>
    </aside>
  );
}

function Icon({ name, className = "" }) {
  const common = { className, fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "org":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 6V3M12 6l4 3M12 6L8 9" />
          <rect x="3" y="9" width="6" height="5" rx="1" />
          <rect x="15" y="9" width="6" height="5" rx="1" />
          <rect x="9" y="16" width="6" height="5" rx="1" />
        </svg>
      );
    case "roles":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <rect x="3" y="4" width="18" height="6" rx="2" />
          <rect x="3" y="14" width="10" height="6" rx="2" />
          <path d="M19 17h2M19 21h2" />
        </svg>
      );
    case "dev":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M8 8l-4 4 4 4M16 8l4 4-4 4" />
        </svg>
      );
    case "succ":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="8" cy="8" r="3" />
          <path d="M4 20v-1a4 4 0 014-4h0" />
          <circle cx="17" cy="13" r="3" />
          <path d="M13 21a4 4 0 018 0v0" />
        </svg>
      );
    case "users":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M16 11a4 4 0 10-8 0 4 4 0 008 0z" />
          <path d="M3 21a7 7 0 0118 0" />
        </svg>
      );
    case "settings":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.17a1.65 1.65 0 00-1 1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 008 4.6 1.65 1.65 0 009 3.09V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9c.57 0 1.1.24 1.47.63.38.39.6.92.6 1.47s-.22 1.08-.6 1.47A1.99 1.99 0 0019.4 15z" />
        </svg>
      );
    default:
      return <svg viewBox="0 0 24 24" {...common}><circle cx="12" cy="12" r="4" /></svg>;
  }
}
