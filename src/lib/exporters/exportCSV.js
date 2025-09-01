export function exportCSV(rows, filename = "export.csv") {
  const csv = rows.map(r => r.map(cell => {
    const t = String(cell ?? "");
    return /[",\n]/.test(t) ? `"${t.replace(/"/g,'""')}"` : t;
  }).join(",")).join("\n");
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
