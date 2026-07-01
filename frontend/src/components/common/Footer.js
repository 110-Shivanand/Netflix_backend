import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const LINKS = [
  "FAQ", "Help Center", "Account", "Media Center",
  "Investor Relations", "Jobs", "Ways to Watch", "Terms of Use",
  "Privacy", "Cookie Preferences", "Corporate Information", "Contact Us",
];

export default function Footer() {
  return (
    <footer className="footer">
      <p className="footer__contact">
        Questions? <a href="mailto:support@netflixclone.com">Contact us</a>
      </p>
      <div className="footer__links">
        {LINKS.map((item) => (
          <Link key={item} to="#" className="footer__link">
            {item}
          </Link>
        ))}
      </div>
      <p className="footer__copy">
        © {new Date().getFullYear()} Netflix Clone. All rights reserved.
      </p>
    </footer>
  );
}
