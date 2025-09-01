import React from "react";

export default function Badge({ children, tone = "slate", className = "" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    green: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300",
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300",
    indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
    rose: "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300",
  };
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded ${tones[tone] || tones.slate} ${className}`}>
      {children}
    </span>
  );
}
