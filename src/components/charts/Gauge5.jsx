import React from "react";

export default function Gauge5({ actual, standard, compact=false }) {
  const left = (v)=> v==null ? "0%" : `${(Math.max(1, Math.min(5, v)) - 1)/4*100}%`;
  const has = (x)=> typeof x === "number";
  return (
    <div className={compact?"w-40":"w-56"}>
      <div className="relative h-2 bg-slate-100 rounded-full">
        {has(actual)&&has(standard) && (
          <div
            className="absolute h-2 rounded-full"
            style={{
              left: `min(${left(actual)}, ${left(standard)})`,
              width: `calc(max(${left(actual)}, ${left(standard)}) - min(${left(actual)}, ${left(standard)}))`,
              background: actual < standard ? "#fecaca" : "#bbf7d0",
            }}
          />
        )}
        {[1,2,3,4,5].map(t=>(
          <div key={t} className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-slate-300" style={{left:left(t)}} />
        ))}
        {has(standard) && (
          <div title={`Эталон: ${standard.toFixed(2)}`}
               className="absolute -top-1.5 -translate-x-1/2 w-3 h-3 rounded-full border border-white shadow"
               style={{left:left(standard), background:"#6366f1"}} />
        )}
        {has(actual) && (
          <div title={`360 факт: ${actual.toFixed(2)}`}
               className="absolute -bottom-1.5 -translate-x-1/2 w-3 h-3 rounded-full border border-white shadow"
               style={{left:left(actual), background:"#10b981"}} />
        )}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-slate-500">
        <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
      </div>
    </div>
  );
}
