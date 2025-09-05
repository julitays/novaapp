// src/components/ui/Select.jsx
import React from "react";
import { createPortal } from "react-dom";

/** Select с железобетонным закрытием:
 *  - Портал в body, закрытие по клику/тачу/esc/scroll/resize (capture)
 *  - Дополнительно слушает window-событие 'novaapp:close-all-selects'
 *  - Поиск, single/multiple, опции: ["RM"] или [{label,value}]
 */
export default function Select({
  options = [],
  value,
  onChange,
  multiple = false,
  placeholder = "Выбрать…",
  className = "",
  maxMenuHeight = 260,
}) {
  const norm = React.useMemo(
    () => options.map(o => (typeof o === "string" ? { label: o, value: o } : o)),
    [options]
  );

  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");

  const rootRef = React.useRef(null);     // корневой контейнер селекта
  const controlRef = React.useRef(null);  // кнопка
  const menuRef = React.useRef(null);     // выпадающий список
  const searchRef = React.useRef(null);

  React.useEffect(() => {
    // закрытие по глобальному событию
    const close = () => setOpen(false);
    window.addEventListener("novaapp:close-all-selects", close);
    return () => window.removeEventListener("novaapp:close-all-selects", close);
  }, []);

  // выбранные значения → массив
  const vArr = multiple ? (Array.isArray(value) ? value : []) : value != null ? [value] : [];

  // фильтрация
  const shown = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? norm.filter(o => o.label.toLowerCase().includes(s)) : norm;
  }, [norm, q]);

  // позиционирование меню
  const [menuStyle, setMenuStyle] = React.useState({});
  const placeMenu = React.useCallback(() => {
    if (!open || !controlRef.current) return;
    const r = controlRef.current.getBoundingClientRect();
    const top = r.bottom + window.scrollY;
    const left = r.left + window.scrollX;
    setMenuStyle({ position: "absolute", top, left, width: r.width });
  }, [open]);
  React.useLayoutEffect(placeMenu, [placeMenu]);

  // закрытие по внешним событиям (capture!)
  React.useEffect(() => {
    if (!open) return;

    const contains = (node) =>
      rootRef.current?.contains(node) || menuRef.current?.contains(node);

    const onDown = (e) => { if (!contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };

    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("click", onDown, true);
    document.addEventListener("focusin", onDown, true);
    window.addEventListener("scroll", onDown, true);
    window.addEventListener("resize", onDown, true);
    window.addEventListener("orientationchange", onDown, true);
    window.addEventListener("keydown", onKey, true);

    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("click", onDown, true);
      document.removeEventListener("focusin", onDown, true);
      window.removeEventListener("scroll", onDown, true);
      window.removeEventListener("resize", onDown, true);
      window.removeEventListener("orientationchange", onDown, true);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  // автофокус на поиск
  React.useEffect(() => {
    if (open) {
      placeMenu();
      const id = setTimeout(() => searchRef.current?.focus(), 0);
      return () => clearTimeout(id);
    }
  }, [open, placeMenu]);

  function toggle(val) {
    if (!multiple) { onChange?.(val); setOpen(false); return; }
    const set = new Set(vArr);
    set.has(val) ? set.delete(val) : set.add(val);
    onChange?.([...set]);
  }
  function clearAll(e) {
    e.stopPropagation();
    multiple ? onChange?.([]) : onChange?.("");
  }

  const display = multiple ? (vArr.length ? vArr.join(", ") : "") : vArr[0] || "";

  const menu = open && createPortal(
    <>
      {/* подложка (страховка), но закрытие работает и без неё */}
      <div className="fixed inset-0 z-[9998]" onPointerDown={() => setOpen(false)} />
      <div
        ref={menuRef}
        className="z-[9999] rounded-xl border border-slate-200 bg-white shadow-xl"
        style={menuStyle}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="p-2 border-b border-slate-100">
          <input
            ref={searchRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск…"
            className="w-full h-9 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <div style={{ maxHeight: maxMenuHeight, overflowY: "auto" }} className="py-1">
          {shown.length === 0 && (
            <div className="px-3 py-2 text-sm text-slate-500">Ничего не найдено</div>
          )}
          {shown.map((o) => {
            const selected = vArr.includes(o.value);
            return (
              <div
                key={o.value}
                onClick={() => toggle(o.value)}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 flex items-center gap-2 ${
                  selected ? "bg-indigo-50" : ""
                }`}
              >
                {multiple && (
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggle(o.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                <span className={selected ? "font-medium text-indigo-700" : ""}>{o.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>,
    document.body
  );

  return (
    <div ref={rootRef} data-select-root className={`relative ${className}`}>
      <button
        ref={controlRef}
        type="button"
        className={`w-full h-10 px-3 rounded-xl border text-left bg-white border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition ${open ? "ring-2 ring-indigo-200 border-indigo-300" : ""}`}
        onClick={() => { setOpen(o => !o); if (!open) setQ(""); }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={display ? "truncate block pr-5" : "text-slate-400"}>
          {display || placeholder}
        </span>
        {display && (
          <span
            onClick={clearAll}
            title="Очистить"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            ×
          </span>
        )}
      </button>
      {menu}
    </div>
  );
}
