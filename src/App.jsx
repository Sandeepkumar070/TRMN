import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { PageGuard, RequireAuth } from "./components/ProtectedRoute";

import MainLayout from "./layout/MainLayout";
import DetailsLayout from "./layout/DetailsLayout";
import ManagementLayout from "./layout/ManagementLayout";

import Dashboard from "./pages/Dashboard";
import TagManagement from "./pages/TagManagement";
import TagAssignment from "./pages/TagAssignment";
import TagHistory from "./pages/TagHistory";
import Settings from "./pages/Settings";
import RackDetails from "./pages/RackDetails";
import ManagementActivity from "./pages/ManagementActivity";
import Login from "./pages/Login";
import Register from "./pages/Register";

import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
              <Route index element={<PageGuard accessKey="dashboard"><Dashboard /></PageGuard>} />
              <Route path="tag-management" element={<PageGuard accessKey="tag-management"><TagManagement /></PageGuard>} />
              <Route path="tag-assignment" element={<PageGuard accessKey="tag-assignment"><TagAssignment /></PageGuard>} />
              <Route path="tag-history" element={<PageGuard accessKey="tag-history"><TagHistory /></PageGuard>} />
              <Route path="settings" element={<PageGuard accessKey="settings"><Settings /></PageGuard>} />
            </Route>

            <Route element={<RequireAuth><ManagementLayout /></RequireAuth>}>
              <Route
                path="tag-management/:activity"
                element={<PageGuard accessKey="tag-management"><ManagementActivity /></PageGuard>}
              />
            </Route>

            <Route element={<RequireAuth><DetailsLayout /></RequireAuth>}>
              <Route
                path="location/:locationCode"
                element={<PageGuard accessKey="dashboard"><RackDetails /></PageGuard>}
              />
            </Route>

            <Route path="/reports" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
