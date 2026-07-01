import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { authAPI } from "../../api/auth";
import toast from "react-hot-toast";
import "./Auth.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters"); return; }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      toast.success("Password reset successfully");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.detail || "Reset failed. The link may have expired.";
      setError(msg);
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
        <h1 className="auth-card__title">Reset Password</h1>
        <p className="auth-card__subtitle">Enter your new password below.</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-form__input--simple"
            aria-label="New password"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="auth-form__input--simple"
            aria-label="Confirm password"
          />
          <button type="submit" className="auth-form__submit" disabled={loading}>
            {loading ? "Resetting…" : "Reset Password"}
          </button>
        </form>

        <p className="auth-card__footer">
          <Link to="/login">← Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
