import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useParams } from "react-router-dom";


import { roleStandards, initialRoles } from "../lib/modules.js";

import OrgStructureView from "../features/org/OrgStructureView.jsx";
import RolesHubView from "../features/roles/RolesHubView.jsx";
import RoleDetailsView from "../features/roles/RoleDetailsView.jsx";
import DevelopmentView from "../features/development/DevelopmentView.jsx";
import EmployeesListView from "../features/employees/EmployeesListView.jsx";
import EmployeeProfileView from "../features/employees/EmployeeProfileView.jsx";
import SuccessionView from "../features/succession/SuccessionView.jsx";




// Простой layout
function Shell({ children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "100vh" }}>
      <aside style={{ borderRight: "1px solid #e5e7eb", padding: 16 }}>
        <h1 style={{ fontWeight: 700, marginBottom: 12 }}>novaapp</h1>
        <nav style={{ display: "grid", gap: 8 }}>
          <Link to="/org">Структура</Link>
          <Link to="/roles">Эталон ролей</Link>
          <Link to="/development">Развитие</Link>
          <Link to="/employees">Сотрудники</Link>
          <Link to="/succession">Кадровый резерв</Link>
        </nav>
      </aside>
      <main style={{ padding: 16 }}>{children}</main>
    </div>
  );
}

// Очень простой ErrorBoundary, чтобы не видеть «белый экран»
class ErrorBoundary extends React.Component {
  constructor(p){ super(p); this.state={hasError:false, err:null}; }
  static getDerivedStateFromError(err){ return {hasError:true, err}; }
  componentDidCatch(err, info){ console.error(err, info); }
  render(){
    if (this.state.hasError) {
      return <div style={{padding:16}}>
        <h2>Упс, что-то упало</h2>
        <pre style={{whiteSpace:"pre-wrap"}}>{String(this.state.err)}</pre>
      </div>;
    }
    return this.props.children;
  }
}

// Обёртка страницы детали роли: достаём роль из state или по имени
function RoleDetailsPage() {
  const { roleName } = useParams();
  const { state } = useLocation();
  const decoded = decodeURIComponent(roleName || "");

  // 1) если пришли из списка — объект уже в state
  let role = state?.role || null;

  // 2) иначе пытаемся найти в roleStandards по имени
  if (!role) {
    role = roleStandards.find(r => r.name === decoded) || null;
  }

  // 3) запасной вариант: подхватить initialRoles и обернуть в форму «стандарта»
  if (!role) {
    const src = initialRoles.find(r => r.name === decoded);
    if (src) {
      role = {
        id: `tmp_${src.name}_${src.version || "v1.0"}`.replace(/\s+/g,"_"),
        name: src.name,
        version: src.version || "v1.0",
        division: "—",
        status: "active",
        goal: "",
        responsibilities: [],
        kpi: { current: [{ name: src.kpi || "—", target: "", period: "" }], recommended: [] },
        competencyMap: src.competencies || {},
        assessmentGuidelines: {}, testAssignment: {}, assessmentCenter: {},
        createdAt: src.created || "", updatedAt: src.created || ""
      };
    }
  }

  if (!role) return <div>Роль не найдена</div>;
  return <RoleDetailsView role={role} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Navigate to="/org" replace />} />
          <Route path="/org" element={<Shell><OrgStructureView /></Shell>} />
          <Route path="/roles" element={<Shell><RolesHubView /></Shell>} />
          <Route path="/roles/:roleName" element={<Shell><RoleDetailsPage /></Shell>} />
          <Route path="/development" element={<Shell><DevelopmentView /></Shell>} />
          <Route path="/employees" element={<Shell><EmployeesListView /></Shell>} />
          <Route path="/employees/:id" element={<Shell><EmployeeProfileView /></Shell>} />
          <Route path="/succession" element={<Shell><SuccessionView /></Shell>} />
          <Route path="*" element={<Shell><div>
            <h2>Экран не найден</h2>
            <p><Link to="/org">Вернуться в «Структура»</Link></p>
          </div></Shell>} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
