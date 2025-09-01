import React from "react";

export default function Input({ className = "", ...props }) {
  const cls =
    "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 " +
    "text-slate-900 dark:text-slate-100 placeholder-slate-400 px-3 py-2 text-sm outline-none " +
    "focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-300";
  return <input className={`${cls} ${className}`} {...props} />;
}
