import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import "./Auth.css";

export default function Login() {
  const [form, setForm]   = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.is_admin ? "/admin" : "/");
    } catch (err) {
      const msg = err.response?.data?.detail || "Invalid credentials";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Header */}
      <header className="auth-page__header">
        <Link to="/" className="auth-page__logo">NETFLIX</Link>
      </header>

      {/* Card */}
      <div className="auth-card">
        <h1 className="auth-card__title">Sign In</h1>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={update("email")}
            required
            className="auth-form__input--simple"
            aria-label="Email address"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={update("password")}
            required
            className="auth-form__input--simple"
            aria-label="Password"
          />

          <div className="auth-form__extras">
            <label className="auth-form__remember">
              <input type="checkbox" /> Remember me
            </label>
            <Link to="/forgot-password" className="auth-form__forgot">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="auth-form__submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="auth-card__footer">
          New to Netflix?{" "}
          <Link to="/register">Sign up now</Link>
        </p>
      </div>
    </div>
  );
}
