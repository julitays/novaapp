import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";

/** Собираем union всех компетенций и нормализуем числа (0..4) */
function buildData(roleMap = {}, empMap = {}) {
  const keys = Array.from(new Set([...Object.keys(roleMap), ...Object.keys(empMap)]));
  return keys.map((name) => ({
    name,
    standard: Number(roleMap[name] ?? 0),
    candidate: Number(empMap[name] ?? 0),
  }));
}

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const std = payload.find((p) => p.dataKey === "standard")?.value ?? 0;
  const cand = payload.find((p) => p.dataKey === "candidate")?.value ?? 0;
  const diff = (cand - std).toFixed(1);
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow text-xs">
      <div className="font-medium mb-1">{label}</div>
      <div>Эталон: <b>{std}</b> /4</div>
      <div>Кандидат: <b>{cand}</b> /4</div>
      <div className={diff >= 0 ? "text-emerald-600" : "text-rose-600"}>Δ {diff}</div>
    </div>
  );
}

/**
 * props:
 *  - role: { competencies: { [name]: level(0..4) }, name }
 *  - employee: { competencies: {}, name }
 *  - title, subtitle (опционально)
 *  - height (по умолчанию 320)
 */
export default function RadarCompare({ role, employee, title, subtitle, height = 320 }) {
  const data = useMemo(
    () => buildData(role?.competencies, employee?.competencies),
    [role, employee]
  );

  return (
    <div className="h-full">
      <div className="flex items-baseline justify-between mb-2">
        <div className="min-w-0">
          <div className="text-sm text-slate-500">
            Сравнение с эталоном <b>«{role?.name ?? "—"}»</b>
          </div>
          {subtitle && <div className="text-xs text-slate-400 truncate">{subtitle}</div>}
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "#6366f1" }} />
            Эталон
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "#10b981" }} />
            Кандидат
          </span>
        </div>
      </div>

      <div style={{ height }}>
        <ResponsiveContainer>
          <RadarChart data={data} outerRadius={110} margin={{ right: 16, left: 16 }}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: "currentColor" }} />
            <PolarRadiusAxis angle={30} domain={[0, 4]} tick={{ fontSize: 10, fill: "currentColor" }} />
            {/* Эталон — ФИОЛЕТОВЫЙ: видно всегда */}
            <Radar
              name="Эталон"
              dataKey="standard"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.25}
              isAnimationActive={false}
            />
            {/* Кандидат — ЗЕЛЕНЫЙ */}
            <Radar
              name="Кандидат"
              dataKey="candidate"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.25}
              isAnimationActive={false}
            />
            <Tooltip content={<Tip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
