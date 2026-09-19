import { Outlet } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";

import "./ManagementLayout.css";

function ManagementLayout() {
  return (
    <div className="management-layout">
      <Header />

      <main className="management-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default ManagementLayout;