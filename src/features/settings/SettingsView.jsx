import React from "react";
import { Page } from "../../components/ui/Page.jsx";
import Card from "../../components/ui/Card.jsx";
import { Button, Input, Select, Badge } from "../../components/ui";

/* ───────────────────────── storage / defaults */
const LS_USERS = "novaapp_users_v2";
const LS_ROLES = "novaapp_acl_roles_v2";
const LS_NOTIFY = "novaapp_notify_v2";
const LS_SECURITY = "novaapp_security_v2";
const LS_AUDIT = "novaapp_audit_v2";

const DEFAULT_ROLES = {
  Admin: {
    label: "Администратор",
    rights: { org: "rw", roles: "rw", employees: "rw", development: "rw", succession: "rw", settings: "rw" },
  },
  HR: {
    label: "HR",
    rights: { org: "r", roles: "rw", employees: "rw", development: "rw", succession: "rw", settings: "r" },
  },
  Manager: {
    label: "Руководитель",
    rights: { org: "r", roles: "r", employees: "rw", development: "rw", succession: "r", settings: "-" },
  },
  Viewer: {
    label: "Читатель",
    rights: { org: "r", roles: "r", employees: "r", development: "r", succession: "r", settings: "-" },
  },
};
const DEFAULT_USERS = [
  { id: "u1", name: "Екатерина Алексеева", email: "ek@example.com", role: "HR", team: "L&D", active: true },
  { id: "u2", name: "Иван Иванов", email: "ivan@example.com", role: "Manager", team: "Продажи", active: true },
  { id: "u3", name: "Маргарита Орлова", email: "margo@example.com", role: "Viewer", team: "Продажи", active: true },
];
const DEFAULT_NOTIFY = { daily: true, assess: true, succession: true, newsletter: false };
const DEFAULT_SECURITY = { mfa: true, sessionMin: 60, stickySidebar: true };

const load = (k, d) => {
  try { const raw = localStorage.getItem(k); return raw ? JSON.parse(raw) : d; } catch { return d; }
};
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const pushAudit = (msg) => {
  const a = load(LS_AUDIT, []);
  a.unshift({ ts: new Date().toISOString(), msg });
  save(LS_AUDIT, a.slice(0, 40));
};

/* ───────────────────────── small ui */
const Toggle = ({ checked, onChange, children, hint }) => (
  <label className="flex items-start gap-3 cursor-pointer">
    <span className="relative inline-flex h-6 w-11 items-center">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e)=>onChange(e.target.checked)} />
      <span className="absolute inset-0 rounded-full bg-slate-200 peer-checked:bg-indigo-500 transition" />
      <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition peer-checked:left-6" />
    </span>
    <span className="leading-tight">
      <span className="block">{children}</span>
      {hint && <span className="block text-xs text-slate-500">{hint}</span>}
    </span>
  </label>
);

const Section = ({ title, children }) => (
  <Card className="p-4">
    <div className="font-medium mb-2">{title}</div>
    <div className="grid gap-3">{children}</div>
  </Card>
);

const Avatar = ({ name }) => {
  const initials = (name || "?")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-400 text-white grid place-items-center text-xs font-semibold">
      {initials}
    </div>
  );
};

/* ───────────────────────── main */
export default function SettingsView() {
  const [tab, setTab] = React.useState("users"); // users | roles | notify | security | audit

  const [roles, setRoles] = React.useState(load(LS_ROLES, DEFAULT_ROLES));
  const [users, setUsers] = React.useState(load(LS_USERS, DEFAULT_USERS));
  const [notify, setNotify] = React.useState(load(LS_NOTIFY, DEFAULT_NOTIFY));
  const [security, setSecurity] = React.useState(load(LS_SECURITY, DEFAULT_SECURITY));

  React.useEffect(()=>save(LS_ROLES, roles), [roles]);
  React.useEffect(()=>save(LS_USERS, users), [users]);
  React.useEffect(()=>save(LS_NOTIFY, notify), [notify]);
  React.useEffect(()=>save(LS_SECURITY, security), [security]);

  const roleNames = Object.keys(roles); // для Select — только строки

  /* USERS ops */
  const [uDraft, setUDraft] = React.useState({ name: "", email: "", role: "Viewer", team: "" });
  const addUser = () => {
    if (!uDraft.name.trim() || !uDraft.email.trim()) return alert("Укажи имя и email");
    const u = { id: `u_${Date.now()}`, active: true, ...uDraft };
    setUsers((p) => [u, ...p]);
    setUDraft({ name: "", email: "", role: "Viewer", team: "" });
    pushAudit(`Добавлен пользователь: ${u.name} (${u.role})`);
  };
  const setUserRole = (id, role) => {
    setUsers((p) => p.map((x) => (x.id === id ? { ...x, role } : x)));
    const u = users.find((x) => x.id === id);
    pushAudit(`Роль изменена: ${u?.name} → ${role}`);
  };
  const toggleActive = (id) => {
    setUsers((p) => p.map((x) => (x.id === id ? { ...x, active: !x.active } : x)));
    const u = users.find((x) => x.id === id);
    pushAudit(`${u?.active ? "Деактивирован" : "Активирован"}: ${u?.name}`);
  };
  const removeUser = (id) => {
    const u = users.find((x) => x.id === id);
    if (!u) return;
    if (!confirm(`Удалить «${u.name}»?`)) return;
    setUsers((p) => p.filter((x) => x.id !== id));
    pushAudit(`Удалён пользователь: ${u.name}`);
  };

  /* ROLES ops */
  const [roleDraft, setRoleDraft] = React.useState("");
  const resources = [
    ["org", "Оргданные"],
    ["roles", "Эталоны ролей"],
    ["employees", "Сотрудники"],
    ["development", "Развитие"],
    ["succession", "Кадровый резерв"],
    ["settings", "Настройки"],
  ];
  const setRight = (roleKey, resKey, mode) => {
    const copy = structuredClone(roles);
    copy[roleKey].rights[resKey] = mode; // '-' | 'r' | 'rw'
    setRoles(copy);
    pushAudit(`Права: ${roleKey} • ${resKey} = ${mode}`);
  };
  const addRole = () => {
    const k = roleDraft.trim();
    if (!k || roles[k]) return;
    setRoles((p) => ({
      ...p,
      [k]: { label: k, rights: { org: "r", roles: "r", employees: "r", development: "r", succession: "r", settings: "-" } },
    }));
    setRoleDraft("");
    pushAudit(`Добавлена роль: ${k}`);
  };
  const renameRole = (k, label) => {
    const copy = structuredClone(roles);
    copy[k].label = label || k;
    setRoles(copy);
  };
  const deleteRole = (k) => {
    if (["Admin", "HR", "Manager", "Viewer"].includes(k)) return alert("Системную роль удалить нельзя");
    if (!confirm(`Удалить роль «${k}»?`)) return;
    const copy = structuredClone(roles);
    delete copy[k];
    setRoles(copy);
    setUsers((p) => p.map((u) => (u.role === k ? { ...u, role: "Viewer" } : u)));
    pushAudit(`Удалена роль: ${k}`);
  };

  /* ───────── tabs */
  const Tabs = () => (
    <div className="flex items-center gap-2 mb-3">
      {[
        ["users", "Пользователи"],
        ["roles", "Роли и права"],
        ["notify", "Уведомления"],
        ["security", "Безопасность"],
        ["audit", "Журнал"],
      ].map(([k, label]) => (
        <button
          key={k}
          onClick={() => setTab(k)}
          className={`px-3 py-1.5 rounded-xl text-sm border transition ${
            tab === k ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  /* ───────── views */
  const UsersView = () => (
    <>
      <Section title="Пригласить пользователя">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_160px_1fr_auto] gap-2">
          <Input placeholder="Имя" value={uDraft.name} onChange={(e)=>setUDraft((d)=>({ ...d, name: e.target.value }))} />
          <Input placeholder="Email" value={uDraft.email} onChange={(e)=>setUDraft((d)=>({ ...d, email: e.target.value }))} />
          <Select value={uDraft.role} onChange={(v)=>setUDraft((d)=>({ ...d, role: v }))} options={roleNames} />
          <Input placeholder="Команда/отдел" value={uDraft.team} onChange={(e)=>setUDraft((d)=>({ ...d, team: e.target.value }))} />
          <Button onClick={addUser}>Пригласить</Button>
        </div>
      </Section>

      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 font-medium border-b border-slate-200">Список пользователей</div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="text-left p-3 w-[32%]">Пользователь</th>
                <th className="text-left p-3 w-[26%]">Email</th>
                <th className="text-left p-3 w-[140px]">Роль</th>
                <th className="text-left p-3 w-[18%]">Команда</th>
                <th className="text-left p-3 w-[160px]">Статус</th>
                <th className="text-left p-3 w-[160px]">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={u.name} />
                      <div className="min-w-0">
                        <div className="font-medium truncate">{u.name}</div>
                        <div className="text-xs text-slate-500 truncate">{roles[u.role]?.label || u.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    <Select
                      value={u.role}
                      onChange={(v) => setUserRole(u.id, v)}
                      options={roleNames}
                      className="w-[140px]"   // ← фиксированная ширина
                    />
                  </td>
                  <td className="p-3">
                    <Input value={u.team || ""} onChange={(e)=>setUsers((p)=>p.map(x=>x.id===u.id?{...x, team:e.target.value}:x))} />
                  </td>
                  <td className="p-3">
                    <Badge tone={u.active ? "green" : "slate"}>{u.active ? "активен" : "деактивирован"}</Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" onClick={()=>toggleActive(u.id)}>{u.active ? "Выключить" : "Включить"}</Button>
                      <Button variant="ghost" onClick={()=>removeUser(u.id)}>Удалить</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td className="p-3 text-slate-500" colSpan={6}>Пользователей пока нет</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );

  const RolesView = () => (
    <>
      <Section title="Добавить роль">
        <div className="flex gap-2 max-w-xl">
          <Input placeholder="Название роли (например, Analyst)" value={roleDraft} onChange={(e)=>setRoleDraft(e.target.value)} />
          <Button onClick={addRole}>Добавить</Button>
        </div>
      </Section>

      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 font-medium border-b border-slate-200">Матрица прав (— / R / RW)</div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="text-left p-3 w-[26%]">Роль</th>
                {resources.map(([k, label])=>(
                  <th key={k} className="text-left p-3 min-w-[120px]">{label}</th>
                ))}
                <th className="text-left p-3 w-[120px]">Действия</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(roles).map(([key, obj])=>(
                <tr key={key} className="border-t border-slate-100">
                  <td className="p-3">
                    <div className="font-medium">{key}</div>
                    <Input className="mt-1" value={obj.label || key} onChange={(e)=>renameRole(key, e.target.value)} />
                  </td>
                  {resources.map(([rk])=>{
                    const val = obj.rights[rk] ?? "-";
                    return (
                      <td key={rk} className="p-3">
                        <div className="inline-flex rounded-xl overflow-hidden border border-slate-200">
                          {["-","r","rw"].map((mode)=>(
                            <button
                              key={mode}
                              onClick={()=>setRight(key, rk, mode)}
                              className={`px-2 py-1 text-xs border-r last:border-r-0 ${
                                val===mode ? "bg-indigo-600 text-white" : "bg-white hover:bg-slate-50"
                              }`}
                            >
                              {mode.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                  <td className="p-3">
                    <Button variant="ghost" onClick={()=>deleteRole(key)}>Удалить</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );

  const NotifyView = () => (
    <Card className="p-4">
      <div className="grid gap-4 max-w-2xl">
        <Toggle checked={notify.daily} onChange={(v)=>setNotify((n)=>({ ...n, daily: v }))}>
          Ежедневный дайджест
        </Toggle>
        <Toggle checked={notify.assess} onChange={(v)=>setNotify((n)=>({ ...n, assess: v }))}>
          Напоминать об оценках/ассессменте
        </Toggle>
        <Toggle checked={notify.succession} onChange={(v)=>setNotify((n)=>({ ...n, succession: v }))}>
          Сигналы по кадровому резерву
        </Toggle>
        <Toggle checked={notify.newsletter} onChange={(v)=>setNotify((n)=>({ ...n, newsletter: v }))}>
          Новости платформы
        </Toggle>
      </div>
    </Card>
  );

  const SecurityView = () => (
    <Card className="p-4">
      <div className="grid gap-4 max-w-xl">
        <Toggle checked={security.mfa} onChange={(v)=>setSecurity((s)=>({ ...s, mfa: v }))}>
          Требовать MFA
        </Toggle>
        <div>
          <div className="text-sm mb-1">Таймаут сессии, минут</div>
          <Input type="number" min={10} max={720} value={String(security.sessionMin)} onChange={(e)=>setSecurity((s)=>({ ...s, sessionMin: Number(e.target.value) }))} />
        </div>
        <Toggle checked={security.stickySidebar} onChange={(v)=>setSecurity((s)=>({ ...s, stickySidebar: v }))}>
          Фиксировать левый сайдбар
        </Toggle>
        <div className="text-xs text-slate-500">
          * Все настройки сохраняются локально (demo / localStorage).
        </div>
      </div>
    </Card>
  );

  const AuditView = () => {
    const list = load(LS_AUDIT, []);
    return (
      <Card className="p-4">
        {list.length === 0 ? (
          <div className="text-sm text-slate-500">Журнал пуст</div>
        ) : (
          <>
            <ul className="text-sm space-y-2 max-h-96 overflow-auto pr-1">
              {list.map((a, i)=>(
                <li key={i} className="flex items-start gap-3">
                  <span className="text-xs text-slate-500 w-[92px] shrink-0">{new Date(a.ts).toLocaleString()}</span>
                  <span>{a.msg}</span>
                </li>
              ))}
            </ul>
            <Button variant="ghost" className="mt-3" onClick={()=>{ localStorage.removeItem(LS_AUDIT); location.reload(); }}>
              Очистить журнал
            </Button>
          </>
        )}
      </Card>
    );
  };

  const activeUsers = users.filter((u)=>u.active).length;

  return (
    <Page
      title="Настройки"
      subtitle={
        <span className="text-slate-600">
          Пользователи: <b>{users.length}</b> (активных: <b>{activeUsers}</b>) · Ролей: <b>{roleNames.length}</b>
        </span>
      }
    >
      <Tabs />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4">
        {/* LEFT */}
        <div className="space-y-4">
          {tab === "users" && <UsersView />}
          {tab === "roles" && <RolesView />}
          {tab === "notify" && <NotifyView />}
          {tab === "security" && <SecurityView />}
          {tab === "audit" && <AuditView />}
        </div>

        {/* RIGHT — summary */}
        <div className="space-y-4">
          <Card className="p-4 sticky top-6">
            <div className="font-medium mb-2">Сводка</div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-500">Пользователи</div>
                <div className="text-2xl font-semibold">{users.length}</div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-500">Активные</div>
                <div className="text-2xl font-semibold">{activeUsers}</div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-500">Ролей</div>
                <div className="text-2xl font-semibold">{roleNames.length}</div>
              </div>
            </div>
          </Card>

          {tab === "users" && (
            <Card className="p-4">
              <div className="font-medium mb-2">Быстрые фильтры (демо)</div>
              <div className="flex flex-wrap gap-2">
                {roleNames.map((r)=>(
                  <Badge key={r} tone="slate">{r}</Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </Page>
  );
}
