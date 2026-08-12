import React from "react";

export default function Spinner({ size = "md", fullPage = false }) {
  if (fullPage) return (
    <div className="spinner-full" role="status" aria-label="Loading">
      <div className={`spinner spinner--${size}`} />
    </div>
  );
  return (
    <div className="spinner-wrap" role="status" aria-label="Loading">
      <div className={`spinner spinner--${size}`} />
    </div>
  );
}
