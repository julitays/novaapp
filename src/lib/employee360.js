// src/lib/employee360.js
import { GROUP_LABELS } from "./constants";

// Генерация «правдоподобной» 360-оценки по списку компетенций
export function generateMock360(competencies = [], base = 3.4) {
  const groups = Object.keys(GROUP_LABELS);
  const jitter = () => (Math.random() - 0.5) * 0.8; // ±0.4
  return competencies.map(name => ({
    name,
    anchor: `Индикаторы проявления компетенции «${name}»`,
    questions: Array.from({ length: Math.ceil(8 + Math.random()*6) }).map((_, i) => {
      const peers   = clamp(base + jitter(), 1, 5);
      const reports = clamp(base + 0.1 + jitter(), 1, 5);
      const manager = clamp(base + 0.15 + jitter(), 1, 5);
      const self    = clamp(base + 0.25 + jitter(), 1, 5);
      return {
        question: `${name}: вопрос ${i+1}`,
        scores: { peers, reports, manager, self },
      };
    }),
  }));
}
const clamp = (x, a, b) => Math.max(a, Math.min(b, Number(x)));

export function generateMock360ForEmployee(emp, roleMap) {
  const comps = Object.keys(roleMap || {});
  const base = 2.8 + (emp?.readiness?.percent || 50)/100 * 1.2; // 2.8..4.0
  return generateMock360(comps, base);
}
