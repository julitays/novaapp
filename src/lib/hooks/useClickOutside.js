import { useEffect } from "react";

/**
 * Вызовет handler, если клик/тап был вне элемента ref.
 */
export default function useClickOutside(ref, handler) {
  useEffect(() => {
    function onDown(e) {
      const el = ref?.current;
      if (!el) return;
      if (el === e.target || el.contains(e.target)) return; // клик внутри — игнор
      handler?.(e);
    }
    document.addEventListener("mousedown", onDown, true);
    document.addEventListener("touchstart", onDown, true);
    return () => {
      document.removeEventListener("mousedown", onDown, true);
      document.removeEventListener("touchstart", onDown, true);
    };
  }, [ref, handler]);
}
