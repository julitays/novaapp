// src/features/employees/EmployeesListView.jsx
import React, { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Page } from "../../components/ui/Page.jsx";
import Card from "../../components/ui/Card.jsx";
import { Input, Button } from "../../components/ui";

import { initialEmployees, initialRoles } from "../../lib/modules";
import { matchPercent } from "../../lib/analytics";

// ────────────────── helpers
const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));
const roleByName = (n) => initialRoles.find((r) => r.name === n) || initialRoles[0];

// ────────────────── MultiSelect (поиск + чипсы + закрытие снаружи)
function MultiSelect({ label, options, value, onChange, placeholder = "Начните ввод…" }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const rootRef = useRef(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return !needle ? options : options.filter((o) => o.toLowerCase().includes(needle));
  }, [options, q]);

  function toggle(opt) {
    const has = value.includes(opt);
    const next = has ? value.filter((v) => v !== opt) : [...value, opt];
    onChange(next);
  }
  function clearOne(opt) {
    onChange(value.filter((v) => v !== opt));
  }

  // закрытие по клику вне и по Esc
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      const root = rootRef.current;
      if (!root) return;
      if (!root.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => (e.key === "Escape" ? setOpen(false) : null);
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      {label && <div className="text-[13px] text-slate-600 mb-1">{label}</div>}
      <div
        className="flex items-center gap-2 min-h-[42px] px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition cursor-text"
        onClick={() => setOpen((v) => !v)}
      >
        {value.length === 0 ? (
          <span className="text-slate-400 text-sm">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {value.map((v) => (
              <span
                key={v}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 ring-1 ring-slate-200"
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
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="p-2 border-b border-slate-100">
            <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Фильтр вариантов…" />
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

// ────────────────── сортировка
const DEFAULT_SORT = { field: "fit", dir: "desc" };
const SERIALIZE = (s) => `${s.field}:${s.dir}`;
const DESERIALIZE = (raw) => {
  if (!raw) return DEFAULT_SORT;
  if (raw.includes("_")) {
    const [f, d] = raw.split("_");
    return {
      field: f === "name" ? "name" : f === "role" ? "role" : f === "dept" ? "dept" : f === "mgr" ? "mgr" : f === "city" ? "city" : "fit",
      dir: d === "asc" ? "asc" : "desc",
    };
  }
  const [field, dir] = raw.split(":");
  const okField = ["fit", "name", "role", "dept", "mgr", "city"].includes(field) ? field : "fit";
  const okDir = dir === "asc" ? "asc" : "desc";
  return { field: okField, dir: okDir };
};

function sortItems(list, sort) {
  const byStr = (g) => (g || "").toString().toLowerCase();
  const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

  const base = list.slice();
  switch (sort.field) {
    case "name":
      base.sort((a, b) => cmp(byStr(a.emp.name), byStr(b.emp.name)));
      break;
    case "role":
      base.sort((a, b) => cmp(byStr(a.emp.title), byStr(b.emp.title)));
      break;
    case "dept":
      base.sort((a, b) => cmp(byStr(a.emp.department), byStr(b.emp.department)));
      break;
    case "mgr":
      base.sort((a, b) => cmp(byStr(a.emp.manager), byStr(b.emp.manager)));
      break;
    case "city":
      base.sort((a, b) => cmp(byStr(a.emp.city || a.emp.region), byStr(b.emp.city || b.emp.region)));
      break;
    case "fit":
    default:
      base.sort((a, b) => b.fit - a.fit || cmp(byStr(a.emp.name), byStr(b.emp.name)));
      break;
  }
  if (sort.dir === "desc") return base;
  return base.reverse();
}

// ────────────────── экран
export default function EmployeesListView() {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  // динамический отступ для липкой шапки (учитываем фактическую высоту Topbar)
  const [topOffset, setTopOffset] = useState(64);
  useEffect(() => {
    function measure() {
      // пробуем найти Topbar по id или data-атрибуту; если не нашли — 64px
      const el = document.getElementById("topbar") || document.querySelector("[data-topbar]");
      setTopOffset(el?.offsetHeight ? el.offsetHeight : 64);
    }
    measure();
    window.addEventListener("resize", measure);
    // на случай позднего монтирования Topbar
    const t = setTimeout(measure, 0);
    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(t);
    };
  }, []);

  // парсинг списков из URL (значения разделены "|")
  const parseList = (k) => (sp.get(k) ? sp.get(k).split("|").filter(Boolean) : []);

  // фильтры (инициализация из querystring)
  const [q, setQ] = useState(sp.get("q") || "");
  const [fRoles, setFRoles] = useState(parseList("roles"));
  const [fDepts, setFDepts] = useState(parseList("depts"));
  const [fMgrs, setFMgrs] = useState(parseList("mgrs"));
  const [fCities, setFCities] = useState(parseList("cities"));
  const [sort, setSort] = useState(() => DESERIALIZE(sp.get("sort") || "fit:desc"));

  // sync в URL
  function syncQS(next = {}) {
    const params = new URLSearchParams();
    const _q = next.q ?? q;
    const _roles = next.roles ?? fRoles;
    const _depts = next.depts ?? fDepts;
    const _mgrs = next.mgrs ?? fMgrs;
    const _cities = next.cities ?? fCities;
    const _sort = next.sort ? SERIALIZE(next.sort) : SERIALIZE(sort);

    if (_q) params.set("q", _q);
    if (_roles.length) params.set("roles", _roles.join("|"));
    if (_depts.length) params.set("depts", _depts.join("|"));
    if (_mgrs.length) params.set("mgrs", _mgrs.join("|"));
    if (_cities.length) params.set("cities", _cities.join("|"));
    if (_sort !== SERIALIZE(DEFAULT_SORT)) params.set("sort", _sort);

    setSp(params, { replace: true });
  }

  // опции
  const roleOptions = uniq(initialEmployees.map((e) => e.title));
  const deptOptions = uniq(initialEmployees.map((e) => e.department));
  const mgrOptions = uniq(initialEmployees.map((e) => e.manager));
  const cityOptions = uniq(initialEmployees.map((e) => e.city || e.region));

  // применяем фильтры
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const base = initialEmployees
      .filter((e) => (fRoles.length === 0 ? true : fRoles.includes(e.title)))
      .filter((e) => (fDepts.length === 0 ? true : fDepts.includes(e.department)))
      .filter((e) => (fMgrs.length === 0 ? true : fMgrs.includes(e.manager)))
      .filter((e) => (fCities.length === 0 ? true : fCities.includes(e.city || e.region)))
      .filter((e) =>
        !needle
          ? true
          : `${e.name} ${e.title} ${e.department} ${e.region} ${e.manager}`.toLowerCase().includes(needle)
      )
      .map((e) => {
        const r = roleByName(e.title);
        return { emp: e, fit: matchPercent(e, r) };
      });

    return sortItems(base, sort);
  }, [q, fRoles, fDepts, fMgrs, fCities, sort]);

  function clearFilters() {
    setQ("");
    setFRoles([]);
    setFDepts([]);
    setFMgrs([]);
    setFCities([]);
    setSort(DEFAULT_SORT);
    setSp(new URLSearchParams(), { replace: true });
  }

  // клик по заголовку для сортировки
  function toggleSort(field) {
    setSort((prev) => {
      const dir = prev.field === field ? (prev.dir === "asc" ? "desc" : "asc") : field === "fit" ? "desc" : "asc";
      const next = { field, dir };
      syncQS({ sort: next });
      return next;
    });
  }
  const arrow = (f) => (sort.field === f ? (sort.dir === "asc" ? "▲" : "▼") : "");

  return (
    <Page
      title="Сотрудники"
      subtitle="Компактный список с мультифильтрами и сортировкой по заголовкам"
      actions={<Button variant="ghost" onClick={clearFilters}>Очистить фильтры</Button>}
    >
      {/* Фильтры */}
      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 2xl:grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-4">
          <MultiSelect
            label="Роли"
            options={roleOptions}
            value={fRoles}
            onChange={(v) => {
              setFRoles(v);
              syncQS({ roles: v });
            }}
          />
          <MultiSelect
            label="Департаменты"
            options={deptOptions}
            value={fDepts}
            onChange={(v) => {
              setFDepts(v);
              syncQS({ depts: v });
            }}
          />
          <MultiSelect
            label="Руководители"
            options={mgrOptions}
            value={fMgrs}
            onChange={(v) => {
              setFMgrs(v);
              syncQS({ mgrs: v });
            }}
          />
          <MultiSelect
            label="Города/Регионы"
            options={cityOptions}
            value={fCities}
            onChange={(v) => {
              setFCities(v);
              syncQS({ cities: v });
            }}
          />
          <div>
            <div className="text-[13px] text-slate-600 mb-1">Поиск</div>
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                syncQS({ q: e.target.value });
              }}
              placeholder="Имя, ключевые слова…"
            />
          </div>
        </div>
      </Card>

      {/* Лист сотрудников */}
      {/* ВАЖНО: без overflow-hidden у контейнера, чтобы sticky работал над всей страницей */}
      <Card className="p-0">
        {/* Шапка таблицы — липкая, с динамическим top */}
        <div
          className="sticky z-30"
          style={{ top: `${topOffset}px` }}
        >
          <div className="bg-white/95 supports-[backdrop-filter]:bg-white/70 backdrop-blur border-b border-slate-200 shadow-sm">
            <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_160px] px-4 py-3">
              <button
                className="text-left text-[13.5px] sm:text-[14px] font-semibold tracking-wide text-slate-800 hover:text-slate-900"
                onClick={() => toggleSort("name")}
                aria-sort={sort.field === "name" ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                title="Сортировать по имени"
              >
                Сотрудник <span className="ml-1">{arrow("name")}</span>
              </button>
              <button
                className="text-left text-[13.5px] sm:text-[14px] font-semibold tracking-wide text-slate-800 hover:text-slate-900"
                onClick={() => toggleSort("role")}
                aria-sort={sort.field === "role" ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                title="Сортировать по роли/отделу"
              >
                Роль / Отдел <span className="ml-1">{arrow("role")}</span>
              </button>
              <button
                className="text-left text-[13.5px] sm:text-[14px] font-semibold tracking-wide text-slate-800 hover:text-slate-900"
                onClick={() => toggleSort("city")}
                aria-sort={sort.field === "city" ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                title="Сортировать по городу/региону"
              >
                Город / Регион <span className="ml-1">{arrow("city")}</span>
              </button>
              <button
                className="text-left text-[13.5px] sm:text-[14px] font-semibold tracking-wide text-slate-800 hover:text-slate-900"
                onClick={() => toggleSort("mgr")}
                aria-sort={sort.field === "mgr" ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                title="Сортировать по руководителю"
              >
                Руководитель <span className="ml-1">{arrow("mgr")}</span>
              </button>
              <button
                className="text-right text-[13.5px] sm:text-[14px] font-semibold tracking-wide text-slate-800 hover:text-slate-900"
                onClick={() => toggleSort("fit")}
                aria-sort={sort.field === "fit" ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                title="Сортировать по соответствию текущей роли"
              >
                Соответствие текущей роли <span className="ml-1">{arrow("fit")}</span>
              </button>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        </div>

        {filtered.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">Ничего не найдено по текущему фильтру.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map(({ emp, fit }, idx) => (
              <li
                key={emp.id}
                className={`px-4 transition ${idx % 2 ? "bg-white" : "bg-slate-50/40"} hover:bg-indigo-50/40`}
              >
                <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_160px] items-center py-3.5 gap-3">
                  {/* Сотрудник */}
                  <div className="min-w-0">
                    <button
                      className="font-medium text-slate-900 hover:underline truncate"
                      onClick={() => navigate(`/employees/${emp.id}`, { state: { emp } })}
                      title="Открыть профиль"
                    >
                      {emp.name}
                    </button>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      ID: {emp.id} · Стаж в роли: {emp.tenureMonths ? `${emp.tenureMonths} мес.` : "—"}
                    </div>
                  </div>

                  {/* Роль / Отдел */}
                  <div className="min-w-0">
                    <div className="truncate text-slate-800">{emp.title || "—"}</div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">{emp.department || "—"}</div>
                  </div>

                  {/* Город / Регион */}
                  <div className="min-w-0">
                    <div className="truncate text-slate-800">{emp.city || emp.region || "—"}</div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {emp.region && emp.city ? emp.region : ""}
                    </div>
                  </div>

                  {/* Руководитель */}
                  <div className="min-w-0">
                    <button
                      className="text-sm text-slate-800 hover:underline truncate"
                      title="Открыть профиль руководителя"
                      onClick={() => {
                        const boss = initialEmployees.find(
                          (x) => x.name === emp.manager || x.id === emp.managerId
                        );
                        if (boss) navigate(`/employees/${boss.id}`, { state: { emp: boss } });
                      }}
                    >
                      {emp.manager || "—"}
                    </button>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {emp.unit || emp.team || emp.section || "—"}
                    </div>
                  </div>

                  {/* Соответствие текущей роли */}
                  <div className="text-right">
                    <div className="font-semibold text-slate-900">{fit}%</div>
                    <div className="h-1.5 rounded bg-slate-100 mt-1.5">
                      <div className="h-1.5 rounded bg-indigo-500" style={{ width: `${fit}%` }} />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Page>
  );
}
