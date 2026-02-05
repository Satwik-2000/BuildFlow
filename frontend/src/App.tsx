import { Routes, Route, Navigate } from "react-router-dom";
import { Spin } from "antd";
import { useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/auth/Login";

// Pages
import Dashboard from "./pages/Dashboard";
import ProjectsList from "./pages/projects/ProjectsList";
import ProjectDetail from "./pages/projects/ProjectDetail";
import ContractsList from "./pages/contracts/ContractsList";
import VendorsList from "./pages/vendors/VendorsList";
import DailyReportsList from "./pages/reports/DailyReportsList";
import RABillsList from "./pages/raBills/RABillsList";
import UsersList from "./pages/users/UsersList";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Spin size="large" style={{ position: "fixed", inset: 0, margin: "auto" }} />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppLayout() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<ProjectsList />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/contracts" element={<ContractsList />} />
        <Route path="/vendors" element={<VendorsList />} />
        <Route path="/reports" element={<DailyReportsList />} />
        <Route path="/ra-bills" element={<RABillsList />} />
        <Route path="/users" element={<UsersList />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
    </Routes>
  );
}
