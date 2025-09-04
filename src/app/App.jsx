// src/app/App.jsx
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useParams,
  Outlet,
} from "react-router-dom";

import { roleStandards, initialRoles } from "../lib/modules.js";

import OrgStructureView from "../features/org/OrgStructureView.jsx";
import RolesHubView from "../features/roles/RolesHubView.jsx";
import RoleDetailsView from "../features/roles/RoleDetailsView.jsx";
import DevelopmentView from "../features/development/DevelopmentView.jsx";
import EmployeesListView from "../features/employees/EmployeesListView.jsx";
import EmployeeProfileView from "../features/employees/EmployeeProfileView.jsx";
import SuccessionView from "../features/succession/SuccessionView.jsx";

import Sidebar from "../components/layout/Sidebar.jsx";
import Topbar from "../components/layout/Topbar.jsx";

// ----- ErrorBoundary, чтобы не ловить «белый экран»
class ErrorBoundary extends React.Component {
  constructor(p) { super(p); this.state = { hasError: false, err: null }; }
  static getDerivedStateFromError(err) { return { hasError: true, err }; }
  componentDidCatch(err, info) { console.error(err, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-2">Упс, что-то упало</h2>
          <pre className="text-sm whitespace-pre-wrap bg-slate-50 p-3 rounded">{String(this.state.err)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// ----- Обёртка приложения с сайдбаром/топбаром
function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Topbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ----- Деталь роли (state → registry → initialRoles)
function RoleDetailsPage() {
  const { roleName } = useParams();
  const { state } = useLocation();
  const decoded = decodeURIComponent(roleName || "");

  let role = state?.role || null;
  if (!role) role = roleStandards.find((r) => r.name === decoded) || null;

  if (!role) {
    const src = initialRoles.find((r) => r.name === decoded);
    if (src) {
      role = {
        id: `tmp_${src.name}_${src.version || "v1.0"}`.replace(/\s+/g, "_"),
        name: src.name,
        version: src.version || "v1.0",
        division: "—",
        status: "active",
        goal: "",
        responsibilities: [],
        kpi: { current: [{ name: src.kpi || "—", target: "", period: "" }], recommended: [] },
        competencyMap: src.competencies || {},
        assessmentGuidelines: {},
        testAssignment: {},
        assessmentCenter: {},
        createdAt: src.created || "",
        updatedAt: src.created || "",
      };
    }
  }

  if (!role) return <div className="p-4">Роль не найдена</div>;
  return <RoleDetailsView role={role} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/org" replace />} />
            <Route path="/org" element={<OrgStructureView />} />
            <Route path="/roles" element={<RolesHubView />} />
            <Route path="/roles/:roleName" element={<RoleDetailsPage />} />
            <Route path="/development" element={<DevelopmentView />} />
            <Route path="/employees" element={<EmployeesListView />} />
            <Route path="/employees/:id" element={<EmployeeProfileView />} />
            <Route path="/succession" element={<SuccessionView />} />
            <Route
              path="*"
              element={
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-2">Экран не найден</h2>
                  <Link to="/org" className="text-indigo-600 hover:underline">Вернуться в «Структура»</Link>
                </div>
              }
            />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
