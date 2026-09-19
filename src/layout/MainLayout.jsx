import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "./MainLayout.css";

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="main-layout">
      <Header onMenuClick={() => setSidebarOpen((value) => !value)} />
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      <main className="page-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
