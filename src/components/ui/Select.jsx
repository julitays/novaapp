import React from "react";

export default function Select({ options = [], value, onChange, className = "", ...props }) {
  const cls =
    "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 " +
    "text-slate-900 dark:text-slate-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-300";
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={`${cls} ${className}`}
      {...props}
    >
      {options.map((o) => (
        <option key={String(o)} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
