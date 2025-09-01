import React from "react";
import {
  ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend
} from "recharts";

export default function RadarCompare({ data }) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius={120} margin={{ right: 16 }}>
          <PolarGrid />
          <PolarAngleAxis dataKey="competency" tick={{ fontSize: 12, fill: "currentColor" }} />
          <PolarRadiusAxis angle={30} domain={[0, 4]} tick={{ fontSize: 11, fill: "currentColor" }} />
          <Radar name="Эталон" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
          <Radar name="Сотр." dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
          <Legend />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
