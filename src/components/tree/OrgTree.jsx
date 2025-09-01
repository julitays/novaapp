// src/components/tree/OrgTree.jsx
import React from "react";
import { lensColor, subtreeCounters } from "../../lib/orgLevels";
import { Button, Input } from "../ui";

function useOpenMap() {
  const [open, setOpen] = React.useState(() => new Set());
  const toggle = (id) => setOpen((s) => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const isOpen = (id) => open.has(id);
  const openAll = () => setOpen(new Set(["__ALL__"])); // особый кейс
  return { isOpen, toggle, openAll, setOpen };
}

export default function OrgTree({ roots, onOpenEmployee, onFilter, lens = "readiness", query = "" }) {
  const { isOpen, toggle } = useOpenMap();
  const q = query.trim().toLowerCase();

  function match(node) {
    if (!q) return true;
    return [node.name, node.title, node.department, node.orgTag].filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q);
  }

  function Node({ node, depth = 0 }) {
    const hasKids = (node.children || []).length > 0;
    const open = isOpen(node.id) || q.length > 0; // при поиске раскрываем
    const tones = lensColor(node, lens);
    const { ready, grow } = subtreeCounters(node);

    // подсветка матчинга
    const title = `${node.title || "—"}${node.orgTag ? ` • ${node.orgTag}` : ""}`;
    const nameMarkup = q
      ? highlight(node.name, q)
      : node.name;

    return (
      <div className="my-1">
        <div className={`flex items-start gap-2 rounded-xl border ${tones.border} ${tones.bg} p-3`}>
          <div className="pt-0.5">
            {hasKids ? (
              <button
                aria-label="toggle"
                className="w-5 h-5 rounded border border-slate-300 text-xs leading-4"
                onClick={() => toggle(node.id)}
                title={open ? "Свернуть" : "Развернуть"}
              >
                {open ? "−" : "+"}
              </button>
            ) : (
              <span className="w-5 h-5 inline-block" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium truncate">{nameMarkup}</div>
                <div className="text-xs text-slate-600 dark:text-slate-300 truncate">{title}</div>
                {node.department && (
                  <div className="text-[11px] text-slate-500">Отдел: {node.department}</div>
                )}
              </div>
              <div className="shrink-0 text-xs">
                <span className={`inline-block rounded px-2 py-0.5 mr-1 ${tones.badge}`}>Готовы: {ready}</span>
                <span className="inline-block rounded px-2 py-0.5 bg-amber-100 text-amber-700">Расти: {grow}</span>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => onOpenEmployee?.(node.id)}>Открыть профиль</Button>
              <Button variant="ghost" onClick={() => onFilter?.({ role: node.title, readiness: "Готовы (≥70%)", q: node.department || "" })}>
                Показать готовых по роли
              </Button>
              <Button variant="ghost" onClick={() => onFilter?.({ role: node.title, readiness: "Ещё развиваться", q: node.department || "" })}>
                Кого прокачать
              </Button>
            </div>
          </div>
        </div>

        {hasKids && open && (
          <div className="ml-6 border-l border-slate-200 dark:border-slate-700 pl-3">
            {node.children.map((c) => (
              <Node key={c.id} node={c} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {roots.length === 0 ? (
        <div className="text-sm text-slate-500">Дерево пустое. Загрузите сотрудников или задайте orgTag/managerId.</div>
      ) : (
        roots.map((r) => <Node key={r.id} node={r} />)
      )}
    </div>
  );
}

function highlight(text, q) {
  if (!text) return "";
  const i = text.toLowerCase().indexOf(q);
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-yellow-200 rounded px-0.5">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}
