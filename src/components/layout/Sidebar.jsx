import React from "react";
import { NavLink } from "react-router-dom";
import Brand from "./Brand";
import { appRoutes } from "../../app/routes";

export default function Sidebar() {
  const navItems = appRoutes.filter(r => r.label);
  return (
    <aside className="hidden md:block w-60 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="p-4">
        <Brand />
      </div>
      <nav className="px-2 pb-4 space-y-1">
        {navItems.map(r => (
          <NavLink
            key={r.path}
            to={r.path}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition
               ${isActive
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200"
                  : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"}`
            }
          >
            <span className="w-5 text-center">{r.icon || "•"}</span>
            <span>{r.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
