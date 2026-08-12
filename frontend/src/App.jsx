import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { WatchlistProvider } from "./context/WatchlistContext";

import MainLayout from "./layouts/MainLayout";

import Home        from "./pages/Home";
import Movies      from "./pages/Movies";
import MovieDetail from "./pages/MovieDetail";
import Search      from "./pages/Search";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WatchlistProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: "#1a1a1a", color: "#fff", border: "1px solid #333" },
              success: { iconTheme: { primary: "#E50914", secondary: "#fff" } },
            }}
          />
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/"              element={<Home />} />
              <Route path="/movies"        element={<Movies />} />
              <Route path="/movies/:slug"  element={<MovieDetail />} />
              <Route path="/search"        element={<Search />} />
              <Route path="*" element={
                <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#141414", flexDirection: "column", gap: 16 }}>
                  <h1 style={{ color: "#e50914", fontSize: "6rem", fontWeight: 900, lineHeight: 1 }}>404</h1>
                  <p style={{ color: "#fff", fontSize: "1.4rem" }}>Page not found</p>
                  <a href="/" style={{ background: "#fff", color: "#000", padding: "10px 28px", borderRadius: 4, fontWeight: 700 }}>Go Home</a>
                </div>
              } />
            </Route>
          </Routes>
        </WatchlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
