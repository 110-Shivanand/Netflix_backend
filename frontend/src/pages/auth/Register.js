import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import "./Auth.css";

export default function Register() {
  const [form, setForm]   = useState({ email: "", username: "", password: "", full_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate     = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.detail || "Registration failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <header className="auth-page__header">
        <Link to="/" className="auth-page__logo">NETFLIX</Link>
      </header>

      <div className="auth-card">
        <h1 className="auth-card__title">Create Account</h1>
        <p className="auth-card__subtitle">Start watching today.</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full name"
            value={form.full_name}
            onChange={update("full_name")}
            className="auth-form__input--simple"
            aria-label="Full name"
          />
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
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={update("username")}
            required
            className="auth-form__input--simple"
            aria-label="Username"
          />
          <input
            type="password"
            placeholder="Password (min 8 characters)"
            value={form.password}
            onChange={update("password")}
            required
            className="auth-form__input--simple"
            aria-label="Password"
          />

          <button type="submit" className="auth-form__submit" disabled={loading}>
            {loading ? "Creating account…" : "Sign Up"}
          </button>
        </form>

        <p className="auth-card__footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
