import React from "react";
import "../styles/Footer.css";
import githubLogo from "../assets/Github.png";

export default function Footer() {
  return (
    <footer className="app-footer">
      <a
        href="https://github.com/EstebanVC23/SyntaxForge.git"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={githubLogo} alt="GitHub" className="github-logo" />
      </a>
    </footer>
  );
}
