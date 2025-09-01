// src/lib/store.js
import { NS } from "./constants";

export function lsGet(key, fallback = null) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(`${NS}:${key}`);
    return raw == null ? fallback : JSON.parse(raw);
  } catch { return fallback; }
}

export function lsSet(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${NS}:${key}`, JSON.stringify(value));
  } catch {}
}
