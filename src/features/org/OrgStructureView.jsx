// src/features/org/OrgStructureView.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { initialEmployees, initialVacancies } from "../../lib/modules";
import { buildOrgTree } from "../../lib/orgLevels";

import OrgTree from "../../components/tree/OrgTree";
import { Page } from "../../components/ui/Page.jsx";
import Card from "../../components/ui/Card.jsx";
import { Button, Input, Badge } from "../../components/ui";

// ───────────────────────────────────────────────────────────────
// Утилиты
const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));

const allRoles   = uniq(initialEmployees.map((e) => e.title));
const allDepts   = uniq(initialEmployees.map((e) => e.department));
const allUnits   = uniq(initialEmployees.map((e) => e.unit || e.team || e.section));
const allMgrs    = uniq(initialEmployees.map((e) => e.manager));
const allRegions = uniq(initialEmployees.map((e) => e.region));

/** Небольшой MultiSelect (поиск + чипсы) со сворачиванием по клику вне */
function MultiSelect({ label, options, value, onChange, placeholder = "Начните ввод…" }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const rootRef = useRef(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return !needle ? options : options.filter((o) => o.toLowerCase().includes(needle));
  }, [options, q]);

  const toggle = (opt) => {
    const has = value.includes(opt);
    onChange(has ? value.filter((v) => v !== opt) : [...value, opt]);
  };
  const clearOne = (opt) => onChange(value.filter((v) => v !== opt));

  // Закрытие по клику вне
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      {label && <div className="text-sm mb-1">{label}</div>}
      <div
        className="flex items-center gap-2 min-h-[38px] px-2 py-1 rounded-xl border border-slate-200 bg-white cursor-text"
        onClick={() => setOpen((v) => !v)}
      >
        {value.length === 0 ? (
          <span className="text-slate-400 text-sm">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {value.map((v) => (
              <span
                key={v}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100"
                onClick={(e) => e.stopPropagation()}
              >
                {v}
                <button
                  className="text-slate-500 hover:text-rose-600"
                  onClick={() => clearOne(v)}
                  aria-label="Удалить"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="ml-auto text-slate-400">▾</div>
      </div>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow">
          <div className="p-2 border-b border-slate-100">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Фильтр вариантов…"
            />
          </div>
          <div className="max-h-56 overflow-auto p-1">
            {filtered.length === 0 ? (
              <div className="px-2 py-3 text-sm text-slate-500">Нет совпадений</div>
            ) : (
              filtered.map((opt) => {
                const active = value.includes(opt);
                return (
                  <button
                    key={opt}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-50 ${
                      active ? "bg-indigo-50 text-indigo-700" : ""
                    }`}
                    onClick={() => toggle(opt)}
                  >
                    {opt}
                  </button>
                );
              })
            )}
          </div>
          <div className="p-2 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">Выбрано: {value.length}</div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => onChange([])}>
                Сбросить
              </Button>
              <Button onClick={() => setOpen(false)}>Готово</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────

export default function OrgStructureView() {
  const navigate = useNavigate();
  const treeWrapperRef = useRef(null);
  const orgTreeRef = useRef(null); // <— ref к дереву

  // фильтры (множественный выбор)
  const [fRoles, setFRoles] = useState([]);
  const [fDepts, setFDepts] = useState([]);
  const [fUnits, setFUnits] = useState([]);
  const [fMgrs, setFMgrs] = useState([]);
  const [fRegions, setFRegions] = useState([]);
  const [q, setQ] = useState("");

  const clearFilters = () => {
    setFRoles([]);
    setFDepts([]);
    setFUnits([]);
    setFMgrs([]);
    setFRegions([]);
    setQ("");
  };

  // применяем фильтры к людям
  const people = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return initialEmployees
      .filter((e) => fRoles.length === 0 || fRoles.includes(e.title))
      .filter((e) => fDepts.length === 0 || fDepts.includes(e.department))
      .filter((e) => fUnits.length === 0 || fUnits.includes(e.unit || e.team || e.section))
      .filter((e) => fMgrs.length === 0 || fMgrs.includes(e.manager))
      .filter((e) => fRegions.length === 0 || fRegions.includes(e.region))
      .filter((e) =>
        !needle
          ? true
          : `${e.name} ${e.title} ${e.department} ${e.region} ${e.manager}`
              .toLowerCase()
              .includes(needle)
      );
  }, [fRoles, fDepts, fUnits, fMgrs, fRegions, q]);

  // метрики
  const headcount = people.length;

  // вакансии — те же фильтры
  const vacancies = useMemo(() => {
    return initialVacancies.filter(
      (v) =>
        (fRoles.length === 0 || fRoles.includes(v.role)) &&
        (fDepts.length === 0 || fDepts.includes(v.department)) &&
        (fUnits.length === 0 || fUnits.includes(v.unit)) &&
        (fMgrs.length === 0 || fMgrs.includes(v.manager)) &&
        (fRegions.length === 0 || fRegions.includes(v.location || v.region || ""))
    );
  }, [fRoles, fDepts, fUnits, fMgrs, fRegions]);

  // дерево
  const tree = useMemo(() => buildOrgTree(people, { preferManagerId: true }), [people]);

  // «тиковые» флажки как бэкап, если методы на ref недоступны
  const [collapseAllTick, setCollapseAllTick] = useState(0);
  const [expandAllTick, setExpandAllTick] = useState(0);

  const handleCollapseAll = () => {
    const api = orgTreeRef.current;
    if (api && typeof api.collapseAll === "function") {
      api.collapseAll();
    } else {
      setCollapseAllTick((t) => t + 1);
    }
  };
  const handleExpandAll = () => {
    const api = orgTreeRef.current;
    if (api && typeof api.expandAll === "function") {
      api.expandAll();
    } else {
      setExpandAllTick((t) => t + 1);
    }
  };

  // экспорт (демо)
  const exportPNG = () =>
    alert("Экспорт PNG доступен после подключения html2canvas. Пока используйте печать/скриншот.");
  const exportPDF = () => window.print();

  const activeFilterText =
    [
      fRoles.length ? `Роль: ${fRoles.join(", ")}` : null,
      fDepts.length ? `Департамент: ${fDepts.join(", ")}` : null,
      fUnits.length ? `Отдел: ${fUnits.join(", ")}` : null,
      fMgrs.length ? `Рук.: ${fMgrs.join(", ")}` : null,
      fRegions.length ? `Регион: ${fRegions.join(", ")}` : null,
      q ? `Поиск: «${q}»` : null,
    ]
      .filter(Boolean)
      .join(" · ") || "—";

  return (
    <Page
      title="Структура"
      subtitle="Фильтры, численность, вакансии и интерактивное дерево"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/employees")}>
            К сотрудникам
          </Button>
          <Button variant="ghost" onClick={clearFilters}>
            Очистить фильтры
          </Button>
        </div>
      }
    >
      {/* Фильтры */}
      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <MultiSelect label="Должность" options={allRoles} value={fRoles} onChange={setFRoles} />
          <MultiSelect label="Департамент" options={allDepts} value={fDepts} onChange={setFDepts} />
          <MultiSelect
            label="Отдел/направление"
            options={allUnits}
            value={fUnits}
            onChange={setFUnits}
          />
          <MultiSelect label="Руководитель" options={allMgrs} value={fMgrs} onChange={setFMgrs} />
          <MultiSelect label="Регион" options={allRegions} value={fRegions} onChange={setFRegions} />
          <div>
            <div className="text-sm mb-1">Поиск</div>
            <Input
              placeholder="Имя, ключевые слова…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-500">Численность по фильтру</div>
            <div className="text-2xl font-semibold">{headcount}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-500">Подходящие вакансии</div>
            <div className="text-2xl font-semibold">{vacancies.length}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-500">Фильтр активен</div>
            <div className="text-sm mt-1 text-slate-700">{activeFilterText}</div>
          </div>
        </div>
      </Card>

      {/* Вакансии */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium">Вакансии (по активным фильтрам)</div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => alert("Импорт вакансий (демо)")}>
              Импорт
            </Button>
            <Button onClick={() => alert("Создание вакансии (демо)")}>Создать вакансию</Button>
          </div>
        </div>
        {vacancies.length === 0 ? (
          <div className="text-sm text-slate-500">Под фильтр ничего не попало.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {vacancies.map((v) => (
              <div key={v.id} className="rounded-xl border border-slate-200 p-3 bg-white">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{v.role}</div>
                  <Badge tone={v.status === "open" ? "green" : "slate"}>{v.status}</Badge>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {v.department}
                  {v.unit ? ` · ${v.unit}` : ""}
                  {v.manager ? ` · рук: ${v.manager}` : ""}
                </div>
                <div className="text-sm mt-2">
                  Ставка: <b>{v.headcount}</b>
                </div>
                <div className="text-xs text-slate-500">Локация: {v.location || "—"}</div>
                <div className="mt-2 flex gap-2">
                  <Button variant="ghost" onClick={() => alert("Открыть вакансию (демо)")}>
                    Открыть
                  </Button>
                  <Button variant="ghost" onClick={() => alert("Назначить подбор (демо)")}>
                    Подбор
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Управление оргструктурой — заглушки */}
      <Card className="p-4 mb-4">
        <div className="font-medium mb-2">Управление структурой (демо)</div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => alert("Создать отдел (демо)")}>
            Создать отдел
          </Button>
          <Button variant="ghost" onClick={() => alert("Создать подразделение (демо)")}>
            Создать подразделение
          </Button>
          <Button variant="ghost" onClick={() => alert("Перевести сотрудника (демо)")}>
            Перевести сотрудника
          </Button>
        </div>
        <div className="text-xs text-slate-500 mt-2">
          Далее добавим drag-and-drop узлов, массовые операции и журнал изменений.
        </div>
      </Card>

      {/* Дерево организации */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-medium">Дерево организации</div>
          <div className="flex items-center gap-2">
            <Input
              className="w-64"
              placeholder="Поиск в дереве…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              title="Лайв-подсветка совпадений"
            />
            <Button variant="ghost" onClick={handleCollapseAll}>
              Свернуть всё
            </Button>
            <Button variant="ghost" onClick={handleExpandAll}>
              Развернуть всё
            </Button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <Button variant="ghost" onClick={exportPNG}>
              Экспорт PNG
            </Button>
            <Button onClick={exportPDF}>Экспорт PDF</Button>
          </div>
        </div>

        <div ref={treeWrapperRef}>
          <OrgTree
            ref={orgTreeRef}                   // <— прокидываем ref
            roots={tree.rootNodes}
            deptCounts={tree.deptCounts}
            query={q}
            collapseAllTick={collapseAllTick}  // <— резервный механизм
            expandAllTick={expandAllTick}      // <— резервный механизм
            onOpenEmployee={(id) => navigate(`/employees/${id}`)}
          />
        </div>
      </Card>
    </Page>
  );
}
