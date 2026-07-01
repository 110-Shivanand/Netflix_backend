import React from "react";
import { Link } from "react-router-dom";
import { FaFilm, FaTv, FaTags, FaUsers, FaChartLine } from "react-icons/fa";
import "./Admin.css";

const TILES = [
  { title: "Movies",    desc: "Upload & manage movies",    icon: <FaFilm />,      link: "/admin/movies",    bg: "#c4070f" },
  { title: "TV Shows",  desc: "Manage shows & episodes",   icon: <FaTv />,        link: "/admin/shows",     bg: "#7c3aed" },
  { title: "Genres",    desc: "Create & delete genres",    icon: <FaTags />,      link: "/admin/genres",    bg: "#1d4ed8" },
  { title: "Users",     desc: "View & manage users",       icon: <FaUsers />,     link: "/admin/users",     bg: "#047857" },
  { title: "Analytics", desc: "Views, ratings & stats",    icon: <FaChartLine />, link: "/admin/analytics", bg: "#b45309" },
];

export default function AdminDashboard() {
  return (
    <div style={{ padding: "32px 32px 64px" }}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Manage your Netflix Clone content and users.</p>
        </div>
        <Link to="/" style={{ color: "#888", fontSize: "0.85rem", textDecoration: "none" }}>
          ← Back to Site
        </Link>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "20px",
        marginTop: "8px",
      }}>
        {TILES.map((tile) => (
          <Link
            key={tile.title}
            to={tile.link}
            className="dashboard-tile"
            style={{ background: tile.bg }}
          >
            <span className="dashboard-tile__icon">{tile.icon}</span>
            <span className="dashboard-tile__title">{tile.title}</span>
            <span className="dashboard-tile__desc">{tile.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
