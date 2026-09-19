import { Outlet } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";

import "./DetailsLayout.css";

function DetailsLayout() {
  return (
    <div className="details-layout">
      <Header />

      <main className="details-page-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default DetailsLayout;