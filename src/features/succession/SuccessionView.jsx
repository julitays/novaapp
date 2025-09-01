import React from "react";
import { useNavigate } from "react-router-dom";
import { initialEmployees, initialRoles } from "../../lib/modules";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";

// простая агрегация «резерва» по ролям: считаем сколько людей с readiness>=70 к каждой роли
function buildReserveData() {
  const roleNames = initialRoles.map(r => r.name);
  const map = new Map(roleNames.map(n => [n, 0]));
  initialEmployees.forEach(e => {
    const target = e.readiness?.targetRole;
    const pct = e.readiness?.percent ?? 0;
    if (target && pct >= 70 && map.has(target)) {
      map.set(target, (map.get(target) || 0) + 1);
    }
  });
  return Array.from(map.entries()).map(([role, reserve]) => ({ role, reserve }));
}

export default function SuccessionView() {
  const navigate = useNavigate();

  const reserveData = buildReserveData();
  const readyCount = initialEmployees.filter(e => (e.readiness?.percent || 0) >= 70).length;
  const growCount  = initialEmployees.length - readyCount;

  const readyData = [
    { name: "Готовы (≥70%)", key: "ready", value: readyCount },
    { name: "Ещё развиваться", key: "grow",  value: growCount  },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Управление кадровым резервом</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Барчарт по резерву с кликом → фильтр по роли */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="font-medium mb-2">Резерв по ключевым ролям (кликабельно)</div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={reserveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="role" tick={{ fill: "currentColor" }} />
                <YAxis allowDecimals={false} tick={{ fill: "currentColor" }} />
                <Tooltip />
                <Bar dataKey="reserve" fill="#6366f1">
                  {reserveData.map((item, idx) => (
                    <Cell
                      key={item.role}
                      cursor="pointer"
                      onClick={() => navigate(`/employees?role=${encodeURIComponent(item.role)}`)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Подсказка: клик по столбцу — перейти к списку сотрудников, отфильтрованному по выбранной роли.
          </div>
        </div>

        {/* Пирог готовности с кликом → фильтр по readiness */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="font-medium mb-2">Готовность к переходу (кликабельно)</div>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={readyData} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                  {readyData.map((item) => (
                    <Cell
                      key={item.key}
                      fill={item.key === "ready" ? "#10b981" : "#e11d48"}
                      cursor="pointer"
                      onClick={() => navigate(`/employees?readiness=${item.key}`)}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Клик по сегменту — открыть сотрудников, кто уже готов, или кому ещё расти.
          </div>
        </div>

        {/* Простой список «узких мест» */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="font-medium mb-2">Быстрые действия</div>
          <ul className="text-sm space-y-2">
            {reserveData
              .filter(r => r.reserve === 0)
              .map(r => (
                <li key={r.role} className="flex items-center justify-between">
                  <span>⚠ Нет резерва: <b>{r.role}</b></span>
                  <button
                    className="text-indigo-600 hover:underline"
                    onClick={() => navigate(`/employees?role=${encodeURIComponent(r.role)}&readiness=grow`)}
                  >
                    найти кандидатов
                  </button>
                </li>
            ))}
            {reserveData.every(r => r.reserve > 0) && (
              <li className="text-slate-500">Пусто — резерв по ролям закрыт</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
