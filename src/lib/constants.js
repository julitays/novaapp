// src/lib/constants.js
export const NS = "novaapp";

// Метки групп для 360
export const GROUP_LABELS = {
  peers: "Коллеги",
  reports: "Подчинённые",
  manager: "Руководитель",
  self: "Самооценка",
};

// Пресеты весов для 360
export const WEIGHT_PRESETS = {
  equal:    { peers: 1,   reports: 1,   manager: 1,   self: 1   },
  manager40:{ peers: 0.3, reports: 0.3, manager: 0.8, self: 0.2 },
  peers40:  { peers: 0.8, reports: 0.4, manager: 0.4, self: 0.2 },
  custom:   { peers: 1,   reports: 1,   manager: 1,   self: 0.5 },
};
