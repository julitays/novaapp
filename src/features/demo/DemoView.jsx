import React from "react";
import { Button, Input, Select } from "../../components/ui";

export default function DemoView() {
  const [scenario, setScenario] = React.useState("Импорт 360");
  const [logs, setLogs] = React.useState<string[]>([]);

  function push(msg) {
    setLogs((l) => [`${new Date().toLocaleTimeString()} — ${msg}`, ...l].slice(0, 50));
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">DEMO</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
          <div className="font-medium mb-1">Быстрые сценарии</div>
          <Select
            value={scenario}
            onChange={setScenario}
            options={[
              "Импорт 360",
              "Генерация эталона KAM",
              "Экспорт роли в JSON",
              "Симуляция ассессмента",
            ]}
          />
          <Button
            onClick={() => {
              if (scenario === "Импорт 360") push("Открыт диалог выбора файла .xlsx (эмуляция)");
              if (scenario === "Генерация эталона KAM") push("Сгенерирован драфт KAM v1.0 (демо)");
              if (scenario === "Экспорт роли в JSON") push("Сохранён Role_KAM_v1.json (демо)");
              if (scenario === "Симуляция ассессмента") push("Смоделирован кейс AC-01 (демо)");
            }}
          >
            Выполнить
          </Button>
          <div className="text-sm text-slate-500">
            Это песочница: можно демонстрировать флоу без влияния на реальные данные.
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
          <div className="font-medium mb-1">Параметры демо</div>
          <div className="space-y-2">
            <div>
              <div className="text-sm text-slate-500 mb-1">Seed пользователи</div>
              <Select value="3" onChange={() => {}} options={["3", "10", "50"]} />
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-1">Шум в данных (σ)</div>
              <Input defaultValue="0.2" />
            </div>
            <Button variant="ghost" onClick={() => push("Параметры сохранены (демо)")}>
              Сохранить параметры
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="font-medium mb-2">Лог действий</div>
          <div className="h-48 overflow-auto text-xs space-y-1">
            {logs.length === 0 && <div className="text-slate-500">Пока пусто</div>}
            {logs.map((l, i) => (
              <div key={i} className="whitespace-pre-wrap">{l}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
