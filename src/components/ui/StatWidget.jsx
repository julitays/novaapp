import Card from "./Card.jsx";

export default function StatWidget({ title, value, delta, accent="brand" }) {
  const trend = typeof delta === "number" && delta !== 0
    ? (delta > 0 ? `+${delta}%` : `${delta}%`)
    : null;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-slate-500">{title}</div>
          <div className="text-2xl font-semibold mt-1">{value}</div>
          {trend && (
            <div className={`text-xs mt-1 ${delta>0?'text-emerald-600':'text-rose-600'}`}>
              {trend} за месяц
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br from-${accent}-400 to-${accent}-600`} />
      </div>
    </Card>
  );
}
