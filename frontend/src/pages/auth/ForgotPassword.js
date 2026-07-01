import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../../api/auth";
import toast from "react-hot-toast";
import "./Auth.css";

export default function ForgotPassword() {
  const [email,   setEmail]   = useState("");
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
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
        <h1 className="auth-card__title">Forgot Password</h1>
        <p className="auth-card__subtitle">
          Enter your email and we'll send you a reset link.
        </p>

        {sent ? (
          <div className="auth-success">
            Check your inbox for the password reset link.
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-form__input--simple"
              aria-label="Email address"
            />
            <button type="submit" className="auth-form__submit" disabled={loading}>
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="auth-card__footer">
          <Link to="/login">← Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
