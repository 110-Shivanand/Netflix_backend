import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { authAPI } from "../../api/auth";
import Spinner from "../../components/common/Spinner";
import "./Auth.css";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status,  setStatus]  = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing verification link.");
      return;
    }
    authAPI
      .verifyEmail(token)
      .then((res) => { setStatus("success"); setMessage(res.data.message); })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.detail || "Verification failed. The link may have expired.");
      });
  }, [token]);

  return (
    <div className="auth-page">
      <header className="auth-page__header">
        <Link to="/" className="auth-page__logo">NETFLIX</Link>
      </header>

      <div className="auth-card" style={{ textAlign: "center" }}>
        <h1 className="auth-card__title">Email Verification</h1>

        {status === "loading" && <Spinner />}

        {status === "success" && (
          <>
            <div className="auth-success" style={{ marginBottom: 24 }}>{message}</div>
            <Link to="/login" className="auth-form__submit" style={{ display: "inline-block", textDecoration: "none", padding: "12px 32px" }}>
              Sign In
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="auth-error" style={{ marginBottom: 24 }}>{message}</div>
            <p className="auth-card__footer">
              <Link to="/login">Back to Sign In</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
