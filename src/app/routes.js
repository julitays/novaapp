// src/app/routes.js
import { lazy } from "react";

// Ленивая загрузка экранов (меньше бандл, быстрее старт)
const OrgStructureView     = lazy(() => import("../features/org/OrgStructureView.jsx"));
const RolesHubView         = lazy(() => import("../features/roles/RolesHubView.jsx"));
const RoleDetailsView      = lazy(() => import("../features/roles/RoleDetailsView.jsx"));
const DevelopmentView      = lazy(() => import("../features/development/DevelopmentView.jsx"));
const SuccessionView       = lazy(() => import("../features/succession/SuccessionView.jsx"));
const EmployeesListView    = lazy(() => import("../features/employees/EmployeesListView.jsx"));
const EmployeeProfileView  = lazy(() => import("../features/employees/EmployeeProfileView.jsx"));
const DemoView       = lazy(() => import("../features/demo/DemoView.jsx"));
const SettingsView   = lazy(() => import("../features/settings/SettingsView.jsx"));

// Регистрация роутов для меню и роутера
export const appRoutes = [
  { path: "/structure",    element: <OrgStructureView />,    label: "Структура",         icon: "🏗️" },
  { path: "/roles",        element: <RolesHubView />,        label: "Эталон ролей",      icon: "📚" },
  // детальная карточка роли — скрыта из меню, но доступна по клику из списка
  { path: "/roles/:id",    element: <RoleDetailsView /> },
  { path: "/development",  element: <DevelopmentView />,     label: "Развитие",          icon: "📈" },
  { path: "/succession",   element: <SuccessionView />,      label: "Кадровый резерв",   icon: "🧩" },
  { path: "/employees",    element: <EmployeesListView />,   /* в меню не показываем — вход из Структуры */ },
  { path: "/employee/:id", element: <EmployeeProfileView /> },
  { path: "/demo",         element: <DemoView />,           label: "DEMO",            icon: "🧪" },
  { path: "/settings",     element: <SettingsView />,       label: "Настройки",       icon: "⚙️" },
];
