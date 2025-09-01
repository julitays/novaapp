import React from "react";

export default function WeakAreasCard({ data }) {
  const total = data.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <div className="text-slate-600 dark:text-slate-300 text-sm">Слабые зоны (топ-3)</div>
      <div className="mt-3 space-y-3">
        {data.map((row, i) => (
          <div key={row.name}>
            <div className="flex items-center justify-between text-sm">
              <div className="font-medium">{row.name}</div>
              <div className="text-slate-600 dark:text-slate-300">
                {Math.round((row.value / total) * 100)}%
              </div>
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
              <div
                className={`h-2 rounded-full ${
                  i === 0 ? "bg-rose-500" : i === 1 ? "bg-amber-500" : "bg-indigo-500"
                }`}
                style={{ width: `${(row.value / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
