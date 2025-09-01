import React from "react";
import { LABELS } from "../../lib/analytics";

export default function Heatmap360({ comp }) {
  const groups = ["peers","reports","manager","self"];
  const labels = LABELS;
  const color = (v)=>{
    if (v==null) return "bg-slate-100";
    if (v < 2.5) return "bg-rose-200";
    if (v < 3.5) return "bg-amber-200";
    if (v < 4.3) return "bg-lime-200";
    return "bg-green-300";
  };
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
      <div className="text-sm text-slate-500 mb-2">Вопросы × Группы (1–5)</div>
      <div className="overflow-auto">
        <div className="min-w-[620px]">
          <div className="grid grid-cols-[1fr_repeat(4,130px)] gap-1">
            <div />
            {groups.map(g=> <div key={g} className="text-xs font-medium text-center py-1">{labels[g]}</div>)}
            {comp.questions.map((q, idx)=>{
              const ext = [q.scores?.peers, q.scores?.reports, q.scores?.manager].filter(x=>typeof x==="number");
              const extMean = ext.length? ext.reduce((a,b)=>a+b,0)/ext.length : null;
              const self = q.scores?.self;
              const selfGap = (typeof self==="number" && extMean!=null) ? Math.abs(self - extMean) : 0;
              const selfAlert = selfGap >= 0.6;
              return (
                <React.Fragment key={idx}>
                  <div className="text-xs px-2 py-1">{q.question}</div>
                  {groups.map(g=>{
                    const v = q.scores?.[g];
                    const isSelf = g==="self";
                    return (
                      <div
                        key={g}
                        className={`text-xs text-center px-2 py-1 rounded ${color(v)} ${isSelf && selfAlert ? "ring-2 ring-rose-400" : ""}`}
                        title={`${labels[g]}: ${v ?? "—"}`}
                      >
                        {v!=null ? v.toFixed(2) : "—"}
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
