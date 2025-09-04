import React from "react";

export default function Textarea({
  value,
  onChange,
  rows = 4,
  className = "",
  ...props
}) {
  return (
    <textarea
      value={value ?? ""}
      onChange={onChange}
      rows={rows}
      className={
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 " +
        "text-sm text-slate-900 placeholder-slate-400 " +
        "focus:outline-none focus:ring-2 focus:ring-indigo-200 " +
        "dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 " +
        className
      }
      {...props}
    />
  );
}
