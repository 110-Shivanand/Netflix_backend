import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaTimes } from "react-icons/fa";
import "./Navbar.css";

const LINKS = [
  { label: "Home",   to: "/" },
  { label: "Movies", to: "/movies" },
  { label: "Search", to: "/search" },
];

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [searchOn,  setSearchOn]  = useState(false);
  const [q,         setQ]         = useState("");
  const inputRef  = useRef(null);
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* close search on route change */
  useEffect(() => { setSearchOn(false); setQ(""); }, [pathname]);

  const openSearch = () => { setSearchOn(true); setTimeout(() => inputRef.current?.focus(), 50); };

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) { navigate(`/search?q=${encodeURIComponent(q.trim())}`); }
  };

  return (
    <nav className={`nav ${scrolled || pathname !== "/" ? "nav--solid" : "nav--clear"}`}>
      {/* Logo */}
      <Link to="/" className="nav__logo">NETFLIX</Link>

      {/* Links */}
      <ul className="nav__links">
        {LINKS.map(l => (
          <li key={l.to}>
            <Link to={l.to} className={`nav__link ${pathname === l.to ? "nav__link--on" : ""}`}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Right */}
      <div className="nav__right">
        {searchOn ? (
          <form className="nav__sf" onSubmit={submit}>
            <FaSearch className="nav__sf-icon" />
            <input
              ref={inputRef}
              className="nav__sf-input"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Titles, genres…"
            />
            <button type="button" className="nav__sf-close" onClick={() => setSearchOn(false)}>
              <FaTimes />
            </button>
          </form>
        ) : (
          <button className="nav__icon-btn" onClick={openSearch} aria-label="Search">
            <FaSearch />
          </button>
        )}
      </div>
    </nav>
  );
}
