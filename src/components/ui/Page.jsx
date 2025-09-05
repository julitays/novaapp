// src/components/ui/Page.jsx
import React from "react";

/**
 * Page — базовый каркас экрана:
 * - Стики-шапка (title / subtitle / actions)
 * - Контент с отступами
 * - Глобальное закрытие всех Select / MultiSelect по клику вне
 *   (шлём window.dispatchEvent(new Event('novaapp:close-all-selects')))
 *
 * Использование:
 * <Page title="Структура" subtitle="..." actions={<Buttons/>}>
 *   ...content...
 * </Page>
 */
export function Page({
  title,
  subtitle,
  actions,
  children,
  className = "",
  contentClassName = "",
  sticky = true, // можно отключить стики при желании
}) {
  const containerRef = React.useRef(null);

  // Клик по странице (capture) — закрыть все селекты, если клик не внутри [data-select-root]
  const onPagePointerDown = React.useCallback((e) => {
    // если кликнули по самому селекту/его меню — ничего не делаем
    if (e.target.closest?.("[data-select-root]")) return;
    window.dispatchEvent(new Event("novaapp:close-all-selects"));
  }, []);

  // Дополнительно — по ESC тоже закрываем все выпадашки
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        window.dispatchEvent(new Event("novaapp:close-all-selects"));
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`min-h-[60vh] ${className}`}
      // ВАЖНО: capture=true, чтобы событие не «съели» вложенные слои
      onPointerDownCapture={onPagePointerDown}
    >
      {/* Шапка страницы */}
      <div
        className={
          sticky
            ? "sticky top-0 z-10 -mx-4 md:-mx-6 px-4 md:px-6 py-3 bg-slate-50/80 backdrop-blur border-b border-slate-200"
            : "px-1 md:px-0 pb-3"
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {!!title && (
              <h1 className="text-xl md:text-2xl font-semibold leading-tight truncate">
                {title}
              </h1>
            )}
            {!!subtitle && (
              <div className="text-sm text-slate-600 mt-0.5 truncate">
                {subtitle}
              </div>
            )}
          </div>
          {!!actions && (
            <div className="shrink-0 flex items-center gap-2">{actions}</div>
          )}
        </div>
      </div>

      {/* Контент */}
      <div className={`mt-4 ${contentClassName}`}>{children}</div>
    </div>
  );
}

export default Page;
