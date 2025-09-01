import React, { useState } from "react";
import { initialRoles, initialEmployees } from "../../lib/modules";
import { toRadarData, matchPercent } from "../../lib/analytics";
import { RadarCompare } from "../../components/charts";
import { Select } from "../../components/ui";
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip
} from "recharts";

export default function DevelopmentView() {
  const [empId, setEmpId] = useState(initialEmployees[0].id);
  const [roleName, setRoleName] = useState(initialRoles[0].name);

  const emp = initialEmployees.find((e) => e.id === +empId || e.id === empId) || initialEmployees[0];
  const role = initialRoles.find((r) => r.name === roleName) || initialRoles[0];
  const percent = matchPercent(emp, role);
  const data = toRadarData(role, emp.competencies);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Развитие</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <div className="text-sm mb-1">Сотрудник</div>
          <select
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-white text-slate-900 dark:text-slate-900 px-3 py-2 text-sm"
            value={empId}
            onChange={(e) => setEmpId(e.target.value)}
          >
            {initialEmployees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} — {e.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="text-sm mb-1">Роль</div>
          <Select value={roleName} onChange={setRoleName} options={initialRoles.map((r) => r.name)} />
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="text-sm text-slate-500">Соответствие</div>
          <div className="text-3xl font-semibold">{percent}%</div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="font-medium mb-2">Радар-компетенции</div>
        <RadarCompare data={data} />
      </div>

      <div>
        <div className="font-medium mb-2">Динамика готовности</div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={emp.assessments ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="percent" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
