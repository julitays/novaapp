import React from "react";
import { Button, Input, Select } from "../../components/ui";

const THEME_KEY = "novaapp_theme";
const BRAND_KEY = "novaapp_brand";

export default function SettingsView() {
  const [brand, setBrand] = React.useState(
    () => localStorage.getItem(BRAND_KEY) || "novaapp"
  );
  const [theme, setTheme] = React.useState(
    () => localStorage.getItem(THEME_KEY) || "system"
  );

  React.useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function save() {
    localStorage.setItem(BRAND_KEY, brand);
    localStorage.setItem(THEME_KEY, theme);
    alert("Настройки сохранены");
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Настройки</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
          <div className="text-sm text-slate-500">Бренд</div>
          <Input value={brand} onChange={(e) => setBrand(e.target.value)} />
          <div className="text-xs text-slate-500">
            Название отображается в логотипе и заголовках.
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
          <div className="text-sm text-slate-500">Тема</div>
          <Select
            value={theme}
            onChange={setTheme}
            options={[
              { value: "light", label: "Светлая" },
              { value: "dark", label: "Тёмная" },
              { value: "system", label: "Системная" },
            ].map((o) => (typeof o === "string" ? o : o.value))}
          />
          <div className="text-xs text-slate-500">
            При «Системная» используем настройку ОС/браузера.
          </div>
        </div>
      </div>

      <Button variant="ghost" onClick={save}>Сохранить</Button>
    </div>
  );
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else if (theme === "light") root.classList.remove("dark");
  else {
    // system
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.matches ? root.classList.add("dark") : root.classList.remove("dark");
  }
}
