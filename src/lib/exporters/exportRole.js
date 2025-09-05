// src/lib/exporters/exportRole.js
// Красивый экспорт карточки роли в PDF (print) и Word (.doc совместимый HTML).
// Никаких зависимостей: только Blob + window.open/print.

function esc(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function styleBlock(title, bodyHtml) {
  return `
  <section class="block">
    <h3>${title}</h3>
    ${bodyHtml}
  </section>`;
}

function tableKPIs(rows = []) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return `<div class="muted">—</div>`;
  }
  const tr = rows
    .map(
      (r) => `
      <tr>
        <td>${esc(r.name || "—")}</td>
        <td class="td-center">${esc(r.target || "—")}</td>
        <td class="td-center">${esc(r.period || "—")}</td>
      </tr>`
    )
    .join("");
  return `
  <table class="tbl">
    <thead><tr><th>Метрика</th><th>Цель</th><th>Период</th></tr></thead>
    <tbody>${tr}</tbody>
  </table>`;
}

function tableCompetencies(map = {}) {
  const entries = Object.entries(map || {});
  if (!entries.length) return `<div class="muted">—</div>`;
  const rows = entries
    .map(
      ([name, lvl]) => `
      <tr>
        <td>${esc(name)}</td>
        <td class="td-center"><span class="badge">${esc(lvl)}</span></td>
        <td class="muted">Поведенческие индикаторы заполняются методологом</td>
      </tr>`
    )
    .join("");
  return `
  <table class="tbl">
    <thead><tr><th>Компетенция</th><th>Уровень (эталон)</th><th>Описание / индикаторы</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function listBullets(list = []) {
  if (!Array.isArray(list) || list.length === 0) return `<div class="muted">—</div>`;
  return `<ul class="ul">${list.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
}

function cssCommon(title) {
  return `
  <style>
    @page { size: A4; margin: 18mm; }
    :root {
      --ink:#0f172a; --muted:#64748b; --line:#e5e7eb;
      --brand:#6366f1; --bg:#ffffff;
    }
    * { box-sizing:border-box; }
    body{ font: 12pt/1.45 system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif; color:var(--ink); background:var(--bg); }
    .header{
      display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:18px;
      padding-bottom:12px; border-bottom:2px solid var(--line);
    }
    h1{ font-size:22pt; margin:0; }
    .meta{ color:var(--muted); font-size:10pt; }
    .badge{ display:inline-block; font: 10pt/1.1 inherit; padding:2px 8px; border-radius:10px; background:#eef2ff; color:#3730a3; border:1px solid #c7d2fe; }
    .chip{ display:inline-block; padding:2px 8px; border-radius:999px; border:1px solid var(--line); color:var(--muted); font-size:9pt; }
    .muted{ color:var(--muted); }
    .block{ margin:14px 0 18px; break-inside: avoid; }
    .block h3{ margin:0 0 8px; font-size:12.5pt; }
    .lead{ margin:0; }
    .tbl{ width:100%; border-collapse: collapse; border:1px solid var(--line); }
    .tbl th, .tbl td{ border-top:1px solid var(--line); border-right:1px solid var(--line); padding:8px 10px; vertical-align: top; }
    .tbl th:last-child, .tbl td:last-child{ border-right:none; }
    .tbl thead th{ background:#f8fafc; text-align:left; font-weight:600; }
    .td-center{ text-align:center; }
    .ul{ margin:6px 0 0 18px; }
    .two{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .aside{ text-align:right; }
    .footer{ margin-top:16px; padding-top:8px; border-top:1px dashed var(--line); color:var(--muted); font-size:9pt; }
    .pill{ display:inline-block; background:#ecfeff; border:1px solid #bae6fd; color:#0369a1; padding:2px 8px; border-radius:999px; }
    .tagrow{ display:flex; gap:6px; flex-wrap:wrap; }
  </style>
  <title>${esc(title)}</title>
  `;
}

function buildHTML(role, printable = false) {
  const title = `${role.name} — профиль роли`;
  const kpiLeft = role?.kpi?.current || [];
  const kpiRight = role?.kpi?.recommended || [];
  const comp = role?.competencyMap || role?.competencies || {};

  const tags = Array.isArray(role?.tags) && role.tags.length
    ? `<div class="tagrow">${role.tags.map(t => `<span class="pill">${esc(t)}</span>`).join("")}</div>` : "";

  const assess = role?.assessmentGuidelines || {};
  const assessBlocks = `
    <div class="two">
      <div>
        <div class="muted">Шкалы</div>
        <p class="lead">${esc(assess.scales || "—")}</p>
        <div class="muted" style="margin-top:8px;">Примеры подтверждений</div>
        ${listBullets(assess.evidenceExamples || [])}
      </div>
      <div>
        <div class="muted">Поведенческие индикаторы</div>
        ${
          Object.entries(assess.behavioralAnchors || {}).length === 0
            ? `<div class="muted">—</div>`
            : Object.entries(assess.behavioralAnchors).map(
                ([k, list]) => `<div class="block" style="margin:8px 0;">
                  <b>${esc(k)}</b>
                  ${listBullets(list || [])}
                </div>`
              ).join("")
        }
      </div>
    </div>
  `;

  const test = role?.testAssignment || {};
  const testHtml = `
    <div class="two">
      <div>
        <div class="muted">Цель</div>
        <p class="lead">${esc(test.objective || "—")}</p>
        <div class="muted" style="margin-top:8px;">Таймбокс (часы)</div>
        <p class="lead">${esc(test.timeboxHours ?? "—")}</p>
      </div>
      <div>
        <div class="muted">Ожидаемые артефакты</div>
        ${listBullets(test.deliverables || [])}
        <div class="muted" style="margin-top:8px;">Критерии оценки</div>
        ${listBullets(test.evaluationCriteria || [])}
      </div>
    </div>
  `;

  const ac = role?.assessmentCenter || {};
  const acHtml = `
    <div class="two">
      <div>
        <div class="muted">Кейсы</div>
        ${
          Array.isArray(ac.cases) && ac.cases.length
            ? `<ul class="ul">${ac.cases.map(c =>
                `<li><b>${esc(c.title)}</b> — ${esc(c.durationMin)} мин; Наблюдатели: ${esc((c.observersRoles||[]).join(", ")||"—")}; Компетенции: ${esc((c.competenciesObserved||[]).join(", ")||"—")}</li>`
              ).join("")}</ul>`
            : `<div class="muted">—</div>`
        }
      </div>
      <div class="aside">
        <div class="muted">Рубрики</div>
        <p class="lead">${esc(ac.rubrics || "—")}</p>
      </div>
    </div>
  `;

  const head = `
  <div class="header">
    <div>
      <h1>${esc(role.name)}</h1>
      <div class="meta">
        Подразделение: <b>${esc(role.division || "—")}</b> · Версия: <b>${esc(role.version || "v1.0")}</b> · 
        Статус: <span class="badge">${esc(role.status || "active")}</span>
      </div>
    </div>
    <div class="aside">
      <div class="chip">Обновлено: ${esc(role.updatedAt || "—")}</div>
    </div>
  </div>
  `;

  const body =
    head +
    styleBlock("Цель роли", `<p class="lead">${esc(role.goal || "—")}</p>${tags}`) +
    styleBlock("Основные функции и задачи", listBullets(role.responsibilities || [])) +
    styleBlock(
      "KPI",
      `<div class="two">
         <div>${tableKPIs(kpiLeft)}</div>
         <div>${tableKPIs(kpiRight)}</div>
       </div>`
    ) +
    styleBlock("Карта компетенций (уровни 1–4)", tableCompetencies(comp)) +
    styleBlock("Рекомендации по оценке", assessBlocks) +
    styleBlock("Тестовое задание", testHtml) +
    styleBlock("Ассессмент-центр", acHtml) +
    `<div class="footer">Сформировано из NovaApp • ${new Date().toLocaleDateString()}</div>`;

  const css = cssCommon(title);

  // Word (.doc) требует немного другого wrapper'а для лучшей совместимости,
  // но и обычный HTML с meta работает. Используем совместимый вариант.
  const wordWrapper = `
  <html xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:w="urn:schemas-microsoft-com:office:word"
        xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta charset="UTF-8" />
    ${css}
  </head>
  <body>${body}</body></html>`;

  const printWrapper = `
  <html><head><meta charset="UTF-8" />${css}</head>
  <body>${body}
  ${ printable ? `<script>window.onload = () => setTimeout(()=>window.print(), 300);</script>` : "" }
  </body></html>`;

  return { wordWrapper, printWrapper, title };
}

// ——— helpers: сохранение
function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Публичные функции

export function exportRoleAsPDF(role) {
  const { printWrapper, title } = buildHTML(role, true);
  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) {
    // запасной вариант — сохранить как HTML, если попапы заблокированы
    const blob = new Blob([printWrapper], { type: "text/html;charset=utf-8" });
    saveBlob(blob, `${role.name.replace(/\s+/g, "_")}_PDF.html`);
    return;
  }
  win.document.open();
  win.document.write(printWrapper);
  win.document.close();
}

export function exportRoleAsWord(role) {
  const { wordWrapper } = buildHTML(role, false);
  // Word отлично открывает text/html с расширением .doc
  const blob = new Blob([wordWrapper], { type: "application/msword;charset=utf-8" });
  const fname = `${role.name.replace(/\s+/g, "_")}.doc`;
  saveBlob(blob, fname);
}
