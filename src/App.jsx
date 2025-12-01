import React, { useState } from "react";
// Importa los proveedores de contexto para gestionar estado global
import { GameProvider } from "./context/GameContext.jsx";
import { WordBankProvider, WordBankContext } from "./context/WordBankContext.jsx";

// Importa las páginas/pantallas de la aplicación
import GamePage from "./pages/GamePage.jsx";
import FreeTextPage from "./pages/FreeTextPage.jsx";
import TheoryPage from "./pages/TheoryPage.jsx";

// Importa componentes reutilizables
import DictionaryDropdown from "./components/DictionaryDropdown.jsx";
import Footer from "./components/Footer.jsx";

// Importa estilos CSS globales
import "./styles/App.css";

// Componente raíz de la aplicación
export default function App() {
  // Estado para controlar la ruta/página actual
  const [route, setRoute] = useState("game"); // "game", "free", o "theory"
  
  // Estado para controlar la visibilidad del dropdown de modos de juego
  const [gameModeOpen, setGameModeOpen] = useState(false);

  /**
   * Maneja el cambio de ruta/página en la aplicación
   * @param {string} newRoute - Nueva ruta a la que navegar
   */
  const handleRouteChange = (newRoute) => {
    console.log("Cambiando ruta a:", newRoute); // Log para depuración
    setRoute(newRoute); // Actualiza la ruta actual
    setGameModeOpen(false); // Cierra el dropdown al cambiar de ruta
  };

  return (
    // Proveedores de contexto que envuelven toda la aplicación
    // WordBankProvider gestiona el estado del banco de palabras
    <WordBankProvider>
      {/* GameProvider gestiona el estado del juego (puntuación, ronda, etc.) */}
      <GameProvider>
        {/* Contenedor principal con padding inferior para el footer */}
        <div className="app-container" style={{ paddingBottom: "70px" }}>
          
          {/* Header/Navegación principal */}
          <header className="app-header">
            {/* Dropdown para seleccionar modo de juego */}
            <div className="dropdown-container">
              {/* Botón que alterna la visibilidad del dropdown */}
              <button
                className="dropdown-button"
                onClick={() => setGameModeOpen(!gameModeOpen)}
              >
                🎮 Modo de Juego {/* Emoji para representar juegos */}
              </button>

              {/* Menú desplegable condicional (se muestra solo cuando gameModeOpen es true) */}
              {gameModeOpen && (
                <div className="dropdown-menu">
                  {/* Opción para Modo Construcción */}
                  <button
                    className={`menu-item ${route === "game" ? "active" : ""}`}
                    onClick={() => handleRouteChange("game")}
                  >
                    🏗️ Modo Construcción {/* Emoji de construcción */}
                  </button>

                  {/* Opción para Modo Texto Libre */}
                  <button
                    className={`menu-item ${route === "free" ? "active" : ""}`}
                    onClick={() => handleRouteChange("free")}
                  >
                    📝 Modo Texto Libre {/* Emoji de texto */}
                  </button>
                </div>
              )}
            </div>

            {/* Botón independiente para la página de teoría */}
            <button
              className={`theory-button ${route === "theory" ? "active" : ""}`}
              onClick={() => handleRouteChange("theory")}
            >
              📚 Teoría GDC {/* Emoji de libro para teoría */}
            </button>

            {/* Componente DictionaryDropdown con acceso al contexto WordBank */}
            {/* Usa WordBankContext.Consumer para pasar la función addToInput como prop */}
            <WordBankContext.Consumer>
              {({ addToInput }) => <DictionaryDropdown addWord={addToInput} />}
            </WordBankContext.Consumer>
          </header>

          {/* Contenido principal que cambia según la ruta actual */}
          <main>
            {/* Renderizado condicional de páginas */}
            {route === "game" && <GamePage />}        {/* Modo construcción */}
            {route === "free" && <FreeTextPage />}    {/* Modo texto libre */}
            {route === "theory" && <TheoryPage />}    {/* Página de teoría */}
          </main>

          {/* Footer de la aplicación (siempre visible) */}
          <Footer />
        </div>
      </GameProvider>
    </WordBankProvider>
  );
}