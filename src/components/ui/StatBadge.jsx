import React from "react";

export default function StatBadge({ label, value, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    indigo: "bg-indigo-100 text-indigo-700",
    green: "bg-green-100 text-green-700",
    rose: "bg-rose-100 text-rose-700",
  };
  return (
    <div className={`rounded-xl px-3 py-2 text-sm ${tones[tone] || tones.slate}`}>
      <div className="text-xs opacity-80">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
