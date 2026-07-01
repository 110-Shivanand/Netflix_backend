import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaFilm, FaTv, FaTags, FaUsers,
  FaChartLine, FaHome, FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "../pages/admin/Admin.css";

const NAV = [
  { label: "Dashboard", to: "/admin",            icon: <FaHome /> },
  { label: "Movies",    to: "/admin/movies",      icon: <FaFilm /> },
  { label: "Shows",     to: "/admin/shows",       icon: <FaTv /> },
  { label: "Genres",    to: "/admin/genres",      icon: <FaTags /> },
  { label: "Users",     to: "/admin/users",       icon: <FaUsers /> },
  { label: "Analytics", to: "/admin/analytics",   icon: <FaChartLine /> },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <Link to="/" className="admin-sidebar__logo">NETFLIX</Link>
        <p className="admin-sidebar__label">Admin Panel</p>

        <nav className="admin-sidebar__nav">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`admin-nav-item${location.pathname === item.to ? " admin-nav-item--active" : ""}`}
            >
              <span className="admin-nav-item__icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <hr className="admin-sidebar__divider" />

        <button className="admin-nav-item" onClick={handleLogout}>
          <span className="admin-nav-item__icon"><FaSignOutAlt /></span>
          Sign Out
        </button>
      </aside>

      {/* Page content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
