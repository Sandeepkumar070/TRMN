import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { key: "dashboard", to: "/", label: "Dashboard", icon: "▦", end: true },
  { key: "tag-management", to: "/tag-management", label: "Tag Management", icon: "⌁" },
  { key: "tag-assignment", to: "/tag-assignment", label: "Tag Assignment", icon: "⇄" },
  { key: "tag-history", to: "/tag-history", label: "Tag History", icon: "◷" },
  { key: "settings", to: "/settings", label: "Settings", icon: "⚙" },
];

function Sidebar({ open, onNavigate }) {
  const { currentUser, hasAccess, logout } = useAuth();
  const navigate = useNavigate();

  const visibleItems = navItems.filter((item) => hasAccess(item.key));

  const handleLogout = () => {
    logout();
    onNavigate?.();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <aside className={`app-sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <div className="sidebar-section-label">Navigation</div>
          <nav className="sidebar-nav">
            {visibleItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-account-card">
          <div className="sidebar-account-avatar">
            {currentUser?.username?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="sidebar-account-copy">
            <strong>{currentUser?.username || "User"}</strong>
            <span>{currentUser?.accessType || "USER"}</span>
          </div>
          <button type="button" className="sidebar-logout-btn" onClick={handleLogout} title="Logout" aria-label="Logout">
            ↪
          </button>
        </div>
      </aside>
      {open && <button className="sidebar-backdrop" onClick={onNavigate} aria-label="Close menu" />}
    </>
  );
}

export default Sidebar;
