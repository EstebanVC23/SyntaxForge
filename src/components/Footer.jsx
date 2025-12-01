import "../styles/Footer.css";
import githubLogo from "../assets/Github.png";

// Componente de pie de página (footer) de la aplicación
export default function Footer() {
  return (
    <footer className="app-footer">
      {/* Enlace al repositorio de GitHub en una nueva pestaña */}
      <a
        href="https://github.com/EstebanVC23/SyntaxForge.git"
        target="_blank"      // Abre el enlace en una nueva pestaña
        rel="noopener noreferrer"  // Mejora seguridad y rendimiento para enlaces externos
      >
        {/* Logo de GitHub como imagen clickeable */}
        <img 
          src={githubLogo} 
          alt="GitHub"  // Texto alternativo para accesibilidad
          className="github-logo"  // Clase CSS para estilizar la imagen
        />
      </a>
    </footer>
  );
}