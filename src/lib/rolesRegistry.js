// src/lib/roles-registry.js
import { embeddedRoles } from './rolesjson/index.js';

const STORAGE_KEY = 'novaapp:roleStandards';

const keyOf = (std) => `${std.name}__${std.version}`;

export function loadEmbeddedRoleStandards() {
  return embeddedRoles;
}

export function loadUserRoleStandards() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function loadRoleStandards() {
  const map = new Map();
  for (const s of loadEmbeddedRoleStandards()) map.set(keyOf(s), s);
  for (const s of loadUserRoleStandards())     map.set(keyOf(s), s);
  return Array.from(map.values());
}

export function upsertRoleStandard(std) {
  const list = loadUserRoleStandards();
  const map  = new Map(list.map(s => [keyOf(s), s]));
  map.set(keyOf(std), std);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(map.values())));
}

export function removeRoleStandard(std) {
  const map = new Map(loadUserRoleStandards().map(s => [keyOf(s), s]));
  map.delete(keyOf(std));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(map.values())));
}

export function clearUserRoleStandards() {
  localStorage.removeItem(STORAGE_KEY);
}
