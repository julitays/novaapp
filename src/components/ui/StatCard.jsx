import React from "react";

export default function StatCard({ title, value, footer, onClick }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition"
    >
      <div className="text-slate-600 dark:text-slate-300 text-sm">{title}</div>
      <div className="text-3xl font-semibold mt-1 text-slate-900 dark:text-slate-50">{value}</div>
      {footer && <div className="text-slate-500 dark:text-slate-400 text-xs mt-2">{footer}</div>}
    </div>
  );
}
