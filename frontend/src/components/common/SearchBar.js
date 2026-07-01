import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTimes } from "react-icons/fa";
import { searchAPI } from "../../api/search";
import { useDebounce } from "../../hooks/useDebounce";
import "./SearchBar.css";

export default function SearchBar() {
  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef  = useRef(null);
  const wrapRef   = useRef(null);
  const navigate  = useNavigate();
  const debounced = useDebounce(query, 400);

  /* focus input when opened */
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  /* close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* live search */
  useEffect(() => {
    if (!debounced.trim()) { setResults(null); return; }
    setLoading(true);
    searchAPI
      .search(debounced)
      .then((res) => setResults(res.data))
      .catch(() => setResults(null))
      .finally(() => setLoading(false));
  }, [debounced]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
      setQuery("");
      setResults(null);
    }
  };

  const handleResultClick = (item) => {
    navigate(item.type === "movie" ? `/movies/${item.slug}` : `/shows/${item.slug}`);
    setOpen(false);
    setQuery("");
    setResults(null);
  };

  const clear = () => { setQuery(""); setResults(null); };

  const suggestions = results
    ? [...(results.movies || []).slice(0, 3), ...(results.shows || []).slice(0, 3)]
    : [];

  return (
    <div className="searchbar" ref={wrapRef}>
      <div className={`searchbar__toggle${open ? " searchbar__toggle--open" : ""}`}>
        <button
          className="searchbar__icon"
          onClick={() => setOpen((o) => !o)}
          aria-label="Search"
        >
          <FaSearch />
        </button>

        {open && (
          <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center" }}>
            <input
              ref={inputRef}
              type="text"
              className="searchbar__input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Titles, people, genres"
              aria-label="Search content"
            />
            {query && (
              <button type="button" className="searchbar__clear" onClick={clear} aria-label="Clear search">
                <FaTimes />
              </button>
            )}
          </form>
        )}
      </div>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div className="searchbar__dropdown">
          {suggestions.map((item) => (
            <button
              key={item.id}
              className="searchbar__result-item"
              onClick={() => handleResultClick(item)}
            >
              {item.thumbnail_url ? (
                <img
                  src={item.thumbnail_url}
                  alt={item.title}
                  className="searchbar__result-thumb"
                />
              ) : (
                <div className="searchbar__result-thumb searchbar__result-thumb--placeholder">
                  N/A
                </div>
              )}
              <div className="searchbar__result-info">
                <span className="searchbar__result-title">{item.title}</span>
                <span className="searchbar__result-type">{item.type}</span>
              </div>
            </button>
          ))}

          <button className="searchbar__see-all" onClick={handleSubmit}>
            See all results for "{query}"
          </button>
        </div>
      )}
    </div>
  );
}
