import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SearchBar from "./SearchBar";
import { FaBell, FaUser, FaCaretDown } from "react-icons/fa";
import "./Navbar.css";

const NAV_LINKS = [
  { label: "Home",     to: "/" },
  { label: "Movies",   to: "/movies" },
  { label: "TV Shows", to: "/shows" },
  { label: "My List",  to: "/watchlist" },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const menuRef = useRef(null);
  const navigate  = useNavigate();
  const location  = useLocation();

  /* scroll detection */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* close dropdown when clicking outside */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate("/login");
  };

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : "navbar--transparent"}`}>
      {/* Logo */}
      <Link to="/" className="navbar__logo">NETFLIX</Link>

      {/* Primary links */}
      {isAuthenticated && (
        <ul className="navbar__links">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`navbar__link${location.pathname === link.to ? " navbar__link--active" : ""}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Right controls */}
      <div className="navbar__right">
        {isAuthenticated ? (
          <>
            <SearchBar />

            <FaBell
              className="navbar__bell"
              aria-label="Notifications"
            />

            {/* User menu */}
            <div style={{ position: "relative" }} ref={menuRef}>
              <button
                className="navbar__user-btn"
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="true"
                aria-expanded={menuOpen}
              >
                <div className="navbar__avatar">
                  {user?.profile?.avatar_url ? (
                    <img src={user.profile.avatar_url} alt="avatar" />
                  ) : (
                    <FaUser />
                  )}
                </div>
                <FaCaretDown
                  className={`navbar__caret${menuOpen ? " navbar__caret--open" : ""}`}
                />
              </button>

              {menuOpen && (
                <div className="navbar__dropdown">
                  <div className="navbar__dropdown-header">{user?.username}</div>

                  <Link
                    to="/profile"
                    className="navbar__dropdown-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>

                  {user?.is_admin && (
                    <Link
                      to="/admin"
                      className="navbar__dropdown-item"
                      onClick={() => setMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}

                  <button className="navbar__dropdown-item" onClick={handleLogout}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login" className="navbar__signin">Sign In</Link>
        )}
      </div>
    </nav>
  );
}
