import React from "react";
import Brand from "./Brand";

export default function Topbar() {
  return (
    <header className="md:hidden sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
      <div className="px-4 py-3 flex items-center justify-between">
        <Brand />
        <span className="text-xs text-slate-500">MVP</span>
      </div>
    </header>
  );
}
