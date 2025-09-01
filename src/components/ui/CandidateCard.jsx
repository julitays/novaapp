import React from "react";

export default function CandidateCard({ emp, onOpen }) {
  return (
    <div
      onClick={onOpen}
      className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow hover:shadow-md transition cursor-pointer bg-white dark:bg-slate-800"
    >
      <div className="font-semibold">{emp.name}</div>
      <div className="text-sm text-slate-500 dark:text-slate-400">{emp.title || emp.role}</div>
      <div className="mt-2">Готовность: {emp.readiness?.percent ?? 0}%</div>
    </div>
  );
}
